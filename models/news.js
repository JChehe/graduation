var mongoose = require("mongoose")

var Schema = mongoose.Schema

var newSchema = new Schema({
	title: {
		type: String,
		required: true,
		validate: [function(value){
			return value.length <= 120
		}, "标题太长了（最大120）"]
	},
	author: Schema.Types.ObjectId,
	content: String,
	create_at:{
		type: Date,
		default: Date.now()
	},
	type: Number, // 0 是新闻，1 是健康小常识,
	is_publish: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model("News", newSchema);