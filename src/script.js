document.addEventListener("DOMContentLoaded", function () {
  // 画像のリスト
  // TODO: ネット画像か、スクレイピングされた画像一覧にする
  var imageList = [
    "images/image1.jpg",
    "images/image2.jpg",
    "https://cdn.netkeiba.com/img.db/v1.1/show_photo.php?horse_id=2018102167&no=67944&tn=&tmp=no",
    "https://cdn.netkeiba.com/img.db/v1.1/show_photo.php?horse_id=2018102167&no=81255&tn=&tmp=no",
  ];

  // ランダムな画像の選択
  var randomIndex = Math.floor(Math.random() * imageList.length);
  var randomImage = imageList[randomIndex];

  // CSSで背景画像を設定
  document.body.style.backgroundImage = "url('" + randomImage + "')";

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
