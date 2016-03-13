var uuid = require('node-uuid');
var LIMIT = 1;
// 默认信息
exports.index = function(req, res, next) {
    res.render("system_admin/system_index", {
        user: req.session.user
    })
}

// 个人信息
exports.perinfo = function(req, res, next) {
    res.render("system_admin/per_info", {
        user: req.session.user
    })
}

// 修改密码
exports.modify_password = function(req, res, next) {
    console.log(req.session.user)
    console.log(req.session.user._id)
    console.log(req.body["old-password"])
    req.models.User.findOne({
        _id: req.session.user._id,
        password: req.body["old-password"]
    }, function(err, user) {
        if (err) return next(err);
        if (user == null) {
            res.send({
                status: false,
                info: "旧密码不正确。"
            })
        } else {
            user.update({
                $set: {
                    password: req.body["new-password"]
                }
            }, function(err, count, raw) {
                if (err) return next(err);
                res.send({
                    status: true,
                    info: "修改密码成功"
                })
            })
        }
    })
}



// 按条件搜索用户列表
exports.condition_search = function(req, res, next) {
    console.log(typeof req.body["min-age"]); // String
    var realName = req.body["real_name"] || {
        "$exists": true
    }
    var minAge = req.body["min-age"] != "" ? parseInt(req.body["min-age"], 10) : -1;
    var maxAge = req.body["max-age"] != "" ? parseInt(req.body["max-age"], 10) : 100000000;

    var sex = req.body["sex"] == "-1" ? ["0", "1"] : [req.body["sex"]]
    console.log(typeof req.body["role"])
    req.models.User.find({
        "role": req.body["role"],
        "role_prop.real_name": realName,
        "role_prop.sex": {
            "$in": sex
        },
        "role_prop.age": {
            "$gte": minAge,
            "$lte": maxAge
        }
    }, function(err, userList) {
        if (err) return next(err);
        console.log(userList)
        // 在前端判断人数，然后进行相应控制
        res.send({
            status: true,
            userList: userList
        })
    })
}



// 系统管理员/管理员 的 系统用户列表
exports.system_user_list = function(req, res, next) {
    var page = req.query.p || 1;
    var options = { skip: (page - 1) * LIMIT, limit: LIMIT }
    var query = { role: 1 }
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
                conditioRole: 1
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
            return next(new Error("帐号已存在！"))
        } else {
            console.log("帐号不存在，可以注册。");
            // console.log(req.body)
            var reqBody = req.body;
            var account = reqBody.account,
                password = reqBody.password,
                role = reqBody.role,
                real_name = reqBody.real_name,
                sex = reqBody.sex,
                age = reqBody.age;

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
                        age: req.body.age
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
                    title: reqBody.title
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
    var originPatientList = reqBody.origin_patient_list.split(",");
    var patientList = reqBody.care_patient_id;
    console.log(reqBody)
    req.models.User.findOne({
        _id: curDoctorId
    }, function(err, user) {
        if (err) return next(err);

        user.update({
            $set: {
                care_patient: patientList
            }
        }, function(err, raw) {

            var queryOriginPatient = {
                _id: {
                    "$in": originPatientList
                }
            };
            // $pull 将所有匹配的文档删除
            req.models.User.update(queryOriginPatient, {
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
                    medical_case: reqBody.medical_case
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
                        id_card: reqBody.id_card,
                        height: parseFloat(reqBody.height),
                        weight: parseFloat(reqBody.weight),
                        phone: reqBody.phone,
                        tel_phone: reqBody.tel_phone,
                        birthday: reqBody.birthday,
                        address: reqBody.address,
                        medical_case: reqBody.medical_case
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
                    medical_case: reqBody.medical_case
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
                    age: reqBody.age,
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

// 系统管理员/管理员 下的 查询病人家属模块
exports.family = function(req, res, next) {
    var curPatient = req.params.id;
    console.log(curPatient)
    req.models.User.findOne({
        _id: curPatient
    }, function(err, user) {
        // console.log(user)
        res.send({
            status: true,
            info: "查询成功",
            familyList: user.family
        })
    })
}


// 系统管理员/管理员 下的 处理（添加或编辑）病人家属模块

exports.handle_family = function(req, res, next) {
        var curPatientId = req.params.id;
        var reqBody = req.body;
        var curFamilyId = reqBody.family_id;

        var randomId = "";
        if (curFamilyId == "") { // 为空即新建
            randomId = uuid.v1()
            reqBody.family_id = randomId
        }
        req.models.User.findOne({
            _id: curPatientId
        }, function(err, user) {
            if (err) return next(err);

            // 为空即新建
            if (curFamilyId == "") {
                console.log("新建")
                user.update({
                    $push: {
                        family: reqBody
                    }
                }, function(err, count, raw) {
                    if (err) return next(err);
                    res.send({
                        status: true,
                        info: "成功插入~",
                        family: reqBody
                    })
                })
            } else {
                console.log("修改")
                var newFamilyArr = user.family;
                newFamilyArr.forEach(function(value, index) {
                    if (value.family_id == curFamilyId) {
                        newFamilyArr[index] = reqBody
                    }
                })
                user.update({
                    $set: {
                        family: newFamilyArr
                    }
                }, function(err, count, raw) {
                    if (err) return next(err);
                    res.send({
                        status: true,
                        info: "成功更新~",
                        family: reqBody
                    })
                })
            }



        })

    }
    /* 系统管理员/管理员 下的 病人模块结束 */
