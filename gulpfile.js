var gulp = require("gulp");

var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var minifyCss = require("gulp-minify-css");
//var jshint = require("gulp-jshint");
var concat = require("gulp-concat");
var imagemin = require("gulp-imagemin");
var pngquant = require("imagemin-pngquant");
var notify = require("gulp-notify");
var cache = require("gulp-cache");
var livereload = require("gulp-livereload");


gulp.task("say", function() {
    console.log("Hello World！");
});

// 处理样式：压缩CSS
gulp.task("style", function() {
    return gulp.src(["public/css/*.css"])
        .pipe(gulp.dest("public/css/"))
        .pipe(minifyCss())
        .pipe(rename({ suffix: ".min" }))
        .pipe(gulp.dest("public/css/"))
    //.pipe(notify({ message: "Style task complete!" }));
});


// 处理JS：jshint 检查、压缩JS
gulp.task("script", function() {
    return gulp.src(["public/js/*.js"])
        //.pipe(jshint())
        //.pipe(jshint.reporter("default"))
        .pipe(gulp.dest("public/js/"))
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest("public/js/"))
      //  .pipe(notify({ message: "script task complete!" }));
});

// 处理图片：压缩图片
gulp.task("image", function() {
    return gulp.src(["public/img/**/*"])
        .pipe(cache(
            imagemin({
                progressive: true,
                svgoPlugins: [
                    { removeViewBox: false },
                    { cleanupIDs: false }
                ],
                use: [pngquant()]
            })))
        .pipe(gulp.dest("public/img/"))
     //   .pipe(notify({ message: "image task complete!" }));
});



// 默认任务
gulp.task("default", function() {
    gulp.start("style", "script", "image");
});

// 监听改动
gulp.task("watch", function() {
    gulp.watch(["public/css/*.css"], ["style"]);
    gulp.watch(["public/js/*.js"], ["script"]);
    gulp.watch(["public/img/**/*"], ["image"]);
})
