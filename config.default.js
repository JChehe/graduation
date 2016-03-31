var path = require("path")

var config = {
	debug: true,

	name: "移动医疗监护系统",
	description: "刘健超的毕业设计——移动医疗监护系统",
	keywords: "graduation, dgut, ljc, node.js",


	dbUrl: "mongodb://@localhost:27017/graduationProject",

	session_secret: "ljc_graduation_project_session_secret",
	auth_cookie_name: "auto_login_cookie",


	port: 3000,

}

module.exports = config;
