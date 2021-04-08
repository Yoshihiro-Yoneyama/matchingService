module.exports = {
  security: {
    //passport.sessionでクライアントがユーザー情報をセッションとして取得するための設定で使う(accountcontrol.js)
    SESSION_SECRET: "YOUR-SESSION-SECRET-STRING",
    //任意の文字列を準備
    PASSWORD_SALT: "YOUR-PASSWORD-SALT",
    //ストレッチング回数を設定
    PASSWORD_STRETCH: 3
  },
  search: {
    //検索1ページあたりの件数
    MAX_ITEM_PER_PAGE: 5
  }
};