var salt = require("../middlewares/salt");
var config = require("../config.default")
var LIMIT = 5;
// 默认信息
exports.index = function(req, res, next) {
    console.log(req.cookies)
    res.render("system_admin/system_index", {
        user: req.session.user
    })
}

// 个人信息
exports.perinfo = function(req, res, next) {
    req.models.Family.find({
        patient_id: req.session.user._id
    }, function(err, familyList) {
        if (err) return next(err);
        res.render("system_admin/per_info", {
            user: req.session.user,
            familyList: familyList
        })
    })
}

// 修改密码
exports.modify_password = function(req, res, next) {
    var user = req.session.user;

    user = new req.models.User(user); // session.user 是 plain object， 需要 Usermodels 包装成mongoose对象
    user.comparePassword(req.body["old-password"], true, function(isMatch) {
        console.log("isMatch" + isMatch)
        if (isMatch) {
            user.update({
                $set: {
                    password: salt.md5(req.body["new-password"])
                }
            }, function(err, count, raw) {
                if (err) return next(err);
                req.session.destroy();
                res.clearCookie(config.auth_cookie_name, "/")

                res.send({
                    status: true,
                    info: "修改密码成功"
                })
            })
        } else {
            res.send({
                status: false,
                info: "旧密码不正确。"
            })
        }
    })

}

// 删除用户
exports.del_user = function(req, res, next) {
    var uid = req.query.uid;
    console.log(uid);
    req.models.User.findOne({
        _id: uid
    }, function(err, user) {
        if (err) return next(err);
        if (user.role == 0) {
            res.send("该用户为系统管理员，不可删除");
        } else {
            user.remove(function() {
                res.send({
                    status: true
                })
            })
        }
    })
}



// 按条件搜索用户列表
exports.user_search = function(req, res, next) {
    var cUser = req.session.user;
    var cUserRole = cUser.role;


    var realNameQuery = null;
    var realName = req.body["real_name"]
    if (realName) {
        realNameQuery = new RegExp(realName)
    } else {
        realNameQuery = {
            "$exists": true
        }
    }
    var minAge = req.body["min-age"] != "" ? parseInt(req.body["min-age"], 10) : -1;
    var maxAge = req.body["max-age"] != "" ? parseInt(req.body["max-age"], 10) : 100000000;

    var sex = req.body["sex"] == "-1" ? ["0", "1"] : [req.body["sex"]]
        // console.log(req.body["role"])
        // console.log(typeof req.body["role"].split(","))
    var queryObj = {
        "role": {
            $in: req.body["role"].split(",")
        },
        // "role_prop.real_name": realName,
        "role_prop.sex": {
            "$in": sex
        },
        /*"$or": [{
            "role_prop.real_name": realNameQuery
        }, {
            "account": realNameQuery
        }],*/
        "role_prop.age": {
            "$gte": minAge,
            "$lte": maxAge
        }
    }

    if (cUserRole === "2") {
        queryObj["_id"] = {
            $in: cUser.care_patient
        }
    } else if (cUserRole === "3") {
        queryObj["_id"] = {
            $in: cUser.related_doctor
        }
    }

    console.log(queryObj)

    req.models.User.find(queryObj, "-password", function(err, userList) {
        if (err) return next(err);
        console.log(userList)
            // 在前端判断人数，然后进行相应控制
        res.send({
            status: true,
            userList: userList
        })
    })
}

// 按条件搜索事件列表
exports.event_search = function(req, res, next) {
    var rb = req.body;
    console.log(rb)
    var filedKey = rb["filed-key"], //  值
        filedSelect = rb["filed-select"], // 键
        startTime = new Date(rb["start-date"] || 0),
        endTime = rb["end-date"] ? new Date(rb["end-date"]) : Date.now();
    console.log(startTime)
    console.log(endTime);

    var query = null;
    switch (filedSelect) {
        case "name":
            query = {
                "happen_time": {
                    "$gte": startTime,
                    "$lte": endTime
                },
                "name": new RegExp(filedKey)
            };
            break;
        case "patient_name":
            query = {
                "happen_time": {
                    "$gte": startTime,
                    "$lte": endTime
                },
                "patient_name": new RegExp(filedKey)
            };
            break;
        case "patient_sex":
            query = {
                "happen_time": {
                    "$gte": startTime,
                    "$lte": endTime
                },
                "patient_sex": new RegExp(filedKey)
            };
            break;
        case "patient_age":
            query = {
                "happen_time": {
                    "$gte": startTime,
                    "$lte": endTime
                },
                "patient_age": new RegExp(filedKey)
            }
            break;
        default:
            query = {
                "happen_time": {
                    "$gte": startTime,
                    "$lte": endTime
                },
                "$or": [{
                    "name": new RegExp(filedKey)
                }, {
                    "patient_name": new RegExp(filedKey)
                }, /*{
                    "patient_sex": new RegExp(filedKey)
                }, */{
                    "patient_age": new RegExp(filedKey)
                }]
            };
    }
    console.log(query)
    var options = {
        sort: {
            "level": 1
        }
    }
    req.models.Event.find(query, null, options)
        .populate("user")
        .exec(function(err, eventList) {
            if (err) return next(err);
            res.send({
                status: true,
                eventList: eventList
            })
        });
}

// 按条件搜索诊断信息
exports.diagnose_search = function(req, res, next) {
    var rb = req.body;
    console.log(rb);
    var keyword = rb["keyword"], //  值
        startTime = new Date(rb["start-date"] || 0),
        endTime = rb["end-date"] ? new Date(rb["end-date"]) : Date.now();

    var patientId = rb["patient-id"];

    console.log("keyword" + keyword)
    var options = {
        sort: { update_time: -1 }
    }

    var query = null;
    if (patientId) {
        query = {
            "patient_id": patientId,
            "update_time": {
                "$gte": startTime,
                "$lte": endTime
            },
            "$or": [{
                "doctor_name": new RegExp(keyword)
            }, {
                "patient_name": new RegExp(keyword)
            }, {
                "content": new RegExp(keyword)
            }]
        };
    } else {
        query = {
            "update_time": {
                "$gte": startTime,
                "$lte": endTime
            },
            "$or": [{
                "doctor_name": new RegExp(keyword)
            }, {
                "patient_name": new RegExp(keyword)
            }, {
                "content": new RegExp(keyword)
            }]
        };
    }
    console.log(query)
    req.models.Diagnose.find(query, null, options)
        .populate("patient", "-password -account -related_doctor -loginTime -care_patient")
        .exec(function(err, diagnoseList) {
            if (err) return next(err);
            res.send({
                status: true,
                diagnoseList: diagnoseList
            })
        })
}


// 系统管理员/管理员 的 系统用户列表
exports.system_user_list = function(req, res, next) {
    var page = req.query.p || 1;
    var options = { skip: (page - 1) * LIMIT, limit: LIMIT }
    var query = {
        role: {
            $in: [0, 1]
        }
    }
    req.models.User.getCount(query, function(count) {
        req.models.User.find(query, null, options, function(err, userList) {
            if (err) return next(err);
            res.render("system_admin/system_user_list", {
                user: req.session.user,
                userList: userList,
                curSideBar: 0,
                pageRange: Math.ceil(count / LIMIT),
                curPage: parseInt(page),
                isLast: (LIMIT * page >= count ? true : false),
                isFirst: (page - 1 === 0 ? true : false),
                conditioRole: [0, 1]
            })
        })
    })
};





// 系统管理员 的 添加系统用户
exports.add_system_user = function(req, res, next) {
    if (!req.body.account || !req.body.real_name || !req.body.sex || !req.body.password || !req.body.role) {
        res.send({
            status: false,
            info: "填写信息完整！"
        })
        return next(new Error("填写信息不完整"))
    }
    req.models.User.findOne({
        account: req.body.account
    }, function(err, user) {
        if (err) return next(err);
        console.log(user)
        if (user) {
            res.send({
                status: false,
                info: "帐号已存在！"
            })
            // return next(new Error("帐号已存在！"))
        } else {
            console.log("帐号不存在，可以注册。");
            // console.log(req.body)
            var reqBody = req.body;
            var account = reqBody.account,
                password = reqBody.password,
                role = reqBody.role,
                real_name = reqBody.real_name,
                sex = reqBody.sex,
                age = reqBody.age || 18;

            req.models.User.create({
                account: account,
                password: password,
                role: role,
                role_prop: {
                    real_name: real_name,
                    age: age,
                    sex: sex
                }
            }, function(err, UserResponse) {
                if (err) return next(err)
                res.send({
                    status: true,
                    info: "添加成功",
                    user: {
                        uid: UserResponse._id,
                        account: req.body.account,
                        real_name: req.body.real_name,
                        sex: req.body.sex,
                        role: req.body.role
                    }
                })
            })
        }
    })
}


// 系统管理员 下的 编辑系统用户信息
exports.edit_system_user = function(req, res, next) {
    var reqBody = req.body;
    if (!reqBody.edit_user_id || !reqBody.real_name || !reqBody.sex) {
        res.send({
            status: false,
            info: "填写信息不完整！"
        })
    }
    req.models.User.findOne({
        _id: reqBody.edit_user_id
    }, function(err, user) {
        if (err) return next(err);
        user.update({
            $set: {
                role_prop: {
                    real_name: reqBody.real_name,
                    sex: reqBody.sex
                }
            }
        }, function(err, count, raw) {
            if (err) return next(err);
            console.log(count)
            console.log(raw)
            res.send({
                status: true,
                info: "修改成功~",
                user: {
                    real_name: reqBody.real_name,
                    sex: reqBody.sex
                }
            })
        })
    })
}



/* 系统管理员/管理员 下的 医生模块开始 */

// 系统管理员/管理员 的 医生用户列表
exports.doctor_list = function(req, res, next) {
    var page = req.query.p || 1;
    var query = { role: 2 }
    var options = { skip: (page - 1) * LIMIT, limit: LIMIT };
    req.models.User.getCount(query, function(count) {
        req.models.User.find(query, null, options, function(err, userList) {
            if (err) return next(err);
            res.render("system_admin/doctor_list", {
                user: req.session.user,
                userList: userList,
                pageRange: Math.ceil(count / LIMIT),
                curPage: parseInt(page),
                isLast: (LIMIT * page >= count ? true : false),
                isFirst: (page - 1 === 0 ? true : false),
                conditioRole: 2
            })
        })
    })
};

// 系统管理员/管理员 下的 添加医生用户
exports.add_doctor_user = function(req, res, next) {
    if (!req.body.account || !req.body.real_name || !req.body.password) {
        res.send({
            status: false,
            info: "填写信息完整！"
        })
        return next(new Error("填写信息不完整！"))
    }
    req.models.User.findOne({
        account: req.body.account
    }, function(err, user) {
        if (err) return next(err);
        console.log(user);
        if (user) {
            res.send({
                status: false,
                info: "帐号已存在！"
            })
            return next(new Error("帐号已存在！"))
        } else {
            console.log("帐号不存在，可以注册。")
            var reqBody = req.body;

            var newUser = {
                account: reqBody.account,
                password: reqBody.password,
                role: reqBody.role,
                role_prop: {
                    sex: reqBody.sex,
                    real_name: reqBody.real_name,
                    phone: reqBody.phone,
                    tel_phone: reqBody.tel_phone,
                    location: reqBody.location,
                    title: reqBody.title,
                    age: (Math.random() * (50 - 30) + 30).toFixed(0)
                }
            }

            req.models.User.create(newUser, function(err, UserResponse) {
                if (err) return next(err);
                res.send({
                    status: true,
                    info: "添加成功",
                    user: {
                        account: reqBody.account,
                        role: reqBody.role,
                        real_name: reqBody.real_name,
                        title: reqBody.title,
                        sex: reqBody.sex,
                        location: reqBody.location,
                        phone: reqBody.phone,
                        tel_phone: reqBody.tel_phone
                    }
                })
            })
        }
    })
}



// 系统管理员/管理员 下的 编辑医生用户

exports.edit_doctor_user = function(req, res, next) {

    req.models.User.findOne({
        _id: req.params.id
    }, function(err, user) {
        if (err) return next(err);
        console.log(user);

        var reqBody = req.body;

        user.update({
            $set: {
                role_prop: {
                    sex: reqBody.sex,
                    real_name: reqBody.real_name,
                    phone: reqBody.phone,
                    tel_phone: reqBody.tel_phone,
                    location: reqBody.location,
                    title: reqBody.title
                }
            }
        }, function(err, count, raw) {
            if (err) return next(err);
            res.send({
                status: true,
                info: "添加成功",
                user: {
                    real_name: reqBody.real_name,
                    sex: reqBody.sex,
                    location: reqBody.location,
                    phone: reqBody.phone,
                    tel_phone: reqBody.tel_phone,
                    title: reqBody.title
                }
            })
        })

    })
}

// 系统管理员/管理员 下的 医生中的 获取病人列表

exports.get_patient_list = function(req, res, next) {
    req.models.User.list(3, function(err, patientList) {
        res.send({
            status: true,
            info: "获取病人列表",
            patientList: patientList
        })
    })
}

// 系统管理员/管理员 下的 医生中的 添加要负责的病人

exports.add_care_patient = function(req, res, next) {

    var reqBody = req.body;
    var curDoctorId = reqBody.doctor_id;
    var originPatientList = [];
    var patientList = reqBody.care_patient_id;
    if(reqBody.origin_patient_list.length !== 0){
        // http://stackoverflow.com/questions/14940660/whats-mongoose-error-cast-to-objectid-failed-for-value-xxx-at-path-id
        originPatientList = reqBody.origin_patient_list.split(",");
    }
    console.log(originPatientList)
    req.models.User.findOne({
        _id: curDoctorId
    }, function(err, user) {
        if (err) return next(err);

        user.update({
            $set: {
                care_patient: patientList
            }
        }, function(err, raw) {

            // var queryOriginPatient = ;
            console.log("query")
            // console.log(queryOriginPatient)
                // $pull 将所有匹配的文档删除
            req.models.User.update({
                _id: {
                    "$in": originPatientList
                }
            }, {
                $pull: {
                    related_doctor: curDoctorId
                }
            }, { multi: true }, function(err, raw) {
                if (err) return next(err);
                console.log("清除原来病人的related_doctor");
                console.log(raw);

                var queryNowPatient = {
                    _id: {
                        "$in": patientList
                    }
                };

                // $addToSet 可以避免插入重复值    
                req.models.User.update(queryNowPatient, {
                    $addToSet: {
                        related_doctor: curDoctorId
                    }
                }, { multi: true }, function(err, raw) {
                    if (err) return next(err);
                    console.log("添加新选择的related_doctor");
                    console.log(raw);

                    res.redirect("back");
                })
            })
        })
    })
}


/* 系统管理员/管理员 下的 医生模块结束 */














/* 系统管理员/管理员 下的 病人模块开始 */

// 系统管理员/管理员 的 病人用户列表
exports.patient_list = function(req, res, next) {
    var page = req.query.p || 1;
    var query = { role: 3 }
    var options = { skip: (page - 1) * LIMIT, limit: LIMIT }
    req.models.User.getCount(query, function(count) {
        req.models.User.find(query, null, options, function(err, patientList) {
            if (err) return next(err);
            res.render("system_admin/patient_list", {
                user: req.session.user,
                userList: patientList,
                curSideBar: 2,
                pageRange: Math.ceil(count / LIMIT),
                curPage: parseInt(page),
                isLast: (LIMIT * page >= count ? true : false),
                isFirst: (page - 1 === 0 ? true : false),
                conditioRole: 3
            })
        })
    })

}

// 系统管理员/管理员 下的 添加病人模块
exports.add_patient_user = function(req, res, next) {
    if (!req.body.account || !req.body.real_name || !req.body.sex || !req.body.password || !req.body.role) {
        res.send({
            status: false,
            info: "填写信息完整！"
        })
        return next(new Error("填写信息不完整"))
    }
    req.models.User.findOne({
        account: req.body.account
    }, function(err, user) {
        if (err) return next(err);
        console.log(user)
        if (user) {
            res.send({
                status: false,
                info: "帐号已存在！"
            })
            return next(new Error("帐号已存在！"))
        } else {
            console.log("帐号不存在，可以注册。")
            var reqBody = req.body;
            var age = calculateAge(new Date(reqBody.birthday), null);
            var newUser = {
                account: reqBody.account,
                password: reqBody.password,
                role: reqBody.role,
                role_prop: {
                    real_name: reqBody.real_name,
                    id_card: reqBody.id_card,
                    height: parseFloat(reqBody.height),
                    weight: parseFloat(reqBody.weight),
                    phone: reqBody.phone,
                    tel_phone: reqBody.tel_phone,
                    birthday: reqBody.birthday,
                    address: reqBody.address,
                    medical_case: reqBody.medical_case,
                    age: age
                }
            }

            req.models.User.create(newUser, function(err, UserResponse) {
                if (err) return next(err);
                console.log(UserResponse)
                res.send({
                    status: true,
                    info: "添加成功",
                    user: {
                        _id: UserResponse._id,
                        account: reqBody.account,
                        role: reqBody.role,
                        real_name: reqBody.real_name,
                        id_card: reqBody.id_card,
                        height: parseFloat(reqBody.height),
                        weight: parseFloat(reqBody.weight),
                        phone: reqBody.phone,
                        tel_phone: reqBody.tel_phone,
                        birthday: reqBody.birthday,
                        address: reqBody.address,
                        medical_case: reqBody.medical_case,
                        age: age
                    }
                })
            })
        }
    })
}

// 系统管理员/管理员 下的 编辑病人模块
exports.edit_patient_user = function(req, res, next) {

    req.models.User.findOne({
        _id: req.body.edit_user_id
    }, function(err, user) {
        if (err) return next(err);

        var reqBody = req.body;
        var age = calculateAge(new Date(reqBody.birthday), null);
        user.update({
            $set: {
                role_prop: {
                    real_name: reqBody.real_name,
                    id_card: reqBody.id_card,
                    height: parseFloat(reqBody.height),
                    weight: parseFloat(reqBody.weight),
                    phone: reqBody.phone,
                    tel_phone: reqBody.tel_phone,
                    birthday: reqBody.birthday,
                    address: reqBody.address,
                    medical_case: reqBody.medical_case,
                    age: age
                }
            }
        }, function(err, count, raw) {
            if (err) return next(err);
            console.log(count)
            console.log(raw)
            res.send({
                status: true,
                info: "修改成功~",
                user: {
                    real_name: reqBody.real_name,
                    age: age,
                    sex: reqBody.sex,
                    id_card: reqBody.id_card,
                    height: reqBody.height,
                    weight: reqBody.weight,
                    phone: reqBody.phone,
                    tel_phone: reqBody.tel_phone,
                    birthday: reqBody.birthday,
                    address: reqBody.address,
                    medical_case: reqBody.medical_case
                }
            })
        })
    })
}

function calculateAge(birthday, ondate) {
    // if ondate is not specified consider today's date
    if (ondate == null) { ondate = new Date(); }
    // if the supplied date is before the birthday returns 0
    if (ondate < birthday) {
        console.log("haha")
        return 0;
    }
    console.log(typeof ondate)
    var age = ondate.getFullYear() - birthday.getFullYear();
    if (birthday.getMonth() > ondate.getMonth() || (birthday.getMonth() == ondate.getMonth() && birthday.getDate() > ondate.getDate())) { age--; }
    return age;
}
// 系统管理员/管理员 下的 查询病人家属模块
exports.get_family = function(req, res, next) {
    var curPatientId = req.params.id;
    console.log(curPatientId)
    req.models.Family.find({
        patient_id: curPatientId
    }, function(err, familyList) {
        if (err) return next(err);
        // console.log(user)
        res.send({
            status: true,
            info: "查询成功",
            familyList: familyList
        })
    })
}


// 系统管理员/管理员 下的 处理（添加或编辑）病人家属模块
exports.handle_family = function(req, res, next) {
    var rb = req.body;
    console.log(rb)
    var familyId = rb.family_id;
    // console.log(rb.is_message)
    // console.log(typeof rb.is_message)
    var familyObj = {
        patient_id: rb.patient_id,
        name: rb.name,
        tel_phone: rb.tel_phone,
        relationship: rb.relationship,
        // is_message: rb.is_message,
        remark: rb.remark
    }
    if (familyId) {
        req.models.Family.findOneAndUpdate({
            _id: familyId
        }, familyObj, { new: true }, function(err, doc) {
            if (err) return next(err);
            console.log(familyObj)
            console.log(doc)
            res.send({
                status: true,
                family: doc,
                info: "修改成功"
            })
        })
    } else {
        req.models.Family.create(familyObj, function(err, doc) {
            if (err) return next(err);
            res.send({
                status: true,
                family: doc,
                info: "新增成功"
            })
        })
    }

}

exports.del_family = function(req, res, next) {
    req.models.Family.findOneAndRemove({
        _id: req.params.id
    }, null, function(err, doc) {
        if (err) return next(err);

        res.send({
            status: true,
            family: doc,
            info: "删除成功"
        })
    })

}


/* 系统管理员/管理员 下的 病人模块结束 */
