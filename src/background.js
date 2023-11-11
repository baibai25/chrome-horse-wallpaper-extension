chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    initializeImageStorage();
  }
});

function initializeImageStorage() {
  const gasUrl =
    "https://script.google.com/macros/s/AKfycbzbQgwnBYmqWjXv8ILaFmtlKpbh7RL-v_HlkpRcC53cskyXEFx6GyxNxkhCkWN6rMKqwg/exec";

  fetch(gasUrl)
    .then((response) => response.json())
    .then((data) => {
      const urlList = data.map((item) => item.URL);
      storeImageList(urlList);
    })
    .catch((error) =>
      console.error("データの取得中にエラーが発生しました: ", error)
    );
}

function storeImageList(urlList) {
  chrome.storage.local.set({ imageList: urlList }, () => {
    console.log("画像URLを保存しました");
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "get_data") {
    chrome.storage.local.get(["imageList"], function (result) {
      if (result && result.imageList) {
        sendResponse({ imageList: result.imageList });
      } else {
        sendResponse({ imageList: [] }); // 空のリストを返す
      }
    });
    return true; // 非同期レスポンスを許可
  }
});
