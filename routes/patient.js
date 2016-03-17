var moment = require("moment")
var LIMIT = 5;

exports.my_related_doctor = function(req, res, next) {
    var myRelatedDoctor = req.session.user.related_doctor; // array
    var page = req.query.p || 1;
    var options = { skip: (page - 1) * LIMIT, limit: LIMIT }

    req.models.User.count({
        _id: {
            "$in": myRelatedDoctor,
        },
        "role": "2"
    }, function(err, count) {
        if (err) return next(err);

        req.models.User.find({
            _id: {
                "$in": myRelatedDoctor,
            },
            "role": "2"
        }, null, options).exec(function(err, docList) {
            if (err) return next(err);

            res.render("patient/my_related_doctor", {
                user: req.session.user,
                userList: docList,
                pageRange: Math.ceil(count / LIMIT),
                curPage: parseInt(page),
                isLast: (LIMIT * page >= count ? true : false),
                isFirst: (page - 1 === 0 ? true : false),
                conditioRole: 2
            })

        })
    })

}



exports.my_diagnose = function(req, res, next) {
    var page = req.query.p || 1;
    var options = { skip: (page - 1) * LIMIT, limit: LIMIT, sort: { "update_time": -1 } }

    req.models.Diagnose.count({
        patient_id: req.session.user._id
    }, function(err, count) {
        if (err) return next(err);
        req.models.Diagnose.find({
            patient_id: req.session.user._id
        }, null, options).exec(function(err, myDiagnoseList) {
            if (err) return next(err);
            res.render("patient/my_diagnose", {
                user: req.session.user,
                myDiagnoseList: myDiagnoseList,
                pageRange: Math.ceil(count / LIMIT),
                curPage: parseInt(page),
                isLast: (LIMIT * page >= count ? true : false),
                isFirst: (page - 1 === 0 ? true : false)
            })
        })
    })
}


exports.my_calendar = function(req, res, next) {
    res.render("patient/my_calendar", {
        user: req.session.user
    })
}

exports.get_calendar_events = function(req, res, next) {
    var pid = req.query.pid;
    req.models.Event.find({
        user_id: pid
    }).select({ "_id": 1, "name": 1, "content": 1, "happen_time": 1, "level": 1, "end_tiem": 1, "is_view": 1 }).exec(function(err, eventList) {
        if (err) return next(err);

        res.json({
            eventList: eventList,
            today: moment(Date.now()).format("YYYY-MM-DD")
        })
    })

}

exports.event_list = function(req, res, next) {
    var limit = 10;
    var page = req.query.p || 1;
    var options = { skip: (page - 1) * limit, limit: limit, sort: { "level": -1 } };

    req.models.Event.count({ "user_id": req.session.user._id }, function(err, count) {
        if (err) return next(err);
        console.log(count)
        req.models.Event.find({
            user_id: req.session.user._id
        }, null, options).populate("user").exec(function(err, eventSec) {
            if (err) return next(err);
            res.render("doctor/event_list", {
                user: req.session.user,
                eventList: eventSec,
                pageRange: Math.ceil(count / limit),
                curPage: parseInt(page),
                isLast: (limit * page >= count ? true : false),
                isFirst: (page - 1 === 0 ? true : false)
            })
        })
    })

}


exports.ecg = function(req, res, next) {

    res.render("patient/ecg", {
        user: req.session.user
    })
}
