var mongoose = require("mongoose")
var diagnoseSchema = require("./diagnose");

var eventSchema = new mongoose.Schema({  // 原型
    _id : mongoose.Schema.Types.ObjectId,
    user_id: mongoose.Schema.Types.ObjectId, // 对应病人_id
    name: String,                            // 事件名称
    is_view: Boolean,						 // 是否已查看
    level: Number,							 // 事件严重等价0-4，0为最高级，4为最低级
    happen_time: {type: Date, default: Date.now}, // 事件发生时间
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User"}, // 病人具体信息
    diagnoses: [diagnoseSchema]
});


module.exports = mongoose.model("Event", eventSchema); // 模型
