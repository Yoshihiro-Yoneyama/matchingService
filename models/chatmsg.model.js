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
    user_id_sender: {
      type: Number,
    },
    user_receiver: {
      user_id: Number,
      readFlg: {
        type: Boolean,
        default: false,
      }
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
