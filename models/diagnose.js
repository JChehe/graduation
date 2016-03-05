var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var diagnoseSchema = new mongoose.Schema({ // 原型
	_id : Schema.Types.ObjectId, // _id
	event_id: Schema.Types.ObjectId, // 事件id
	doctor_id: Schema.Types.ObjectId, // 诊断医生 _id
	doctor_name: String, // 诊断医生名称，这样不用嵌入文档
	content: String, // 诊断内容
	create_time: Date, // 诊断的创建日期
	update_time: {type: Date, default: Date.now}  // 诊断的更新日期
})

exports.diagnoseSchema = diagnoseSchema;