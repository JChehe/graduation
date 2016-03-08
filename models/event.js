var mongoose = require("mongoose")
// var diagnoseSchema = require("./diagnose");

var Schema = mongoose.Schema;
var eventSchema = new Schema({  // 原型
    _id : Schema.Types.ObjectId,
    user_id: Schema.Types.ObjectId, // 对应病人_id
    name: String,                            // 事件名称
    is_view: Boolean,						 // 是否已查看
    level: Number,							 // 事件严重等价0-4，0为最高级，4为最低级
    happen_time: {type: Date, default: Date.now}, // 事件发生时间
    user: { type: Schema.Types.ObjectId, ref: "User"}, // 病人具体信息
    // diagnoses: [diagnoseSchema]
    diagnoses:[{ type: Schema.Types.ObjectId, ref: "Diagnose"}]
});


module.exports = mongoose.model("Event", eventSchema); // 模型
