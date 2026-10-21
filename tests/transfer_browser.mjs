import assert from "node:assert/strict";
import { randomBytes, scryptSync, createHash } from "node:crypto";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const directory = await mkdtemp(join(tmpdir(), "daj-browser-"));
const password = randomBytes(20).toString("hex"), salt = randomBytes(32);
const viewerPassword = randomBytes(20).toString("hex"), viewerSalt = randomBytes(32);
await writeFile(join(directory, "auth.json"), JSON.stringify({
  salt: salt.toString("hex"), hash: scryptSync(password, salt, 32, {N: 16384, r: 8, p: 1}).toString("hex"),
  viewer_salt: viewerSalt.toString("hex"), viewer_hash: scryptSync(viewerPassword, viewerSalt, 32, {N: 16384, r: 8, p: 1}).toString("hex"),
}), {mode: 0o600});
const server = spawn("python3", ["-u", "tests/serve_transfer_fixture.py", directory], {stdio: ["ignore", "pipe", "inherit"]});
let browser;
try {
  const base = await new Promise((resolve, reject) => {
    server.stdout.once("data", value => resolve(value.toString().trim()));
    server.once("exit", code => reject(new Error(`fixture exited ${code}`)));
    setTimeout(() => reject(new Error("fixture startup timeout")), 10000).unref();
  });
  browser = await chromium.launch({headless: true});
  const context = await browser.newContext({acceptDownloads: true, viewport: {width: 1440, height: 1000}});
  const page = await context.newPage(), errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(base + "/daj/");
  await page.locator("#password").fill("incorrect"); await page.locator("#login-button").click();
  await page.getByText("Nieprawidłowe hasło.", {exact: true}).waitFor();
  await page.locator("#password").fill(password); await page.locator("#login-button").click();
  await page.locator("#workspace").waitFor({state: "visible"});
  assert.equal(await page.locator("#upload-card").isVisible(), true);
  assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "noindex, nofollow, noarchive");

  const payload = Buffer.alloc(18 * 1024 ** 2 + 13, 0x5a), file = join(directory, "transfer-test.bin");
  await writeFile(file, payload);
  let patches = 0;
  await page.route("**/daj/api/uploads/*", async route => {
    if (route.request().method() === "PATCH" && ++patches > 1) await new Promise(resolve => setTimeout(resolve, 900));
    await route.continue().catch(() => {});
  });
  await page.locator("#file").setInputFiles(file);
  const firstChunk = page.waitForResponse(response => response.request().method() === "PATCH" && response.status() === 200);
  await page.locator("#upload").click(); await firstChunk; await page.locator("#pause").click();
  await page.getByText("Wysyłanie wstrzymane. Możesz je wznowić tym samym przyciskiem.", {exact: true}).waitFor();
  const status = await page.evaluate(async () => (await fetch("/daj/api/status")).json());
  assert.equal(status.files.length, 1); assert(status.files[0].offset > 0 && status.files[0].offset < payload.length);
  await page.reload(); await page.locator("#workspace").waitFor({state: "visible"});
  await page.locator("#file").setInputFiles(file); await page.locator("#upload").click();
  await page.getByText("Gotowe! Plik jest dostępny do pobrania w skrzynce poniżej.", {exact: true}).waitFor();
  const completed = await page.evaluate(async () => (await fetch("/daj/api/status")).json());
  assert.equal(completed.files.length, 1); assert.equal(completed.files[0].offset, payload.length); assert.equal(completed.files[0].ready, true);
  const downloadEvent = page.waitForEvent("download"); await page.getByRole("link", {name: "Pobierz plik", exact: true}).click();
  const download = await downloadEvent;
  const downloaded = await readFile(await download.path());
  assert.equal(createHash("sha256").update(downloaded).digest("hex"), createHash("sha256").update(payload).digest("hex"));

  // Record a tiny actual WebM in the browser and verify native playback too.
  const video = await page.evaluate(async () => {
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d"), stream = canvas.captureStream(10);
    const recorder = new MediaRecorder(stream, {mimeType: "video/webm;codecs=vp8"}), chunks = [];
    recorder.ondataavailable = event => chunks.push(event.data);
    const result = new Promise(resolve => recorder.onstop = async () => resolve(Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer()))));
    recorder.start();
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? "#85edd0" : "#193144"; ctx.fillRect(0, 0, 64, 64); await new Promise(resolve => setTimeout(resolve, 100)); }
    recorder.stop(); stream.getTracks().forEach(track => track.stop()); return result;
  });
  const videoFile = join(directory, "browser-video.webm"); await writeFile(videoFile, Buffer.from(video));
  await page.locator("#file").setInputFiles(videoFile); await page.locator("#upload").click();
  await page.getByText("Gotowe! Plik jest dostępny do pobrania w skrzynce poniżej.", {exact: true}).waitFor();
  await page.getByRole("button", {name: "Obejrzyj", exact: true}).click();
  await page.waitForFunction(() => document.getElementById("player").readyState >= 1);
  assert.equal(await page.locator("#player").evaluate(async player => { await player.play(); return player.paused; }), false);
  const movieURL = await page.locator("#player").getAttribute("src");
  const anonymous = await browser.newContext(); const otherPage = await anonymous.newPage();
  await otherPage.goto(base + movieURL); await otherPage.locator("#login").waitFor({state: "visible"});
  assert.equal(await otherPage.locator("#workspace").isVisible(), false);
  await otherPage.locator("#password").fill(viewerPassword); await otherPage.locator("#login-button").click();
  await otherPage.waitForFunction(() => document.getElementById("player").readyState >= 1);
  assert.equal(await otherPage.locator("#upload-card").isVisible(), false);
  assert.equal(await otherPage.locator("#file").isVisible(), false);
  assert.equal(await otherPage.getByRole("button", {name: "Rozpocznij / wznów wysyłanie", exact: true}).isVisible(), false);
  await otherPage.getByText("Dostęp: oglądanie i pobieranie", {exact: true}).waitFor();
  const blocked = await otherPage.evaluate(async () => {
    const status = await (await fetch("/daj/api/status")).json();
    const response = await fetch("/daj/api/uploads", {method: "POST", headers: {"Content-Type": "application/json", "X-Daj-CSRF": status.csrf}, body: JSON.stringify({name: "forbidden.bin", size: 1, modified: 1})});
    return {role: status.role, status: response.status};
  });
  assert.deepEqual(blocked, {role: "viewer", status: 403});
  const viewerDownload = otherPage.waitForEvent("download");
  await otherPage.locator(".file-row").filter({hasText: "browser-video.webm"}).getByRole("link", {name: "Pobierz plik", exact: true}).click();
  assert.deepEqual(await readFile(await (await viewerDownload).path()), Buffer.from(video));
  for (const width of [1440, 390]) {
    await otherPage.setViewportSize({width, height: 900});
    assert(await otherPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `viewer overflow at ${width}`);
    if (process.env.TRANSFER_SCREENSHOT_DIR) await otherPage.screenshot({path: join(process.env.TRANSFER_SCREENSHOT_DIR, `viewer-${width}.png`), fullPage: true});
  }
  await otherPage.locator("#logout").click(); await otherPage.locator("#login").waitFor({state: "visible"});
  await anonymous.close();

  for (const width of [1440, 390]) {
    await page.setViewportSize({width, height: 900});
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}`);
    const output = process.env.TRANSFER_SCREENSHOT_DIR;
    if (output) await page.screenshot({path: join(output, `transfer-${width}.png`), fullPage: true});
  }
  await page.locator("#logout").click(); await page.locator("#login").waitFor({state: "visible"});
  assert.equal(await page.locator("#files").textContent(), ""); assert.equal(await page.locator("#player").getAttribute("src"), null);
  assert.deepEqual(errors, []);
  console.log("TRANSFER_BROWSER_OK: uploader and viewer roles, upload API denied to viewer, pause/reload/resume, exact downloads, native video, private links, desktop/mobile, logout");
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
  await new Promise(resolve => server.once("exit", resolve));
  await rm(directory, {recursive: true, force: true});
}
