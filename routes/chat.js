exports.save_chat_record = function(req, res, next) {
    var rb = req.body;
    var user = req.session.user;
    var chatObj = null;
    console.log(req.body)
    if(user.role == 2){
    	chatObj = {
    		patient_id: rb.talk_people_id,
    		doctor_id: user._id,
    	}
    }else if(user.role == 3){
    	chatObj = {
    		patient_id: user._id,
    		doctor_id: rb.talk_people_id,
    	}
    }

    chatObj.content = rb.message;
    chatObj.belong = user.role;
    console.log(chatObj)
    req.models.Chat.create(chatObj, function(err, chatRecord) {
        if (err) return next(err);
        res.send({
            status: true,
            info: "保存成功",
            chatRecord: chatRecord
        })
    })
}

exports.get_chat_record = function(req, res, next) {
	var limitNum = req.query.limit || 0; // 0 是无限制
	// console.log(req.query.timestamp)
	var topTimeStamp = req.query.firstloadtimestamp;
	var belong = req.query.belong;
	var belongQuery;
	if(belong){
		belongQuery = belong
	}else{
		belongQuery = {$exists: true}
	}

	if(topTimeStamp){
		topTimeStamp = Date(+topTimeStamp); // 主要用于获取历史信息
	}else{
		topTimeStamp = Date.now(); // 主要用于获取；轮询新信息
	}
	var topTimeStamp = req.query.firstloadtimestamp || Date.now();

    req.models.Chat.find({
        patient_id: req.query.patient_id,
        doctor_id: req.query.doctor_id,
        create_at: {
        	// 字符串对于 Date() 是非法值，需要转为整数
            "$gt": new Date(+req.query.timestamp), // 大于
            "$lte" : topTimeStamp
        },
        belong: belongQuery

    }, null, {limit: limitNum}, function(err, chatRecordList) {
        if (err) return next(err);
        res.send({
            status: true,
            info: "获取成功",
            chatRecordList: chatRecordList
        })
    })
}

exports.get_talk_people = function(req, res, next) {
    var cUser = req.session.user || req.query.uid;
    var queryObj = null;

    if (cUser.role == 2) {
        queryObj = {
            _id: {
                $in: cUser.care_patient
            }
        }
    }else if(cUser.role == 3){
    	queryObj = {
            _id: {
                $in: cUser.related_doctor
            }
        }
    }

    var options = {
    	select:{
    		_id: 1,
    		account: 1,
    		"role_prop.real_name": 1
    	}
    }

    req.models.User.find(queryObj, null, options, function(err, userList) {
        if (err) return next(err);
        res.send({
            status: true,
            info: "请求成功",
            userList: userList
        })
    })
}
