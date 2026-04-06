/**
 * 鐘氏族譜 — 自動建立 Google Forms
 *
 * 使用方式：
 * 1. 打開 Google Apps Script：https://script.google.com
 * 2. 建立新專案
 * 3. 貼上這段程式碼
 * 4. 執行 createAllForms()
 * 5. 授權後會自動建立兩個表單
 * 6. 在 Logger（執行紀錄）中查看表單網址
 */

function createAllForms() {
  const addFormUrl = createAddPersonForm();
  const editFormUrl = createEditRequestForm();

  Logger.log('==============================');
  Logger.log('兩個表單已建立完成！');
  Logger.log('');
  Logger.log('【新增族人申請表單】');
  Logger.log(addFormUrl);
  Logger.log('');
  Logger.log('【資料修改申請表單】');
  Logger.log(editFormUrl);
  Logger.log('==============================');
}

function createAddPersonForm() {
  const form = FormApp.create('鐘氏族譜 — 新增族人申請');

  form.setDescription(
    '歡迎鐘氏族人提交新增族人資料的申請。\n' +
    '填寫後管理員會審核，通過後會正式加入族譜中。\n\n' +
    '族譜維護人：鐘基啟（gjj22622@gmail.com）'
  );

  form.setConfirmationMessage(
    '感謝您的提交！管理員收到後會盡快審核。\n' +
    '如有問題請聯繫 gjj22622@gmail.com'
  );

  // ===== 申請人資訊 =====
  form.addSectionHeaderItem()
    .setTitle('一、您的聯絡資訊');

  form.addTextItem()
    .setTitle('申請人姓名')
    .setHelpText('請填寫您的真實姓名')
    .setRequired(true);

  form.addTextItem()
    .setTitle('聯絡方式（手機/Email/Line）')
    .setHelpText('請至少填一種聯絡方式，方便管理員與您確認')
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('您與族人的關係')
    .setHelpText('例如：我是鍾俊雄的孫子、我是鍾博瀚的太太');

  // ===== 新增族人資料 =====
  form.addSectionHeaderItem()
    .setTitle('二、要新增的族人資料');

  form.addTextItem()
    .setTitle('族人姓名')
    .setHelpText('要新增的族人全名，例如：鍾○○')
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('性別')
    .setChoiceValues(['男', '女'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('世代（第幾代）')
    .setHelpText('渡台祖=第0代，之後每代加1')
    .setChoiceValues([
      '第1代', '第2代', '第3代', '第4代', '第5代',
      '第6代', '第7代', '第8代', '第9代', '第10代', '第11代', '不確定'
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('支系')
    .setHelpText('屬於哪個支系？')
    .setChoiceValues(['頂番婆', '草湳底', '埔姜崙', '不確定'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('出生年（西元）')
    .setHelpText('例如：1990，不確定可留空');

  form.addTextItem()
    .setTitle('卒年（西元）')
    .setHelpText('在世者留空');

  form.addTextItem()
    .setTitle('配偶姓名')
    .setHelpText('例如：林○○，沒有可留空');

  form.addTextItem()
    .setTitle('父親姓名')
    .setHelpText('請填寫族譜中父親的全名，例如：鍾俊雄')
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('備註')
    .setHelpText('職業、居住地、特殊事蹟等，可留空');

  // 設定接收回覆到試算表
  form.setCollectEmail(false);

  const url = form.getPublishedUrl();
  Logger.log('新增族人申請表單已建立：' + url);
  return url;
}

function createEditRequestForm() {
  const form = FormApp.create('鐘氏族譜 — 資料修改申請');

  form.setDescription(
    '如果您發現族譜中有資料需要修改（名字錯誤、年份有誤等），請填寫此表單。\n' +
    '管理員審核後會更新族譜資料。\n\n' +
    '族譜維護人：鐘基啟（gjj22622@gmail.com）'
  );

  form.setConfirmationMessage(
    '感謝您的回報！管理員收到後會盡快處理。\n' +
    '如有問題請聯繫 gjj22622@gmail.com'
  );

  // ===== 申請人資訊 =====
  form.addSectionHeaderItem()
    .setTitle('一、您的聯絡資訊');

  form.addTextItem()
    .setTitle('申請人姓名')
    .setHelpText('請填寫您的真實姓名')
    .setRequired(true);

  form.addTextItem()
    .setTitle('聯絡方式（手機/Email/Line）')
    .setHelpText('請至少填一種聯絡方式')
    .setRequired(true);

  // ===== 修改內容 =====
  form.addSectionHeaderItem()
    .setTitle('二、要修改的內容');

  form.addTextItem()
    .setTitle('要修改的族人姓名')
    .setHelpText('族譜中現在顯示的姓名')
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('要修改哪些欄位？（可複選）')
    .setChoiceValues(['姓名', '性別', '出生年', '卒年', '配偶', '支系', '世代', '父親', '備註/事蹟', '其他'])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('修改內容說明')
    .setHelpText('請詳細說明要改成什麼，例如：\n出生年應為 1943 不是 1945\n配偶姓名應為「盧寶蓮」不是「盧寶連」')
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('備註')
    .setHelpText('其他需要說明的事項');

  form.setCollectEmail(false);

  const url = form.getPublishedUrl();
  Logger.log('資料修改申請表單已建立：' + url);
  return url;
}
