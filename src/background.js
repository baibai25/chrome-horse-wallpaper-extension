// 初回インストールの検出
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    // 初回インストール時の処理
    const gasUrl =
      "https://script.google.com/macros/s/AKfycbzbQgwnBYmqWjXv8ILaFmtlKpbh7RL-v_HlkpRcC53cskyXEFx6GyxNxkhCkWN6rMKqwg/exec";

    fetch(gasUrl)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // GASからのデータをリストとして格納
        const urlList = data.map((item) => item.URL);

        // リストを拡張機能の永続ストレージに保存
        // chrome.storage.sync.set({ imageList: urlList }, function () {
        chrome.storage.local.set({ imageList: urlList }, function () {
          console.log("APIデータを保存しました");
        });
      })
      .catch((error) => {
        console.error("データの取得中にエラーが発生しました: ", error);
      });
  }
});

// 新しいタブを開いたときにデータを読み込み、content.jsに送信
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "get_data") {
    // 永続ストレージからデータを取得
    chrome.storage.local.get(["imageList"], function (result) {
      const imageList = result.imageList || [];
      sendResponse(imageList);
    });

    // 非同期を同期的に扱うためのtrue
    return true;
  }
});
