//ログイン認証に必要なユーザー情報をDBにインサートするためだけのファイル

//mongodbのコンフィグファイルをインポート
const { CONNECTION_URL, DATABASE, OPTIONS } = require("../../config/mongodb.config.js");
//mongodbをインポート
const MongoClient = require("mongodb").MongoClient;

//db吐き出し
var insertUsers = function (db) {
  //Promise.all()で以下の「データの投入」と「インデックスを貼る」処理を設定する。
  return Promise.all([
    db.collection("users").insertOne({
      email: "test@test",
      name: "testuser",
      password:"qwerty",//"qwerty", // "77d1fb804f4e1e6059377122046c95de5e567cb9fd374639cb96e7f5cc07dba1"
      role: "owner"
    }),
    db.collection("users")
      .createIndex({email:1},{umique: true, background: true})
  ]);
};

var insertPrivileges = function(db) {
  return Promise.all([
    db.collection("privileges").insertMany([
      {role:"default", permissions: ["read"]},
      {role: "owner", permissions: ["readWrite"]}
    ]),
    db.collection("privileges")
      .createIndex({role: 1}, {unique: true, background: true})
  ]);
};


//mongodbサーバーに接続
MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
  //dbに接続し"DATABASE"を取得(この状態でdbが操作できるようになる)
  var db = client.db(DATABASE);
  //全ての処理が終わった後でclient.close()をするためにPromiseを使った
  Promise.all([
    insertUsers(db),
    insertPrivileges(db)
  ]).catch((error) => {
    console.log(error);
  }).then(() => {
    client.close();
  });
});

