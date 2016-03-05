exports.my_related_doctor = function(req, res, next){
	var myRelatedDoctor = req.session.user.related_doctor; // array

	req.models.User.find({
		_id : {
			"$in" : myRelatedDoctor,
		},
		"role" : "2"
	}, function(err, docList){
		if(err) return next(err);
		

		res.render("patient/my_related_doctor",{
			user: req.session.user,
			userList: docList
		})

	})
}

exports.event_list = function(req, res, next){
	var limit = 1;
	var page = req.query.p || 1;
	var options = { skip: (page - 1) * limit, limit: limit, sort: {"level": -1}};

	req.models.Event.count({"user_id": req.session.user._id},function(err, count){
		if(err) return next(err);
		console.log(count)
		req.models.Event.find({
			user_id: req.session.user._id
		},null, options).populate("user").exec(function(err, eventSec){
			if(err) return next(err);
			res.render("doctor/event_list",{
				user: req.session.user,
				eventList: eventSec,
				pageRange: Math.ceil(count/limit),
				curPage: parseInt(page),
				isLast: (limit*page >= count? true : false),
				isFirst: (page-1===0? true: false),
			})
		})
	})
	
}

exports.diagnose = function(req, res, next){

	res.render("patient/diagnose",{
		user: req.session.user
	})
}


exports.ecg = function(req, res, next){

	res.render("patient/ecg",{
		user: req.session.user
	})
}