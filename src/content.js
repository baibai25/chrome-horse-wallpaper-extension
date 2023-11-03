document.addEventListener("DOMContentLoaded", function () {
  var imageList = []; // 画像のリストを初期化

  // test.txt ファイルのパス
  const fileUrl = "image_list.txt";

  // ファイルをフェッチして画像リストを取得
  fetch(fileUrl)
    .then((response) => response.text())
    .then((text) => {
      // テキストを改行で分割し、空白行をフィルタリングして画像リストに追加
      imageList = text.split("\n").filter((line) => line.trim() !== "");

      // ランダムな画像の選択
      var randomIndex = Math.floor(Math.random() * imageList.length);
      var randomImage = imageList[randomIndex];

      // CSSで背景画像を設定
      document.body.style.backgroundImage = "url('" + randomImage + "')";
    })
    .catch((error) => {
      console.error("Error while loading files: ", error);
    });

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
