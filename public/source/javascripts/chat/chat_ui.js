/* eslint-disable no-undef */

$(() => {
  //Socket機能を呼び出し
  const socket = io();

  //送信ボタンの押下処理
  $(".send").submit(() => {
    let date = new Date();

    //※ここからDB格納するデータ形成
    let data = {};
    //入力されたメッセージ
    data.msg = $("#bms_send_message").val();
    //ログインユーザーのユーザーID
    data.user_id = $("#login_user_id").val();
    //ルームID
    data.room_id = $("#room_id").val();
    data.role_code = $("#role_code").val();
    data.create_at = date;

    //socket.emit("イベント名", data)： サーバーサイドへデータの送信
    socket.emit("sending message", data); //$("#send_message").val() + $("#login_user_id").val() + create_at
    //フォームを空にする
    $("#bms_send_message").val("");
    return false;
  });

  //Socket.on("イベント名", data)： データの受信
  //サーバーから送信されたメッセージを受信し、msgに格納
  socket.on("new message", (data) => {
    
    //ログインユーザーIDの取得
    var user_id = $("#login_user_id").val();
    //id=messagesのタグにmsgに格納されたデータを表示

    //ログインユーザーIDとメッセージ送信者のユーザーIDが一致すれば左に表示
    if (data.user_id == user_id) {
      $("#messages").append(
        $(
          "<div id='bms_messages'><div class='bms_message bms_right'><div class='bms_message_box'><div class='bms_message_content'><div class='bms_message_text'>" +
            data.msg +
            "</div></div></div></div></div><div class='bms_clear'></div>"
        )
      );
    //一致しなければ右に表示
    } else {
      $("#messages").append(
        $(
          "<div id='bms_messages'><div class='bms_message bms_left'><div class='bms_message_box'><div class='bms_message_content'><div class='bms_message_text'>" +
            data.msg +
            "</div></div></div></div></div><div class='bms_clear'></div>"
        )
      );
    }
    $("html").scrollTop($("html")[0].scrollHeight);
    $(".chat_container").scrollTop($(".chat_container")[0].scrollHeight);
  });

});

