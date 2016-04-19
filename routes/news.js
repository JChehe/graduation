// 保存处理
exports.edit_handle = function(req, res, next){
	var rb = req.body;
	var news_id = rb.nid;
	rb.author = req.session.user._id;
	if(news_id == undefined){
		req.models.News.create(rb, function(err, news){
			if(err) return next(err);
			res.redirect("/news_list")
		})
	}else{
		req.models.News.update({
			_id: news_id
		}, rb, function(err, news){
			if(err) return next(err);
			res.redirect("/news_list")
		})
	}
	
}

// 渲染新闻信息列表
exports.list = function(req, res, next){
	req.models.News.find({
		is_publish: true,
		type: 0,
	}, null, {sort: {create_at: -1}, limit: 10}, function(err, newsList){
		if(err) return next(err);

		req.models.News.find({
			is_publish: true,
			type: 1,
		}, null, {sort: {create_at: -1}, limit: 10}, function(err, healthList){
			res.render("news/news_list",{
				newsList: {
					newsList: newsList,
					healthList: healthList
				},
				user: req.session.user
			})
		})
		
	})
}

// 渲染新闻编辑页面
exports.publish_news_page = function(req, res, next){
	var news_id = req.query.id;
	if(news_id){
		req.models.News.findOne({
			_id: news_id
		}, function(err, news){
			if(err) return next(err);
			res.render("news/publish_news", {
				user: req.session.user,
				news: news
			})
		})
	}else{
		res.render("news/publish_news",{
			user: req.session.user
		})
	}
	
}

// 获取单独一条新闻信息
exports.news_one = function(req, res, next){
	var news_id = req.query.id;
	req.models.News.findOne({
		_id: news_id
	}, function(err, news){
		if(err) return next(err);
		res.send(news)
	})
}

// 新闻信息管理页面
exports.news_manage = function(req, res, next){
	req.models.News.find({},null, {sort: {create_at: -1}}, function(err, newsList){
		if(err) return next(err);
		res.render("news/news_manage", {
			user: req.session.user,
			newsList: newsList
		})
	})
}

// 发布
exports.news_publish = function(req, res, next){
	var news_id = req.query.id;
	req.models.News.findOne({
		_id: news_id
	}, function(err, news){
		if(err) return next(err);
		news.update({
			$set: {
				"is_publish": !news.is_publish
			}
		}, function(err, count, raw){
			if(err) return next(err);
			res.send({
				status: true,
				is_publish: !news.is_publish
			})
		})
	})
}

// 删除
exports.news_del = function(req, res, next){
	var news_id = req.query.id;
	req.models.News.findOneAndRemove({
		_id: news_id
	}, function(err, news){
		if(err) return next(err);
		res.send({
			status: true
		})
	})
}