//リリース段階ではMongoDBのユーザーIDとパスワードを設定しておく
module.exports = {
  //mongoDBのアクセスURL
  CONNECTION_URL: "mongodb://localhost:27017/testdb",
  //アクセスするDB
  DATABASE:"testdb",
  OPTIONS:{
    family:4,
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
};