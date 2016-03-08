var express = require("express")
var http = require("http")
var path = require("path")
var favicon = require('serve-favicon');
var logger = require("morgan")
var cookieParser = require("cookie-parser")
var session = require("express-session")

var bodyParser = require("body-parser")
var mongoose = require("mongoose")

// var ueditor = require("ueditor")

var routes = require("./routes/index.js")
var models = require("./models/index.js")

var dbUrl = process.env.MONGOHQ_URL || "mongodb://@localhost:27017/graduationProject"
var db = mongoose.connect(dbUrl, { safe: true })

var app = express();
// app.use(bodyParser());

app.set("appName", "graduation_Project")
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "jade")
app.set("port", process.env.PORT || 3000)
app.use(express.static(path.join(__dirname, "public")))

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger("dev"))

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser("ljc"))
app.use(session({ secret: "hehe", cookie: { maxAge: 6000000000 },resave: true, saveUninitialized: true }))


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
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


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