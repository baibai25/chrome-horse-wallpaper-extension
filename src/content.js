document.addEventListener("DOMContentLoaded", function () {
  initializeBackgroundImage();
  initializeDateTimeDisplay();
});

function initializeBackgroundImage() {
  chrome.runtime.sendMessage({ message: "get_data" }, (imageList) => {
    const randomImage = selectRandomImage(imageList);
    document.body.style.backgroundImage = `url('${randomImage}')`;
  });
}

function selectRandomImage(imageList) {
  const randomIndex = Math.floor(Math.random() * imageList.length);
  return imageList[randomIndex];
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
