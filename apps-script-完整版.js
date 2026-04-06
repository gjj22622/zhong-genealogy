/**
 * =====================================================
 * 鐘氏族譜 — Google Apps Script 完整版
 * =====================================================
 *
 * 首次使用：
 * 1. 打開族人資料 Google Sheet → 擴充功能 → Apps Script
 * 2. 全選刪除原有程式碼，貼上這整份
 * 3. 儲存（Ctrl+S）
 * 4. 上方函式選「initialSetup」→ 按 ▶ 執行 → 授權
 * 5. 完成！Sheet 上方會出現「族譜管理」選單
 *
 * 建立表單（只需做一次）：
 * - 函式選「createAddPersonForm」→ 執行 → Logger 看網址
 * - 函式選「createEditFormV2」→ 執行 → Logger 看網址
 * - 兩個表單都要「回覆 → 連結到試算表 → 選擇現有試算表」
 * - 分頁名稱必須是「新增族人申請」和「資料修改申請」
 *
 * 日常審核：
 * - 在回覆表的「審核」欄選「✅ 通過」
 * - 上方選單 → 族譜管理 → 🔄 執行審核
 * =====================================================
 */

// ========== 設定區 ==========
const ADMIN_EMAIL = 'gjj22622@gmail.com';
const MAIN_SHEET = '族人資料';
const ADD_SHEET = '新增族人申請';
const EDIT_SHEET = '資料修改申請';


// ==========================================================
//  一、選單與初始設定
// ==========================================================

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

function initialSetup() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 在新增申請表加入「審核」欄
  _addReviewColumn(ss, ADD_SHEET);
  // 在修改申請表加入「審核」欄
  _addReviewColumn(ss, EDIT_SHEET);

  // 設定觸發器
  const triggers = ScriptApp.getProjectTriggers();

  if (!triggers.some(t => t.getHandlerFunction() === 'onFormSubmitNotify')) {
    ScriptApp.newTrigger('onFormSubmitNotify')
      .forSpreadsheet(ss)
      .onFormSubmit()
      .create();
  }
  if (!triggers.some(t => t.getHandlerFunction() === 'onOpen')) {
    ScriptApp.newTrigger('onOpen')
      .forSpreadsheet(ss)
      .onOpen()
      .create();
  }

  ui.alert(
    '✅ 初始設定完成！\n\n' +
    '1. 已在回覆表新增「審核」欄（下拉選單）\n' +
    '2. 已設定新申請 Email 通知\n' +
    '3. 上方選單已出現「族譜管理」\n\n' +
    '審核方式：在「審核」欄選「✅ 通過」→ 點「族譜管理 → 🔄 執行審核」'
  );
}

function _addReviewColumn(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) { Logger.log('找不到「' + sheetName + '」'); return; }
  if (sheet.getLastColumn() === 0) { Logger.log('「' + sheetName + '」是空的'); return; }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (headers.indexOf('審核') !== -1) { Logger.log('「' + sheetName + '」已有審核欄'); return; }

  const nextCol = sheet.getLastColumn() + 1;
  sheet.getRange(1, nextCol).setValue('審核');

  if (sheet.getLastRow() > 1) {
    const range = sheet.getRange(2, nextCol, sheet.getLastRow() - 1, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['✅ 通過', '❌ 退回', '⏳ 待審核'])
      .setAllowInvalid(false)
      .build();
    range.setDataValidation(rule);
    range.setValue('⏳ 待審核');
  }
  Logger.log('已在「' + sheetName + '」新增「審核」欄');
}


// ==========================================================
//  二、新申請自動 Email 通知管理員
// ==========================================================

function onFormSubmitNotify(e) {
  try {
    const sheetName = e.range.getSheet().getName();
    const row = e.namedValues || {};
    let subject, body;

    if (sheetName === ADD_SHEET) {
      const name = _val(row, '族人姓名');
      const applicant = _val(row, '申請人姓名');
      subject = '【族譜】新增申請：' + name + '（' + applicant + '）';
      body = '收到新增族人申請，請到 Google Sheet 審核。\n\n' +
        '族人姓名：' + name + '\n' +
        '申請人：' + applicant + '\n' +
        'Email：' + _val(row, 'Email') + '\n\n' +
        '→ 到「' + ADD_SHEET + '」分頁，審核欄選「✅ 通過」→ 族譜管理 → 執行審核';
    } else if (sheetName === EDIT_SHEET) {
      const target = _val(row, '要修改的族人姓名');
      const applicant = _val(row, '申請人姓名');
      subject = '【族譜】修改申請：' + target + '（' + applicant + '）';
      body = '收到資料修改申請，請到 Google Sheet 審核。\n\n' +
        '要修改的族人：' + target + '\n' +
        '申請人：' + applicant + '\n' +
        'Email：' + _val(row, 'Email') + '\n\n' +
        '→ 到「' + EDIT_SHEET + '」分頁，審核欄選「✅ 通過」→ 族譜管理 → 執行審核';
    } else {
      return;
    }

    // 自動在新行加入審核下拉選單
    _setReviewDropdown(e.range.getSheet(), e.range.getRow());

    MailApp.sendEmail(ADMIN_EMAIL, subject, body);
    Logger.log('通知已發送：' + subject);
  } catch (err) {
    Logger.log('通知錯誤：' + err.message);
  }
}

function _val(row, key) {
  return row[key] ? row[key][0] : '未填';
}

function _setReviewDropdown(sheet, rowNum) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const reviewCol = headers.indexOf('審核') + 1;
  if (reviewCol <= 0) return;
  const cell = sheet.getRange(rowNum, reviewCol);
  cell.setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['✅ 通過', '❌ 退回', '⏳ 待審核'])
      .setAllowInvalid(false)
      .build()
  );
  cell.setValue('⏳ 待審核');
}


// ==========================================================
//  三、執行審核
// ==========================================================

function runReview() {
  const addCount = processAddRequests();
  const editCount = processEditRequests();
  SpreadsheetApp.getUi().alert(
    '審核完成！\n\n' +
    '新增族人：' + addCount + ' 筆（自動加入主表）\n' +
    '修改資料：' + editCount + ' 筆（自動修改主表）\n\n' +
    '已發送審核結果 Email 通知申請人。'
  );
}


// ==========================================================
//  四、處理新增申請
// ==========================================================

function processAddRequests() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const addSheet = ss.getSheetByName(ADD_SHEET);
  const mainSheet = ss.getSheetByName(MAIN_SHEET);
  if (!addSheet || !mainSheet) { Logger.log('找不到工作表'); return 0; }

  const data = addSheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim());
  const reviewCol = headers.indexOf('審核');
  if (reviewCol === -1) { Logger.log('找不到「審核」欄'); return 0; }

  const mainData = mainSheet.getDataRange().getValues();
  let maxId = 0;
  mainData.forEach(row => {
    const num = parseInt(String(row[0]).replace('p', ''));
    if (!isNaN(num) && num > maxId) maxId = num;
  });

  const col = (name) => headers.indexOf(name);
  let count = 0;

  for (let i = 1; i < data.length; i++) {
    const status = String(data[i][reviewCol]).trim();
    if (status !== '✅ 通過') continue;

    const name = col('族人姓名') >= 0 ? String(data[i][col('族人姓名')]).trim() : '';
    if (!name) continue;

    const genderRaw = col('性別') >= 0 ? String(data[i][col('性別')]) : '';
    const gender = (genderRaw === '女' || genderRaw === 'female') ? 'female' : 'male';

    const genRaw = col('世代（第幾代）') >= 0 ? String(data[i][col('世代（第幾代）')]) : '';
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
      if (!parentId) Logger.log('⚠️ 找不到父親「' + fatherName + '」');
    }

    const newId = 'p' + (++maxId);

    mainSheet.appendRow([
      newId, name, gender, generation,
      branch === '不確定' ? '' : branch,
      birthYear, deathYear, spouse,
      '', parentId, notes
    ]);

    // 更新父親的 childrenIds（在主表找到父親那行，在 childrenIds 欄加入新 ID）
    if (parentId) {
      for (let j = 1; j < mainData.length; j++) {
        if (String(mainData[j][0]).trim() === parentId) {
          const childrenCol = 9; // childrenIds 是第 9 欄（0-indexed=8, 1-indexed=9）
          const existing = String(mainData[j][8] || '').trim();
          const updated = existing ? existing + ',' + newId : newId;
          mainSheet.getRange(j + 1, childrenCol).setValue(updated);
          Logger.log('   ↳ 已更新父親 ' + parentId + ' 的 childrenIds：' + updated);
          break;
        }
      }
    }

    addSheet.getRange(i + 1, reviewCol + 1).clearDataValidations().setValue('✅ 已加入 (' + newId + ')');
    count++;
    Logger.log('✅ 已新增：' + name + ' → ' + newId);

    // 通知申請人
    const email = col('Email') >= 0 ? String(data[i][col('Email')]).trim() : '';
    const applicant = col('申請人姓名') >= 0 ? String(data[i][col('申請人姓名')]) : '';
    _notifyApplicant(email, applicant, '新增族人', '已將「' + name + '」加入族譜（編號 ' + newId + '）', true);
  }

  Logger.log('新增申請處理完成：' + count + ' 筆');
  return count;
}


// ==========================================================
//  五、處理修改申請（自動修改主表）
// ==========================================================

function processEditRequests() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const editSheet = ss.getSheetByName(EDIT_SHEET);
  const mainSheet = ss.getSheetByName(MAIN_SHEET);
  if (!editSheet || !mainSheet) { Logger.log('找不到工作表'); return 0; }

  const data = editSheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim());
  const reviewCol = headers.indexOf('審核');
  if (reviewCol === -1) { Logger.log('找不到「審核」欄'); return 0; }

  const col = (name) => headers.indexOf(name);

  const mainData = mainSheet.getDataRange().getValues();
  const mainHeaders = mainData[0];

  // 表單欄位 → 主表欄位 index
  // 主表順序：id(0) name(1) gender(2) generation(3) branch(4) birthYear(5) deathYear(6) spouse(7) childrenIds(8) parentId(9) notes(10)
  const fieldMap = [
    { formCol: '正確姓名',           mainIdx: 1 },
    { formCol: '正確性別',           mainIdx: 2, transform: v => v === '女' ? 'female' : v === '男' ? 'male' : null },
    { formCol: '正確世代（第幾代）',  mainIdx: 3 },
    { formCol: '正確支系',           mainIdx: 4, transform: v => v === '不修改' ? null : v },
    { formCol: '正確出生年（西元）',  mainIdx: 5 },
    { formCol: '正確卒年（西元）',    mainIdx: 6, transform: v => v === '在世' ? '' : v },
    { formCol: '正確配偶姓名',       mainIdx: 7 },
    { formCol: '正確父親姓名',       mainIdx: 9, isFather: true },
    { formCol: '正確備註',           mainIdx: 10 },
  ];

  let count = 0;

  for (let i = 1; i < data.length; i++) {
    const status = String(data[i][reviewCol]).trim();
    if (status !== '✅ 通過') continue;

    const targetName = col('要修改的族人姓名') >= 0 ? String(data[i][col('要修改的族人姓名')]).trim() : '';
    if (!targetName) continue;

    // 在主表找這個人
    let targetRow = -1;
    for (let j = 1; j < mainData.length; j++) {
      if (String(mainData[j][1]).trim() === targetName) {
        targetRow = j;
        break;
      }
    }
    if (targetRow === -1) {
      editSheet.getRange(i + 1, reviewCol + 1).clearDataValidations().setValue('❌ 找不到「' + targetName + '」');
      Logger.log('❌ 找不到族人：' + targetName);
      continue;
    }

    // 逐欄修改
    const changes = [];
    for (const field of fieldMap) {
      const formIdx = col(field.formCol);
      if (formIdx === -1) continue;

      let newValue = String(data[i][formIdx]).trim();
      if (!newValue || newValue === '不修改') continue;

      if (field.transform) {
        const t = field.transform(newValue);
        if (t === null) continue;
        newValue = t;
      }

      // 父親姓名 → 找 ID
      if (field.isFather) {
        let foundId = '';
        for (let j = 1; j < mainData.length; j++) {
          if (String(mainData[j][1]).trim() === newValue) { foundId = String(mainData[j][0]); break; }
        }
        if (!foundId) { Logger.log('⚠️ 找不到父親「' + newValue + '」'); continue; }
        newValue = foundId;
      }

      const oldValue = String(mainData[targetRow][field.mainIdx]).trim();
      if (oldValue !== newValue) {
        mainSheet.getRange(targetRow + 1, field.mainIdx + 1).setValue(newValue);
        changes.push(String(mainHeaders[field.mainIdx]) + '：' + (oldValue || '(空)') + ' → ' + newValue);
      }
    }

    if (changes.length > 0) {
      editSheet.getRange(i + 1, reviewCol + 1).clearDataValidations().setValue('✅ 已修改（' + changes.length + '欄）');
      Logger.log('✅ 已修改「' + targetName + '」：' + changes.join('、'));
    } else {
      editSheet.getRange(i + 1, reviewCol + 1).clearDataValidations().setValue('✅ 已處理（無變更）');
    }
    count++;

    // 通知申請人
    const email = col('Email') >= 0 ? String(data[i][col('Email')]).trim() : '';
    const applicant = col('申請人姓名') >= 0 ? String(data[i][col('申請人姓名')]) : '';
    const detail = changes.length > 0 ? '已修改「' + targetName + '」：' + changes.join('、') : '「' + targetName + '」無需變更';
    _notifyApplicant(email, applicant, '資料修改', detail, true);
  }

  Logger.log('修改申請處理完成：' + count + ' 筆');
  return count;
}


// ==========================================================
//  六、通知申請人
// ==========================================================

function _notifyApplicant(email, name, type, detail, approved) {
  if (!email || !email.includes('@')) return;
  try {
    const subject = '【鐘氏族譜】您的' + type + '申請' + (approved ? '已通過' : '已退回');
    const body =
      (name || '族人') + '您好，\n\n' +
      '您提交的' + type + '申請審核結果：' + (approved ? '✅ 已通過' : '❌ 已退回') + '\n\n' +
      detail + '\n\n' +
      (approved ? '族譜已更新，重新開啟網頁即可看到最新資料。\n\n' : '\n') +
      '鐘氏族譜維護人 鐘基啟\ngjj22622@gmail.com';
    MailApp.sendEmail(email, subject, body);
    Logger.log('已通知：' + email);
  } catch(e) {
    Logger.log('通知失敗：' + e.message);
  }
}


// ==========================================================
//  七、資料完整性檢查
// ==========================================================

function validateData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(MAIN_SHEET);
  const data = sheet.getDataRange().getValues();

  const ids = new Set();
  const issues = [];

  for (let i = 1; i < data.length; i++) {
    const id = String(data[i][0]).trim();
    const name = String(data[i][1]).trim();
    if (!id) { issues.push('第' + (i+1) + '行：缺少 ID'); continue; }
    if (!name) issues.push('第' + (i+1) + '行（' + id + '）：缺少姓名');
    if (ids.has(id)) issues.push('第' + (i+1) + '行：重複 ID「' + id + '」');
    ids.add(id);
  }

  for (let i = 1; i < data.length; i++) {
    const pid = String(data[i][9]).trim();
    if (pid && pid !== 'undefined' && pid !== 'null' && !ids.has(pid)) {
      issues.push('第' + (i+1) + '行（' + data[i][1] + '）：父親 ID「' + pid + '」不存在');
    }
  }

  const msg = issues.length === 0
    ? '✅ 資料完整！共 ' + (data.length - 1) + ' 筆族人'
    : '⚠️ 發現 ' + issues.length + ' 個問題：\n\n' + issues.join('\n');
  SpreadsheetApp.getUi().alert(msg);
}


// ==========================================================
//  八、建立「新增族人申請」表單
// ==========================================================

function createAddPersonForm() {
  const form = FormApp.create('鐘氏族譜 — 新增族人申請');

  form.setDescription(
    '歡迎鐘氏族人提交新增族人資料的申請。\n' +
    '填寫後管理員會審核，通過後會正式加入族譜中。\n\n' +
    '族譜維護人：鐘基啟（gjj22622@gmail.com）'
  );
  form.setConfirmationMessage('感謝您的提交！管理員收到後會盡快審核，結果會以 Email 通知您。');

  // 申請人資訊
  form.addSectionHeaderItem().setTitle('一、您的聯絡資訊');
  form.addTextItem().setTitle('申請人姓名').setRequired(true);
  form.addTextItem().setTitle('Email').setHelpText('審核通過後會以 Email 通知您，請務必填寫正確').setRequired(true);
  form.addTextItem().setTitle('手機號碼').setHelpText('選填');
  form.addTextItem().setTitle('Line ID').setHelpText('選填');
  form.addParagraphTextItem().setTitle('您與族人的關係').setHelpText('例如：我是鍾俊雄的孫子');

  // 族人資料
  form.addSectionHeaderItem().setTitle('二、要新增的族人資料');
  form.addTextItem().setTitle('族人姓名').setHelpText('例如：鍾○○').setRequired(true);
  form.addMultipleChoiceItem().setTitle('性別').setChoiceValues(['男', '女']).setRequired(true);
  form.addMultipleChoiceItem().setTitle('世代（第幾代）')
    .setHelpText('渡台祖=第0代')
    .setChoiceValues(['第1代','第2代','第3代','第4代','第5代','第6代','第7代','第8代','第9代','第10代','第11代','不確定'])
    .setRequired(true);
  form.addMultipleChoiceItem().setTitle('支系').setChoiceValues(['頂番婆','草湳底','埔姜崙','不確定']).setRequired(true);
  form.addTextItem().setTitle('出生年（西元）').setHelpText('例如：1990，不確定可留空');
  form.addTextItem().setTitle('卒年（西元）').setHelpText('在世者留空');
  form.addTextItem().setTitle('配偶姓名').setHelpText('沒有可留空');
  form.addTextItem().setTitle('父親姓名').setHelpText('族譜中父親的全名').setRequired(true);
  form.addParagraphTextItem().setTitle('備註').setHelpText('職業、居住地等，可留空');

  form.setCollectEmail(false);
  const url = form.getPublishedUrl();
  Logger.log('✅ 新增族人申請表單已建立：' + url);
  return url;
}


// ==========================================================
//  九、建立「資料修改申請」表單（新版，結構化）
// ==========================================================

function createEditFormV2() {
  const form = FormApp.create('鐘氏族譜 — 資料修改申請');

  form.setDescription(
    '發現族譜資料有誤？請填寫此表單。\n' +
    '直接填入「正確的值」，不需要改的欄位留空。\n' +
    '管理員審核通過後會自動更新族譜。\n\n' +
    '族譜維護人：鐘基啟（gjj22622@gmail.com）'
  );
  form.setConfirmationMessage('感謝您的回報！審核結果會以 Email 通知您。');

  // 申請人資訊
  form.addSectionHeaderItem().setTitle('一、您的聯絡資訊');
  form.addTextItem().setTitle('申請人姓名').setRequired(true);
  form.addTextItem().setTitle('Email').setHelpText('審核通過後會以 Email 通知您，請務必填寫正確').setRequired(true);
  form.addTextItem().setTitle('手機號碼').setHelpText('選填');
  form.addTextItem().setTitle('Line ID').setHelpText('選填');

  // 要修改誰
  form.addSectionHeaderItem().setTitle('二、要修改的族人');
  form.addTextItem().setTitle('要修改的族人姓名').setHelpText('族譜上目前顯示的姓名').setRequired(true);

  // 修改內容
  form.addSectionHeaderItem().setTitle('三、修改內容（不需要改的欄位留空）');
  form.addTextItem().setTitle('正確姓名').setHelpText('姓名有誤才填，不改就留空');
  form.addMultipleChoiceItem().setTitle('正確性別').setChoiceValues(['不修改', '男', '女']);
  form.addTextItem().setTitle('正確世代（第幾代）').setHelpText('例如：9');
  form.addMultipleChoiceItem().setTitle('正確支系').setChoiceValues(['不修改', '頂番婆', '草湳底', '埔姜崙']);
  form.addTextItem().setTitle('正確出生年（西元）').setHelpText('例如：1943');
  form.addTextItem().setTitle('正確卒年（西元）').setHelpText('在世者填「在世」');
  form.addTextItem().setTitle('正確配偶姓名');
  form.addTextItem().setTitle('正確父親姓名');
  form.addParagraphTextItem().setTitle('正確備註');
  form.addParagraphTextItem().setTitle('其他說明').setHelpText('補充修改原因等');

  form.setCollectEmail(false);
  const url = form.getPublishedUrl();
  Logger.log('✅ 資料修改申請表單已建立：' + url);
  Logger.log('');
  Logger.log('下一步：');
  Logger.log('1. 打開此表單 → 回覆 → 連結到試算表 → 選你的族人資料 Sheet');
  Logger.log('2. 新分頁改名為「資料修改申請」（刪除舊的）');
  Logger.log('3. 把表單網址更新到族譜 HTML');
  return url;
}
