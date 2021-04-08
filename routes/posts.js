/********* 記事投稿関連のルーター *********/
const router = require("express").Router();

//MongoDB接続関連モジュールのインポート
const { CONNECTION_URL, OPTIONS, DATABASE } = require("../config/mongodb.config.js");
const MongoClient = require("mongodb").MongoClient;

router.get("/*", (req, res) => {
  //MondoDBに接続する際の雛形
  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    let db = client.db(DATABASE);
    //投稿されている記事をDBからとってくる
    db.collection("posts").findOne({
      //リクエストのurlがDBに登録されているurlと一致するものをとってくる
      url: req.url
      //とってきた投稿記事を"doc"に格納
    }).then((doc) => {
      //docを表示する（この状態で）
      res.render("./posts/index.ejs", doc);
    }).catch((error) => {
      throw error;
    }).finally(() => {
      client.close();
    });
  });
});

module.exports = router;