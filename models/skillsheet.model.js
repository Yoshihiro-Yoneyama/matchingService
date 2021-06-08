//mongooseをインポート
const mongoose = require("mongoose");

//mongoose-sequenceをインポート
const AutoIncrement = require("mongoose-sequence")(mongoose);

//skillsheetコレクションのスキーマ定義
//(MongoDBの"users"コレクションに格納するフィールドのデータ型を指定)
const skillSchema = mongoose.Schema({
  //ユーザーID
  user_id: {
    type: Number,
    trim: true,
  },
  //表示名
  username: {
    type: String,
  },
  //経歴
  experience: {
    type: String,
    trim: true,
  },
  //スキル
  skill: {
    type: String,
    trim: true,
  },
  //希望勤務地
  location: {
    type: String,
  },
  //就労形態
  work_style: {
    type: String,
  },
  //業種
  industry_types: {
    type: String,
  },
  //更新日
  update: {
    type: Date,
  },
  //発行日
  published: {
    type: Date,
  },
});

//user_idフィールドを追加して、auto-incrementを付与
skillSchema.plugin(AutoIncrement, { inc_field: "sheet_id" });
let skillsheet = mongoose.model("job", skillSchema);

module.exports = skillsheet;
