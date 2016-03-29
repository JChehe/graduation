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

// 手动输入添加事件
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
        }, function(err, event) {
            if (err) return next(err);
            res.redirect("/add_event")

        })
    })
}

// 事件响应机制
exports.create_event = function(req, res, next){
    var rb = req.body;

    req.models.User.findOne({
        _id: rb.user_id,
        role: 3
    }, function(err, user){
        if(err) return next(err);

        req.models.Event.create({
            user_id: rb.user_id,
            name: rb.name,
            content: rb.content,
            level: rb.level,
            is_view: false,
            user: rb.user_id,
            patient_name: user.role_prop.real_name,
            patient_age: user.role_prop.age,
            patient_sex: user.role_prop.sex
        }, function(err, event){
            if(err) return next(err);
            res.send({
                status: true,
                info: "产生事件成功",
                event:event
            })
        })
    })
}



exports.set_event_view = function(req, res, next) {
    var cEventId = req.body.eventId;
    req.models.Event.findOneAndUpdate({
        _id: cEventId
    }, { is_view: true }, { new: true }, function(err, doc) {
        if (err) return next(err);
        res.send({
            status: true,
            event: doc,
            info: "该事件已查看"
        })
    })
}
