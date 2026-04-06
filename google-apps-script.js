/**
 * 鐘氏族譜 — Google Apps Script（審核機制）
 *
 * 設定步驟：
 * 1. 打開你的族人資料 Google Sheet
 * 2. 擴充功能 → Apps Script
 * 3. 把這段程式碼全部貼上（取代原有內容）
 * 4. 儲存 → 執行「初始設定」
 * 5. 授權後即完成！
 *
 * 使用方式：
 * - 收到新申請 → 自動寄 Email 通知你
 * - 打開 Sheet → 上方選單出現「族譜管理」
 * - 在回覆表的「審核」欄選「✅ 通過」
 * - 點選單「族譜管理 → 執行審核」→ 自動處理
 */

// ========== 設定區（請確認名稱與你的 Sheet 一致）==========
const ADMIN_EMAIL = 'gjj22622@gmail.com';
const MAIN_SHEET = '族人資料';
const ADD_SHEET = '新增族人申請';
const EDIT_SHEET = '資料修改申請';

// ========== 自訂選單 ==========
function onOpen() {
  SpreadsheetApp.getUi().createMenu('族譜管理')
    .addItem('🔄 執行審核（新增 + 修改）', 'runReview')
    .addSeparator()
    .addItem('📋 只審核新增申請', 'processAddRequests')
    .addItem('📝 只審核修改申請', 'processEditRequests')
    .addSeparator()
    .addItem('✅ 檢查資料完整性', 'validateData')
    .addItem('⚙️ 初始設定（首次使用）', 'initialSetup')
    .addToUi();
}

// ========== 初始設定（只需執行一次）==========
function initialSetup() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. 在新增申請表加入「審核」欄
  const addSheet = ss.getSheetByName(ADD_SHEET);
  if (addSheet) {
    const addHeaders = addSheet.getRange(1, 1, 1, addSheet.getLastColumn()).getValues()[0];
    if (addHeaders.indexOf('審核') === -1) {
      const nextCol = addSheet.getLastColumn() + 1;
      addSheet.getRange(1, nextCol).setValue('審核');
      // 對所有現有行加入下拉選單
      if (addSheet.getLastRow() > 1) {
        const range = addSheet.getRange(2, nextCol, addSheet.getLastRow() - 1, 1);
        const rule = SpreadsheetApp.newDataValidation()
          .requireValueInList(['✅ 通過', '❌ 退回', '⏳ 待審核'])
          .setAllowInvalid(false)
          .build();
        range.setDataValidation(rule);
        range.setValue('⏳ 待審核');
      }
      Logger.log('已在「' + ADD_SHEET + '」新增「審核」欄');
    }
  }

  // 2. 在修改申請表加入「審核」欄
  const editSheet = ss.getSheetByName(EDIT_SHEET);
  if (editSheet) {
    const editHeaders = editSheet.getRange(1, 1, 1, editSheet.getLastColumn()).getValues()[0];
    if (editHeaders.indexOf('審核') === -1) {
      const nextCol = editSheet.getLastColumn() + 1;
      editSheet.getRange(1, nextCol).setValue('審核');
      if (editSheet.getLastRow() > 1) {
        const range = editSheet.getRange(2, nextCol, editSheet.getLastRow() - 1, 1);
        const rule = SpreadsheetApp.newDataValidation()
          .requireValueInList(['✅ 通過', '❌ 退回', '⏳ 待審核'])
          .setAllowInvalid(false)
          .build();
        range.setDataValidation(rule);
        range.setValue('⏳ 待審核');
      }
      Logger.log('已在「' + EDIT_SHEET + '」新增「審核」欄');
    }
  }

  // 3. 設定表單提交觸發器（Email 通知）
  const triggers = ScriptApp.getProjectTriggers();
  const hasFormTrigger = triggers.some(t => t.getHandlerFunction() === 'onFormSubmitNotify');
  if (!hasFormTrigger) {
    ScriptApp.newTrigger('onFormSubmitNotify')
      .forSpreadsheet(ss)
      .onFormSubmit()
      .create();
    Logger.log('已建立表單提交通知觸發器');
  }

  // 4. 設定 onOpen 觸發器（自訂選單）
  const hasOpenTrigger = triggers.some(t => t.getHandlerFunction() === 'onOpen');
  if (!hasOpenTrigger) {
    ScriptApp.newTrigger('onOpen')
      .forSpreadsheet(ss)
      .onOpen()
      .create();
    Logger.log('已建立選單觸發器');
  }

  ui.alert('✅ 初始設定完成！\n\n' +
    '1. 已在回覆表新增「審核」欄（下拉選單）\n' +
    '2. 已設定新申請 Email 通知\n' +
    '3. 上方選單已出現「族譜管理」\n\n' +
    '使用方式：在「審核」欄選「✅ 通過」→ 點「族譜管理 → 執行審核」');
}

// ========== 新申請 Email 通知 ==========
function onFormSubmitNotify(e) {
  try {
    const sheetName = e.range.getSheet().getName();
    const row = e.namedValues || {};

    let subject, body;

    if (sheetName === ADD_SHEET) {
      const name = row['族人姓名'] ? row['族人姓名'][0] : '未知';
      const applicant = row['申請人姓名'] ? row['申請人姓名'][0] : '未知';
      subject = '【族譜】新增申請：' + name + '（申請人：' + applicant + '）';
      body = '收到新增族人申請，請到 Google Sheet 審核。\n\n' +
        '族人姓名：' + name + '\n' +
        '申請人：' + applicant + '\n' +
        '聯絡方式：' + (row['聯絡方式（手機/Email/Line）'] ? row['聯絡方式（手機/Email/Line）'][0] : '') + '\n\n' +
        '請到「' + ADD_SHEET + '」工作表，在「審核」欄選擇「✅ 通過」後執行審核。';

      // 自動在新行加入審核下拉選單
      const sheet = e.range.getSheet();
      const reviewCol = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].indexOf('審核') + 1;
      if (reviewCol > 0) {
        const cell = sheet.getRange(e.range.getRow(), reviewCol);
        const rule = SpreadsheetApp.newDataValidation()
          .requireValueInList(['✅ 通過', '❌ 退回', '⏳ 待審核'])
          .setAllowInvalid(false)
          .build();
        cell.setDataValidation(rule);
        cell.setValue('⏳ 待審核');
      }
    } else if (sheetName === EDIT_SHEET) {
      const target = row['要修改的族人姓名'] ? row['要修改的族人姓名'][0] : '未知';
      const applicant = row['申請人姓名'] ? row['申請人姓名'][0] : '未知';
      subject = '【族譜】修改申請：' + target + '（申請人：' + applicant + '）';
      body = '收到資料修改申請，請到 Google Sheet 審核。\n\n' +
        '要修改的族人：' + target + '\n' +
        '修改欄位：' + (row['要修改哪些欄位？（可複選）'] ? row['要修改哪些欄位？（可複選）'][0] : '') + '\n' +
        '修改說明：' + (row['修改內容說明'] ? row['修改內容說明'][0] : '') + '\n' +
        '申請人：' + applicant + '\n\n' +
        '請到「' + EDIT_SHEET + '」工作表，在「審核」欄選擇「✅ 通過」後執行審核。\n' +
        '注意：修改申請需要你手動到「' + MAIN_SHEET + '」找到該族人並修改對應欄位。';

      // 自動在新行加入審核下拉選單
      const sheet = e.range.getSheet();
      const reviewCol = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].indexOf('審核') + 1;
      if (reviewCol > 0) {
        const cell = sheet.getRange(e.range.getRow(), reviewCol);
        const rule = SpreadsheetApp.newDataValidation()
          .requireValueInList(['✅ 通過', '❌ 退回', '⏳ 待審核'])
          .setAllowInvalid(false)
          .build();
        cell.setDataValidation(rule);
        cell.setValue('⏳ 待審核');
      }
    } else {
      return; // 不是我們的表單
    }

    MailApp.sendEmail(ADMIN_EMAIL, subject, body);
    Logger.log('通知已發送：' + subject);
  } catch (err) {
    Logger.log('通知錯誤：' + err.message);
  }
}

// ========== 執行全部審核 ==========
function runReview() {
  const addCount = processAddRequests();
  const editCount = processEditRequests();

  SpreadsheetApp.getUi().alert(
    '審核完成！\n\n' +
    '新增族人：' + addCount + ' 筆\n' +
    '修改申請：' + editCount + ' 筆已標記完成\n\n' +
    '（修改申請需手動到族人資料表修改對應欄位）'
  );
}

// ========== 處理新增申請 ==========
function processAddRequests() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const addSheet = ss.getSheetByName(ADD_SHEET);
  const mainSheet = ss.getSheetByName(MAIN_SHEET);
  if (!addSheet || !mainSheet) { Logger.log('找不到工作表'); return 0; }

  const data = addSheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim());
  const reviewCol = headers.indexOf('審核');
  if (reviewCol === -1) { Logger.log('找不到「審核」欄'); return 0; }

  // 找主表最大 ID
  const mainData = mainSheet.getDataRange().getValues();
  let maxId = 0;
  mainData.forEach(row => {
    const num = parseInt(String(row[0]).replace('p', ''));
    if (!isNaN(num) && num > maxId) maxId = num;
  });

  // 欄位對應
  const col = (name) => {
    const idx = headers.indexOf(name);
    return idx >= 0 ? idx : -1;
  };

  let count = 0;
  for (let i = 1; i < data.length; i++) {
    const status = String(data[i][reviewCol]).trim();
    if (status !== '✅ 通過') continue;

    const name = col('族人姓名') >= 0 ? String(data[i][col('族人姓名')]) : '';
    if (!name) continue;

    const genderRaw = col('性別') >= 0 ? String(data[i][col('性別')]) : '';
    const gender = (genderRaw === '女' || genderRaw === 'female') ? 'female' : 'male';

    const genRaw = col('世代（第幾代）') >= 0 ? String(data[i][col('世代（第幾代）')]) : '';
    // 解析「第9代」→ 9
    const genMatch = genRaw.match(/(\d+)/);
    const generation = genMatch ? genMatch[1] : '';

    const branch = col('支系') >= 0 ? String(data[i][col('支系')]) : '';
    const birthYear = col('出生年（西元）') >= 0 ? String(data[i][col('出生年（西元）')]) : '';
    const deathYear = col('卒年（西元）') >= 0 ? String(data[i][col('卒年（西元）')]) : '';
    const spouse = col('配偶姓名') >= 0 ? String(data[i][col('配偶姓名')]) : '';
    const fatherName = col('父親姓名') >= 0 ? String(data[i][col('父親姓名')]).trim() : '';
    const notes = col('備註') >= 0 ? String(data[i][col('備註')]) : '';

    // 用姓名找父親 ID
    let parentId = '';
    if (fatherName) {
      for (let j = 1; j < mainData.length; j++) {
        if (String(mainData[j][1]).trim() === fatherName) {
          parentId = String(mainData[j][0]);
          break;
        }
      }
      if (!parentId) Logger.log('⚠️ 找不到父親「' + fatherName + '」的 ID');
    }

    const newId = 'p' + (++maxId);

    // 加入主表
    mainSheet.appendRow([
      newId, name, gender, generation,
      branch === '不確定' ? '' : branch,
      birthYear, deathYear, spouse,
      '',       // childrenIds
      parentId, // parentId
      notes
    ]);

    // 標記已處理
    addSheet.getRange(i + 1, reviewCol + 1).setValue('✅ 已加入 (' + newId + ')');
    count++;
    Logger.log('✅ 已新增：' + name + ' → ' + newId + (parentId ? '，父親：' + parentId : ''));
  }

  Logger.log('新增申請處理完成：' + count + ' 筆');
  return count;
}

// ========== 處理修改申請（自動修改主表）==========
function processEditRequests() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const editSheet = ss.getSheetByName(EDIT_SHEET);
  const mainSheet = ss.getSheetByName(MAIN_SHEET);
  if (!editSheet || !mainSheet) { Logger.log('找不到工作表'); return 0; }

  const data = editSheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim());
  const reviewCol = headers.indexOf('審核');
  if (reviewCol === -1) { Logger.log('找不到「審核」欄'); return 0; }

  const col = (name) => {
    const idx = headers.indexOf(name);
    return idx >= 0 ? idx : -1;
  };

  // 讀取主表
  const mainData = mainSheet.getDataRange().getValues();
  const mainHeaders = mainData[0]; // id,name,gender,generation,branch,birthYear,deathYear,spouse,childrenIds,parentId,notes

  // 表單欄位 → 主表欄位 index 的對應
  const fieldMap = [
    { formCol: '正確姓名',         mainIdx: 1 },  // name
    { formCol: '正確性別',         mainIdx: 2, transform: (v) => v === '女' ? 'female' : v === '男' ? 'male' : null },
    { formCol: '正確世代（第幾代）', mainIdx: 3 },  // generation
    { formCol: '正確支系',         mainIdx: 4 },  // branch
    { formCol: '正確出生年（西元）', mainIdx: 5 },  // birthYear
    { formCol: '正確卒年（西元）',   mainIdx: 6, transform: (v) => v === '在世' ? '' : v },  // deathYear
    { formCol: '正確配偶姓名',     mainIdx: 7 },  // spouse
    { formCol: '正確父親姓名',     mainIdx: 9, isFather: true },  // parentId（需要比對姓名→ID）
    { formCol: '正確備註',         mainIdx: 10 }, // notes
  ];

  let count = 0;
  for (let i = 1; i < data.length; i++) {
    const status = String(data[i][reviewCol]).trim();
    if (status !== '✅ 通過') continue;

    const targetName = col('要修改的族人姓名') >= 0 ? String(data[i][col('要修改的族人姓名')]).trim() : '';
    if (!targetName) continue;

    // 在主表找到這個人
    let targetRow = -1;
    for (let j = 1; j < mainData.length; j++) {
      if (String(mainData[j][1]).trim() === targetName) {
        targetRow = j;
        break;
      }
    }

    if (targetRow === -1) {
      editSheet.getRange(i + 1, reviewCol + 1).setValue('❌ 找不到「' + targetName + '」');
      Logger.log('❌ 找不到族人：' + targetName);
      continue;
    }

    // 逐欄檢查並修改
    let changes = [];
    for (const field of fieldMap) {
      const formIdx = col(field.formCol);
      if (formIdx === -1) continue;

      let newValue = String(data[i][formIdx]).trim();
      if (!newValue || newValue === '不修改') continue;

      // 轉換值
      if (field.transform) {
        const transformed = field.transform(newValue);
        if (transformed === null) continue; // 「不修改」
        newValue = transformed;
      }

      // 父親姓名 → 找 ID
      if (field.isFather) {
        let foundId = '';
        for (let j = 1; j < mainData.length; j++) {
          if (String(mainData[j][1]).trim() === newValue) {
            foundId = String(mainData[j][0]);
            break;
          }
        }
        if (foundId) {
          newValue = foundId;
        } else {
          Logger.log('⚠️ 找不到父親「' + newValue + '」的 ID，跳過此欄');
          continue;
        }
      }

      const oldValue = String(mainData[targetRow][field.mainIdx]);
      if (oldValue.trim() !== newValue) {
        // 寫入主表（targetRow+1 因為 Sheet 是 1-indexed）
        mainSheet.getRange(targetRow + 1, field.mainIdx + 1).setValue(newValue);
        changes.push(String(mainHeaders[field.mainIdx]) + '：' + oldValue + ' → ' + newValue);
      }
    }

    if (changes.length > 0) {
      editSheet.getRange(i + 1, reviewCol + 1).setValue('✅ 已修改（' + changes.length + '欄）');
      Logger.log('✅ 已修改「' + targetName + '」：' + changes.join('、'));
    } else {
      editSheet.getRange(i + 1, reviewCol + 1).setValue('✅ 已處理（無變更）');
      Logger.log('📝 「' + targetName + '」無需修改的欄位');
    }
    count++;
  }

  Logger.log('修改申請處理完成：' + count + ' 筆');
  return count;
}

// ========== 檢查主表資料完整性 ==========
function validateData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(MAIN_SHEET);
  const data = sheet.getDataRange().getValues();

  const ids = new Set();
  const issues = [];

  for (let i = 1; i < data.length; i++) {
    const id = String(data[i][0]).trim();
    const name = String(data[i][1]).trim();
    if (!id) { issues.push('第 ' + (i+1) + ' 行缺少 ID'); continue; }
    if (!name) issues.push('第 ' + (i+1) + ' 行（' + id + '）缺少姓名');
    if (ids.has(id)) issues.push('重複 ID：' + id + '（第 ' + (i+1) + ' 行）');
    ids.add(id);
  }

  // 檢查 parentId
  for (let i = 1; i < data.length; i++) {
    const parentId = String(data[i][9]).trim();
    if (parentId && parentId !== 'undefined' && parentId !== 'null' && !ids.has(parentId)) {
      issues.push('第 ' + (i+1) + ' 行（' + data[i][1] + '）的父親 ID「' + parentId + '」不存在');
    }
  }

  const msg = issues.length === 0
    ? '✅ 資料完整性檢查通過！\n共 ' + (data.length - 1) + ' 筆族人'
    : '⚠️ 發現 ' + issues.length + ' 個問題：\n\n' + issues.join('\n');

  SpreadsheetApp.getUi().alert(msg);
  Logger.log(msg);
}
