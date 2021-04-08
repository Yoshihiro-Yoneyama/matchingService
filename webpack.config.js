//npx webpackで実行

const path = require("path");

module.exports = {
  mode: "development",
  // devtool: "none",
  entry: {app: "./app.js",}, //エントリーポイント(全てのファイルの基準となるファイル)
  output: {   //ファイルの出力先を指定
    path: path.resolve(__dirname, "public/development/dist"),
    filename: "[name].bundle.js"  //出力ファイルのファイル名
  },
};