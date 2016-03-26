var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var chatSchema = new Schema({
	patient_id: Schema.Types.ObjectId, // 病人id
	doctor_id: Schema.Types.ObjectId,
	content: String,
	belong: String, // 与 用户角色 role相等
	create_at: { type: Date, default: Date.now}
})


module.exports = mongoose.model("Chat", chatSchema);