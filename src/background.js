chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    initializeImageStorage();
  }
});

chrome.runtime.onStartup.addListener(function () {
  checkAndUpdateImageStorage();
});

function checkAndUpdateImageStorage() {
  chrome.storage.local.get(["lastUpdate"], function (result) {
    const lastUpdate = result.lastUpdate ? new Date(result.lastUpdate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 今日の日付の0時0分0秒に設定

    if (!lastUpdate || lastUpdate < today) {
      initializeImageStorage();
    }
  });
}

function initializeImageStorage() {
  const gasUrl =
    "https://script.google.com/macros/s/AKfycbzbQgwnBYmqWjXv8ILaFmtlKpbh7RL-v_HlkpRcC53cskyXEFx6GyxNxkhCkWN6rMKqwg/exec";

  fetch(gasUrl)
    .then((response) => response.json())
    .then((data) => {
      const urlList = data.map((item) => item.URL);
      storeImageList(urlList);
      updateLastUpdateDate();
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

function updateLastUpdateDate() {
  const today = new Date();
  chrome.storage.local.set({ lastUpdate: today.toISOString() }, () => {
    console.log("最終更新日を保存しました");
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
