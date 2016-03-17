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
        role: "3"
    }, function(err, patientList) {
        if (err) return next(err);
        res.render("doctor/add_event", {
            user: req.session.user,
            patientList: patientList
        })
    })
}

exports.add_event_handle = function(req, res, next) {
    var rb = req.body;

    req.models.User.findOne({
        _id: rb.patient_id
    }, function(err, patient) {
        if (err) return next(err);
        req.models.Event.create({
            user_id: rb.patient_id,
            name: rb.event_name,
            content: rb.event_info,
            is_view: false,
            level: rb.level,
            user: rb.patient_id,
            patient_name: patient.role_prop.real_name,
            patient_age: patient.role_prop.age,
            patient_sex: patient.role_prop.sex
        }, function(err, event){
            if(err) return next(err);
            res.redirect("/add_event")

        })
    })
}
