/**
 * 鐘氏族譜 — Google Apps Script
 *
 * 功能：
 * 1. 當有人填寫「新增族人申請」表單時，自動發 Email 通知管理員
 * 2. 管理員在 Google Sheet 上標記「通過」後，自動把資料加入族人主表
 *
 * 設定步驟：
 * 1. 打開你的族人資料 Google Sheet
 * 2. 擴充功能 > Apps Script
 * 3. 貼上這段程式碼
 * 4. 修改下面的常數（EMAIL、SHEET 名稱等）
 * 5. 執行 setupTriggers() 一次來設定自動觸發
 */

// ========== 設定區 ==========
const ADMIN_EMAIL = 'gjj22622@gmail.com';       // 管理員 Email
const MAIN_SHEET_NAME = '族人資料';               // 族人主表的工作表名稱
const ADD_RESPONSES_SHEET = '新增申請回覆';       // 新增表單的回覆工作表名稱
const EDIT_RESPONSES_SHEET = '修改申請回覆';      // 修改表單的回覆工作表名稱

// ========== 設定觸發器（只需執行一次）==========
function setupTriggers() {
  // 當「新增申請」表單有新回覆時觸發
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger('onNewAddRequest')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();
  Logger.log('觸發器已建立！');
}

// ========== 新增申請通知 ==========
function onNewAddRequest(e) {
  try {
    const responses = e.namedValues;
    const applicant = responses['申請人姓名'] ? responses['申請人姓名'][0] : '未知';
    const personName = responses['族人姓名'] ? responses['族人姓名'][0] : '未知';
    const contact = responses['聯絡方式（手機/Email/Line）'] ? responses['聯絡方式（手機/Email/Line）'][0] : '';

    const subject = `【鐘氏族譜】新增族人申請：${personName}`;
    const body = `
收到新的族人新增申請！

申請人：${applicant}
聯絡方式：${contact}
族人姓名：${personName}
性別：${responses['性別'] ? responses['性別'][0] : ''}
世代：${responses['世代（第幾代）'] ? responses['世代（第幾代）'][0] : ''}
支系：${responses['支系'] ? responses['支系'][0] : ''}
出生年：${responses['出生年（西元）'] ? responses['出生年（西元）'][0] : ''}
配偶：${responses['配偶姓名'] ? responses['配偶姓名'][0] : ''}
父親：${responses['父親姓名'] ? responses['父親姓名'][0] : ''}
備註：${responses['備註'] ? responses['備註'][0] : ''}

請到 Google Sheet 審核此申請。
    `.trim();

    MailApp.sendEmail(ADMIN_EMAIL, subject, body);
    Logger.log('已發送通知：' + subject);
  } catch (err) {
    Logger.log('通知發送失敗：' + err.message);
  }
}

// ========== 批准申請 → 自動加入主表 ==========
/**
 * 在「新增申請回覆」工作表中，新增一欄「審核狀態」
 * 管理員填入「通過」後，執行此函式會自動把通過的資料加入族人主表
 *
 * 使用方式：手動執行，或設定定時觸發（例如每小時）
 */
function processApprovedRequests() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const responseSheet = ss.getSheetByName(ADD_RESPONSES_SHEET);
  const mainSheet = ss.getSheetByName(MAIN_SHEET_NAME);

  if (!responseSheet || !mainSheet) {
    Logger.log('找不到工作表，請確認名稱設定');
    return;
  }

  const data = responseSheet.getDataRange().getValues();
  const headers = data[0];

  // 找到「審核狀態」欄的 index
  const statusCol = headers.indexOf('審核狀態');
  if (statusCol === -1) {
    Logger.log('請在回覆表新增「審核狀態」欄');
    return;
  }

  // 找到主表的最後一個 ID
  const mainData = mainSheet.getDataRange().getValues();
  let maxId = 0;
  mainData.forEach(row => {
    const id = String(row[0]);
    const num = parseInt(id.replace('p', ''));
    if (!isNaN(num) && num > maxId) maxId = num;
  });

  let addedCount = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = String(row[statusCol]).trim();

    // 只處理「通過」且尚未處理的
    if (status === '通過') {
      // 取得欄位（依據表單欄位順序，可能需要調整 index）
      const nameCol = headers.indexOf('族人姓名');
      const genderCol = headers.indexOf('性別');
      const genCol = headers.indexOf('世代（第幾代）');
      const branchCol = headers.indexOf('支系');
      const birthCol = headers.indexOf('出生年（西元）');
      const spouseCol = headers.indexOf('配偶姓名');
      const fatherCol = headers.indexOf('父親姓名');
      const notesCol = headers.indexOf('備註');

      const newId = 'p' + (++maxId);
      const name = nameCol >= 0 ? row[nameCol] : '';
      const gender = genderCol >= 0 ? row[genderCol] : 'male';
      const gen = genCol >= 0 ? row[genCol] : '';
      const branch = branchCol >= 0 ? row[branchCol] : '';
      const birth = birthCol >= 0 ? row[birthCol] : '';
      const spouse = spouseCol >= 0 ? row[spouseCol] : '';
      const father = fatherCol >= 0 ? row[fatherCol] : '';
      const notes = notesCol >= 0 ? row[notesCol] : '';

      // 找到父親的 ID（用姓名比對）
      let parentId = '';
      if (father) {
        for (let j = 1; j < mainData.length; j++) {
          if (String(mainData[j][1]).trim() === String(father).trim()) {
            parentId = String(mainData[j][0]);
            break;
          }
        }
      }

      // 加入主表
      mainSheet.appendRow([
        newId,                    // id
        name,                     // name
        gender === '女' ? 'female' : 'male',  // gender
        gen,                      // generation
        branch,                   // branch
        birth,                    // birthYear
        '',                       // deathYear
        spouse,                   // spouse
        '',                       // childrenIds
        parentId,                 // parentId
        notes                     // notes
      ]);

      // 標記已處理
      responseSheet.getRange(i + 1, statusCol + 1).setValue('已加入');
      addedCount++;

      Logger.log(`已加入：${name} (${newId})`);
    }
  }

  Logger.log(`本次處理完成，新增 ${addedCount} 筆`);
}

// ========== 工具：檢查主表資料完整性 ==========
function validateData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(MAIN_SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  let issues = [];
  const ids = new Set();

  for (let i = 1; i < data.length; i++) {
    const id = String(data[i][0]);
    const name = String(data[i][1]);
    const parentId = String(data[i][9]);

    if (ids.has(id)) issues.push(`重複 ID: ${id} (第 ${i+1} 行)`);
    ids.add(id);

    if (parentId && !ids.has(parentId)) {
      // parentId 可能在後面的行，先跳過
    }
  }

  // 二次檢查 parentId
  for (let i = 1; i < data.length; i++) {
    const parentId = String(data[i][9]).trim();
    if (parentId && parentId !== 'undefined' && parentId !== 'null' && !ids.has(parentId)) {
      issues.push(`找不到父親: ${data[i][1]} 的 parentId=${parentId} (第 ${i+1} 行)`);
    }
  }

  if (issues.length === 0) {
    Logger.log('資料完整性檢查通過！共 ' + (data.length - 1) + ' 筆');
  } else {
    Logger.log('發現問題：\n' + issues.join('\n'));
  }
}
