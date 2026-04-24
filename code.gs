// ==========================================
// 華媽咪閨蜜花園：後台終極修復版 (修復C欄空白問題)
// ==========================================

function doGet(e) {
  try {
    var userName = e.parameter.userName;
    var ss = SpreadsheetApp.openById("12fHl5DVSUrRQ1sG8F2lxUNIJ18UVz_YKNqnYod8BM04");
    
    // 計算活動點數
    var sheet1 = ss.getSheetByName("活動集點");
    var data1 = sheet1.getDataRange().getDisplayValues();
    var totalPoints = 0;
    for (var i = 1; i < data1.length; i++) {
      if (data1[i][1] === userName && data1[i][4] === "✅ 已發放") {
        totalPoints += parseFloat(data1[i][5]) || 0;
      }
    }
    
    // 計算蜜豆點數
    var sheet2 = ss.getSheetByName("累積蜜豆");
    var data2 = sheet2.getDataRange().getDisplayValues();
    var totalHoneyBeans = 0;
    for (var j = 1; j < data2.length; j++) {
      if (data2[j][1] === userName && data2[j][4] === "✅ 已發放") {
        totalHoneyBeans += parseFloat(data2[j][5]) || 0;
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      totalPoints: totalPoints,
      totalHoneyBeans: totalHoneyBeans
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ totalPoints: 0, totalHoneyBeans: 0 })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  var ss = SpreadsheetApp.openById("12fHl5DVSUrRQ1sG8F2lxUNIJ18UVz_YKNqnYod8BM04");
  try {
    var params = JSON.parse(e.postData.contents);
    var type = params.type;       // 判斷是 shop 還是 event
    var userName = params.userName;
    
    // 【重點：接收網頁傳來的活動名稱】
    var activityInfo = params.eventName || params.reason || params.giftName || "未註記活動";
    
    // 判斷存入哪張分頁
    var sheetName = (type === "shop") ? "累積蜜豆" : "活動集點";
    var sheet = ss.getSheetByName(sheetName);
    
    // 圖片處理邏輯 (請確保 folderId 是正確的)
    var folderId = "1qBxyKOYNpWuyn9jPckFQY7jlciSnK_Dn"; 
    var folder = DriveApp.getFolderById(folderId);
    var contentType = params.imageBlob.split(",")[0].split(":")[1].split(";")[0];
    var decode = Utilities.base64Decode(params.imageBlob.split(",")[1]);
    var blob = Utilities.newBlob(decode, contentType, userName + "_" + new Date().getTime());
    var file = folder.createFile(blob);
    var fileUrl = file.getUrl();

    // 【核心修復：寫入資料到表格】
    // 順序：A時間, B名字, C活動項目(就是原本空白那一格), D圖片連結, E狀態, F點數
    sheet.appendRow([
      new Date(),    // A: 時間戳記
      activityInfo,  // B: 參加的活動項目
      "",            // C: 上傳心得截圖（備用）
      fileUrl,       // D: 圖片
      "⏳ 待審核",  // E: 第1欄（狀態）
      0,             // F: 第2欄（點數）
      userName       // G: 顧客名稱
    ]);

    return ContentService.createTextOutput("Success");
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString());
  }
}