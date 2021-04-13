//mongooseをインポート
const mongoose = require("mongoose");

const users = mongoose.model(
  "users",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    Status: {
      type: String,
      enum: ["Pending", "Active"],
      default: "Pending"  
    },
    confirmationCode: {
      type: String,
      unique: true},
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ]
  })
);

module.exports = users;