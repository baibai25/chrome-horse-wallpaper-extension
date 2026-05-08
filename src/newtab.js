import { loadUrlList } from "./storage.js";
import { getCachedImage } from "./imageCache.js";

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
        "Image list is empty. Please add URLs from the extension's options page."
      );
      return;
    }
    await setRandomBackgroundImage(imageList);
  } catch (error) {
    console.error("Failed to load image list:", error);
  }
}

async function setRandomBackgroundImage(imageList) {
  const shuffled = shuffle([...imageList]);
  for (const url of shuffled) {
    const blob = await getCachedImage(url).catch(() => null);
    if (blob) {
      document.body.style.backgroundImage = `url('${URL.createObjectURL(blob)}')`;
      return;
    }
    const ok = await tryLoadImage(url);
    if (ok) {
      document.body.style.backgroundImage = `url('${url}')`;
      return;
    }
    console.warn(`Failed to load image: ${url}`);
  }
  console.error("Failed to load any image URL");
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
