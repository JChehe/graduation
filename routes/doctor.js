// var mongoJoin = require("mongo-join");
exports.my_care_patient = function(req, res, next) {
    var carePatientList = [];
    req.models.User.findOne({
        _id: req.session.user._id
    }, function(err, curDoctor) {
        if (err) return next(err)
        curDoctor.care_patient.forEach(function(patientId, index) {
            req.models.User.findOne({
                _id: patientId
            }, function(err, carePatient) {
                if (err) return next(err);
                carePatientList.push(carePatient)
                if (index == curDoctor.care_patient.length - 1) {
                    res.render("doctor/my_care_patient", {
                        user: req.session.user,
                        userList: carePatientList
                    })
                }
            })
        })
    })
}

exports.get_patient_info = function(req, res, next) {
    var curPatientId = req.params.id;
    req.models.User.findOne({
        _id: curPatientId
    }, function(err, patient) {
        if (err) return next(err);
        res.send({
            status: true,
            info: "查询成功",
            data: patient
        })
    })
}

// 用population 将 病人嵌入 event
exports.event_list = function(req, res, next) {
    req.models.User.findOne({
        _id: req.session.user._id
    }, function(err, doc) {
        if (err) return next(err);

        var myCarePatient = doc.care_patient;

        req.models.Event.find({
            user_id: {
                "$in": myCarePatient
            }
        }).sort({ 'level': -1 }).limit(10).populate({
            path: "user"
        }).exec(function(err, eventList) {
            if (err) return next(err);
            console.log(eventList)
            res.render("doctor/event_list", {
                user: req.session.user,
                eventList: eventList
            })
        })


    })
}

exports.diagnose_list = function(req, res, next) {
    var doc = req.session.user;
    // res.json(req.session.user)
    console.log(req.session.user.role)
        /*req.models.Diagnose.find({
                patient_id: {
                    "$in": doc.care_patient
                }
            }).populate("patient")
            .exec(function(err, diagnoseList) {
                if (err) return next(err);

                res.render("doctor/diagnose_list", {
                    user: req.session.user,
                    diagnoseList: diagnoseList
                })
            });*/
    res.render("doctor/diagnose_list", {
        user: req.session.user
    });

}


exports.get_related_diagnose = function(req, res, next) {
    var eventId = req.query.eid;
    console.log(eventId)
        /*req.models.Diagnose.find({
            event_id: eventId
        }).sort({"create_time": -1}).limit(5).exec(function(err, diagnoseList){
            if(err) return next(err);
            res.json(diagnoseList);
        })*/
    req.models.Diagnose.find({
        event_id: eventId
    }, function(err, diagnoseList) {
        if (err) return next(err);
        console.log(diagnoseList)
    })
}


exports.add_diagnose = function(req, res, next){
    // console.log(req.body)
    var rb = req.body;
    req.models.Diagnose.create({
        event_id: req.query.eid,
        doctor_id: req.session.user._id,
        patient_id: rb.patient_id,
        patient: rb.patient_id,
        doctor_name: req.session.user.role_prop.real_name,
        content: rb.diagnose_content,
        create_time: Date.now(),
        update_time: Date.now()
    }, function(err, diagnose){
        if(err) return next(err);
        // console.log("haha")
        // res.send("ha")
        req.models.Event.update({
            _id: req.query.eid
        }, {
            $push: {
                diagnoses: diagnose._id
            }
        })
    })
}


exports.modify_diagnose = function(req, res, next) {
    var diagnoseId = req.query.did;
    var diagnoseContent = req.body.content;

    // 检查 前端报错：POST http://localhost:3000/modify_diagnose?did=111 500 (Internal Server Error)
    // 是因为 数据库没有实际文档吗

    req.models.Diagnose.update({
        _id: diagnoseId
    }, { content: diagnoseContent }, function(err, raw) {
        if(err) return next(err);

        res.json(true)
    })
}
