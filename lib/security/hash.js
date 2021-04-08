/********** パスワードにソルトの差し込みとストレッチングを行うロジック ********/
const { PASSWORD_SALT, PASSWORD_STRETCH } = require("../../config/app.config.js").security;
const crypto = require("crypto");

//digestメソッドで文字列を受け取ると、ソルトの差し込み、ストレッチングを行う
let digest = (text) => {
  let hash;

  //取得したパスワードにソルトの差し込み
  text += PASSWORD_SALT;

  //ストレッチング回数分ハッシュ化を繰り返す
  for (let i = PASSWORD_STRETCH; i--;) {
    //ハッシュモジュールのインスタンス化
    hash = crypto.createHash("sha256");
    //ハッシュ化したい文字列を与える
    hash.update(text);
    //16進数でハッシュ化した文字列を"text"に格納
    text = hash.digest("hex");
  }
  return text;
};


module.exports = {
  digest
};