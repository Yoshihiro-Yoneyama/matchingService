//mongodbと接続する前にコマンドプロンプトからDBのユーザー登録を行っておく
module.exports = {
  //mongoDBのアクセスURL
  CONNECTION_URL: "mongodb://user:user@localhost:27017/testdb",
  //アクセスするDB
  DATABASE:"testdb",
  OPTIONS:{
    family:4,
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
};