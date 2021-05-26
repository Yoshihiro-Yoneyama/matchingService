//mongooseをインポート
const mongoose = require("mongoose");

//mongoose-sequenceをインポート
const AutoIncrement = require("mongoose-sequence")(mongoose);

//usersコレクションのスキーマ定義
//(MongoDBの"users"コレクションに格納するフィールドのデータ型を指定)
const chatroomSchema = mongoose.Schema(
  {
    user_id: [String],
    job_id: {
      type: String
    },
    status: {
      type: String,
      enum: ["close", "open"],
      default: "open",
    },
    /* create_at: {
      type: Date,
    }, */
    timestamp: true
  },
  { collection: "chatroom" }
);

//user_idフィールドを追加して、auto-incrementを付与
chatroomSchema.plugin(AutoIncrement, { inc_field: "room_id" });
let chatroom = mongoose.model("chatroom", chatroomSchema);

module.exports = chatroom;
