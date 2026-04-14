import { loadUrlList } from "./storage.js";

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
    const randomImage = imageList[Math.floor(Math.random() * imageList.length)];
    setBackgroundImage(randomImage);
  } catch (error) {
    console.error("画像リストの読み込みに失敗しました:", error);
  }
}

function setBackgroundImage(imageUrl) {
  const img = new Image();
  img.onload = () => {
    document.body.style.backgroundImage = `url('${imageUrl}')`;
  };
  img.onerror = () => {
    console.error(`画像の読み込みに失敗しました: ${imageUrl}`);
  };
  img.src = imageUrl;
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
