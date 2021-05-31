const default_db = require("../../models");
// const chatroom = default_db.chatroom;
const chatmsg = default_db.chatmsg;

/* メッセージ送受信の設定(リアルタイムWebを実装するのにサーバーを立てる必要があるため、
Socket.IOの設定はapp.jsで行う) */
module.exports = (io) => {
  //iosocketに接続
  /* 
  @socket
  @data.msg = メッセージ
  @data.user_id = ログインユーザーID;
  @data.createdAt = 送信日時;
  @data.room_id = ルームID
  */
  io.on("connection", (socket) => {
    //フォームからデータ(メッセージ)を受信し、dataに格納
    socket.on("sending message", (data) => {
      let date = new Date();

      const sendmsg = new chatmsg({
        message: data.msg,
        user_id: data.user_id, 
        room_id: data.room_id,
        createdAt: date
      });
      console.log("message: " + data.user_id);
      sendmsg.save();

      //受け取ったメッセージを接続しているクライアント全員に対して送信する
      io.emit("new message", data.msg);
    });
  });
};
