"use strict";
const $ = id => document.getElementById(id);
let csrf = "", active = false, paused = false, currentXHR = null, wakeLock = null, maxFile = 16 * 1024 ** 3;
const chunkSize = 8 * 1024 ** 2;
const fileURL = id => `/daj/file/${id}`;
const bytes = value => value >= 1024 ** 3 ? `${(value / 1024 ** 3).toFixed(2)} GiB` : `${(value / 1024 ** 2).toFixed(1)} MiB`;
function duration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "obliczam…";
  seconds = Math.ceil(seconds);
  if (seconds >= 3600) return `${Math.floor(seconds / 3600)} godz. ${Math.ceil(seconds % 3600 / 60)} min`;
  return seconds >= 60 ? `${Math.ceil(seconds / 60)} min` : `${seconds} s`;
}
function message(id, text, kind = "") { $(id).textContent = text; $(id).className = `message ${kind}`; }
function loggedOut() {
  csrf = ""; $("login").hidden = false; $("workspace").hidden = true;
  $("files").replaceChildren(); $("player").pause(); $("player").removeAttribute("src"); $("player").load();
  $("player-area").hidden = true;
}
async function api(path, method = "GET", data) {
  const response = await fetch(`/daj/api/${path}`, {method, cache: "no-store", headers: {
    "Content-Type": "application/json", "X-Daj-CSRF": csrf,
  }, body: data === undefined ? undefined : JSON.stringify(data)});
  const result = await response.json().catch(() => ({message: "Serwer chwilowo nie odpowiada. Spróbuj ponownie."}));
  if (response.status === 401 && path !== "login") loggedOut();
  if (!response.ok) { const error = new Error(result.message || "Nie udało się wykonać operacji."); error.status = response.status; throw error; }
  return result;
}
function showPlayer(file) {
  $("player-title").textContent = file.name; $("player").src = fileURL(file.id);
  $("player-area").hidden = false; $("player-area").scrollIntoView({behavior: "smooth", block: "nearest"});
}
function action(label, callback) {
  const button = document.createElement("button"); button.type = "button"; button.className = "secondary";
  button.textContent = label; button.addEventListener("click", callback); return button;
}
async function refresh(followLink = false) {
  const status = await api("status"); csrf = status.csrf; maxFile = status.max_file;
  $("login").hidden = true; $("workspace").hidden = false;
  $("files").replaceChildren(); $("files-message").textContent = status.files.length ? "" : "Skrzynka jest pusta. Możesz wysłać pierwszy plik.";
  for (const file of status.files) {
    const row = document.createElement("div"); row.className = "file-row";
    const name = document.createElement("p"); name.className = "file-name"; name.textContent = file.name;
    const detail = document.createElement("p"); detail.className = "muted";
    detail.textContent = file.ready ? `${bytes(file.size)} · Gotowy do pobrania` : `${bytes(file.offset)} z ${bytes(file.size)} · Wysyłanie nieukończone`;
    const actions = document.createElement("div"); actions.className = "actions";
    if (file.ready) {
      const download = document.createElement("a"); download.className = "button"; download.href = fileURL(file.id) + "?download=1"; download.textContent = "Pobierz plik";
      actions.append(download);
      if (file.video) actions.append(action("Obejrzyj", () => showPlayer(file)));
      actions.append(action("Kopiuj link", async event => {
        try { await navigator.clipboard.writeText(location.origin + fileURL(file.id)); event.target.textContent = "Link skopiowany"; }
        catch { message("files-message", `Link do pliku: ${location.origin + fileURL(file.id)}`); }
      }));
    } else {
      actions.append(action("Jak wznowić?", () => {
        message("upload-message", `Wybierz ponownie plik „${file.name}” i kliknij „Rozpocznij / wznów wysyłanie”.`);
        $("file").scrollIntoView({behavior: "smooth", block: "center"});
      }));
      actions.append(action("Usuń nieukończony", async () => {
        if (active) { message("upload-message", "Najpierw wstrzymaj wysyłanie.", "error"); return; }
        if (!confirm(`Usunąć nieukończone wysyłanie pliku „${file.name}”?`)) return;
        try { await api(`uploads/${file.id}`, "DELETE"); await refresh(); }
        catch (error) { message("files-message", error.message, "error"); }
      }));
    }
    row.append(name, detail, actions); $("files").append(row);
  }
  if (followLink) {
    const query = new URLSearchParams(location.search), target = query.get("file");
    const file = status.files.find(file => file.id === target && file.ready);
    if (file) {
      if (query.has("download")) location.assign(fileURL(file.id) + "?download=1");
      else if (file.video) showPlayer(file);
    }
  }
  return status;
}
$("show-password").addEventListener("click", () => {
  const visible = $("password").type === "password";
  $("password").type = visible ? "text" : "password"; $("show-password").textContent = visible ? "Ukryj" : "Pokaż";
  $("show-password").setAttribute("aria-label", visible ? "Ukryj hasło" : "Pokaż hasło");
});
$("login-form").addEventListener("submit", async event => {
  event.preventDefault(); $("login-button").disabled = true; message("login-message", "Sprawdzam hasło…");
  try { csrf = (await api("login", "POST", {password: $("password").value})).csrf; $("password").value = ""; await refresh(true); message("login-message", ""); }
  catch (error) { message("login-message", error.message, "error"); }
  finally { $("login-button").disabled = false; }
});
$("logout").addEventListener("click", async () => {
  paused = true; currentXHR?.abort();
  try { await api("logout", "POST", {}); loggedOut(); }
  catch (error) { message("upload-message", error.message, "error"); }
});
$("refresh").addEventListener("click", () => refresh().catch(error => message("files-message", error.message, "error")));
$("close-player").addEventListener("click", () => { $("player").pause(); $("player").removeAttribute("src"); $("player").load(); $("player-area").hidden = true; });
$("file").addEventListener("change", () => {
  $("upload").disabled = !$("file").files.length || active;
  if (!active) { $("progress-area").hidden = true; message("upload-message", ""); }
});
$("pause").addEventListener("click", () => { paused = true; currentXHR?.abort(); });
function sendChunk(identifier, offset, blob, progress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest(); currentXHR = xhr;
    xhr.open("PATCH", `/daj/api/uploads/${identifier}`);
    xhr.setRequestHeader("Content-Type", "application/octet-stream"); xhr.setRequestHeader("Upload-Offset", String(offset)); xhr.setRequestHeader("X-Daj-CSRF", csrf);
    xhr.upload.onprogress = event => progress(offset + event.loaded);
    xhr.onload = () => {
      let data; try { data = JSON.parse(xhr.responseText); } catch { data = {message: "Serwer chwilowo nie odpowiada."}; }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data.offset);
      else { if (xhr.status === 401) loggedOut(); const error = new Error(data.message || "Błąd wysyłania."); error.status = xhr.status; reject(error); }
    };
    xhr.onerror = xhr.ontimeout = () => reject(new Error("Przerwane połączenie z serwerem."));
    xhr.onabort = () => reject(new Error("Wysyłanie wstrzymane.")); xhr.send(blob);
  });
}
$("upload").addEventListener("click", async () => {
  const file = $("file").files[0]; if (!file || active) return;
  if (file.size === 0 || file.size > maxFile) { message("upload-message", "Wybierz niepusty plik o rozmiarze do 16 GiB.", "error"); return; }
  active = true; paused = false; $("upload").disabled = true; $("file").disabled = true; $("pause").hidden = false; $("progress-area").hidden = false;
  let start = performance.now(), initialOffset = 0, confirmed = 0;
  function progress(sent) {
    const percent = Math.min(100, sent / file.size * 100), seconds = (performance.now() - start) / 1000;
    const speed = seconds > 1 ? Math.max(0, sent - initialOffset) / seconds : 0;
    $("progress").value = percent; $("percent").textContent = `${percent.toFixed(1)}%`; $("transferred").textContent = `${bytes(sent)} / ${bytes(file.size)}`;
    if (speed > 0) {
      const remaining = Math.max(0, (file.size - sent) / speed);
      const finish = new Date(Date.now() + remaining * 1000).toLocaleTimeString("pl-PL", {hour: "2-digit", minute: "2-digit"});
      $("estimate").textContent = `${bytes(speed)}/s · Pozostało około ${duration(remaining)} · Koniec około ${finish}`;
    } else $("estimate").textContent = "Obliczam prędkość i pozostały czas…";
    if (sent === file.size) $("estimate").textContent = "Dane wysłane. Czekam na potwierdzenie zapisu na serwerze…";
  }
  try {
    if ("wakeLock" in navigator) { try { wakeLock = await navigator.wakeLock.request("screen"); } catch {} }
    const upload = await api("uploads", "POST", {name: file.name, size: file.size, modified: file.lastModified});
    initialOffset = confirmed = upload.offset; start = performance.now(); progress(confirmed);
    message("upload-message", confirmed ? "Wznawiam od zapisanej części pliku…" : "Wysyłanie rozpoczęte…");
    let retries = 0;
    while (confirmed < file.size && !paused) {
      try {
        confirmed = await sendChunk(upload.id, confirmed, file.slice(confirmed, confirmed + chunkSize), progress);
        retries = 0; progress(confirmed); message("upload-message", "Wysyłanie trwa. Możesz wstrzymać i wznowić później.");
      } catch (error) {
        if (paused || error.status === 401 || (error.status && ![409, 429, 502, 503, 504].includes(error.status)) || ++retries > 5) throw error;
        message("upload-message", `Połączenie przerwane. Próba wznowienia ${retries}/5…`);
        await new Promise(resolve => setTimeout(resolve, Math.min(15000, retries * 2500)));
        if (paused) break;
        confirmed = (await api(`uploads/${upload.id}`)).offset; progress(confirmed);
      }
    }
    if (paused) throw new Error("Wysyłanie wstrzymane.");
    await api(`uploads/${upload.id}/finish`, "POST", {});
    progress(file.size); $("estimate").textContent = "Plik został zapisany na serwerze.";
    message("upload-message", "Gotowe! Plik jest dostępny do pobrania w skrzynce poniżej.", "success");
    await refresh();
  } catch (error) {
    progress(confirmed);
    $("estimate").textContent = "Zapisane porcje pozostają na serwerze. Wybierz ten sam plik, aby wznowić.";
    message("upload-message", paused ? "Wysyłanie wstrzymane. Możesz je wznowić tym samym przyciskiem." : error.message, paused ? "" : "error");
  } finally {
    active = false; currentXHR = null; $("file").disabled = false; $("upload").disabled = !$("file").files.length; $("pause").hidden = true;
    if (wakeLock) { await wakeLock.release().catch(() => {}); wakeLock = null; }
  }
});
window.addEventListener("beforeunload", event => { if (active) { event.preventDefault(); event.returnValue = ""; } });
refresh(true).catch(error => { if (error.status !== 401) message("login-message", error.message, "error"); });
