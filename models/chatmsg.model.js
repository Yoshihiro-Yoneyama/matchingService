/* 
チャットメッセージのモデル
*/

//mongooseをインポート
const mongoose = require("mongoose");

//usersコレクションのスキーマ定義
//(MongoDBの"users"コレクションに格納するフィールドのデータ型を指定)
const msgSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      trim: true,
    },
    user_id: {
      type: Number,
    },
    room_id: {
      type: Number,
    },
    createdAt: {
      type: Date,
    },
  },
  { collection: "chatmsg" }
);

//
let chatmsg = mongoose.model("chatmsg", msgSchema);

module.exports = chatmsg;
