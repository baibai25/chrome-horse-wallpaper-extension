import { loadUrlList } from "./storage.js";

const IMAGE_LOAD_TIMEOUT_MS = 8000;

document.addEventListener("DOMContentLoaded", () => {
  initializeBackgroundImage();
  initializeDateTimeDisplay();
});

async function initializeBackgroundImage() {
  try {
    const imageList = await loadUrlList();
    if (imageList.length === 0) {
      console.warn(
        "画像リストが未設定です。拡張機能のオプションページから URL を登録してください。"
      );
      return;
    }
    await setRandomBackgroundImage(imageList);
  } catch (error) {
    console.error("画像リストの読み込みに失敗しました:", error);
  }
}

async function setRandomBackgroundImage(imageList) {
  // ランダム順に試し、最初に読み込めた URL を背景に採用する。
  // Wikipedia などの削除済み画像で失敗しても新タブが空のままにならない。
  const shuffled = shuffle([...imageList]);
  for (const url of shuffled) {
    const ok = await tryLoadImage(url);
    if (ok) {
      document.body.style.backgroundImage = `url('${url}')`;
      return;
    }
    console.warn(`画像の読み込みに失敗しました: ${url}`);
  }
  console.error("すべての画像 URL が読み込めませんでした");
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
    setTimeout(() => finish(false), IMAGE_LOAD_TIMEOUT_MS);
    img.src = url;
  });
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function initializeDateTimeDisplay() {
  const dateContainer = document.getElementById("date");
  const timeContainer = document.getElementById("time");

  function updateDateTime() {
    const currentDate = new Date();
    timeContainer.textContent = currentDate.toLocaleTimeString();
    dateContainer.textContent = formatDate(currentDate);
  }

  updateDateTime();
  setInterval(updateDateTime, 1000);
}

function formatDate(date) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  };
  return date.toLocaleDateString("en-US", options);
}
