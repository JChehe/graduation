var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var diagnoseSchema = new Schema({ // 原型
	event_id: Schema.Types.ObjectId, // 事件id
	doctor_id: Schema.Types.ObjectId, // 诊断医生 _id
	patient_id: Schema.Types.ObjectId, // 病人_id
	patient: {type: Schema.Types.ObjectId, ref: "User"},
	// patient: {type: Schema.Types.ObjectId, ref: "User"}, // 病人的具体信息
	doctor_name: String, // 诊断医生名称，这样不用嵌入文档
	patient_name: String, // 相应病人名称，这样不用嵌入文档
	content: String, // 诊断内容
	create_time: {type: Date, default: Date.now}, // 诊断的创建日期
	update_time: {type: Date, default: Date.now}  // 诊断的更新日期
});

diagnoseSchema.pre("update", function(next){
	now = new Date();
	console.log("update")
	this.update({},{ $set: { update_time: now } });
	
	next();
})

module.exports = mongoose.model("Diagnose", diagnoseSchema);


// 为什么  加上 _id: Schema.Types.ObjectId就不行？

