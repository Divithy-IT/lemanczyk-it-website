"use strict";
(() => {
  const player = document.getElementById("shared-player") || document.getElementById("player");
  if (!player) return;
  const counts = document.getElementById("live-counts");
  const notice = document.getElementById("transfer-message");
  const retry = document.getElementById("retry-player");
  const viewer = crypto.randomUUID().replaceAll("-", "");
  const busyText = "Za dużo osób teraz ogląda film. Poczekaj chwilę — spróbujemy ponownie automatycznie.";
  let leasedFile = "", timer = null, waiting = false, restarting = false, wanted = false, position = 0;
  const file = () => {
    const source = player.getAttribute("src");
    return source ? new URL(source, location.href).pathname : "";
  };
  const tell = text => { if (notice) notice.textContent = text; };
  const csrfHeaders = () => typeof csrf === "string" && csrf ? {"X-Daj-CSRF": csrf} : {};
  async function watch(path, playing, keepalive = false) {
    return fetch(path + "?activity=watch", {method: "POST", cache: "no-store", keepalive,
      headers: {"Content-Type": "application/json", ...csrfHeaders()}, body: JSON.stringify({viewer, playing})});
  }
  function release() {
    if (leasedFile) {
      const previous = leasedFile; leasedFile = "";
      watch(previous, false, true).catch(() => {});
    }
  }
  async function refreshCounts() {
    const path = file(); if (!path || !counts) return;
    try {
      const response = await fetch(path + "?activity=status", {cache: "no-store"});
      if (!response.ok) return;
      const data = await response.json();
      if (file() === path) counts.textContent = `Ogląda teraz: ${data.watching} / ${data.watch_limit} · Pobiera teraz: ${data.downloading} / ${data.download_limit}`;
    } catch { /* Keep the last known counts during a transient network failure. */ }
  }
  function wait() {
    if (Number.isFinite(player.currentTime)) position = player.currentTime;
    waiting = true; restarting = false; player.pause(); release();
    tell(busyText); if (retry) retry.hidden = false;
    clearTimeout(timer); timer = setTimeout(retryPlayback, 10000 + Math.random() * 2000);
    refreshCounts();
  }
  async function admit() {
    const path = file(); if (!path) return false;
    if (leasedFile && leasedFile !== path) release();
    try {
      const response = await watch(path, true);
      if (response.status === 429) { wait(); return false; }
      if (!response.ok) return false;
      if (file() !== path || !wanted && !waiting && !restarting) {
        watch(path, false, true).catch(() => {}); return false;
      }
      leasedFile = path; refreshCounts(); return true;
    } catch { return false; }
  }
  async function retryPlayback() {
    clearTimeout(timer);
    restarting = true;
    if (!file() || !await admit()) {
      restarting = false;
      if (waiting) { clearTimeout(timer); timer = setTimeout(retryPlayback, 12000); }
      return;
    }
    const resume = wanted;
    waiting = false; restarting = true; tell(""); if (retry) retry.hidden = true;
    player.addEventListener("loadedmetadata", () => {
      restarting = false;
      if (position > 0 && Number.isFinite(player.duration)) player.currentTime = Math.min(position, player.duration);
      if (resume) player.play().catch(() => {}); else release();
    }, {once: true});
    player.load();
  }
  player.addEventListener("play", () => {
    wanted = true;
    if (waiting) { player.pause(); retryPlayback(); } else admit();
  });
  player.addEventListener("pause", () => {
    if (waiting || restarting) return;
    wanted = false; release(); refreshCounts();
  });
  player.addEventListener("ended", () => { wanted = false; release(); refreshCounts(); });
  player.addEventListener("emptied", () => {
    if (restarting) return;
    if (!file()) { clearTimeout(timer); waiting = false; wanted = false; position = 0; release(); }
  });
  player.addEventListener("loadstart", () => {
    if (leasedFile && leasedFile !== file()) { release(); position = 0; }
    refreshCounts();
  });
  player.addEventListener("error", async () => {
    const path = file(); if (!path) return;
    release();
    try {
      const response = await fetch(path + "?availability=stream", {cache: "no-store"});
      if (response.status === 429 || player.error?.code === MediaError.MEDIA_ERR_NETWORK || player.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
        // A freed slot may already be available by the time this probe arrives.
        if (response.status === 429 || response.ok && player.error?.code === MediaError.MEDIA_ERR_NETWORK) { wait(); return; }
      }
    } catch { /* The browser retains its normal media error controls. */ }
    tell("Nie udało się odtworzyć filmu. Spróbuj ponownie lub pobierz plik.");
    if (retry) retry.hidden = false;
  });
  retry?.addEventListener("click", retryPlayback);
  document.addEventListener("click", async event => {
    const link = event.target.closest?.('a[href*="download=1"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = new URL(link.href, location.href); if (target.origin !== location.origin) return;
    event.preventDefault();
    try {
      const response = await fetch(target.pathname + "?availability=download", {cache: "no-store"});
      if (response.status === 429) { tell("Wszystkie miejsca do pobierania są teraz zajęte. Poczekaj chwilę i kliknij ponownie „Pobierz film”."); return; }
    } catch { /* The actual download endpoint also returns a readable busy page. */ }
    tell(""); location.assign(target.href);
  });
  setInterval(() => {
    if (!player.paused && !player.ended && !waiting) admit();
    else refreshCounts();
  }, 15000);
  window.addEventListener("pagehide", release);
  refreshCounts();
})();
