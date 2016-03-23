var express = require("express"),
    router = express.Router();


// 登录
exports.authRequired = function(req, res, next) {
    if (req.session.user /* && req.session.admin*/ ) {
        return next();
    } else {
        return res.redirect("/login")
    }
}


/*
 * 目前实现的权限机制是：权限高的能访问权限低的，而不是特定权限只能访问该权限的。
 *     系统管理员以上
 *	   管理员以上
 *     医生以上
 *     病人以上
 */

exports.systemAdminRequired = function(req, res, next){
	if(req.session.user.role == 0){
		return next();
	}else{
		return next(new Error("权限不足"))
	}
}

exports.adminRequired = function(req, res, next){
	if(req.session.user.role <= 1){
		return next();
	}else{
		return next(new Error("权限不足"))
	}
}

exports.doctorRequired = function(req, res, next){
	if(req.session.user.role <= 2){
		return next();
	}else{
		return next(new Error("权限不足"))
	}
}

exports.patientRequired = function(req, res, next){
	if(req.session.user.role <= 3){
		return next();
	}else{
		return next(new Error("权限不足"))
	}
}

