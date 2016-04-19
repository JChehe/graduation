var express = require("express")
var http = require("http")
var path = require("path")
var favicon = require('serve-favicon');
var logger = require("morgan")
var cookieParser = require("cookie-parser")
var session = require("express-session")

var mongoStore = require("connect-mongo")(session)

var bodyParser = require("body-parser")
var mongoose = require("mongoose")

var routes = require("./routes/index.js")
var models = require("./models/index.js")

var config = require("./config.default")

var dbUrl = process.env.MONGOHQ_URL || config.dbUrl
var db = mongoose.connect(dbUrl, { safe: true })

var ueditor = require("ueditor")
var app = express();
// app.use(bodyParser());

app.set("appName", "graduation_Project")
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "jade")
app.set("port", process.env.PORT || config.port)
app.use(express.static(path.join(__dirname, "public")))

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger("dev"))

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser(config.session_secret))

// 实现session持久化
app.use(session({
    secret: config.session_secret,
    store: new mongoStore({
        url: dbUrl,
        collection: "sessions",
        ttl: 14 * 24 * 60 * 60 // = 14 days. Default
    })
}))

app.locals.moment = require("moment");

app.use(function(req, res, next) {
    if ( /*!models.Article || */ !models.User || !models.Event || !models.Diagnose) {
        return next(new Error("No models"))
    }
    req.models = models;
    return next()
})

var routes = require("./routes/index");

app.use("/", routes);

app.use("/ueditor/ue", ueditor(path.join(__dirname, 'public'), function(req, res, next) {
    // ueditor 客户发起上传图片请求
    if (req.query.action === 'uploadimage') {
        var foo = req.ueditor;
        var date = new Date();
        var imgname = req.ueditor.filename;

        var img_url = '/news/images/';
        res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage') {
        var dir_url = '/news/images/';
        res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
        // console.log('config.json')
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/ueditor/nodejs/config.json');
    }
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    // mongoose.set("debug", true); // 显示mongoDB 执行语句
    app.use(function(error, req, res, next) {
        res.status(error.status || 500);
        res.render('error', {
            message: error.message,
            error: error
        });
    });
}


var server = http.createServer(app)
var boot = function() {
    server.listen(app.get("port"), function(req, res) {
        console.log(app.get("appName") + " : " + app.get("port") + "启动成功!");
    })
}

var shutdown = function() {
    server.close()
}

if (require.main === module) {
    boot()
} else {
    console.info("Running app as a module")
    exports.boot = boot
    exports.shutdown = shutdown
    exports.port = app.get("port")
}

var open =require("open");
open("http://localhost:3000/")