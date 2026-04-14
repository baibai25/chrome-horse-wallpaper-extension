import { loadUrlList, saveUrlList } from "./storage.js";

const urlListEl = document.getElementById("url-list");
const saveButton = document.getElementById("save");
const statusEl = document.getElementById("status");
const countEl = document.getElementById("count");

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
}

async function handleSave() {
  const urls = urlListEl.value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

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
