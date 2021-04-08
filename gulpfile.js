//gulpモジュールから"src","dest"の関数をインポートする(watchを使う場合はその追加も)
const { src, dest } = require("gulp");
//gulpのプラグインを一括でロードしてくれる
const loadPlugins = require("gulp-load-plugins");
const $ = loadPlugins();
const mozjpeg = require("imagemin-mozjpeg");
const pngquant = require("imagemin-pngquant");
const autoprefixer = require("autoprefixer");

//ファイルのコピー
const copyFiles = () => {
  return src("./views/**/*.ejs")
    .pipe(
      $.rename({
        prefix: "gulpcopy-",
      })
    )
    .pipe(dest("./public/development"));
};

//scssファイルのコンパイル&コピー
//※ソースマップは圧縮後に元のソースがどういったものであるかをブラウザ上で確認できる
const styles = () => {
  return (
    src("./public/source/stylesheets/sample.scss")
      .pipe($.sourcemaps.init())
      //ここの部分のソースマップが生成される(sourcemaps使用)
      .pipe($.sass())
      .pipe(
        $.postcss([
          autoprefixer({
            // ☆IEは11以上、Androidは5以上
            //その他は最新2バージョンで必要なベンダープレフィックスを付与する
            //※そもそもベンダープレフィックス自体必要でなくなってきているため実装時に要チェック
            overrideBrowserslist: [
              "last 2 version",
              "ie >= 11",
              "Android >= 5",
            ],
            cascade: false,
          }),
        ])
      )
      //"."であればdestと同じディレクトリに書き出し
      .pipe($.sourcemaps.write("."))
      .pipe(dest("./public/development/stylesheets"))
  );
};

//ES6のトランスパイル及び圧縮
//※.babelrcファイルを作成して、presetsを使用するように設定
const scripts = () => {
  return src("./public/source/javascripts/sample/*.js")
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.uglify())
    .pipe($.rename({
      extname: ".min.js"
    }))
    .pipe($.sourcemaps.write("."))
    .pipe(dest("./public/development/javascripts"));
};

//画像の圧縮とコピー
const taskImagemin = () => {
  return (
    src("./public/source/images/*")
      //強制終了防止
      .pipe($.plumber())
      //保存先のファイルとの差分を常に監視して変更点のみを処理する。
      .pipe($.changed("./public/development/images"))
      .pipe(
        $.imagemin([
          pngquant({
            quality: [0.65, 0.8],
            speed: 1,
          }),
          mozjpeg({
            quality: 80,
          }),
          $.imagemin.gifsicle({
            interlaced: false,
          }),
          $.imagemin.svgo({
            plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
          }),
        ])
      )
      .pipe($.rename({ suffix: "_min" }))
      .pipe(dest("./public/development/images"))
  );
};

// Wacth
// const taskWatch = (done) => {
//   watch("./public/source/images/*", taskImagemin);
//   done();
// };

//gulp <module name>
module.exports = {
  copyFiles,
  styles,
  scripts,
  // taskWatch,
  taskImagemin,
};
