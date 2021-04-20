const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

//mongodbのポートの読み込みと、mongoDBのコレクション名(user-api)をつける
mongoose.connect("mongodb://user:user@localhost:27017/testdb", {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});


const users_db = {};

users_db.mongoose = mongoose;

users_db.users = require("./user.model.js");

users_db.ROLES = ["admin","client", "worker"];

module.exports = users_db;