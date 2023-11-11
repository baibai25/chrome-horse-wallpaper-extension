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
    .then((data) => storeImageList(data.map((item) => item.URL)))
    .catch((error) =>
      console.error("データの取得中にエラーが発生しました: ", error)
    );
}

function storeImageList(urlList) {
  const imagePromises = urlList.map((url) => fetchImageAsBase64(url));
  Promise.all(imagePromises).then((base64Images) => {
    chrome.storage.local.set({ imageList: base64Images }, () => {
      console.log("画像データを保存しました");
    });
  });
}

function fetchImageAsBase64(url) {
  return fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        })
    );
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "get_data") {
    chrome.storage.local.get(["imageList"], function (result) {
      sendResponse(result.imageList || []);
    });
    return true;
  }
});
