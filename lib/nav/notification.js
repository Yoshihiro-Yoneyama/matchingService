/** 
 * 
 * 新設されたchatroom数のお知らせ
 * res.localsにこのメソッドで取得できる数を入れる。
 * 
 * @chatroom
 * 
 */
const default_db = require("../models");
const chatroom = default_db.chatroom;

const noteCounts = (login_user_id) => {
  let query = {
    $and: [
      { "users.user_id": login_user_id },
      { "users.status": "Pending" }
    ],
  };
  chatroom
    .find(query)
    .count();
};

module.exports = {
  noteCounts,
};
