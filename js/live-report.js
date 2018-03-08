init(); //初始化页面
//power
getPower(); //获取查看权限
getLanguage(); //获取语言列表
//设置选择频道
var getReportValue;

function getReport() {
	$.ajax({
		type: "get",
		url: baseUrl + "get_channel_info",
		success: function(data) {
			if(data != null && data.item != null && data.item.length != 0) {
				getReportValue = data.item;
				$.each(data.item, function(i, e) {
					$('#r-content .report-select select,#r-content1 .report-select select').append('<option value="' + e["频道名称"] + '">' + e["频道名称"] + '</option>');
				});
			} else {
				errorTip('请您去管理中心系统设置中增加频道');
			}
		}
	});
}
getReport(); //设置选择频道
$('#livedback,#back').click(function() {
	$('#r-content2').show();
	$('#r-content,#r-content1,#r-content3').hide();
	getAllList(); //刷新列表
	//视频正在播放  返回列表的时候停止播放
	if(playing === true) {
		jPlay.stop();
	}
})
$('#editback').click(function() {
	getIsEditPageModifiy();
	continueSave();
})
function getIsEditPageModifiy(){
	var tag = [];
	var obj = {};
	var reportSelect = $('#r-content1 .report-select select').val();
	var reportStart = $('#editStartTime').val();
	var reportEnd = $('#editEndTime').val();
	var title = $('#r-content1 .title input').val();
	var autor = $('#r-content1 .autor input').val();
	var source = $('#r-content1 .source input').val();
	var publishtime = $('#r-content1 .publish-time input').val();
	var introduce = $('#r-content1 .introduce textarea').val();
	var findpower = $('#r-content1 .find-power select').val();
	//获取标签列表
	if($('#tagCon-edit').text()) {
		$.each($('#tagCon-edit li'), function(i, e) {
			tag.push($(this).text());
		})
	}
	//判断右侧浮层
	var flag1 = false,
		flag2 = false,
		flag4 = false; //标识
	if($('#edititem1').hasClass('active-bg')) {
		flag1 = true;
	}
	if($('#edititem2').hasClass('active-bg')) {
		flag2 = true;
	}
	if($('#edititem4').hasClass('active-bg')) {
		flag4 = true;
	}
	//设置语言		
	if($('#sel-lang1 .sel-dt').text() != editData['语言']) {
		isEditPageModifiy = true;
	}
	if(flag1 != editData['置顶']) {
		isEditPageModifiy = true;
	}
	if(flag2 != editData['推荐']) {
		isEditPageModifiy = true;
	}
	if(flag4 != editData['评论']) {
		isEditPageModifiy = true;
	}
	//设置投票
	if(editPostTicket != null && editPostTicket['标题'] != null) {
		if((editData['投票'] != null && editData['投票']['标题'] != null && editPostTicket['标题'] != editData['投票']['标题']) || editData['投票'] == null) {
			isEditPageModifiy = true;
		}
	}
	//数组判断是否相等
	if(tag.toString() != editData['标签'].toString()) {
		isEditPageModifiy = true;
	}
	if(reportSelect != editData['频道']['频道名称']) {
		if(getReportValue != null) {
			$.each(getReportValue, function(i, e) {
				if(e['频道名称'] == reportSelect) {
					isEditPageModifiy = true;
				}
			});
		}
	}
	if(title != editData['标题']) {
		isEditPageModifiy = true;
	}
	if(autor != editData['作者']) {
		isEditPageModifiy = true;
	}
	if(source != editData['来源']) {
		isEditPageModifiy = true;
	}
	if(publishtime != editData['发布时间']) {
		isEditPageModifiy = true;
	}
	//判断缩略图
	if($('#editpreviewImg').attr('src') != editData['缩略图'].url) {
		isEditPageModifiy = true;
	}
	if(introduce != editData['简介']) {
		isEditPageModifiy = true;
	}
	//power
	if(power != null && power.length) {
		$.each(power, function(i, e) {
			if(findpower == e['名称']) {
				if(e['级别'] != editData['开放用户级别']) {
					isEditPageModifiy = true;
				}
				return false;
			}
		});
	}
	//判断副标题
	if(((editsubheadObj['时间'] == editData['副标题']['时间']) && (editsubheadObj['来源'] == editData['副标题']['来源']) && (editsubheadObj['作者'] == editData['副标题']['作者']) && (editsubheadObj['浏览人数'] == editData['副标题']['浏览人数']) && (editsubheadObj['上下条'] == editData['副标题']['上下条'])) == false) {
		isEditPageModifiy = true;
	}
	//判断直播开始时间
	if(reportStart != editData['直播开始时间']) {
		isEditPageModifiy = true;
	}
	if(reportEnd != editData['直播结束时间']) {
		isEditPageModifiy = true;
	}
}
function continueSave() {
	if(isEditPageModifiy) {
		if(confirm('您还未保存修改，是否要进行接下来的操作？')) {
			$('#r-content2').show();
			$('#r-content,#r-content1,#r-content3').hide();
			getAllList(); //刷新列表
			//视频正在播放  返回列表的时候停止播放
			if(playing === true) {
				jPlay.stop();
			}
			doingEdit = false;
			isEditPageModifiy = false;
		}
	} else {
		$('#r-content2').show();
		$('#r-content,#r-content1,#r-content3').hide();
		getAllList(); //刷新列表
		//视频正在播放  返回列表的时候停止播放
		if(playing === true) {
			jPlay.stop();
		}
		doingEdit = false;
		isEditPageModifiy = false;
	}
}
//点击创建
$('#built').click(function() {
	clearNew(); //清空文本框
	$('#r-content').show();
	$('#r-content2,#r-content1,#r-content3').hide();
})
//创建直播时清空之前新建的文本框
function clearNew() {
	$('#r-content .report-select select').val('');
	$('#newStartTime').val('');
	$('#newEndTime').val('');
	//重置新建副标题对象
	newsubheadObj['时间'] = true;
	newsubheadObj['作者'] = true;
	newsubheadObj['浏览人数'] = true;
	newsubheadObj['来源'] = true;
	newsubheadObj['上下条'] = true;
	$('#r-content .title input').val('');
	$('#r-content .autor input').val('');
	$('#r-content .source input').val('');
	$('#r-content .publish-time input').val(getNowFormatDate());
	$('#previewImg').attr('src', 'img/add.png');
	$('#r-content .introduce textarea').val('');
	//清楚右侧悬浮高亮显示去除隐藏右侧浮层
	$('#r-content .exta-list').hide();
	$.each($('#r-content .exta-list > div'), function(i, e) {
		if($(this).hasClass('active-bg')) {
			$(this).removeClass('active-bg').find('i').removeClass('active-icon' + (i + 1)).addClass('icon' + (i + 1));
		}

	})
	$.each($('#r-content .exta-list > div > i'), function(i, e) {
		if($(this).hasClass('active-bg')) {
			$(this).removeClass('active-bg');
		}

	})
	//投票
	$.each($('#itemlist div'), function(i, e) {
		if($(this).hasClass('active-bg2')) {
			$(this).removeClass('active-bg2');
		}
	});
	$('.tag-container').html('');
	$('.itext').val('');
	//清除红色的框
	$('.error-red').removeClass('error-red');
}

function clearEdit() {
	$('#r-content1 .report-select select').val('');
	$('#editStartTime').val('');
	$('#editEndTime').val('');
	//重置新建副标题对象
	editsubheadObj['时间'] = true;
	editsubheadObj['作者'] = true;
	editsubheadObj['浏览人数'] = true;
	editsubheadObj['来源'] = true;
	editsubheadObj['上下条'] = true;
	$('#r-content1 .title input').val('');
	$('#r-content1 .autor input').val('');
	$('#r-content1 .source input').val('');
	$('#r-content1 .publish-time input').val(getNowFormatDate());
	$('#editpreviewImg').attr('src', 'img/add.png');
	$('#r-content1 .introduce textarea').val('');
	//power
	$('#editSelect').val('');
	//清除右侧悬浮高亮显示去除隐藏右侧浮层
	$('#r-content1 .exta-list').hide();
	$.each($('#r-content1 .exta-list > div'), function(i, e) {
		if($(this).hasClass('active-bg')) {
			$(this).removeClass('active-bg').find('i').removeClass('active-icon' + (i + 1)).addClass('icon' + (i + 1));
		}
	})
	$.each($('#r-content1 .exta-list > div > i'), function(i, e) {
		if($(this).hasClass('active-bg')) {
			$(this).removeClass('active-bg');
		}
	})
	//投票
	$.each($('#edititemlist div'), function(i, e) {
		if($(this).hasClass('active-bg2')) {
			$(this).removeClass('active-bg2');
		}
	});
	$('.tag-container').html('');
	$('.itext').val('');
	//清除红色的框
	$('.error-red').removeClass('error-red');
}
//新建提交
$('#subm,#submBack').click(function() {
	var tag = [];
	var obj = {};
	var reportSelect = $('#r-content .report-select select').val();
	var reportStart = $('#newStartTime').val();
	var reportEnd = $('#newEndTime').val();
	var title = $('#r-content .title input').val();
	var autor = $('#r-content .autor input').val();
	var source = $('#r-content .source input').val();
	var publishtime = $('#r-content .publish-time input').val();
	var introduce = $('#r-content .introduce textarea').val();
	var findpower = $('#r-content .find-power select').val();
	obj['语言'] = $('#sel-lang1 .sel-dt').text();
	//获取标签列表	
	if($('#tagCon-new').text()) {
		$.each($('#tagCon-new li'), function(i, e) {
			tag.push($(this).text());
		})
	}
	obj['标签'] = tag;
	//给传给后台的对象赋值,必须传给后台的值
	obj["类别"] = "live";
	obj['标题'] = title;
	obj['作者'] = autor;
	obj['来源'] = source;
	obj['发布时间'] = publishtime;
	obj['简介'] = introduce;
	obj['副标题'] = newsubheadObj;
	obj['序号'] = 1;
	obj['直播开始时间'] = reportStart;
	obj['直播结束时间'] = reportEnd;
	obj['直播状态'] = '未发布';
	//判断置顶、评论、推荐的值是否为true，为true的话传给后台
	if(rItem1['置顶'] == true) {
		obj['置顶'] = true;
	}
	if(rItem2['推荐'] == true) {
		obj['推荐'] = true;
	}
	if(rItem4['评论'] == true) {
		obj['评论'] = true;
	}
	//判断投票有没有值选中
	$.each($('#itemlist div'), function(i, e) {
		if($(this).hasClass('active-bg2')) {
			obj['投票'] = postTicket;
			return false;
		}
	})
	//判断频道选择
	if(getReportValue != null) {
		$.each(getReportValue, function(i, e) {
			if(e['频道名称'] == reportSelect) {
				obj['频道'] = e;
			}
		});
	}
	//判断频道
	if(reportSelect == null) {
		errorTip('请选择频道');
		return;
	}
	//判断标题
	if(getByteLen(title) < setContentLimitData['标题'][0] || getByteLen(title) > setContentLimitData['标题'][1]) {
		errorTip('标题输入的字符范围为' + setContentLimitData['标题'][0] + '-' + setContentLimitData['标题'][1] + '之间');
		return
	}
	//当标题正确的时候,判断作者
	if(getByteLen(autor) < setContentLimitData['作者'][0] || getByteLen(autor) > setContentLimitData['作者'][1]) {
		errorTip('作者输入的字符范围为' + setContentLimitData['作者'][0] + '-' + setContentLimitData['作者'][1] + '之间')
		return
	}
	//当作者正确的时候,判断来源
	if(getByteLen(source) < setContentLimitData['来源'][0] || getByteLen(source) > setContentLimitData['来源'][1]) {
		errorTip('来源输入的字符范围为' + setContentLimitData['来源'][0] + '-' + setContentLimitData['来源'][1] + '之间');
		return
	}
	//当来源正确的时候，判断缩略图是不是插入图片
	if($('#previewImg').attr('src') == 'img/add.png') {
		errorTip('请选择缩略图图片');
		return
	} else {
		obj['缩略图'] = {
			'url': $('#previewImg').attr('src'),
			'size': $('#previewImg').attr('datasize')
		};
	}
	//当缩略图选择了之后，判断简介
	if(getByteLen(introduce) < setContentLimitData['简介'][0] || getByteLen(introduce) > setContentLimitData['简介'][1]) {
		errorTip('简介输入的字符范围为' + setContentLimitData['简介'][0] + '-' + setContentLimitData['简介'][1] + '之间');
		return
	}
	//power
	if($('#newSelect').val() == '') {
		errorTip('请选择查看权限');
		return
	} else {
		obj['开放用户级别'] = parseInt($('#newSelect option:selected').attr('dataLevel'));
	}
	if(reportStart.trim() == '') {
		errorTip('请您输入直播开始时间');
		return
	}
	if(reportEnd.trim() == '') {
		errorTip('请您输入直播结束时间');
		return
	}
	//验证时间差
	var a = reportStart.split(/[^0-9]/);
	var b = reportEnd.split(/[^0-9]/);
	var c = new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
	var d = new Date(b[0], b[1] - 1, b[2], b[3], b[4], b[5]);
	if((c.getTime() - d.getTime()) >= 0) {
		errorTip('直播起始时间不能大于直播结束时间');
		return
	}
	console.log(obj);
	//提交之前进行判断必需填的是否正确
	newBuiltAjax(obj, $(this).attr('id'), 'live');
})
//编辑文章初始化
var editData = []; //每一项文章的列表数据存储容器
$('.footer table tbody').on('click', '.icon2', function() {
	doingEdit = true;
	//投票
	clearEdit(); //清空编辑器原有的东西
	$('#r-content1').show();
	$('#r-content,#r-content2,#r-content3').hide();
	editData = getCommonHtmlFromId($(this).parent().parent().attr('dataId'));
	if(editData['频道'] != null && editData['频道']['频道名称'] != null) {
		$('#r-content1 .report-select select').val(editData['频道']['频道名称']);
	}
	$('#r-content1 .title input').val(editData['标题']);
	$('#r-content1 .autor input').val(editData['作者']);
	$('#r-content1 .source input').val(editData['来源']);
	$('#r-content1 .publish-time input').val(editData['发布时间']);
	//设置缩略图
	$('#editpreviewImg').attr('src', editData['缩略图'].url);
	$('#r-content1 .introduce textarea').val(editData['简介']);
	$('#r-content1 .report-name input').val(editData['频道名称']);
	$('#r-content1 .link1 input').val(editData['源地址']);
	$('#r-content1 .link2 input').val(editData['播放地址']);
	//power
	if(power != null && power.length != 0) {
		$.each(power, function(i, e) {
			if(e['级别'] == editData['开放用户级别']) {
				$('#editSelect').val(e['名称']);
				return false;
			}
		});
	}
	//设置直播开始时间、直播结束时间
	if(editData['直播开始时间'] != null) {
		$('#editStartTime').val(editData['直播开始时间']);

	}
	if(editData['直播结束时间'] != null) {
		$('#editEndTime').val(editData['直播结束时间']);
	}
	//展开右侧悬浮部分设置
	$('#r-content1 .exta-list').show();
	if(editData['置顶'] == true) {
		$('#edititem1').removeClass().addClass('active-bg');
		$('#edititem1').find('i').removeClass().addClass('active-icon1');
	} else {
		$('#edititem1').removeClass();
		$('#edititem1').find('i').removeClass().addClass('icon1');
	}
	if(editData['推荐'] == true) {
		$('#edititem2').removeClass().addClass('active-bg');
		$('#edititem2').find('i').removeClass().addClass('active-icon2');
	} else {
		$('#edititem2').removeClass();
		$('#edititem2').find('i').removeClass().addClass('icon2');
	}
	if(editData['评论'] == true) {
		$('#edititem4').removeClass().addClass('active-bg');
		$('#edititem4').find('i').removeClass().addClass('active-icon4');
	} else {
		$('#edititem4').removeClass();
		$('#edititem4').find('i').removeClass().addClass('icon4');
	}
	//判断投票有没有值选中
	//设置投票 
	if(editData['投票'] != null && editData['投票']['关闭投票'] != null && editData['投票']['关闭投票'] === false && editData['投票']['标题'] != null) {
		if(editData['投票']['标题'] == '点赞') {
			$('#edititemlist .one').addClass('active-bg2');
		} else if(editData['投票']['标题'] == '献花') {
			$('#edititemlist .two').addClass('active-bg2');
		} else if(editData['投票']['标题'] == '献烛') {
			$('#edititemlist .three').addClass('active-bg2');
		}
	}
	//标签部分设置
	if(editData['标签'] && editData['标签'].length) {
		$('#tagCon-edit').html('');
		$.each(editData['标签'], function(i, e) {
			$('#tagCon-edit').append('<li>' + e + '<span class="del"></span></li>');
		});
	}
	//副标题设置
	$('#editsubhead-time').prop('checked', editData['副标题']['时间']);
	$('#editsubhead-autor').prop('checked', editData['副标题']['作者']);
	$('#editsubhead-personnum').prop('checked', editData['副标题']['浏览人数']);
	$('#editsubhead-source').prop('checked', editData['副标题']['来源']);
	$('#editsubhead-updown').prop('checked', editData['副标题']['上下条']);
	//设置副标题对象
	editsubheadObj['时间'] = $('#editsubhead-time').prop('checked');
	editsubheadObj['作者'] = $('#editsubhead-autor').prop('checked');
	editsubheadObj['浏览人数'] = $('#editsubhead-personnum').prop('checked');
	editsubheadObj['来源'] = $('#editsubhead-source').prop('checked');
	editsubheadObj['上下条'] = $('#editsubhead-updown').prop('checked');
})
//编辑部分保存修改
$('#save').click(function() {
	var tag = [];
	var obj = {};
	var reportSelect = $('#r-content1 .report-select select').val();
	var reportStart = $('#editStartTime').val();
	var reportEnd = $('#editEndTime').val();
	var title = $('#r-content1 .title input').val();
	var autor = $('#r-content1 .autor input').val();
	var source = $('#r-content1 .source input').val();
	var publishtime = $('#r-content1 .publish-time input').val();
	var introduce = $('#r-content1 .introduce textarea').val();
	var findpower = $('#r-content1 .find-power select').val();
	//获取标签列表
	if($('#tagCon-edit').text()) {
		$.each($('#tagCon-edit li'), function(i, e) {
			tag.push($(this).text());
		})
	}
	//判断右侧浮层
	var flag1 = false,
		flag2 = false,
		flag4 = false; //标识
	if($('#edititem1').hasClass('active-bg')) {
		flag1 = true;
	}
	if($('#edititem2').hasClass('active-bg')) {
		flag2 = true;
	}
	if($('#edititem4').hasClass('active-bg')) {
		flag4 = true;
	}
	//设置语言		
	if($('#sel-lang1 .sel-dt').text() != editData['语言']) {
		obj['语言'] = $('#sel-lang1 .sel-dt').text();
	}
	if(flag1 != editData['置顶']) {
		obj['置顶'] = flag1;
	}
	if(flag2 != editData['推荐']) {
		obj['推荐'] = flag2;
	}
	if(flag4 != editData['评论']) {
		obj['评论'] = flag4;
	}
	//设置投票
	if(editPostTicket != null && editPostTicket['标题'] != null) {
		if((editData['投票'] != null && editData['投票']['标题'] != null && editPostTicket['标题'] != editData['投票']['标题']) || editData['投票'] == null) {
			obj['投票'] = editPostTicket;
		}
	}
	//数组判断是否相等
	if(tag.toString() != editData['标签'].toString()) {
		obj['标签'] = tag;
	}
	if(reportSelect != editData['频道']['频道名称']) {
		if(getReportValue != null) {
			$.each(getReportValue, function(i, e) {
				if(e['频道名称'] == reportSelect) {
					obj['频道'] = e;
				}
			});
		}
	}
	if(title != editData['标题']) {
		obj['标题'] = title;
	}
	if(autor != editData['作者']) {
		obj['作者'] = autor;
	}
	if(source != editData['来源']) {
		obj['来源'] = source;
	}
	if(publishtime != editData['发布时间']) {
		obj['发布时间'] = publishtime;
	}
	//判断缩略图
	if($('#editpreviewImg').attr('src') != editData['缩略图'].url) {
		obj['缩略图'] = {
			'url': $('#editpreviewImg').attr('src'),
			'size': $('#editpreviewImg').attr('datasize')
		};
	}
	if(introduce != editData['简介']) {
		obj['简介'] = introduce;
	}
	//power
	if(power != null && power.length) {
		$.each(power, function(i, e) {
			if(findpower == e['名称']) {
				if(e['级别'] != editData['开放用户级别']) {
					obj['开放用户级别'] = e['级别'];
				}
				return false;
			}
		});
	}
	//判断副标题
	if(((editsubheadObj['时间'] == editData['副标题']['时间']) && (editsubheadObj['来源'] == editData['副标题']['来源']) && (editsubheadObj['作者'] == editData['副标题']['作者']) && (editsubheadObj['浏览人数'] == editData['副标题']['浏览人数']) && (editsubheadObj['上下条'] == editData['副标题']['上下条'])) == false) {
		obj['副标题'] = editsubheadObj;
	}
	//判断直播开始时间
	if(reportStart != editData['直播开始时间']) {
		obj['直播开始时间'] = reportStart;
	}
	if(reportEnd != editData['直播结束时间']) {
		obj['直播结束时间'] = reportEnd;
	}
	//判断频道
	if(reportSelect == null) {
		errorTip('请选择频道');
		return;
	}
	//判断标题
	if(getByteLen(title) < setContentLimitData['标题'][0] || getByteLen(title) > setContentLimitData['标题'][1]) {
		errorTip('标题输入的字符范围为' + setContentLimitData['标题'][0] + '-' + setContentLimitData['标题'][1] + '之间');
		return
	}
	//当标题正确的时候,判断作者
	if(getByteLen(autor) < setContentLimitData['作者'][0] || getByteLen(autor) > setContentLimitData['作者'][1]) {
		errorTip('作者输入的字符范围为' + setContentLimitData['作者'][0] + '-' + setContentLimitData['作者'][1] + '之间')
		return
	}
	//当作者正确的时候,判断来源
	if(getByteLen(source) < setContentLimitData['来源'][0] || getByteLen(source) > setContentLimitData['来源'][1]) {
		errorTip('来源输入的字符范围为' + setContentLimitData['来源'][0] + '-' + setContentLimitData['来源'][1] + '之间');
		return
	}
	//当来源正确的时候，判断缩略图是不是插入图片
	if($('#editpreviewImg').attr('src') == 'img/add.png') {
		errorTip('请选择缩略图图片');
		return
	}
	//当缩略图选择了之后，判断简介
	if(getByteLen(introduce) < setContentLimitData['简介'][0] || getByteLen(introduce) > setContentLimitData['简介'][1]) {
		errorTip('简介输入的字符范围为' + setContentLimitData['简介'][0] + '-' + setContentLimitData['简介'][1] + '之间');
		return
	}
	if(reportStart.trim() == '') {
		errorTip('请您输入直播开始时间');
		return
	}
	if(reportEnd.trim() == '') {
		errorTip('请您输入直播结束时间');
		return
	}
	//验证时间差
	var a = reportStart.split(/[^0-9]/);
	var b = reportEnd.split(/[^0-9]/);
	var c = new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
	var d = new Date(b[0], b[1] - 1, b[2], b[3], b[4], b[5]);
	if((c.getTime() - d.getTime()) >= 0) {
		errorTip('直播起始时间不能大于直播结束时间');
		return
	}
	//提交之前进行判断必需填的是否正确
	editBuiltAjax(obj, null, editData);
})
//点击进入发布页面
var publishId;
var canPlay = true;
var playing = false;
var jPlay;
$('.footer table tbody').on('click', '.icon4', function() {
	$('#r-content3').show();
	$('#r-content2,#r-content1,#r-content').hide();
	publishId = $(this).parent().parent().attr('dataId')
	$.ajax({
		type: "get",
		async: false,
		url: baseUrl + 'content/' + publishId + '?projection={"标题":1,"简介":1,"缩略图":1,"频道":1,"直播状态":1}',
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data != null) {
				//设置标题
				$('#r-content3 .title span').text(data['标题']);
				//根据直播状态设置发布、终止按钮是否禁用
				if(data['直播状态'] == '未发布' || data['直播状态'] == '已终止') {
					//发布					
					$('#start').css({
						'pointer-events': 'auto',
						'opacity': 1
					});
					$('#end').css({
						'pointer-events': 'none',
						'opacity': .45
					});
				} else {
					$('#start').css({
						'pointer-events': 'none',
						'opacity': .45
					});
					$('#end').css({
						'pointer-events': 'auto',
						'opacity': 1
					});
					//终止
				}
				jPlay = jwplayer("player").setup({
					flashplayer: "jwplayer.flash.swf",
					file: data['频道']['播放地址'],
					image: data['缩略图'].url,
					autostart: true,
					width: 700,
					height: 400,
					stretching: 'uniform',
					description: data['简介'],
					events: {
						onComplete: function() {
							playing = false;
							//console.log("播放结束!!!");
						},
						onVolume: function() {
							//console.log("声音大小改变!!!");
						},
						onPlay: function() {
							playing = true;
							//console.log("开始播放!!!");
						},
						onPause: function() {
							//console.log("暂停!!!");
						},
						onBufferChange: function() {
							//console.log("缓冲改变!!!");
						},
						onBufferFull: function() {
							//console.log("视频缓冲完成!!!");
						},
						onReady: function() {
							//$('#start,#end').show();
							//console.log("准备就绪!!!");
						},
						onError: function(obj) {
							canPlay = false;
							/*$('#start,#end').css({
								'pointer-events': 'none',
								'opacity': .45
							});*/
						},
						onFullscreen: function(obj) {
							/*if(obj.fullscreen) {
								console.log("全屏");
							} else {
								console.log("非全屏");
							}*/
						},
						onMute: function(obj) {
							//console.log("静音/取消静音")
						}
					}
				});

			}
		}
	});
})

function publish(status) {
	$.ajax({
		type: "patch",
		url: baseUrl + 'content/' + publishId,
		data: {
			'直播状态': status
		},
		dataType: 'json',
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data._status == 'OK') {
				if(status == '已发布') {
					errorTip('发布成功');
				} else {
					errorTip('终止成功');
				}
			}
		}
	});
}
//点击发布
$('#start').click(function() {
	if(canPlay === false) {
		errorTip('视频有误，发布被禁止')
	} else {
		publish('已发布');
	}
})
//点击终止
$('#end').click(function() {
	publish('已终止');
})