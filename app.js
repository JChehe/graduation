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
var db = mongoose.connect(dbUrl,{safe:true})

var app = express()
app.locals.moment = require("moment");

app.use(function(req, res, next){
    if(/*!models.Article || */!models.User){
        return next(new Error("No models"))
    }
    req.models = models;
    return next()
})


app.set("appName", "graduation_Project")
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "jade")
app.set("port", process.env.PORT || 3000)
app.use(express.static(path.join(__dirname, "public")))

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger("dev"))
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser("ljc"))
app.use(session({secret: "hehe", cookie: { maxAge: 600000 }}))


//  权限管理
var authorize = function(req, res, next){
    // console.log("session:" + req.session.user)
    if( req.session.user/* && req.session.admin*/){
        return next();
    }else{
        return res.redirect("/login")
    }
}

app.get("/login", routes.login.login)
app.post("/login/login_handler", routes.login.authenticate)
app.get("/logout", routes.login.logout)

app.get("*", authorize)
app.use(function(req, res, next){
    res.locals.isLogin= true
    next()
})

app.get("/", routes.system_admin.index)

app.get("/perinfo", routes.system_admin.perinfo)
app.get("/system_user_list", routes.system_admin.systemUserList)
app.get("/doctor_list", routes.system_admin.doctorList)
app.get("/patient_list", routes.system_admin.patientList)

app.post("/add_system_user", routes.system_admin.add_system_user)
app.post("/edit_system_user", routes.system_admin.edit_system_user)

app.post("/modify_password", routes.system_admin.modifyPassword)
app.post("/condition_search", routes.system_admin.conditionSearch)

app.post("/add_patient_user", routes.system_admin.add_patient_user)
app.post("/edit_patient_user", routes.system_admin.edit_patient_user)

app.get("/family/:id", routes.system_admin.family)
app.post("/handle_family/:id", routes.system_admin.handle_family) // 添加或修改


app.post("/add_doctor_user", routes.system_admin.add_doctor_user)
app.post("/edit_doctor_user/:id", routes.system_admin.edit_doctor_user)
app.get("/get_patient_list", routes.system_admin.get_patient_list)
app.post("/add_care_patient", routes.system_admin.add_care_patient)


app.get("/my_care_patient", routes.doctor.my_care_patient)
app.get("/get_patient_info/:id", routes.doctor.get_patient_info)

app.get("/event_list", routes.doctor.event_list)


app.get("/select_event", routes.event.select_event)
app.post("/select_event", routes.event.select_event_handle)
app.get("/add_event", routes.event.add_event)
app.post("/add_event_handle", routes.event.add_event_handle)


app.get("/my_related_doctor", routes.patient.my_related_doctor);
app.get("/diagnose", routes.patient.diagnose);
app.get("/patient/event_list", routes.patient.event_list);
app.get("/ecg", routes.patient.ecg)

app.use(function(req, res, next){
    var err = new Error("Not Found")
    err.status = 404
    next(err)
})

if(app.get("ENV") === "development"){
    app.use(function(err, req, res, next){
        res.status(err.status || 500)
        res.render({
            message : err.status || 500,
            error: {}
        })
    })
}

var server = http.createServer(app)
var boot = function(){
    server.listen(app.get("port"), function(req, res){
        console.log(app.get("appName") + " : "+ app.get("port") +"启动成功!");
    })
}

var shutdown = function(){
    server.close()
}

if(require.main === module){
    boot()
}else{
    console.info("Running app as a module")
    exports.boot = boot
    exports.shutdown = shutdown
    exports.port = app.get("port")
}
