const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

//mongodbのポートの読み込みと、mongoDBのコレクション名(user-api)をつける
mongoose.connect("mongodb://user:user@localhost:27017/testdb", {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const default_db = {};

default_db.mongoose = mongoose;

//
default_db.users = require("./user.model.js");

default_db.job = require("./job.model.js");

default_db.privileges = require("./privileges");

default_db.ROLES = ["admin","client", "worker"];

module.exports = default_db;