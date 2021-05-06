/************* メール送信に関する設定 *************/
const nodemailer = require("nodemailer");

//認証用メールの送信元情報を呼び出し
const {user, pass} = require("./aurh.config");

//SMTP接続の設定
const transport = nodemailer.createTransport({
  //送信者が利用しているメール
  service: "gmail",
  port: 465,
  secure: true,
  //送信者のメールアカウント情報を設定
  auth: {
    user: user,
    pass: pass,
  },
});

module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
  //送信するメールの内容を設定
  transport.sendMail({
    //送信者のメールアドレス
    from: user,
    //受信者のメールアドレス
    to: email,
    //件名
    subject: "アカウントの本登録確認",
    //メール内容
    html: `<h1>メール認証</h1>
    <h2>${name}様</h2>
    <p>今度は当サービスにご登録いただきありがとうございます。</p>
    <p>現在お客様のアカウントは仮登録の状態でございます。下記のURLにアクセスして頂くことで登録が完了となります。</p>
    <p>なおURLの有効期限は5分間となっておりますのでお早めにご登録くださいませ。</p>
    <br/><a href=http://localhost:3000/account/regist-email/${confirmationCode}>http://localhost:3000/account/regist-email/${confirmationCode}</a>`
  }).catch((error) => {
    throw error;
  });
};

