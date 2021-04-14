const nodemailer = require("nodemailer");

const user = "twice.yoneyama@gmail.com";
const pass = "271661310";

//SMTP接続の設定
const transport = nodemailer.createTransport({
  //送信者が利用しているメール
  service: "Gmail",
  //送信者のメールアカウント情報を設定
  auth: {
    user: user,
    pass: pass,
  },
});

let sendConfirmationEmail = (name, email, confirmationCode) => {
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
    <p>現在お客様のアカウントは仮登録の状態でございますので、下記のURLにアクセスして頂きまして登録を完了して頂きますようお願いいたします。</p>
    <br/><a href=http:localhost3000/confirm/${confirmationCode}></a>`
  }).catch((error) => {
    throw error;
  });
};

module.exports = sendConfirmationEmail;