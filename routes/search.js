//mongodbモジュールインポート
const {
  CONNECTION_URL,
  OPTIONS,
  DATABASE,
} = require("../config/mongodb.config.js");
const MongoClient = require("mongodb").MongoClient;
//ページ毎の記事最大表示件数
const { MAX_ITEM_PER_PAGE } = require("../config/app.config.js").search;
const router = require("express").Router();

//ワーカーでログイン及びログインしていない状態は仕事情報を表示
router.get("/job*", (req, res) => {
  //pageが取得できれば(クエリで取得できたものは文字列なので)、数値に変える(parseInt)
  //pageの取得はlist.ejsにページ番号をURLに載せてリクエストを送る実装をしている(クエリパラメータとしてpageをとってきている)
  //初期表示ではページ番号は取得できていないから1(1ページ目)を返している。
  let page = req.query.page ? parseInt(req.query.page) : 1;

  //ejsからクエリパラメータとしてとってきた(formタグ内のnameタグ)をキーワードとする
  let keyword = req.query.searchword || "";

  //部分一致で検索がヒットするように検索ワードを書き換え
  let regexp = new RegExp(`.*${keyword}>*`);

  //検索クエリ(部分一致で検索)
  let query = { $or: [{ title: regexp }, { skills: regexp }] };

  //MondoDBに接続
  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    let db = client.db(DATABASE);

    //countと仕事情報の2つをデーターベースから取りに行く
    Promise.all([
      //検索総件数のカウント
      db.collection("jobs").find(query).count(),
      //キーワード(skills)を使ってdbの"posts"に検索しに行く
      db
        .collection("jobs")
        .find(query)
        //応募期日での降順
        .sort({ post_period: -1 })
        //ページ番号×ページ毎表示件数後の仕事情報から表示する
        .skip((page - 1) * MAX_ITEM_PER_PAGE)
        //ページ毎表示件数上限
        .limit(MAX_ITEM_PER_PAGE)
        //検索結果を配列で取得
        .toArray(),
      //Promiseで2つのデータを取りに行っているからresults[0]はカウント、results[1]は取得した仕事情報となる
    ])
      .then((results) => {
        //データが手に入ったらそのまま渡してあげたいが、画面側に検索ボックスもありそのキーワードも返してあげる
        let data = {
          keyword,
          count: results[0], //検索総件数のカウント
          list: results[1], //取得した全仕事情報
          pagination: {
            //ページの総数
            max: Math.ceil(results[0] / MAX_ITEM_PER_PAGE),
            current: page,
          },
        };
        //list.ejsにデータを渡す
        res.render("./search/list.ejs", data);
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        client.close();
      });
  });
});

//クライアントがログインしている時はスキルシートを表示
router.get("/skillsheet*", (req, res) => {
  //pageが取得できれば(クエリで取得できたものは文字列なので)、数値に変える(parseInt)
  //pageの取得はlist.ejsにページ番号をURLに載せてリクエストを送る実装をしている(クエリパラメータとしてpageをとってきている)
  //初期表示ではページ番号は取得できていないから1(1ページ目)を返している。
  let page = req.query.page ? parseInt(req.query.page) : 1;

  //ejsからクエリパラメータとしてとってきた(formタグ内のnameタグ)をキーワードとする
  let keyword = req.query.searchword || "";

  //部分一致で検索がヒットするように検索ワードを書き換え
  let regexp = new RegExp(`.*${keyword}>*`);
  //検索クエリ(部分一致で検索)
  let query = { $or: [{ industry_types : regexp }, { skills: regexp }] };

  //MondoDBに接続
  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    let db = client.db(DATABASE);

    //countと仕事情報の2つをデーターベースから取りに行く
    Promise.all([
      //検索総件数のカウント
      db.collection("skillsheets").find(query).count(),
      //キーワード(skills)を使ってdbの"posts"に検索しに行く
      db
        .collection("skillsheets")
        .find(query)
        //応募期日での降順
        .sort({ createAt: -1 })
        //ページ番号×ページ毎表示件数後の仕事情報から表示する
        .skip((page - 1) * MAX_ITEM_PER_PAGE)
        //ページ毎表示件数上限
        .limit(MAX_ITEM_PER_PAGE)
        //検索結果を配列で取得
        .toArray(),
      //Promiseで2つのデータを取りに行っているからresults[0]はカウント、results[1]は取得した仕事情報となる
    ])
      .then((results) => {
        //データが手に入ったらそのまま渡してあげたいが、画面側に検索ボックスもありそのキーワードも返してあげる
        let data = {
          keyword,
          count: results[0], //検索総件数のカウント
          list: results[1], //取得した全仕事情報
          pagination: {
            //ページの総数
            max: Math.ceil(results[0] / MAX_ITEM_PER_PAGE),
            current: page,
          },
        };
        //list.ejsにデータを渡す
        res.render("./search/list_skill.ejs", data);
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        client.close();
      });
  });
});

module.exports = router;
