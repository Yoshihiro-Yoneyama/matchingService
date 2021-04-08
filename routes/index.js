//view配下のindex.ejsを表示するファイル
//vie返却するモジュールの作成
const router = require( "express" ).Router();

/*----- routerに以下の機能を付けてモジュール化する ------*/
//"/"のリクエストを受け取ったら↓
router.get( "/", ( req, res ) => {
  //"index.ejs"の画面をレスポンスとして返す
  res.render( "./index.ejs" );
});

//app.jsにてrequireすることで使用可能に
module.exports = router;