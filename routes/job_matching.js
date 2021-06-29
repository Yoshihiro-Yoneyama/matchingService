const express = require("express");
const router = express.Router();

const hash = require("../lib/security/hash.js");

/** 
使用するコレクションのインポート
* @job  job_id
* @chatroom
*/
const default_db = require("../models");
// const users = default_db.users;
const job = default_db.job;
const user = default_db.users;
const chatroom = default_db.chatroom;
const chatmsg = default_db.chatmsg;
const skillsheet = default_db.skillsheet;

//仕事情報job_idから仕事情報を取得するメソッド
const findJobInfo = (id) => {
  return job.findOne({
    //選択した仕事情報を検索
    job_id: id,
  });
};

//チャットルーム新設
/**
 * @worker_id  ログインユーザーID
 * @jobInfo  仕事情報
 */
//room_url格納(ハッシュ化込み)
//urlを返す
router.post("/room", (req, res) => {
  //ドロップダウンリストから選んだ仕事情報のjob_idを取得
  //パラメータ: id = job
  let getJobId = req.body.job_id;
  //スキルシートIDを取得
  let getSheetID = req.body.sheet_id;

  //(メソッド)チャットルームを作成→room_url作成→url付与してリダイレクト
  const createNewChatroom = (worker_id, jobInfo) => {
    let datetime = new Date();
    return new chatroom({
      //user_id[0] = ワーカー user_id[1] = クライアント
      users: [{ user_id: worker_id }, { user_id: jobInfo.user_id }],
      /*       u_id: [worker_id, jobInfo.user_id], */
      job_id: jobInfo.job_id,
      createdAt: datetime,
    })
      .save()
      .then((chatroomInfo) => {
        if (req.user.role_code == "0002") {
          chatroom
            //url反映用にroom_idをハッシュ化
            .findOneAndUpdate(
              {
                room_id: chatroomInfo.room_id,
              },
              {
                $set: {
                  room_url: hash.digest(chatroomInfo.room_id),
                  "users.0.status": "Active",
                },
              }
            )
            .then((newChatroomInfo) => {
              new chatroom();
              //格納したroom_urlを取り出すためにもう一度IDでルーム検索
              chatroom
                .findOne({ room_id: newChatroomInfo.room_id })
                .then((url) => {
                  res.redirect("./room/" + url.room_url);
                });
            });
        } else if (req.user.role_code == "0003") {
          chatroom
            //url反映用にroom_idをハッシュ化
            .findOneAndUpdate(
              {
                room_id: chatroomInfo.room_id,
              },
              {
                $set: {
                  room_url: hash.digest(chatroomInfo.room_id),
                  "users.1.status": "Active",
                },
              }
            )
            .then((newChatroomInfo) => {
              new chatroom();
              //格納したroom_urlを取り出すためにもう一度IDでルーム検索
              chatroom
                .findOne({ room_id: newChatroomInfo.room_id })
                .then((url) => {
                  res.redirect("./room/" + url.room_url);
                });
            });
        }
      });
  };

  skillsheet
    .findOne({
      sheet_id: getSheetID,
    })
    .then((doc) => {
      if (getJobId == "") {
        job.find({ user_id: req.user.user_id }).then((job) => {
          doc.job_id = [];
          doc.title = [];
          doc.errors;
          for (let i = 0; i < job.length; i++) {
            doc.job_id[i] = job[i].job_id;
            doc.title[i] = job[i].title;
          }
          doc.errors = "提案する仕事情報を選択してください。";
          res.render("./posts/skillsheet.ejs", doc);
        });
        return;
      } else {
        //ワーカーIDとクライアントIDの変数を作成
        let getWorkerId, getClientId;
        //ワーカーでログイン→仕事応募
        if (req.user.role_code == "0002") {
          getWorkerId = req.body.worker_id;
          getClientId = req.body.client_id;

          //クライアントでログイン→スカウト
        } else if (req.user.role_code == "0003") {
          getWorkerId = req.body.worker_id;
          getClientId = req.user.user_id;
        }

        new job();
        findJobInfo(getJobId) //〇
          .then((jobInfo) => {
            //既設ルームか検索
            chatroom
              .findOne({
                $and: [
                  { job_id: getJobId }, //提案する仕事情報ID
                  { "users.user_id": [getClientId, getWorkerId] }, //クライアントID,ワーカーIDで検索
                ],
              })
              .then((chatroomInfo) => {
                //既設ルーム返却
                if (chatroomInfo) {
                  //既存ルームのステータス確認
                  if (chatroomInfo.status == "open") {
                    res.redirect("./room/" + chatroomInfo.room_url);
                  } else {
                    //ステータス"close"の場合ルーム新設してリダイレクト
                    createNewChatroom(getWorkerId, jobInfo);
                  }
                } else {
                  //ルームが存在しない場合新設してリダイレクト
                  createNewChatroom(getWorkerId, jobInfo);
                }
              });
          });
      }
    });
});

//作成したチャットルームへの遷移
router.get("/room/*", (req, res) => {
  chatroom
    .findOne({
      //クエリパラメータからroom_urlを取得
      room_url: req.params[0],
    })
    //room情報を"room"に格納
    .then((room) => {
      /****** newflgの有無確認 ******/
      //ログインユーザー=ワーカー
      if (req.user.role_code == "0002") {
        //
        if (room.users[0].status == "Pending") {
          //"Pending"→"Active"
          chatroom.findOneAndUpdate(
            { room_id: room.room_id },
            {
              $set: {
                "users.0.status": "Active",
              },
            }
          );
        }
        //ログインユーザー=クライアント
      } else if (req.user.role_code == "0003") {
        if (room.users[1].status == "Pending") {
          //"Pending"→"Active"
          chatroom
            .findOneAndUpdate(
              {
                room_id: room.room_id,
              },
              {
                $set: {
                  "users.1.status": "Active",
                },
              }
            )
            .then((test) => {
              console.log(test);
            });
        }
      }

      /****** DBに格納しているメッセージを表示 ******/
      //レスポンス内容
      let roominfo = {
        //送信メッセージの送信元を測定するためにuser_idを取得
        user_id: req.user.user_id,
        job_id: room.job_id,
        room_id: room.room_id,
        role_code: req.user.role_code,
      };
      //ログインユーザーあてのメッセージのreadFlgを全てtrue（既読）にする
      chatmsg.updateMany(
        {
          "user_receiver.user_id": req.user.user_id,
          "user_receiver.readFlg": false,
        },
        { $set: { "user_receiver.readFlg": true } }
      ).then((tes)=>{console.log(tes);});
      //room_idが合致するメッセージを全件取得
      chatmsg
        .find({ room_id: room.room_id })
        /*.sort({ createdAt: -1 })
        .limit(20)
        .toArray() */
        //メッセージ取得
        .then((msg) => {
          roominfo.msg = msg;
          res.render("./matching/chatroom.ejs", roominfo);
        });
    });
});

/****** 選考中の仕事情報一覧表示 *****/
router.get("/job_list", (req, res) => {
  //ログインIDからチャットルーム情報を取得
  chatroom
    .find({ "users.user_id": req.user.user_id })
    .then((room) => {
      //→ルームが開設されている仕事情報全て取得
      let testUserid = [];
      let testJobid = [];

      //roomからワーカーのuser_idとjob_idを抜き出し(配列で格納されているため配列で取得)
      for (let i = 0; i < room.length; i++) {
        testUserid[i] = room[i].users[0].user_id;
        testJobid[i] = room[i].job_id;
      }
      //仕事情報とワーカーのユーザー情報を取得
      Promise.all([
        job.find({ job_id: { $in: testJobid } }),
        user.find({ user_id: { $in: testUserid } }),
      ]).then((job_listInfo) => {
        //開設したチャットルームに紐づけられた仕事情報を全件格納
        let getJobInfo = job_listInfo[0];
        //応募したワーカーユーザー情報を全件格納
        let getUserInfo = job_listInfo[1];

        /**
         * room情報とroomにあるjob_idとuser_idを格納
         *
         * @doc room,role_code(ログインユーザー),user_id,username
         *
         */
        let doc = [];
        let loginUserrole = req.user.role_code;

        //docにchatoroom情報を配列で格納
        for (let i = 0; i < room.length; i++) {
          doc[i] = room[i];

          //チャットルーム新設された場合はルーム一覧でnewと表示
          doc[i].newflg = "";
          if (req.user.role_code == "0002") {
            if (room[i].users[0].status == "Pending") {
              doc[i].newflg = true;
              /* chatroom.findOneAndUpdate(
                {
                  room_id: room[i].room_id,
                },
                {
                  $set: {
                    "users.0.status": "Active",
                  },
                }
              ); */
            }
          }
          if (req.user.role_code == "0003") {
            if (room[i].users[1].status == "Pending") {
              doc[i].newflg = true;
              /* chatroom.findOneAndUpdate(
                {
                  room_id: room[i].room_id,
                },
                {
                  $set: {
                    "users.1.status": "Active",
                  },
                }
              ); */
            }
          }
          //クライアントとワーカーで表示内容を差別化するためにrole_codeを持たせておく
          doc[i].role_code = loginUserrole;

          //取得した全user_idとchatoroomのuser_idを照合し、合致したuser_idのusernameを格納
          for (let j = 0; j < getUserInfo.length; j++) {
            if (doc[i].users[0].user_id == getUserInfo[j].user_id) {
              doc[i].username = getUserInfo[j].username;
            }
          }
          //取得した全job_idとchatoroomのjob_idを照合し、合致したjob_idの仕事タイトルを格納
          for (let k = 0; k < getJobInfo.length; k++) {
            if (doc[i].job_id == getJobInfo[k].job_id) {
              doc[i].title = getJobInfo[k].title;
            }
          }
        }
        res.render("./matching/job_list", { doc });
      });
    })
    .catch((error) => {
      throw error;
    });
});

module.exports = router;
