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
const chatroom = default_db.chatroom;
const chatmsg = default_db.chatmsg;

//仕事情報urlから仕事情報を取得するメソッド
const findJobInfo = (Path) => {
  return job.findOne({
    //選択した仕事情報を検索
    url: Path,
  });
};

//チャットルーム新設
/**
 * @loginUser_id  ログインユーザーID
 * @jobInfo  仕事情報
 */

//room_url格納(ハッシュ化込み)
//urlを返す

router.post("/room", (req, res) => {
  //仕事情報の詳細からurlを取得
  let jobPath = req.body.url;
  new job();

  //チャットルームを作成→room_url作成→url付与してリダイレクト
  const createNewChatroom = (loginUser_id, jobInfo) => {
    let datetime = new Date();
    return new chatroom({
      //user_id[0] = ワーカー user_id[1] = クライアント
      user_id: [loginUser_id, jobInfo.user_id],
      job_id: jobInfo.job_id,
      createdAt: datetime,
    })
      .save()
      .then((chatroomInfo) => {
        chatroom
          //url反映用にroom_idをハッシュ化
          .findOneAndUpdate(
            {
              room_id: chatroomInfo.room_id,
            },
            {
              $set: {
                room_url: hash.digest(chatroomInfo.room_id),
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
      });
  };

  findJobInfo(jobPath) //〇
    .then((jobInfo) => {
      //既設ルームか検索
      chatroom
        .findOne({
          $and: [{ job_id: jobInfo.job_id }, { user_id: req.user.user_id }],
        })
        .then((chatroomInfo) => {
          //既設ルーム返却
          if (chatroomInfo) {
            //既存ルームのステータス確認
            if (chatroomInfo.status == "open") {
              res.redirect("./room/" + chatroomInfo.room_url);
            } else {
              //ステータス"close"の場合ルーム新設してリダイレクト
              createNewChatroom(req.user.user_id, jobInfo);
            }
          } else {
            //ルームが存在しない場合新設してリダイレクト
            createNewChatroom(req.user.user_id, jobInfo);
          }
        });
    });
});

/* job
    .findOne({
      //選択した仕事情報を検索
      url: jobPath,
    })
    .then((jobInfo) => {
      return chatroom.findOne({
        $and: [{ job_id: jobInfo.job_id }, { user_id: req.user.user_id }],
      });
    })
    .then((doc) => {
      if (doc) {
        if (doc.status == "open") {
          res.redirect("./room/" + doc.room_url);
        } else {
          const newChatroom = new chatroom({
            //user_id[0] = ワーカー user_id[1] = クライアント
            user_id: [req.user.user_id, job.user_id],
            job_id: job.job_id,
            createdAt: datetime,
          }); 
          //新たに作成したチャットルームをDBに格納
          newChatroom.save().then((doc) => {
            chatroom
              //url反映用にroom_idをハッシュ化
              .findOneAndUpdate(
                {
                  room_id: doc.room_id,
                },
                {
                  $set: {
                    room_url: hash.digest(doc.room_id),
                  },
                }
              )
              .then((docs) => {
                new chatroom();
                //格納したroom_urlを取り出すためにもう一度IDでルーム検索
                chatroom.findOne({ room_id: docs.room_id }).then((url) => {
                  //urlにroom_urlを付けてリダイレクトする
                  //※チャット画面のURLは全てroom_idで判別するために
                  //room_urlを付与してリダイレクトしている。
                  res.redirect("./room/" + url.room_url); //ejsでの値の取り出し方法はプロパティを書くだけ
                  console.log(url);
                });
              });
          });
        }
      } else {
        const newChatroom = new chatroom({
          //user_id[0] = ワーカー user_id[1] = クライアント
          user_id: [req.user.user_id, job.user_id],
          job_id: job.job_id,
          createdAt: datetime,
        });
        //新たに作成したチャットルームをDBに格納
        newChatroom.save().then((doc) => {
          chatroom
            //url反映用にroom_idをハッシュ化
            .findOneAndUpdate(
              {
                room_id: doc.room_id,
              },
              {
                $set: {
                  room_url: hash.digest(doc.room_id),
                },
              }
            )
            .then((docs) => {
              new chatroom();
              //格納したroom_urlを取り出すためにもう一度IDでルーム検索
              chatroom.findOne({ room_id: docs.room_id }).then((url) => {
                //urlにroom_urlを付けてリダイレクトする
                //※チャット画面のURLは全てroom_idで判別するために
                //room_urlを付与してリダイレクトしている。
                res.redirect("./room/" + url.room_url); //ejsでの値の取り出し方法はプロパティを書くだけ
                console.log(url);
              });
            });
        });
      }
    }); */

//チャットIDをハッシュ化する構想
//→そもそもPOST送信にすれば済む話
/* newChatroom.save().then((doc) => {
  chatroom
    .findOneAndUpdate(
      {
        room_id: doc.room_id,
      },
      {
        $set: {
          room_id: hash.digest(doc.room_id),
        },
      }
    )
    .then(() => {
      //urlにroom_idを付けてリダイレクトする
      //※チャット画面のURLは全てroom_idで判別するために
      //あえてroom_idを付与してリダイレクトしている。
      res.redirect("./room/" + doc.room_id); //ejsでの値の取り出し方法はプロパティを書くだけ
    });
}); */

//チャットルームへの遷移先
router.get("/room/*", (req, res) => {
  chatroom
    .findOne({
      //クエリパラメータからroom_urlを取得
      room_url: req.params[0],
    })
    //room情報を"room"に格納
    .then((room) => {
      let roominfo = {
        //送信メッセージの送信元を測定するためにuser_idを取得
        user_id: req.user.user_id,
        job_id: room.job_id,
        room_id: room.room_id,
      };
      //room_idが合致するメッセージを取得
      chatmsg
        .find({ room_id: room.room_id })
        /*.sort({ createdAt: -1 })
        .limit(20)
        .toArray() */
        //メッセージ取得
        .then((msg) => {
          roominfo.msg = msg;
          console.log(msg);
          res.render("./matching/chatroom.ejs", roominfo);
        });
    });
});

//選考中の仕事情報一覧表示
router.get("/job_list", (req, res) => {
  res.render("./matching/job_list");
});

module.exports = router;
