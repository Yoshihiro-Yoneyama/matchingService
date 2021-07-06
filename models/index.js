const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

//mongodbのポートの読み込みと、mongoDBのコレクション名(user-api)をつける
/**
 *テストアカウントのためMongoDBを以下の設定にしています。
 *アカウント名：user
 *パスワード：user
 *
 */
mongoose.connect("mongodb://user:user@localhost:27017/testdb", {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

//モデルを格納する空データ
const default_db = {};

//作成した空データにmongooseを宛がう
default_db.mongoose = mongoose;

//ユーザーアカウントモデル
default_db.users = require("./user.model.js");

//仕事情報モデル
default_db.job = require("./job.model.js");

//スキルシートモデル
default_db.skillsheet = require("./skillsheet.model.js");

//権限情報モデル
default_db.privileges = require("./privileges.model.js");

//チャットルームモデル
default_db.chatroom = require("./chatroom.model.js");

//チャットメッセージモデル
default_db.chatmsg = require("./chatmsg.model.js");

//(未使用)権限モデル
default_db.ROLES = ["admin","client", "worker"];

module.exports = default_db;