// WARNING: Very slow
chrome.runtime.onMessage.addListener(function (request, sender, callback) {
  // 「ウェブアプリ」としてデプロイしているGASのURL
  const gasUrl =
    "https://script.google.com/macros/s/AKfycbzbQgwnBYmqWjXv8ILaFmtlKpbh7RL-v_HlkpRcC53cskyXEFx6GyxNxkhCkWN6rMKqwg/exec";

  fetch(gasUrl)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      // GASからのデータをリストとして格納
      const urlList = data.map((item) => item.URL);

      // リストをcallback経由でcontent.jsに返す
      callback(urlList);
    })
    .catch((error) => {
      console.error("データの取得中にエラーが発生しました: ", error);
    });

  // 非同期を同期的に扱うためのtrue
  return true;
});
