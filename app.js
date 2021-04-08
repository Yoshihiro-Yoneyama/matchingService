const express = require("express");

/********* ログイン関係でいるやつ！！！ ********/
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const { SESSION_SECRET } = require("./config/app.config.js").security;

//認証、認可処理のインポート
const accountcontrol = require("./lib/security/accountcontrol.js");

const app = express();

//認証、認可処理時のエラーメッセージ表示用
const flash = require("connect-flash");

//テンプレートエンジンの指定(ejs)
app.set("view engine", "ejs");
//x-powered-byの非表示(脆弱性対策)
app.disable("x-powered-by");

//※静的ファイル使用(publicファイル内の静的ファイル(js,css)をejsに宛がうのに必要となる記述
//静的ファイルを格納しているディレクトリー名をexpress.staticミドルウェア関数に渡して、ファイルを直接提供する
app.use("/public",express.static(__dirname + "/public"));

/********* ログイン関係でいるやつ！！！ ********/
app.use(cookieParser());
app.use(session({
  //SESSION_SECRETの中身をキーとして、クッキー情報を暗号化する
  secret: SESSION_SECRET,
  //セッションチェックをするたびにセッションを作成するか否かの指定
  resave: false,
  //初期化をしていない状態のセッションを保存するか否かの指定
  saveUninitialized: true,
  //レスポンスに設定するセッションIDクッキーの名前(何でもよい)
  name: "sid"
}));
//htmlのform_inputタグの内容を取得できるようにするモジュール
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//メッセージを表示できるモジュール
app.use(flash());

//認証処理の初期化設定
//"initialize"の中身(passport.initialize(),passport.session())を配列からカンマ区切りで読み込んだ
app.use(...accountcontrol.initialize());

/*********** ルーティング関連 ***********/
//ホームディレクトリにリクエスト送信
app.use("/", require("./routes/index.js"));

//accountディレクトリにリクエスト送信
app.use("/account/", require("./routes/account.js"));

//postsディレクトリにリクエストを送信
app.use("/posts/", require("./routes/posts.js"));

//searchディレクトリにリクエストを送信
app.use("/search/", require("./routes/search.js"));

//3000番ポートを使用
app.listen(3000);