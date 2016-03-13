// 登录
exports.login = function(req, res, next) {
	res.render('system_admin/login', {
        isLogin: false
    })
}


// 登录处理
exports.authenticate = function(req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.render("system_admin/login", {
            error: "请输入帐号和密码！"
        });
    }
    req.models.User.findOne({
        account: req.body.username,
        password: req.body.password
    }, function(err, user) {
        if (err) return next(err);
        if (!user) return res.render("system_admin/login", {
            error: "帐号或密码错误!"
        });
        console.log("登录成功");
        req.session.user = user
        req.session.role = user.role
        // console.log(req.session.user)
        res.redirect("/")
    })
}

//注销
exports.logout = function(req, res, next) {
    req.session.destroy()
    res.redirect("/")
}