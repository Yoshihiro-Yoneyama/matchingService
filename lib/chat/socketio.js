const default_db = require("../../models");
const chatroom = default_db.chatroom;
const chatmsg = default_db.chatmsg;

/* メッセージ送受信の設定(リアルタイムWebを実装するのにサーバーを立てる必要があるため、
Socket.IOの設定はapp.jsで行う) */
module.exports = (io) => {
  //iosocketに接続
  /**
   * @socket
   * @data.msg = メッセージ
   * @data.user_id_sender = ログインユーザーID;
   * @data.createdAt = 送信日時;
   * @data.room_id = ルームID
   */
  io.on("connection", (socket) => {
    //フォームからデータ(メッセージ)を受信し、dataに格納
    socket.on("sending message", (data) => {
      let date = new Date();
      chatroom.findOne({ room_id: data.room_id }).then((room) => {
        //受信データの送り元＝ワーカー
        if (data.user_id_sender == room.users[0].user_id) {
          const sendmsg = new chatmsg({
            message: data.msg,
            user_id_sender: data.user_id_sender,
            //送り先にクライアントを指定
            "user_receiver.user_id": room.users[1].user_id,
            room_id: data.room_id,
            createdAt: date,
          });
          sendmsg.save().then((sendmsg) => {
            //チャットメッセージの既読フラグを付与してメッセージデータの全てを返却
            already_read(data.user_id_sender);
            //受け取ったメッセージを接続しているクライアント全員に対して送信する
            io.emit("new message", sendmsg);
          });
          // sendmsg.save();
          // data.receiver_user_id = room.users[1].user_id;
        //受信データの送り元＝クライアント
        } else if (data.user_id_sender == room.users[1].user_id) {
          const sendmsg = new chatmsg({
            message: data.msg,
            user_id_sender: data.user_id_sender,
            "user_receiver.user_id": room.users[0].user_id,
            room_id: data.room_id,
            createdAt: date,
          });
          sendmsg.save().then((sendmsg) => {
            //チャットメッセージの既読フラグを付与してメッセージデータの全てを返却
            already_read(data.user_id_sender);

            //受け取ったメッセージを接続しているクライアント全員に対して送信する
            io.emit("new message", sendmsg);
          });
          // sendmsg.save();
          // data.receiver_user_id = room.users[0].user_id;
        }
      });

      //ログインユーザー宛のメッセージで未読のものがあれば全て既読にする
      /* chatmsg.updateMany(
        {
          "user_receiver.user_id": data.user_id_sender,  //ログインユーザー
          "user_receiver.readFlg": false,
        },
        { $set: { "user_receiver.readFlg": true }}
      ).then(); */

      //チャットメッセージの既読フラグを付与してメッセージデータの全てを返却
      const already_read = (login_user_id) => {
        chatmsg
          .updateMany(
            {
              "user_receiver.user_id": login_user_id, //ログインユーザー
              "user_receiver.readFlg": false,
            },
            { $set: { "user_receiver.readFlg": true } }
          )
          .then();
      };

      //受け取ったメッセージを接続しているクライアント全員に対して送信する
      // io.emit("new message", data);
    });
  });
};
