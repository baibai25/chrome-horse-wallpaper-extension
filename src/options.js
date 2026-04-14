import { loadUrlList, saveUrlList } from "./storage.js";

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
    showStatus(`読み込みに失敗しました: ${error.message}`, "error");
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
      `http:// または https:// で始まらない URL が ${invalid.length} 件あります`,
      "error"
    );
    return;
  }

  try {
    await saveUrlList(urls);
    updateCount(urls.length);
    showStatus(`${urls.length} 件の URL を保存しました`, "success");
  } catch (error) {
    showStatus(`保存に失敗しました: ${error.message}`, "error");
  }
}

async function handleCheck() {
  const urls = getUrlsFromTextarea();
  if (urls.length === 0) {
    showStatus("チェック対象の URL がありません", "error");
    return;
  }

  checkButton.disabled = true;
  saveButton.disabled = true;
  removeFailedButton.hidden = true;
  lastFailedUrls = [];
  renderCheckProgress(0, urls.length);

  const failed = [];
  let done = 0;
  const queue = [...urls];
  const worker = async () => {
    while (queue.length > 0) {
      const url = queue.shift();
      const ok = await tryLoadImage(url);
      done++;
      if (!ok) failed.push(url);
      renderCheckProgress(done, urls.length);
    }
  };
  const workerCount = Math.min(CHECK_CONCURRENCY, urls.length);
  await Promise.all(Array.from({ length: workerCount }, worker));

  checkButton.disabled = false;
  saveButton.disabled = false;
  lastFailedUrls = failed;

  if (failed.length === 0) {
    renderCheckSuccess(urls.length);
  } else {
    renderCheckFailure(failed, urls.length);
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
    `${removedCount} 件を削除しました。保存ボタンで確定してください`,
    "success"
  );
}

function resetCheckResult() {
  checkResultEl.textContent = "";
  removeFailedButton.hidden = true;
  lastFailedUrls = [];
}

function renderCheckProgress(done, total) {
  checkResultEl.textContent = `チェック中... ${done} / ${total}`;
}

function renderCheckSuccess(total) {
  checkResultEl.textContent = "";
  const span = document.createElement("span");
  span.className = "success";
  span.textContent = `すべての URL が読み込めました (${total} 件)`;
  checkResultEl.appendChild(span);
}

function renderCheckFailure(failed, total) {
  checkResultEl.textContent = "";
  const span = document.createElement("span");
  span.className = "error";
  span.textContent = `${failed.length} / ${total} 件が読み込めませんでした:`;
  checkResultEl.appendChild(span);
  const ul = document.createElement("ul");
  for (const url of failed) {
    const li = document.createElement("li");
    li.textContent = url;
    ul.appendChild(li);
  }
  checkResultEl.appendChild(ul);
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
  countEl.textContent = `登録 ${n} 件`;
}

function showStatus(message, kind) {
  statusEl.textContent = message;
  statusEl.className = kind;
  setTimeout(() => {
    statusEl.textContent = "";
    statusEl.className = "";
  }, 4000);
}
