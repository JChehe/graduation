var mongoJoin = require("mongo-join");
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
    }, function(err, doc){
        if(err) return next(err);

        var myCarePatient = doc.care_patient;

        req.models.Event.find({
            user_id: {
                "$in": myCarePatient
            }
        }).sort({'level':-1}).limit(10).populate({
            path: "user"
        }).exec(function(err, eventList){
            if(err) return next(err);
            console.log(eventList)
            res.render("doctor/event_list",{
                user: req.session.user,
                eventList: eventList
            })
        })


    })
}
