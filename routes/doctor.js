// var mongoJoin = require("mongo-join");

var LIMIT = 3;

exports.my_care_patient = function(req, res, next) {
    var curDoctor = req.session.user;
    var page = req.query.p || 1;
    var options = { skip: (page - 1) * LIMIT, limit: LIMIT };

    req.models.User.count({
        _id: {
            $in: curDoctor.care_patient
        }
    }, function(err, count) {
        if (err) return next(err);

        req.models.User.find({
            _id: {
                $in: curDoctor.care_patient
            }
        }, null, options).exec(function(err, userList) {
            if (err) return next(err);
            res.render("doctor/my_care_patient", {
                user: req.session.user,
                userList: userList,
                pageRange: Math.ceil(count / LIMIT),
                curPage: parseInt(page),
                isLast: (LIMIT * page >= count ? true : false),
                isFirst: (page - 1 === 0 ? true : false),
                conditioRole: 3
            })

        })
    })
}

exports.get_patient_info = function(req, res, next) {
    var curPatientId = req.params.id;
    req.models.User.findOne({
        _id: curPatientId,
        role: 3
    }, function(err, patient) {
        if (err) return next(err);

        req.models.Family.find({
            patient_id: patient._id
        }, function(err, familyList) {
            if (err) return next(err);
            res.send({
                status: true,
                info: "查询成功",
                data: {
                    patient: patient,
                    familyList: familyList
                }
            })
        })

    })
}

// 用population 将 病人嵌入 event
exports.event_list = function(req, res, next) {
    var curDoctor = req.session.user;
    var page = req.query.p || 1;
    var options = { skip: (page - 1) * LIMIT, limit: LIMIT, sort: { level: 1 } };

    var myCarePatient = curDoctor.care_patient;

    req.models.Event.count({
        user_id: {
            "$in": myCarePatient
        }
    }, function(err, count) {
        if (err) return next(err);
        req.models.Event.find({
            user_id: {
                "$in": myCarePatient
            }
        }, null, options).populate({
            path: "user"
        }).exec(function(err, eventList) {
            if (err) return next(err);
            res.render("doctor/event_list", {
                user: req.session.user,
                eventList: eventList,
                pageRange: Math.ceil(count / LIMIT),
                curPage: parseInt(page),
                isLast: (LIMIT * page >= count ? true : false),
                isFirst: (page - 1 === 0 ? true : false)
            })
        })
    })
}

// 按时间排序
exports.diagnose_list = function(req, res, next) {
    var page = req.query.p || 1;
    var cDoctor = req.session.user;
    var options = { skip: (page - 1) * LIMIT, limit: LIMIT, sort: { update_time: -1 } };

    req.models.Diagnose.count({
        patient_id: {
            "$in": cDoctor.care_patient
        }
    }, function(err, count) {
        if (err) return next(err);

        req.models.Diagnose.find({
                patient_id: {
                    "$in": cDoctor.care_patient
                }
            }, null, options).populate("patient")
            .exec(function(err, diagnoseList) {
                if (err) return next(err);
                console.log(diagnoseList)
                res.render("doctor/diagnose_list", {
                    user: req.session.user,
                    diagnoseList: diagnoseList,
                    pageRange: Math.ceil(count / LIMIT),
                    curPage: parseInt(page),
                    isLast: (LIMIT * page >= count ? true : false),
                    isFirst: (page - 1 === 0 ? true : false)
                })
            });
    })

    /*  res.render("doctor/diagnose_list", {
          user: req.session.user
      });*/

}

// z限制5个，且按时间排序
exports.get_related_diagnose = function(req, res, next) {
    var eventId = req.query.eid;
    console.log(eventId)
        /*req.models.Diagnose.find({
            event_id: eventId
        }, function(err, diagnoseList) {
            if (err) return next(err);
            res.send(diagnoseList);
        });*/

    req.models.Diagnose.find({
        event_id: eventId
    }).sort({ update_time: -1 }).limit(5).exec(function(err, diagnoseList) {
        if (err) return next(err);
        res.send(diagnoseList);
    })
}


exports.add_diagnose = function(req, res, next) {
    // console.log(req.body)
    var rb = req.body;
    req.models.Diagnose.create({
        event_id: req.query.eid,
        doctor_id: req.session.user._id,
        patient_id: rb.patient_id,
        patient: rb.patient_id,
        doctor_name: req.session.user.role_prop.real_name,
        patient_name: rb.patient_name,
        content: rb.diagnose_content,
        create_time: Date.now(),
        update_time: Date.now()
    }, function(err, diagnose) {
        if (err) return next(err);
        console.log("新增 diagnose");
        console.log(diagnose);
        console.log("添加事件成功");
        req.models.Event.findByIdAndUpdate(req.query.eid, {
            $push: {
                diagnoses: diagnose._id
            }
        }, { upsert: true }, function(err, doc) {
            if (err) return next(err);
            console.log("更新相应事件的 diagnoses");
            res.send(diagnose)
        })
    })
}


exports.modify_diagnose = function(req, res, next) {
    var diagnoseId = req.query.did;
    var diagnoseContent = req.body.content;

    req.models.Diagnose.update({
        _id: diagnoseId
    }, { content: diagnoseContent }, function(err, raw) {
        if (err) return next(err);

        res.json(true)
    })
}




exports.get_unView_event = function(req, res, next) {
    var cDoctor = req.session.user;

    var myCarePatient = cDoctor.care_patient;

    req.models.Event.find({
        user_id: {
            "$in": myCarePatient
        },
        is_view: false
    },null, { sort: {happen_time: -1} }, function(err, eventList) {
        if (err) return next(err);

        res.send({
            status: "success",
            eventList: eventList
        })

    })
}

