var mongoose = require("mongoose");
var salt = require("../middlewares/salt")

var userSchema = new mongoose.Schema({
    account: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        validate: [function(value) {
            return (6 <= value.length && value.length <= 15)
        }, "密码长度要介于6至15位。"]
    },
    /*
        0: 系统管理员，
        1: 管理员
        2: 医生，
        3: 病人
    */
    role: { // 角色权限
        type: String
    },
    role_prop: {
        real_name: String, // 实名
        age: { // 年龄
            type: Number,
            default: 18
        },
        sex: {
            type: String,
            default: "0" // 男
        },
        id_card: String, // 身份证
        birthday: Date, // 生日
        height: Number, // 身高
        weight: Number, // 重量
        phone: String, // 电话号码
        tel_phone: String, // 手机号码
        location: String, // 办公室或病房地址
        title: String, // 职称
        address: String, // 住址
        description: String, // 描述
        medical_case: String, // 病人病例
        dependency: mongoose.Schema.Types.ObjectId // 病人所属
    },
    family: Array, // 家属信息
    care_patient: Array, // 医生关注的病人
    related_doctor: Array, // 病人的照顾医生
    // event_list: mongoose.Schema.Types.ObjectId,
    createAt: { // 帐号创建日期
        type: Date,
        default: Date.now
    },
    loginTime: Array

})

userSchema.pre("save", function(next){
    var saltStr = salt.md5(this.password)
    this.password = saltStr;
    next();
})

userSchema.methods = {
    comparePassword: function(password, isNeedSalt, cb){
        if(isNeedSalt){
            passwordsalt = salt.md5(password)
        }else{
            passwordsalt = password
        }
        
        if(passwordsalt == this.password){
            cb(true);
        }else{
            cb(false);
        }
    }
}

userSchema.static({
    list: function(userRole, callback) {
        this.find({
            "role": userRole
        }, "-password", {
            limit: 20
        }, callback)
    },
    getCount: function(query, callback) {

        this.count(query, function(err, count) {
            if (err) return next(err);
            callback(count);
        })
    }
})


/*function md5(str){
    var md5 = crypto.createsalt("md5");
    return md5.update(str).digest("hex");
}*/

module.exports = mongoose.model("User", userSchema)