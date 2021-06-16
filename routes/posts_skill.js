/********* 記事投稿関連のルーター *********/
const router = require("express").Router();

//MongoDB接続関連モジュールのインポート
const {
  CONNECTION_URL,
  OPTIONS,
  DATABASE,
} = require("../config/mongodb.config.js");
const MongoClient = require("mongodb").MongoClient;

const default_db = require("../models");
const job = default_db.job;

router.get("/*", (req, res) => {
  //MondoDBに接続する際の雛形
  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    let db = client.db(DATABASE);
    //投稿されている記事をDBからとってくる
    db.collection("skillsheets")
      .findOne({
        //リクエストのurlがDBに登録されているurlと一致するものをとってくる
        url: req.url,
        //とってきた投稿記事を"doc"に格納
      })
      .then((doc) => {
        job.find({ user_id: req.user.user_id })
          .then((job) => {

            doc.job_id = [];
            doc.title = [];
            for (let i = 0; i < job.length; i++) {
              doc.job_id[i] = job[i].job_id;
              doc.title[i] = job[i].title;
            }
            
            //検索結果と一致したスキルシートを表示
            res.render("./posts/skillsheet.ejs", doc);
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

module.exports = router;
