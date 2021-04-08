/******* 認証、認可関係の処理 ********/
//"passport"を読み込み
const passport = require("passport");
//passport-localの中のStrategyメソッドの読み込み
const LocalStrategy = require("passport-local").Strategy;
//mongodbのインポート
const { CONNECTION_URL, OPTIONS, DATABASE } = require("../../config/mongodb.config.js");
const MongoClient = require("mongodb").MongoClient;

//ハッシュ化メソッドの読み込み
const hash = require("./hash.js");

//passport.jsからapp.js,account.jsへ出力するメソッド(下記module.exports参照)
let initialize, authenticate, authorize;


//認証情報をクライアント側で保存する処理
//ユーザー情報の中のemail(ログイン時のusername)情報を渡す
passport.serializeUser((email, done) => {
  done(null, email);
});


//クライアントから認証情報をサーバーで復元する処理
//mongodbからユーザー情報を取得し直す
passport.deserializeUser((email, done) => {
  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    var db = client.db(DATABASE);
    //サーバーで受け取ったemailの情報を元にmongodbからユーザー情報(user)を見つけてくる
    db.collection("users").findOne({ email })
    //userを見つけても、DBの"users"にはpermissionsの情報までは書かれていないためpermissions(権限)を復元する必要がある。
      .then((user) => {
        return new Promise((resolve, reject) => {
        //privilegesコレクション(テーブル)を見に行って
          db.collection("privileges")
          //roleがユーザーのroleと一致するものをとってくる
            .findOne({role:user.role})
            .then((privilege) => {
              //userのpermissionsにとってきたロールを格納
              user.permissions = privilege.permissions;
              //権限を付与されたユーザー情報を返す
              resolve(user);
              /* 以上でpermissionをとってくることができる */
            }).catch((error) => {
              reject(error);
            });
        });
      })
      //userを見つけることができれば
      .then((user) => {
        //ユーザー情報を渡す
        done(null, user);
      }).catch((error) => {
        done(error);
      }).finally(() => {
        client.close();
      });
  });
});

/************ 認証機能の実装(Strategy) ***********/
//useの第二引数をLocalStrategyにすることで、ログインボタンを押下されたときにstrategyを呼び出す。
//strategyの中にログインボタン押下時の処理を書く
passport.use("local-strategy", new LocalStrategy({
  /* オプション設定 */
  //formタグのname値の指定
  //第一引数のlocal-strategyを設定するための3つのメソッド
  usernameField: "username",   //ユーザー名
  passwordField: "password",   //パスワード
  passReqToCallback: true //第二引数にリクエストを送るためにtrue
}, (req, username, password, done) => {
  /******* mongodbにアクセスしてusernameとpasswordをとってくる ******/
  //mongodbに接続
  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    //データベース(testdb)を取得
    let db = client.db(DATABASE);
    //usersコレクション(テーブル)を取得
    db.collection("users").findOne({
      //usernameとemailが一致するものを探す
      email: username,
      //パスワード確認(hash.digestでハッシュ化したものを取りに行く実装)
      password: hash.digest(password)
      //取得できていればuserが手に入る
    }).then((user) => {
      //ユーザーが正しく取得できているかの判定
      if (user) {
        //正しく取得できていればログインへ
        //emailが一意なキーであるためemailを渡す
        done(null, user.email);
        //取得できていなかった場合
      } else {
        //falseを第二引数にいれ、メッセージを返す
        //account.jsでエラーメッセージを反映する必要がある※1
        done(null, false, req.flash("message", "ユーザー名 または パスワードが間違っています。"));
      }
    }).catch(() => {
      done(error);
    }).finally(() => {
      client.close();
    });
  });
}));


/****************** 実際に出力するメソッドの実装部分 *****************/

/********** 初期化処理 ************/
//初期化処理としてapp.jsに渡すもの
initialize = function () {
  return [
    passport.initialize(),
    //session情報は所持しておく
    passport.session(),
    /* ejs上でログイン判定をする */
    function (req, res, next) {
      //ログインしていればユーザー情報(req.user)がある
      if(req.user) {
        //ユーザーがあれば、クライアントからのリクエスト情報の中にユーザー情報を入れてあげる
        //(これでejs上でログインしているかの判定ができるようになる)
        res.locals.user = req.user;
      }
      next();
    }
  ];
};

/************* 認証処理 ************/
//ルーターにログイン処理を設ける
//ログイン画面に渡したいもの
authenticate = function () {
  return passport.authenticate(
    "local-strategy", {  //ログインボタン押下で"local-strategy"が呼び出される
      successRedirect: "/account",  //ログイン成功時の遷移先
      failureRedirect: "/account/login" //ログイン失敗時はログイン画面に戻す
    }
  );
};


/************ 認可処理  ************/
//認可処理においてユーザーに権限があるかどうかを確認する処理(authorize)
authorize = function (privilege) {
  return function (req, res, next) {
    //ログイン済であるか否か
    if(req.isAuthenticated() &&
    //権限があるか否か
    (req.user.permissions || []).indexOf(privilege) >= 0) {
      //ログイン後の画面に遷移 
      next();
    } else {
      res.redirect("/account/login");   //認証されていなければログイン画面に遷移(デフォルトでログイン画面に遷移する実装)
    }
  };
};

/* このファイルで出力するモジュールは
初期化処理 initialize
認証処理 authenticate
認可処理 autholize*/
module.exports = {
  initialize,
  authenticate,
  authorize
};