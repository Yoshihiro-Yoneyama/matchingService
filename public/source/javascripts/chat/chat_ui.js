/* eslint-disable no-undef */


$(() => {
  //Socket機能を呼び出し
  const socket = io();

  //送信ボタンの押下処理
  $(".send").submit(() => {
    let date = new Date;

    //※ここからメッセージDB格納の準備
    let data = {};
    data.msg = $("#word").val();
    data.user_id = $("#login_user_id").val();
    data.room_id = $("#room_id").val();
    data.create_at = date;

    //socket.emit("イベント名", data)： データの送信
    socket.emit("sending message",data );//$("#word").val() + $("#login_user_id").val() + create_at
    //フォームを空にする
    $("#word").val("");
    return false;
  });

  //Socket.on("イベント名", data)： データの受信
  //サーバーから送信されたメッセージを受信し、msgに格納
  socket.on("new message", (msg) => {
    //id=messagesのタグにmsgに格納されたデータを表示
    $("#messages").append($("<div>").text(msg));
  });
});