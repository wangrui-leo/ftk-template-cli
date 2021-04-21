	var last_id = 0;
	var page = 1;
	var cid = 1; //1为关注的人，2为关注的标签,3为自己发的
	var dynamics_type = 'hot'; //默认显示动态
	var decode_uid = "4ydwy274";

	//获取内容
	getHotDynamics();

	getInterestedLabel();
	getInterestedPerson();
	common._loaddingClose();
	//获取可能感兴趣的标签
	function getInterestedLabel() {
		var url = "/feed/interestedLabel";
		$.ajax({
			url: url,
			async: true,
			beforeSend: function() {},
			complete: function() {},
			success: function(data) {
				var html = "";
				$.each(data.data.dataList, function(i, el) {
					html += template('label-tmpl', el);
				});

				$("#label_content").html(html);
				$("#change_label_content").removeClass('active');
				Viewer('.viewer-img'); //图片浏览器
				leftheight = $('.interset-index-r').height();

				if (data.data.dataList.length == 0) {
					$('#label_show').removeClass('interset-index-r-content-1');
					$('#label_show').hide();
				}

			},
		});
	}

	function getInterestedPerson() {
		var url = "/feed/interestedPerson";
		$.ajax({
			url: url,
			async: true,
			beforeSend: function() {},
			complete: function() {},
			success: function(data) {
				var html = "";
				$.each(data.data.dataList, function(i, el) {
					html += template('person-tmpl', el);
				});

				$("#person_content").html(html);
				$("#change_person_content").removeClass('active')
				Viewer('.viewer-img'); //图片浏览器
				leftheight = $('.interset-index-r').height();
			},
		});
	}

	function getDynamics() {
		var url = `/feed/getDynamics?page=${page}&cid=${cid}&last_id=${last_id}`;
		$.ajax({
			url: url,
			async: true,
			beforeSend: function() {
				if (page > 4) {
					common._loadding('.interset-commont-content');
					$('.interset-more-loading').hide();
				}
				if (page) {
					$(".footer-more").hide();
				}
			},
			complete: function() {
				common._loaddingClose();
				$('.interset-more-loading').hide();
			},
			success: function(data) {
				if (data.status == 'success') {
					var html = "";
					template.defaults.escape = false;
					$.each(data.data.dataList, function(i, val) {
						if (i == data.data.dataList.length - 1) {
							last_id = val.created_at;
						}

						if (val.type == 4 && val.quoted_type == 0) { //兴趣动态
							var temp_data = {
								'val': val
							};
							html += template('inst-list', temp_data);
						} else if (val.type == 1 && val.quoted_type == 0) { //文章
							var temp_data = {
								'val': val
							};
							html += template('article-list', temp_data);
						} else if (val.type == 2 && val.quoted_type == 0) { //众测产品
							var temp_data = {
								'val': val
							};
							html += template('evaluating-list', temp_data);
						} else if (val.type == 14 && val.quoted_type == 0) { //鲸闻
							var temp_data = {
								'val': val
							};
							html += template('news-list', temp_data);
						} else if (val.type == 5 && val.quoted_type == 0) { //直播
							var temp_data = {
								'val': val
							};
							html += template('live-list', temp_data);
						} else if (val.type == 3 && val.quoted_type == 0) { //众测体验
							var temp_data = {
								'val': val
							};
							html += template('evaluating-use-list', temp_data);
						} else if (val.type == 10 && val.quoted_type == 0) { //闲置
							var temp_data = {
								'val': val
							};
							html += template('sale-list', temp_data);
						} else if (val.quoted_type != 0) {
							var temp_data = {
								'val': val
							};
							html += template('quoted_list', temp_data);
						}
					});

					if (data.data.is_last_page == 1) {
						$(".footer-more").hide();
					} else {
						$(".footer-more").show();
					}

					$(".interset-commont-content").append(html);
					videoCallBack('.video-js') //视频实例化	
					Viewer('.viewer-img'); //图片浏览器
					$('.interset-more-loading').hide();
				} else if (data.status == 'nologin') {
					alert('获取动态需要登录');
				}
			},
			error: function() {
				$(".footer-more").show();
			}
		});
	}


	//换一组标签
	$("#change_label_content").on('click', function() {
		getInterestedLabel();
		$(this).addClass('active');

	});

	//换一组可能感兴趣的人
	$("#change_person_content").on('click', function() {
		getInterestedPerson();
		$(this).addClass('active');

	});

	$("#send").on('click', function() {
		var length = $('input[name^="tags_id"]').length;
		var form_values = $("#inst_form").serializeArray();
		var imgs_url = '';
		var upload_img = new Array();
		form_values.forEach(function(item, index) {
			if (item['name'] == 'upload_img') {
				upload_img.push(item['value']);
			}
		});

		if (upload_img.length > 0) {
			upload_img = upload_img.join(',');
			imgs_url = upload_img;
		} else {
			imgs_url = '';
		}

		var html = "<input type='hidden' name='imgs_url' value='" + imgs_url + "'>";
		$("#inst_form").append(html);

		var url = '/feed/send';
		$.ajax({
			url: url,
			async: true,
			type: 'post',
			data: $("#inst_form").serialize(),
			beforeSend: function() {},
			complete: function() {},
			success: function(data) {
				if (data.status == 'success') {
					messageBox('success', '发布成功');
					window.location.reload();
				} else if (data.status == 'fail') {
					alert(data.message);
				} else if (data.status == 'nologin') {
					alert(data.message);
				} else {
					alert("系统繁忙");
				}
			}
		});
	});

	$('.interset-commont-content').on('click', '.interset-list-warp .menu-collect', function(event) {
		event.stopPropagation();
		var type = $(this).attr('data_type');
		var data_id = $(this).attr('data_id');

		var module = '';
		if (type == 0) {
			module = 'inst';
		}

		var url = '/' + module + '/favourite/' + data_id;
		if (module == '') {
			return;
		}

		var this_obj = $(this);
		$.ajax({
			url: url,
			async: true,
			type: 'get',
			beforeSend: function() {},
			complete: function() {},
			success: function(data) {
				if (data.status == 'success') {
					alert('收藏成功');
					$(this_obj).parent().parent().hide();
				} else if (data.status == 'nologin') {
					alert('未登录');
				} else if (data.status == 'fail') {
					alert(data.message);
				} else {
					alert('系统繁忙');
				}
			}
		});
	})

	//获取下一页的数据
	$(".more-button").on('click', function() {
		page = page + 1;
		if (dynamics_type == 'new') {
			getDynamics();
		} else if (dynamics_type == 'hot') {
			getHotDynamics();
		}
	});

	function getMyAttent() {
		page = 1;
		cid = 1;
		$(".interset-commont-content").empty();
		$(".interset-content-warp .interset-title li").eq(0).click();
	}

	function getMyAttentLabel() {
		page = 1;
		cid = 2;
		$(".interset-commont-content").empty();
		$(".interset-content-warp .interset-title li").eq(0).click();
	}

	function getMyDynamics() {
		page = 1;
		cid = 3;
		$(".interset-commont-content").empty();
		$(".interset-content-warp .interset-title li").eq(0).click();
	}

	//关注，取消关注
	$("#person_content").on('click', '.attention-icon', function() {
		var data_uid = $(this).attr("data_user_id");
		var data_is_attention = $(this).attr("data_is_attention");
		if (data_is_attention == 0) {
			var url = "/user/attention/" + data_uid;
		} else {
			var url = "/user/unfriend/" + data_uid;
		}

		var this_obj = $(this);
		$.ajax({
			url: url,
			async: true,
			beforeSend: function() {},
			complete: function() {},
			success: function(data) {
				if (data.status == 'success') {
					if (data_is_attention == 0) {
						messageBox('prompt', '关注成功');
						this_obj.text("取消关注");
						this_obj.attr('data_is_attention', 1);
					} else {
						messageBox('prompt', '取消关注成功');
						this_obj.text("关注");
						this_obj.attr('data_is_attention', 0);
					}
				} else if (data.status == 'fail') {
					messageBox('prompt', data.message);
				} else if (data.status == 'nologin') {
					headerFun._showLogin();
				} else {
					messageBox('prompt', '系统繁忙,操作失败');
				}
			},
		});
	});

	//关注标签
	$("#label_content").on('click', '.attention-icon', function() {
		var data_tag_id = $(this).attr("data_tag_id");
		var data_is_attention = $(this).attr("data_is_attention");

		if (data_is_attention == 0) {
			var url = "/user/attentionLabel/" + data_tag_id;
		} else {
			var url = "/user/cancelAttentionLabel/" + data_tag_id;
		}

		var this_obj = $(this);
		$.ajax({
			url: url,
			async: true,
			beforeSend: function() {},
			complete: function() {},
			success: function(data) {
				if (data.status == 'success') {
					if (data_is_attention == 0) {
						messageBox('prompt', '关注成功');
						this_obj.text("取消关注");
						this_obj.attr('data_is_attention', 1);
					} else {
						messageBox('prompt', '取消关注成功');
						this_obj.text("关注");
						this_obj.attr('data_is_attention', 0);
					}
				} else if (data.status == 'fail') {
					messageBox('prompt', data.message);
				} else if (data.status == 'nologin') {
					headerFun._showLogin();
				} else {
					messageBox('prompt', '系统繁忙,操作失败');
				}
			},
		});
	});

	//获取热门动态
	function getHotDynamics() {
		var url = `/feed/getHotDynamic?last_id=${last_id}`;
		$.ajax({
			url: url,
			async: true,
			beforeSend: function() {
				if (page > 4) {
					common._loadding('.interset-commont-content');
				}
				if (page) {
					$(".footer-more").hide();
				}
			},
			complete: function() {
				common._loaddingClose();
				$('.interset-more-loading').hide();
			},
			success: function(data) {
				if (data.status == 'success') {
					var html = "";
					template.defaults.escape = false;
					$.each(data.data.dataList, function(i, val) {
						if (i == data.data.dataList.length - 1) {
							last_id = val.score;
						}
						if (val.type == 4 && val.quoted_type == 0) { //兴趣动态
							var temp_data = {
								'val': val
							};
							html += template('inst-list', temp_data);
						} else if (val.type == 1 && val.quoted_type == 0) { //文章
							var temp_data = {
								'val': val
							};
							html += template('article-list', temp_data);
						} else if (val.type == 2 && val.quoted_type == 0) { //众测产品
							var temp_data = {
								'val': val
							};
							html += template('evaluating-list', temp_data);
						} else if (val.type == 14 && val.quoted_type ==…</script>