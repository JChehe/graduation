var express = require("express"),
    router = express.Router();

var auth = require("../middlewares/auth");


/*  属于写法一
var systemAdminRouter = express.Router(),
    adminRouter = express.Router(),
    doctorRouter = express.Router(),
    patientRouter = express.Router();*/


var login = require("./login"),
    system_admin = require("./system_admin"),
    admin = require("./admin"),
    doctor = require("./doctor"),
    patient = require("./patient"),
    event = require("./event");
    chat = require("./chat");



router.get("/login", login.login)
router.post("/login/login_handler", login.authenticate)

router.get("*", auth.authRequired)
router.use(function(req, res, next) {
    res.locals.isLogin = true
    next();
})

/* 公共路由
 *   首页
 *   个人信息
 *   删除用户
 *   修改密码
 *   注销
 */
router.get("/", system_admin.index)
router.get("/perinfo", system_admin.perinfo)
router.get("/del_user", system_admin.del_user)
router.post("/modify_password", system_admin.modify_password)
router.get("/logout", login.logout)

// 搜索
router.post("/user_search", system_admin.user_search)
router.post("/event_search", system_admin.event_search)
router.post("/diagnose_search", system_admin.diagnose_search)

/*
 * 权限控制的两种写法：
 * 第一种：要在前端增加层级，即修改请求路径
    router.use("/system_admin", auth.systemAdminRequired, systemAdminRouter);

    adminRouter.get("/system_user_list", system_admin.system_user_list)
    adminRouter.get("/doctor_list", system_admin.doctor_list)
    adminRouter.get("/patient_list", system_admin.patient_list)

 * 第二种：无须前端改请求路径，用起来比较灵活，但写法比较冗余
    router.get("/system_user_list", auth.systemAdminRequired, system_admin.system_user_list);
*/


/* 系统管理员权限以上 开始 */

router.get("/system_user_list", auth.systemAdminRequired, system_admin.system_user_list)
router.post("/add_system_user", auth.systemAdminRequired, system_admin.add_system_user)
router.post("/edit_system_user", auth.systemAdminRequired, system_admin.edit_system_user)

/* 系统管理员权限以上 结束 */



/* 管理员权限以上  开始 */
router.get("/doctor_list", auth.adminRequired, system_admin.doctor_list)
router.get("/patient_list", auth.adminRequired, system_admin.patient_list)
router.post("/add_patient_user", auth.adminRequired, system_admin.add_patient_user)
router.post("/edit_patient_user", auth.adminRequired, system_admin.edit_patient_user)

// 家属的添加、编辑与删除
router.post("/handle_family/:id", auth.adminRequired, system_admin.handle_family) // 添加或修改
router.get("/del_family/:id", auth.adminRequired, system_admin.del_family)

// 医生的添加与编辑
router.post("/add_doctor_user", auth.adminRequired, system_admin.add_doctor_user)
router.post("/edit_doctor_user/:id", auth.adminRequired, system_admin.edit_doctor_user)

// 获取病人列表与为医生选择病人
router.get("/get_patient_list", auth.adminRequired, system_admin.get_patient_list)
router.post("/add_care_patient", auth.adminRequired, system_admin.add_care_patient)


/* 管理员权限以上  结束 */





/* 医生权限以上 开始 */

router.get("/my_care_patient", auth.doctorRequired, doctor.my_care_patient)
router.get("/get_patient_info/:id", doctor.get_patient_info)

router.get("/event_list", auth.doctorRequired, doctor.event_list)
router.get("/diagnose_list", auth.doctorRequired, doctor.diagnose_list);
router.post("/modify_diagnose", auth.doctorRequired, doctor.modify_diagnose)
router.post("/add_diagnose", auth.doctorRequired, doctor.add_diagnose)
router.get("/get_unView_event", auth.doctorRequired, doctor.get_unView_event)

/* 医生权限以上 开始 */




/* 病人权限以上 开始  */

router.get("/my_related_doctor", auth.patientRequired, patient.my_related_doctor);
router.get("/my_diagnose", auth.patientRequired, patient.my_diagnose);
router.get("/my_calendar", auth.patientRequired, patient.my_calendar);
router.get("/patient/event_list", auth.patientRequired, patient.event_list);
router.get("/ecg", auth.patientRequired, patient.ecg)
router.get("/get_family/:id", auth.patientRequired, system_admin.get_family)

router.get("/get_related_diagnose", auth.patientRequired, doctor.get_related_diagnose)
router.get("/get_calendar_events", auth.patientRequired, patient.get_calendar_events);

/* 病人权限以上 结束 */



/* 额外功能，此部分功能应由硬件产生 开始 */
router.get("/select_event", auth.doctorRequired, event.select_event)
router.post("/select_event", auth.doctorRequired, event.select_event_handle)
router.get("/add_event", auth.doctorRequired, event.add_event)
router.post("/add_event_handle", auth.doctorRequired, event.add_event_handle)
/* 额外功能，此部分功能应由硬件产生 结束 */


router.get("/get_chat_record", auth.patientRequired, chat.get_chat_record);
router.post("/save_chat_record", auth.patientRequired, chat.save_chat_record);
router.get("/get_talk_people", auth.patientRequired, chat.get_talk_people);

module.exports = router;