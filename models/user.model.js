//mongooseをインポート
const mongoose = require("mongoose");

//MongoDBの"users"コレクションに格納するデータ型を指定
const users = mongoose.model(
  "users",
  new mongoose.Schema({
    username: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
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
    role: {
      type: String,
    },
    published: {
      type: Date
    }
  })
);

module.exports = users;
