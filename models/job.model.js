//mongooseをインポート
const mongoose = require("mongoose");

//mongoose-sequenceをインポート
const AutoIncrement = require("mongoose-sequence")(mongoose);

//usersコレクションのスキーマ定義
//(MongoDBの"users"コレクションに格納するフィールドのデータ型を指定)
const jobsSchema = mongoose.Schema({
  //※後々消す
  url: {
    type: String
  },
  //仕事情報を作成した
  user_id: {
    type: Number,
    trim: true,
    required: true,
  },
  //仕事名
  title: {
    type: String,
    trim: true,
    unique: true, //一意
  },
  //報酬
  salary: {
    type: String,
    trim: true,
    //required: true,
  },
  //仕事内容
  job_description: {
    type: String,
    trim: true,
  },
  //契約期間(開始)
  contract_period_from: {
    type: String,
  },
  //契約期間(終了)
  contract_period_to: {
    type: String,
  },
  //募集期間(開始)
  post_period_from: {
    type: String,
  },
  //募集期間(終了)
  post_period_to: {
    type: String,
  },
  //勤務地
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
  //技能
  skills: {
    type: String,
  },
  //更新日
  update: {
    type: Date
  },
  //発行日
  published: {
    type: Date
  },
  job_id: {
    type: Number,
    index: true,
  }
});

//user_idフィールドを追加して、auto-incrementを付与
jobsSchema.plugin(AutoIncrement, { inc_field: "job_id" });
let jobs = mongoose.model("job", jobsSchema);

module.exports = jobs;
