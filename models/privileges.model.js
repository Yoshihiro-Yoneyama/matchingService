//mongooseをインポート
const mongoose = require("mongoose");

//usersコレクションのスキーマ定義
//(MongoDBの"users"コレクションに格納するフィールドのデータ型を指定)
const privilegesSchema = new mongoose.Schema({
  role: {
    type: String,
    trim: true,
    required: true,
  },
  role_code: {
    type: String,
    trim: true,
    unique: true, //一意
  },
  permission: {
    type: String,
    enum: ["read", "readwrite"],
    default: "readwrite",
  },
});

//
let privileges = mongoose.model("privileges", privilegesSchema);

module.exports = privileges;
