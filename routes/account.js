const router = require("express").Router();

/* 仕事登録関連に必要なモジュール(DB周り) */
const {
  CONNECTION_URL,
  OPTIONS,
  DATABASE,
} = require("../config/mongodb.config.js");
const MongoClient = require("mongodb").MongoClient;

/* 仕事情報編集削除用検索ページに必要なモジュール */
const { MAX_ITEM_PER_PAGE } = require("../config/app.config.js").search;

/* 認証認可関連(ログイン周り)に必要なモジュール */
const {
  authenticate,
  authorize,
} = require("../lib/security/accountcontrol.js"); //authenticate,authorize読み込み

/* セキュリティ用モジュール */
//csrf対策用モジュールをインスタンス化(このモジュールはインスタンス化して使う)
let tokens = new require("csrf")();

/* 登録画面にて入力した情報について、修正のため確認画面から戻ってきたときに復元する実装 */
//mongodbに登録するデータを成形する関数
let createRegistData = (body) => {
  let datetime = new Date();
  //nameタグを目印に値を取りに行く
  return {
    url: body.url, //仕事情報の遷移先url(後で消す)
    title: body.title, //仕事名
    job_description: body.job_description, //仕事内容
    contract_period: body.contract_period, //契約期間
    post_period: body.post_period, //応募期間
    location: body.location, //勤務地
    work_style: body.work_style, //業務形態
    industry_types: body.industry_types, //業種
    skills: body.skills, //スキルカテゴリー
    update: datetime, //更新日
    published: datetime, //発行日
  };
};

/* 登録画面のバリデーション */
let validateRegistData = (body) => {
  let isValidated = true,
    errors = {};

  //urlが入力されているかどうか
  if (!body.url) {
    isValidated = false;
    errors.url = "URLが未入力です。'/'から始まるURLを入力してください。";
  }

  //URLは入力されているが、
  //先頭が"/"から始まっていない
  if (body.url && /^\//.test(body.url) === false) {
    isValidated = false;
    errors.url = "'/'から始まるURLを入力してください。";
  }

  //タイトルが入力されているかどうか
  if (!body.title) {
    isValidated = false;
    errors.title = "仕事名が未入力です。任意の仕事名を入力してください。";
  }

  //返すエラーがあるか
  return isValidated ? undefined : errors;
};

/* 更新画面のバリデーション */
let validateEditData = (body) => {
  let isValidated = true,
    errors = {};

  //タイトルが入力されているかどうか
  if (!body.title) {
    isValidated = false;
    errors.title = "仕事名が未入力です。任意の仕事名を入力してください。";
  }

  //返すエラーがあるか
  return isValidated ? undefined : errors;
};

/***************************************** ログイン関連 *****************************************/
/*********** ログイン後の画面へのルーティング ***********/
//※認可処理を実装していないとログイン画面に遷移しない
//読み書き権限があるユーザーのみログイン後のTOP画面を表示できる
router.get("/", authorize("readWrite"), (req, res) => {
  res.render("./account/index.ejs"); //isAuthenticatedから飛んでくる所
});

//認可処理がないときは下記を代用
/* , (req, res, next) => {
  if(req.isAuthenticated()) {   //認証されているか否かの判定(isAuthenticated)
    next();   //認証されていればログイン後の画面に遷移
  } else {
    res.redirect("/account/login");   //認証されていなければログイン画面に遷移(デフォルトでログイン画面に遷移する実装)
  }
} */

/*********** ログイン画面へのルーティング ***********/
router.get("/login", (req, res) => {
  res.render("./account/login.ejs", { message: req.flash("message") }); //※1 {message: req.flash("message")} で画面側にメッセージが渡る
});

/*********** ログイン認証処理 ***********/
router.post("/login", authenticate());

/*********** ログアウト処理 ***********/
router.post("/logout", (req, res) => {
  req.logout();
  res.redirect("/account/login");
});

/***************************************** 新規仕事情報登録画面 *****************************************/
/*********** 登録画面表示 ***********/
/* csrf対策(トークン発行) */
router.get("/posts/regist", (req, res) => {
  //secretを生成(サーバー側で持っておくトークンの照合元)
  tokens.secret((error, secret) => {
    //サーバー側でトークンを発行
    let token = tokens.create(secret);
    //サーバーサイドはセッションにsecretを保存
    req.session._csrf = secret;
    //クライアント側ではクッキーにトークンを保存
    res.cookie("_csrf", token);
    res.render("./account/posts/regist-form.ejs");
  });
});

/*********** 確認画面から戻ってきた際にデータの復元込みで登録画面表示 **********/
router.post("/posts/regist/input", (req, res) => {
  //フォームの入力情報の取得
  let original = createRegistData(req.body);
  res.render("./account/posts/regist-form.ejs", { original });
});

/********** 登録確認画面へのルーティング *********/
router.post("/posts/regist/confirm", (req, res) => {
  //フォームの入力情報の取得
  let original = createRegistData(req.body);
  //バリデーショチェックの追加
  let errors = validateRegistData(req.body);
  //バリデーションチェックでエラーがあれば
  if (errors) {
    //入力情報と一緒にエラーも返してあげる
    res.render("./account/posts/regist-form.ejs", { errors, original });
    return;
  }
  //登録確認画面へ遷移
  res.render("./account/posts/regist-confirm.ejs", { original });
});

/*********** 登録完了画面へのルーティング **********/
/* csrf対策(トークン照合) */
router.post("/posts/regist/execute", (req, res) => {
  let secret = req.session._csrf;
  let token = req.cookies._csrf;

  if (tokens.verify(secret, token) === false) {
    throw new Error("Invalid Token.");
  }
  //フォームの入力情報の取得
  let original = createRegistData(req.body);
  //バリデーショチェックの追加
  let errors = validateRegistData(req.body);
  //バリデーションチェックでエラーがあれば
  if (errors) {
    //入力情報と一緒にエラーも返してあげる
    res.render("./account/posts/regist-form.ejs", { errors, original });
    return;
  }
  //データベース接続
  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    let db = client.db(DATABASE);
    //postsにデータを登録
    db.collection("posts")
      .insertOne(original)
      .then(() => {
        delete req.session._csrf;
        res.clearCookie("_csrf");
        //res.render("./account/posts/regist-complete.ejs");→リダイレクト先へ移設
        //再送信防止のためのリダイレクト
        res.redirect("/account/posts/regist/complete");
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        client.close();
      });
  });
});

/*********** (登録完了画面用)再送信防止用のリダイレクト先 ***********/
router.get("/posts/regist/complete", (req, res) => {
  res.render("./account/posts/regist-complete.ejs");
});

/***************************************** 仕事情報更新画面 *****************************************/
/*********** 更新する仕事情報の検索画面へのルーティング ***********/
router.get("/posts/edit/search/", (req, res) => {
  //ページ番号取得(search.js参照)
  let page = req.query.page ? parseInt(req.query.page) : 1;

  //ejsから送られるキーワード
  let keyword = req.query.searchword || "";

  //部分一致の正規表現
  let regexp = new RegExp(`.*${keyword}>*`);

  //検索クエリ(部分一致で検索)
  let query = { $or: [{ title: regexp }, { skills: regexp }] };

  //mongodbに接続
  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    let db = client.db(DATABASE);

    //検索総件数と仕事情報を配列で格納
    Promise.all([
      db.collection("posts").find(query).count(),
      db
        .collection("posts")
        .find(query)
        .sort({ post_period: -1 })
        .skip((page - 1) * MAX_ITEM_PER_PAGE)
        .limit(MAX_ITEM_PER_PAGE)
        .toArray(),
    ])
      .then((results) => {
        let data = {
          keyword,
          count: results[0],
          list: results[1],
          pagination: {
            max: Math.ceil(results[0] / MAX_ITEM_PER_PAGE),
            current: page,
          },
        };
        res.render("./account/posts/edit-search.ejs", data);
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        client.close();
      });
  });
});

/*********** 更新画面へのルーティング ***********/
/* csrf対策(トークン発行) */
router.get("/posts/edit/select/*", (req, res) => {
  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    let db = client.db(DATABASE);
    //パスパラメータから仕事情報のURLを取得(DBで検索をかけるため)
    let jobPath = req.params["0"];
    db.collection("posts")
      .findOne({
        url: "/" + jobPath,
      })
      .then((doc) => {
        doc.contract_period = doc.contract_period.toLocaleString();
        doc.post_period = doc.post_period.toLocaleString();
        //secretを生成(サーバー側で持っておくトークンの照合元)
        tokens.secret((error, secret) => {
          //サーバー側でトークンを発行
          let token = tokens.create(secret);
          //サーバーサイドはセッションにsecretを保存
          req.session._csrf = secret;
          //クライアント側ではクッキーにトークンを保存
          res.cookie("_csrf", token);
          res.render("./account/posts/edit-form.ejs", { doc });
        });
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        client.close();
      });
  });
});

/********** 更新確認画面へのルーティング *********/
router.post("/posts/edit/confirm", (req, res) => {
  //フォームの入力情報の取得
  let original = createRegistData(req.body);
  //バリデーショチェックの追加
  let errors = validateEditData(req.body);
  //バリデーションチェックでエラーがあれば
  if (errors) {
    //変更情報と一緒にエラーも返してあげる
    res.render("./account/posts/edit-form.ejs", { errors, original });
    return;
  }
  //変更確認画面へ遷移
  res.render("./account/posts/edit-confirm.ejs", { original });
});

/*********** 更新確認画面から戻ってきた際にデータの復元込みで登録画面表示 **********/
router.post("/posts/edit/input", (req, res) => {
  //フォームの入力情報の取得
  let original = createRegistData(req.body);
  res.render("./account/posts/edit-form.ejs", { original });
});

/*********** 更新完了画面へのルーティング **********/
/* csrf対策(トークン照合) */
router.post("/posts/edit/execute", (req, res) => {
  let secret = req.session._csrf;
  let token = req.cookies._csrf;

  if (tokens.verify(secret, token) === false) {
    throw new Error("Invalid Token.");
  }
  //フォームの入力情報の取得
  let original = createRegistData(req.body);
  //バリデーショチェックの追加
  let errors = validateEditData(req.body);
  //バリデーションチェックでエラーがあれば
  if (errors) {
    //入力情報と一緒にエラーも返してあげる
    res.render("./account/posts/edit-form.ejs", { errors, original });
    return;
  }
  //データベース接続
  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    let db = client.db(DATABASE);
    db.collection("posts")
      /* 仕事情報を入力させているものに更新 */
      .updateOne(
        {
          //URLと一致した仕事情報について更新
          url: original.url,
        },
        //更新内容↓
        {
          $set: {
            title: original.title,
            job_description: original.job_description,
            contract_period: original.contract_period,
            post_period: original.post_period,
            location: original.location,
            work_style: original.work_style,
            industry_types: original.industry_types,
            skills: original.skills,
          },
        }
      )
      .then(() => {
        delete req.session._csrf;
        res.clearCookie("_csrf");
        //res.render("./account/posts/regist-complete.ejs");→リダイレクト先へ移設
        //再送信防止のためのリダイレクト
        res.redirect("/account/posts/edit/complete");
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        client.close();
      });
  });
});

/*********** (更新完了画面用)再送信防止用のリダイレクト先 ***********/
router.get("/posts/edit/complete", (req, res) => {
  res.render("./account/posts/edit-complete.ejs");
});

/***************************************** 仕事情報削除画面 *****************************************/
/*********** 削除確認画面へのルーティング **********/
router.get("/posts/delete/confirm/*", (req, res) => {
  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    let db = client.db(DATABASE);
    let jobPath = req.params["0"];
    db.collection("posts")
      .findOne({
        url: "/" + jobPath,
      })
      .then((doc) => {
        doc.contract_period = doc.contract_period.toLocaleString();
        doc.post_period = doc.post_period.toLocaleString();
        //secretを生成(サーバー側で持っておくトークンの照合元)
        tokens.secret((error, secret) => {
          //サーバー側でトークンを発行
          let token = tokens.create(secret);
          //サーバーサイドはセッションにsecretを保存
          req.session._csrf = secret;
          //クライアント側ではクッキーにトークンを保存
          res.cookie("_csrf", token);
          res.render("./account/posts/delete-confirm.ejs", { doc });
        });
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        client.close();
      });
  });
});

/*********** 削除完了画面へのルーティング **********/
//router.post("/posts/delete/execute", (res, req) => {

//MongoClient.connect(CONNECTION_URL, OPTIONS, ( error, client ) => {
//let db = client.db(DATABASE);
//   let url = req.body.url;
//   console.log(url);
// });
//});

/********** 登録確認画面へのルーティング *********/
router.post("/posts/delete/execute", (req, res) => {
  //csrf対策
  let secret = req.session._csrf;
  let token = req.cookies._csrf;
  if (tokens.verify(secret, token) === false) {
    throw new Error("Invalid Token.");
  }
  //UIよりURLを取得
  let url = req.body.url;
  //取得したURLをキーにDBに格納されている仕事情報を削除
  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    let db = client.db(DATABASE);
    db.collection("posts")
      .deleteOne({
        url: url,
      })
      .then(() => {
        delete req.session._csrf;
        res.clearCookie("_csrf");
        //res.render("./account/posts/regist-complete.ejs");→リダイレクト先へ移設
        //再送信防止のためのリダイレクト
        res.redirect("/account/posts/delete/complete");
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        client.close();
      });
  });
});

/*********** (削除完了画面用)再送信防止用のリダイレクト先 ***********/
router.get("/posts/delete/complete", (req, res) => {
  res.render("./account/posts/delete-complete.ejs");
});

module.exports = router;
