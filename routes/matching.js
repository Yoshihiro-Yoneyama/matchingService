const express = require("express");
const router = express.Router();

/** 
使用するコレクションのインポート
* @job  job_id
* @chatroom
*/
const default_db = require("../models");
// const users = default_db.users;
const job = default_db.job;
const chatroom = default_db.chatroom;
const chatmsg = default_db.chatmsg;

router.post("/room", (req, res) => {
  //仕事情報の詳細からurlを取得
  let jobPath = req.body.url;
  new job();
  job
    .findOne({
      //選択した仕事情報を検索
      url: jobPath,
    })
    .then((job) => {
      let datetime = new Date();
      const newChatroom = new chatroom({
        //user_id[0] = ワーカー user_id[1] = クライアント
        user_id: [req.user.user_id, job.user_id],
        job_id: job.job_id,
        create_at: datetime,
      });
      //新たに作成したチャットルームをDBに格納
      newChatroom.save().then((doc) => {
        //urlにroom_idを付けてリダイレクトする
        //※チャット画面のURLは全てroom_idで判別するために
        //あえてroom_idを付与してリダイレクトしている。
        res.redirect("./room/" + doc.room_id); //ejsでの値の取り出し方法はプロパティを書くだけ
      });
    });
});

//チャットルームへの遷移先
router.get("/room/*", (req, res) => {
  chatroom
    .findOne({
      //クエリパラメータからroom_idを取得
      room_id: req.params[0],
    })
    //room情報を"room"に格納
    .then((room) => {
      let roominfo = {
        //送信メッセージの送信元を測定するためにuser_idを取得
        user_id: req.user.user_id,
        job_id: room.job_id,
        room_id: room.room_id,
      };
      // res.render("./matching/chatroom.ejs", roominfo);
      //room_idが合致するメッセージを取得
      chatmsg
        .find({ room_id: room.room_id })
        .sort({ create_at: -1 })
        .limit(20)
        .toArray()
        //メッセージ取得
        .then((msg) => {
          roominfo.msg = msg;
          console.log(msg);
          res.render("./matching/chatroom.ejs", roominfo);
        });
    });
});

//
router.get("/job_list", (req, res) => {
  res.render("./matching/job_list");
});

module.exports = router;
