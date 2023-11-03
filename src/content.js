document.addEventListener("DOMContentLoaded", function () {
  chrome.runtime.sendMessage(
    {
      message: "get_data",
    },
    (imageList) => {
      console.log(imageList);

      // ランダムな画像の選択
      var randomIndex = Math.floor(Math.random() * imageList.length);
      var randomImage = imageList[randomIndex];

      // CSSで背景画像を設定
      document.body.style.backgroundImage = "url('" + randomImage + "')";
    }
  );

  // 日付と時刻を表示
  var dateContainer = document.getElementById("date");
  var timeContainer = document.getElementById("time");

  function updateDateTime() {
    var currentDate = new Date();
    var options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    };
    var formattedDate = currentDate.toLocaleDateString("en-US", options);
    var formattedTime = currentDate.toLocaleTimeString();

    timeContainer.textContent = formattedTime;
    dateContainer.textContent = formattedDate;
  }

  updateDateTime();
  setInterval(updateDateTime, 1000);
});
