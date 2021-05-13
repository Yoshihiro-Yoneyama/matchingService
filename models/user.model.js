//mongooseをインポート
const mongoose = require("mongoose");

//mongoose-sequenceをインポート
const AutoIncrement = require("mongoose-sequence")(mongoose);

//usersコレクションのスキーマ定義
//(MongoDBの"users"コレクションに格納するフィールドのデータ型を指定)
const usersSchema = mongoose.Schema({
  username: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    unique: true, //一意
  },
  password: {
    type: String,
    trim: true,
    required: true,
    minlength: 7,
  },
  status: {
    type: String,
    enum: ["Pending", "Active"],
    default: "Pending",
  },
  confirmationCode: {
    type: String,
    unique: true,
  },
  role_code: {
    type:String
  },
  published: {
    type: Date,
  },
});

//user_idフィールドを追加して、auto-incrementを付与
usersSchema.plugin(AutoIncrement, { inc_field: "user_id" });
let users = mongoose.model("users", usersSchema);

module.exports = users;
