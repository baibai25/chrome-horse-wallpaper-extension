import { loadUrlList, saveUrlList } from "./storage.js";
import { cacheImage, syncCache } from "./imageCache.js";

const IMAGE_CHECK_TIMEOUT_MS = 10000;
const CHECK_CONCURRENCY = 6;

const urlListEl = document.getElementById("url-list");
const saveButton = document.getElementById("save");
const checkButton = document.getElementById("check");
const removeFailedButton = document.getElementById("remove-failed");
const statusEl = document.getElementById("status");
const countEl = document.getElementById("count");
const checkResultEl = document.getElementById("check-result");

let lastFailedUrls = [];

document.addEventListener("DOMContentLoaded", init);

async function init() {
  try {
    const urls = await loadUrlList();
    urlListEl.value = urls.join("\n");
    updateCount(urls.length);
  } catch (error) {
    showStatus(`Failed to load: ${error.message}`, "error");
  }
  saveButton.addEventListener("click", handleSave);
  checkButton.addEventListener("click", handleCheck);
  removeFailedButton.addEventListener("click", handleRemoveFailed);
  urlListEl.addEventListener("input", resetCheckResult);
}

function getUrlsFromTextarea() {
  return urlListEl.value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

async function handleSave() {
  const urls = getUrlsFromTextarea();

  const invalid = urls.filter((url) => !/^https?:\/\//i.test(url));
  if (invalid.length > 0) {
    showStatus(
      `${invalid.length} URL(s) do not start with http:// or https://`,
      "error"
    );
    return;
  }

  try {
    await saveUrlList(urls);
    await syncCache(urls);
    updateCount(urls.length);
    showStatus(`Saved ${urls.length} URL(s)`, "success");
  } catch (error) {
    showStatus(`Failed to save: ${error.message}`, "error");
  }
}

async function handleCheck() {
  const urls = getUrlsFromTextarea();
  if (urls.length === 0) {
    showStatus("No URLs to check", "error");
    return;
  }

  checkButton.disabled = true;
  saveButton.disabled = true;
  removeFailedButton.hidden = true;
  lastFailedUrls = [];
  renderCheckProgress(0, urls.length);

  const failed = [];
  let done = 0;
  let cached = 0;
  const queue = [...urls];
  const worker = async () => {
    while (queue.length > 0) {
      const url = queue.shift();
      const ok = await tryLoadImage(url);
      done++;
      if (ok) {
        if (await tryCacheImage(url)) cached++;
      } else {
        failed.push(url);
      }
      renderCheckProgress(done, urls.length);
    }
  };
  const workerCount = Math.min(CHECK_CONCURRENCY, urls.length);
  await Promise.all(Array.from({ length: workerCount }, worker));

  checkButton.disabled = false;
  saveButton.disabled = false;
  lastFailedUrls = failed;

  if (failed.length === 0) {
    renderCheckSuccess(urls.length, cached);
  } else {
    renderCheckFailure(failed, urls.length, cached);
    removeFailedButton.hidden = false;
  }
}

function handleRemoveFailed() {
  if (lastFailedUrls.length === 0) return;
  const failedSet = new Set(lastFailedUrls);
  const remaining = getUrlsFromTextarea().filter((url) => !failedSet.has(url));
  urlListEl.value = remaining.join("\n");
  updateCount(remaining.length);
  const removedCount = lastFailedUrls.length;
  resetCheckResult();
  showStatus(
    `Removed ${removedCount} URL(s). Click Save to confirm.`,
    "success"
  );
}

function resetCheckResult() {
  checkResultEl.textContent = "";
  removeFailedButton.hidden = true;
  lastFailedUrls = [];
}

function renderCheckProgress(done, total) {
  checkResultEl.textContent = `Checking... ${done} / ${total}`;
}

function renderCheckSuccess(total, cached) {
  checkResultEl.textContent = "";
  const span = document.createElement("span");
  span.className = "success";
  span.textContent = `All URLs loaded successfully (${total} total, ${cached} cached)`;
  checkResultEl.appendChild(span);
}

function renderCheckFailure(failed, total, cached) {
  checkResultEl.textContent = "";
  const span = document.createElement("span");
  span.className = "error";
  span.textContent = `${failed.length} / ${total} URL(s) failed to load (${cached} cached):`;
  checkResultEl.appendChild(span);
  const ul = document.createElement("ul");
  for (const url of failed) {
    const li = document.createElement("li");
    li.textContent = url;
    ul.appendChild(li);
  }
  checkResultEl.appendChild(ul);
}

async function tryCacheImage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return false;
    const blob = await response.blob();
    await cacheImage(url, blob);
    return true;
  } catch {
    return false;
  }
}

function tryLoadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };
    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    setTimeout(() => finish(false), IMAGE_CHECK_TIMEOUT_MS);
    img.src = url;
  });
}

function updateCount(n) {
  countEl.textContent = `${n} registered`;
}

function showStatus(message, kind) {
  statusEl.textContent = message;
  statusEl.className = kind;
  setTimeout(() => {
    statusEl.textContent = "";
    statusEl.className = "";
  }, 4000);
}
