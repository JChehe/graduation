var express = require("express"),
    router = express.Router();


var login = require("./login"),
    system_admin = require("./system_admin"),
    admin = require("./admin"),
    doctor = require("./doctor"),
    patient = require("./patient"),
    event = require("./event");




//  权限管理
var authorize = function(req, res, next) {
    if (req.session.user /* && req.session.admin*/ ) {
        return next();
    } else {
        return res.redirect("/login")
    }
}

router.get("/login", login.login)
router.post("/login/login_handler", login.authenticate)
router.get("/logout", login.logout)

router.get("*", authorize)
router.use(function(req, res, next) {
    res.locals.isLogin = true
    next();
})

router.get("/", system_admin.index)

router.get("/perinfo", system_admin.perinfo)
router.get("/system_user_list", system_admin.system_user_list)
router.get("/doctor_list", system_admin.doctor_list)
router.get("/patient_list", system_admin.patient_list)

router.get("/del_user", system_admin.del_user)

router.post("/add_system_user", system_admin.add_system_user)
router.post("/edit_system_user", system_admin.edit_system_user)

router.post("/modify_password", system_admin.modify_password)
router.post("/user_search", system_admin.user_search)
router.post("/event_search", system_admin.event_search)
router.post("/diagnose_search", system_admin.diagnose_search)

router.post("/add_patient_user", system_admin.add_patient_user)
router.post("/edit_patient_user", system_admin.edit_patient_user)

router.get("/family/:id", system_admin.family)
router.post("/handle_family/:id", system_admin.handle_family) // 添加或修改


router.post("/add_doctor_user", system_admin.add_doctor_user)
router.post("/edit_doctor_user/:id", system_admin.edit_doctor_user)
router.get("/get_patient_list", system_admin.get_patient_list)
router.post("/add_care_patient", system_admin.add_care_patient)


router.get("/my_care_patient", doctor.my_care_patient)
router.get("/get_patient_info/:id", doctor.get_patient_info)

router.get("/event_list", doctor.event_list)
router.get("/diagnose_list", doctor.diagnose_list);
router.get("/get_related_diagnose", doctor.get_related_diagnose)
router.post("/modify_diagnose", doctor.modify_diagnose)
router.post("/add_diagnose", doctor.add_diagnose)
router.get("/get_unView_event", doctor.get_unView_event)

router.get("/select_event", event.select_event)
router.post("/select_event", event.select_event_handle)
router.get("/add_event", event.add_event)
router.post("/add_event_handle", event.add_event_handle)


router.get("/my_related_doctor", patient.my_related_doctor);
router.get("/my_diagnose", patient.my_diagnose);
router.get("/my_calendar", patient.my_calendar);
router.get("/patient/event_list", patient.event_list);
router.get("/ecg", patient.ecg)

router.get("/get_calendar_events", patient.get_calendar_events);



module.exports = router;
