function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var urlList = [];

  for (var i = 0; i < values.length; i++) {
    var url = values[i][0]; // URLが格納されている列のインデックスを指定

    // URLが有効な場合、リンクをJSONに追加
    if (url && isValidURL(url)) {
      var linkObject = {
        URL: url,
      };
      urlList.push(linkObject);
    }
  }

  var jsonString = JSON.stringify(urlList);

  // JSONデータをウェブ経由で返す
  return ContentService.createTextOutput(jsonString).setMimeType(
    ContentService.MimeType.JSON
  );
}

// URLが有効かどうかを確認する関数 (正規表現ではなくUrlFetchAppを使用)
function isValidURL(url) {
  try {
    var response = UrlFetchApp.fetch(url);
    return response.getResponseCode() === 200;
  } catch (e) {
    return false;
  }
}
