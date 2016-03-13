exports.select_event = function(req, res, next) {
    var resPatientList = [];
    var resEventList = [];

    req.models.User.find({
        role: "3",
        event_list: undefined
    }, function(err, patientList) {
        if (err) return next(err);
        resPatientList = patientList;

        req.models.Event.find({
            user_id: undefined
        }, function(err, eventList) {
            resEventList = eventList;
            res.render("doctor/select_event", {
                user: req.session.user,
                patientList: resPatientList,
                eventList: resEventList
            })
        })
    });
}

exports.select_event_handle = function(req, res, next) {
    // console.log(req.body)
    var reqBody = req.body;
    req.models.User.findOne({
        _id: reqBody.patient_id
    }, function(err, patient) {
        req.models.Event.findOne({
            _id: reqBody.event_id
        }, function(err, pEvent) {
            pEvent.update({
                $set: {
                    user_id: reqBody.patient_id,
                    user: reqBody.patient_id,
                    happen_time: new Date()
                }
            }, function(err, count, raw) {
                if (err) return next(err);
                res.redirect("/my_care_patient")
            })
        })
    })
}

exports.add_event = function(req, res, next) {
    req.models.User.find({

    }, function(err, patientList) {
        if (err) return next(err);
        res.render("doctor/add_event", {
            user: req.session.user,
            patientList: patientList
        })
    })
}

exports.add_event_handle = function(req, res, next) {
    var reqBody = req.body;
    // console.log(reqBody)
    req.models.User.findOne({
        _id: reqBody.patient_id
    }, function(err, patient) {
        if (err) return next(err);
        console.log(reqBody)
        if (!patient.event_list) {
            return next(new Error("没有创建事件列表"));
        }

        reqBody.is_view = false;
        req.models.Event.findOne({
            _id: patient.event_list
        }, function(err, eventDoc) {
            eventDoc.update({
                $push: {
                    event_list: {
                        "name": reqBody.event_name,
                        "happen_time": reqBody.happen_time,
                        "is_view": false,
                        "info": reqBody.event_info
                    }
                }
            }, function(err, count, raw) {

                res.redirect("/add_event")
            })
        })
    })
}
