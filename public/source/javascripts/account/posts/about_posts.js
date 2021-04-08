/********* 戻るボタンと確定ボタンの実装 *********/
//jqueryで書いている
//※ejsがES6未対応のため通常のjsでコーディング(buttonタグも使えない模様)
var btnSubmit_onclick = function (event) {
  var $submit = $(this);
  var $form = $submit.parents("form");
  $form.attr("method", $submit.data("method"));
  $form.attr("action", $submit.data("action"));
  //submitボタン押下判定
  $form.submit();

  /* 二重送信防止の実装 */
  //submitボタンを押せないようにする→イベント削除
  $submit.off().prop("disabled", true);
  //formの処理を無効化する(保険)
  $form.on("submit", false);
};

/* inputのボタン押下認知 */
var document_onready = function (event) {
  $("input[type='submit']").on("click", btnSubmit_onclick);
};

$(document).ready(document_onready);
