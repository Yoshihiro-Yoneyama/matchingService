//mongooseをインポート
const mongoose = require("mongoose");

//mongoose-sequenceをインポート
const AutoIncrement = require("mongoose-sequence")(mongoose);

//usersコレクションのスキーマ定義
//(MongoDBの"users"コレクションに格納するフィールドのデータ型を指定)
const chatroomSchema = mongoose.Schema(
  {
    /* user_id: [String], */
    users: [{
      user_id: String,
      status: {
        type: String,
        enum: [ "Pending", "Active" ],
        default: "Pending",
      }
    }],
    /* user_id : [{user_id: String, status: Boolean}], */
    job_id: {
      type: String,
    },
    status: {
      type: String,
      enum: ["close", "open"],
      default: "open",
    },
    createdAt: {
      type: Date,
    },
    room_url: {
      type: String,
    },
    room_id: {
      type: Number,
    },
  },
  { collection: "chatroom" }
);

//user_idフィールドを追加して、auto-incrementを付与
chatroomSchema.plugin(AutoIncrement, { inc_field: "room_id" });
let chatroom = mongoose.model("chatroom", chatroomSchema);

module.exports = chatroom;
