/**
 * 建立新版「資料修改申請」表單（結構化欄位，可自動審核）
 *
 * 使用方式：
 * 1. 在 Apps Script 執行 createEditFormV2()
 * 2. 從 Logger 取得新表單網址
 * 3. 把新表單連結到你的 Google Sheet（表單 → 回覆 → 選擇現有試算表）
 * 4. 把舊的「資料修改申請」分頁刪除或改名
 * 5. 新分頁命名為「資料修改申請」
 */

function createEditFormV2() {
  const form = FormApp.create('鐘氏族譜 — 資料修改申請（新版）');

  form.setDescription(
    '如果您發現族譜中有資料需要修改，請填寫此表單。\n' +
    '請直接填入「正確的值」，管理員審核通過後會自動更新族譜。\n\n' +
    '不需要修改的欄位留空即可。\n\n' +
    '族譜維護人：鐘基啟（gjj22622@gmail.com）'
  );

  form.setConfirmationMessage(
    '感謝您的回報！管理員審核後族譜會自動更新。'
  );

  // ===== 申請人資訊 =====
  form.addSectionHeaderItem()
    .setTitle('一、您的聯絡資訊');

  form.addTextItem()
    .setTitle('申請人姓名')
    .setRequired(true);

  form.addTextItem()
    .setTitle('聯絡方式（手機/Email/Line）')
    .setRequired(true);

  // ===== 要修改誰 =====
  form.addSectionHeaderItem()
    .setTitle('二、要修改的族人');

  form.addTextItem()
    .setTitle('要修改的族人姓名')
    .setHelpText('請填族譜上目前顯示的姓名，用來定位這個人')
    .setRequired(true);

  // ===== 修改內容（留空 = 不修改）=====
  form.addSectionHeaderItem()
    .setTitle('三、修改內容（不需要改的欄位留空）');

  form.addTextItem()
    .setTitle('正確姓名')
    .setHelpText('如果姓名有誤，填入正確的全名。不需改就留空。');

  form.addMultipleChoiceItem()
    .setTitle('正確性別')
    .setHelpText('不需改就選「不修改」')
    .setChoiceValues(['不修改', '男', '女']);

  form.addTextItem()
    .setTitle('正確世代（第幾代）')
    .setHelpText('例如：9。不需改就留空。');

  form.addMultipleChoiceItem()
    .setTitle('正確支系')
    .setHelpText('不需改就選「不修改」')
    .setChoiceValues(['不修改', '頂番婆', '草湳底', '埔姜崙']);

  form.addTextItem()
    .setTitle('正確出生年（西元）')
    .setHelpText('例如：1943。不需改就留空。');

  form.addTextItem()
    .setTitle('正確卒年（西元）')
    .setHelpText('在世者填「在世」，不需改就留空。');

  form.addTextItem()
    .setTitle('正確配偶姓名')
    .setHelpText('不需改就留空。');

  form.addTextItem()
    .setTitle('正確父親姓名')
    .setHelpText('不需改就留空。');

  form.addParagraphTextItem()
    .setTitle('正確備註')
    .setHelpText('不需改就留空。');

  form.addParagraphTextItem()
    .setTitle('其他說明')
    .setHelpText('補充說明修改原因等');

  form.setCollectEmail(false);

  const url = form.getPublishedUrl();
  const editUrl = form.getEditUrl();
  Logger.log('==============================');
  Logger.log('新版修改申請表單已建立！');
  Logger.log('');
  Logger.log('填寫網址（給族人用）：');
  Logger.log(url);
  Logger.log('');
  Logger.log('編輯網址（管理用）：');
  Logger.log(editUrl);
  Logger.log('==============================');
  Logger.log('');
  Logger.log('下一步：');
  Logger.log('1. 打開表單 → 回覆 → 連結到試算表 → 選擇現有試算表（你的族人資料）');
  Logger.log('2. 新分頁會叫「資料修改申請（新版）」，請改名為「資料修改申請」（先刪除或改名舊的）');
  Logger.log('3. 把新的表單網址更新到族譜 HTML 的 FORM_EDIT_URL');
}
