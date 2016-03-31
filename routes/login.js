var salt = require("../middlewares/salt")
var config = require("../config.default")

var COOKIE_AUTO_LOGIN_TIME = 1000 * 60 * 60 * 24 * 7; // 7天
// 登录
exports.login = function(req, res, next) {
    var auto_login_cookie = req.cookies[config.auth_cookie_name];

    if (auto_login_cookie) {
        console.log(auto_login_cookie)
        var auth_token = salt.decrypt(auto_login_cookie, "secret").split("\t");
        var auto_login = {
            account: auth_token[0],
            password: auth_token[1]
        };
        console.log(auth_token)
        if (auto_login.account && auto_login.password) {
            req.models.User.findOne({
                account: auto_login.account
            }, function(err, user) {
                if (err) return next(err);
                if (!user) {
                    return res.render("system_admin/login", {
                        error: "账户不存在"
                    });
                }
                user.comparePassword(auto_login.password, false, function(isMatch) {
                    if (isMatch) {
                        console.log("登录成功");
                        user.update({
                            $push: {
                                loginTime: Date.now()
                            }
                        }, { upsert: true }, function(err, count, raw) {
                            if (err) return next(err);
                            req.session.user = user
                            req.session.role = user.role
                            res.redirect("/")

                        })

                    } else {
                        return res.render("system_admin/login", {
                            error: "密码错误!"
                        });
                    }
                })
            })
        }
    } else {
        res.render('system_admin/login', {
            isLogin: false
        })
    }


}

// 登录处理
exports.authenticate = function(req, res, next) {
    var rb = req.body;
    req.models.User.findOne({
        account: rb.username
    }, function(err, user) {
        if (err) return next(err);
        if (!user) {
            return res.render("system_admin/login", {
                error: "账户不存在"
            });
        }
        user.comparePassword(rb.password, true, function(isMatch) {
            if (isMatch) {
                console.log("登录成功");
                console.log(rb.is_remember)
                if (rb.is_remember == 1) {
                    var auth_token = salt.encrypt(user.account + "\t" + user.password, "secret");
                    res.cookie(config.auth_cookie_name, auth_token, { path: "/", maxAge: COOKIE_AUTO_LOGIN_TIME, httpOnly: true })
                }
                user.update({
                    $push: {
                        loginTime: Date.now()
                    }
                }, { upsert: true }, function(err, count, raw) {
                    if (err) return next(err);
                    req.session.user = user
                    req.session.role = user.role
                    res.redirect("/")

                })

            } else {
                return res.render("system_admin/login", {
                    error: "密码错误!"
                });
            }
        })
    })
}


//注销
exports.logout = function(req, res, next) {
    req.session.destroy();
    res.clearCookie(config.auth_cookie_name, "/")
    res.redirect("/")
}
