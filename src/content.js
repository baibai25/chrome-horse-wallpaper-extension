document.addEventListener("DOMContentLoaded", function () {
  initializeBackgroundImage();
  initializeDateTimeDisplay();
});

function initializeBackgroundImage() {
  chrome.runtime.sendMessage({ message: "get_data" }, (response) => {
    if (response && response.imageList && response.imageList.length > 0) {
      const randomImage = selectRandomImage(response.imageList);
      setBackgroundImage(randomImage);
    } else {
      console.error("画像リストが取得できませんでした。");
    }
  });
}

function setBackgroundImage(imageUrl) {
  const img = new Image();
  img.onload = () =>
    (document.body.style.backgroundImage = `url('${imageUrl}')`);
  img.src = imageUrl;
}

function selectRandomImage(imageList) {
  const randomIndex = Math.floor(Math.random() * imageList.length);
  return imageList[randomIndex];
}

function initializeDateTimeDisplay() {
  const dateContainer = document.getElementById("date");
  const timeContainer = document.getElementById("time");
  const updateInterval = 1000; // 1秒ごとに更新

  function updateDateTime() {
    const currentDate = new Date();
    timeContainer.textContent = currentDate.toLocaleTimeString();
    dateContainer.textContent = formatDate(currentDate);
  }

  updateDateTime();
  setInterval(updateDateTime, updateInterval);
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
