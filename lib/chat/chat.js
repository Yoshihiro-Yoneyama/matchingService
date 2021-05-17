/* リアルタイムWebを実装するのにサーバーを立てる必要があるため、
Socket.IOの設定はapp.jsで行う。 */
//Socket.IOの準備(Socket.IOに接続)
module.exports = (io) => {
  io.on("connection", (socket) => {
    //フォームからデータ(メッセージ)を受信する
    socket.on("sending message", (msg) => {
      console.log("message: " + msg);
      //受け取ったメッセージを接続しているクライアント全員に対して送信する
      io.emit("new message", msg);
    });
  });
};
