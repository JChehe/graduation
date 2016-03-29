var mongoose = require("mongoose")
// var diagnoseSchema = require("./diagnose");

var Schema = mongoose.Schema;
var eventSchema = new Schema({  // 原型
    user_id: Schema.Types.ObjectId, // 对应病人_id
    name: String,                            // 事件名称
    content: String,						 // 事件内容
    is_view: Boolean,						 // 是否已查看
    level: Number,							 // 事件严重等价0-4，0为最高级，4为最低级
    happen_time: {type: Date, default: Date.now}, // 事件发生时间
    end_time: {type:Date},                   // 事件结束时间
    user: { type: Schema.Types.ObjectId, ref: "User"}, // 病人具体信息
    patient_name: String, // 保存病人的基本信息
    patient_age: String,
    patient_sex: String,
    // diagnoses: [diagnoseSchema]
    diagnoses:[{ type: Schema.Types.ObjectId, ref: "Diagnose"}] // 诊断数组
});


module.exports = mongoose.model("Event", eventSchema); // 模型