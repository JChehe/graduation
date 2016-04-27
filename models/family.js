var mongoose = require("mongoose");

// 家属Schema
var familySchema = new mongoose.Schema({
	patient_id: mongoose.Schema.Types.ObjectId, // 相应病人id
	name: String, // 家属名字
	tel_phone: String, // 手机
	relationship: String, // 与病人关系
	is_message: {
		type: Boolean,
		default: false
	}, // 是否接收信息
	remark: String // 备注
})


module.exports = mongoose.model("family", familySchema);