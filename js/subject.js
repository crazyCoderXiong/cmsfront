var pagesize = 20;
var curpage = 1;
init(); //初始化页面
//power
getPower(); //获取查看权限
getLanguage(); //获取语言列表
/*选择专题标签部分start*/
//新建部分添加标签名称
$('#r-content .topic-addbtn').click(function() {
	var ipt = $(this).parent().find('.topic-itext').val();
	if(ipt && ipt.length && ipt.trim() == '') {
		errorTip('请输入要添加的标签');
		return;
	}
	var len = getByteLen(ipt);
	if(len >= 1) {
		//判断容器是否存在与添加的标签值相等
		if($('#r-content .topic-tag-container li').length) {
			var exist = false;
			$.each($('#r-content .topic-tag-container li'), function(i, e) {
				if($(this).text() == ipt.trim()) {
					exist = true;
					errorTip('添加的标签已经存在');
					return;
				}
			})
			if(!exist) {
				$('#r-content .topic-tag-container').append('<li>' + ipt + '<span class="topic-del"></span></li>');
				$(this).parent().find('.topic-itext').val('');
			}
		} else {
			$('#r-content .topic-tag-container').append('<li>' + ipt + '<span class="topic-del"></span></li>');
			$(this).parent().find('.topic-itext').val('');
		}
	} else {
		$(this).parent().find('.topic-itext').val('');
		errorTip('添加标签的字符长度不在一个字符以上');
	}
})
//编辑部分添加标签名称
$('#r-content1 .topic-addbtn').click(function() {
	var ipt = $(this).parent().find('.topic-itext').val();
	if(ipt && ipt.length && ipt.trim() == '') {
		errorTip('请输入要添加的标签');
		return;
	}
	var len = getByteLen(ipt);
	if(len >= 1) {
		//判断容器是否存在与添加的标签值相等
		if($('#r-content1 .topic-tag-container li').length) {
			var exist = false;
			$.each($('#r-content1 .topic-tag-container li'), function(i, e) {
				if($(this).text() == ipt.trim()) {
					exist = true;
					errorTip('添加的标签已经存在');
					return;
				}
			})
			if(!exist) {
				$('#r-content1 .topic-tag-container').append('<li>' + ipt + '<span class="topic-del"></span></li>');
				$(this).parent().find('.topic-itext').val('');
			}
		} else {
			$('#r-content1 .topic-tag-container').append('<li>' + ipt + '<span class="topic-del"></span></li>');
			$(this).parent().find('.topic-itext').val('');
		}
	} else {
		$(this).parent().find('.topic-itext').val('');
		errorTip('添加标签的字符长度不在一个字符以上');
	}
})
//选择标签弹框位置设置
$('.topic-tag-box').click(function(e) {
	e.stopPropagation();
})
//新建部分点击标签选择按钮
$('#r-content .topic-selTag').click(function(e) {
	$('.topic-tag-box,#mark').show(); //显示弹框	
	$('#topic-del-tag').html($('#r-content .topic-tag .topic-tag-container').html()); //添加的按钮在弹框选择按钮容器位置显示		
	topicGetInitAllTag(); //查询所有的标签
	tagBoxW = $('.topic-tag-box').width(); //选择标签弹框的宽度
	tagBoxH = $('.topic-tag-box').height(); //选择标签弹框的高度
	//设置弹框位置
	$('.topic-tag-box').css({
		'left': (winW - tagBoxW) * 0.7,
		'top': (winH - tagBoxH) * 0.5
	})
	e.stopPropagation();
})
//编辑部分点击标签选择按钮
$('#r-content1 .topic-selTag').click(function(e) {
	$('.topic-tag-box,#mark').show(); //显示弹框	
	$('#topic-del-tag').html($('#r-content1 .topic-tag .topic-tag-container').html()); //添加的按钮在弹框选择按钮容器位置显示		
	topicGetInitAllTag(); //查询所有的标签
	tagBoxW = $('.topic-tag-box').width(); //选择标签弹框的宽度
	tagBoxH = $('.topic-tag-box').height(); //选择标签弹框的高度
	//设置弹框位置
	$('.topic-tag-box').css({
		'left': (winW - tagBoxW) * 0.7,
		'top': (winH - tagBoxH) * 0.5
	})
	e.stopPropagation();
})

function topicGetInitAllTag() {
	$('#topic-use').removeClass('active-orange');
	var url1 = baseUrl + 'tag?where={"引用次数":{"$gte":1},"语言":"' + defaultLang + '"}&sort=[("引用次数",-1)]&max_results=' + pagesize + '&page=' + curpage;
	var url2 = baseUrl + 'tag?where={"引用次数":{"$gte":1},"语言":"' + defaultLang + '"}&sort=[("引用次数",-1)]';
	topictagAjax(url1, url2);
}
//查询所有常用标签
function topicGetAllTag() {
	$('#topic-use').addClass('active-orange').parent().find('.topic-spell').children().removeClass('active-orange') //高亮显示  排他
	var url1 = baseUrl + 'tag?where={"引用次数":{"$gte":1},"语言":"' + defaultLang + '"}&sort=[("引用次数",-1)]&max_results=' + pagesize + '&page=' + curpage;
	var url2 = baseUrl + 'tag?where={"引用次数":{"$gte":1},"语言":"' + defaultLang + '"}&sort=[("引用次数",-1)]';
	topictagAjax(url1, url2);
}
//常用标签点击事件
$('#topic-use').off('click').on('click', function() {
	topicGetAllTag(); //全部查询标签名称
})
//点击英文字母  拼音查询对应的标签
var topicspellArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
$('#topic-spell span').click(function() {
	var data = topicspellArr[$(this).index()]; //获取当前点击的关联词
	var url1 = encodeURI(baseUrl + 'tag?where={"$or":[{"标签名称":{"$regex":"' + data + '"}},{"拼音":{"$regex":"' + data + '"}}],"语言":"' + defaultLang + '"}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]');
	var url2 = baseUrl + 'tag?where={"$or":[{"标签名称":{"$regex":"' + data + '"}},{"拼音":{"$regex":"' + data + '"}}],"语言":"' + defaultLang + '"}';
	$(this).addClass('active-orange').siblings().removeClass('active-orange').end().parent().siblings().removeClass('active-orange'); //点击高亮显示排他
	topictagAjax(url1, url2);
})
//关键字查询标签  ,点击搜索按钮
$('#topic-fre-sure').click(function() {
	var data = $('#topic-searInput').val(); //文本框值	
	$('#topic-use,#topic-spell span').removeClass('active-orange'); //移出常用或者拼音字母高亮 
	var url1 = encodeURI(baseUrl + 'tag?where={"$or":[{"标签名称":{"$regex":"' + data + '"}},{"拼音":{"$regex":"' + data + '"}}],"语言":"' + defaultLang + '"}&max_results=' + pagesize + '&page=' + curpage);
	var url2 = baseUrl + 'tag?where={"$or":[{"标签名称":{"$regex":"' + data + '"}},{"拼音":{"$regex":"' + data + '"}}],"语言":"' + defaultLang + '"}';
	topictagAjax(url1, url2);
})
//点击标签选框取消按钮,隐藏选择标签框
$('.topic-tag-box .topic-cancel').click(function() {
	$('.topic-tag-box,#mark').hide();
})
//选择标签框确认按钮,隐藏选择标签框，并且将弹出框选择出来的标签显示在文章列表页面添加按钮上
$('.topic-tag-box .topic-sure').click(function() {
	$('.topic-tag-box,#mark').hide();
	$('.topic-tag-container').html($('#topic-del-tag').html())

})
$(document).on('click', function() {
	$('.topic-tag-box').hide();
})

function setTopicHtml(data) {
	$('#topic-searInput').val('');
	$('#topic-tagContainer').html(''); //清空容器
	$.each(data._items, function(i, e) {
		$('#topic-tagContainer').append('<li data-id=' + e._id + '>' + e["标签名称"] + '</li>');
	})
	$('#topic-tagContainer li').click(function() {
		var value = $(this).text();
		$(this).addClass('active-blue').siblings().removeClass('active-blue');
		if($('#topic-del-tag li').length) {
			var exist = false;
			$.each($('#topic-del-tag li'), function(i, e) {
				if($(this).text() == value) {
					exist = true;
					errorTip('添加的标签已经存在');
					return;
				}
			})
			if(!exist) {
				$('#topic-del-tag').append('<li>' + $(this).text() + '<span class="topic-del"></span></li>');
			}
		} else {
			$('#topic-del-tag').append('<li>' + $(this).text() + '<span class="topic-del"></span></li>');
		}
	})
}
//获取标签名称公共ajax部分
function topictagAjax(url1, url2) {
	//全局变量
	var totalNum = null; //多少条数据
	$.ajax({
		type: "get",
		url: url1,
		async: false,
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data != null && data._items != null && data._items.length) {
				totalNum = data._meta.total;
				$('#topic-selTagPage').remove(); //移除page容器
				$('#topic-selTagPageParent').append('<div id="topic-selTagPage"></div>'); //追加page容器
				pageUtil.initPage('topic-selTagPage', {
					totalCount: totalNum, //总页数，一般从回调函数中获取。如果没有数据则默认为1页
					curPage: 1, //初始化时的默认选中页，默认第一页。如果所填范围溢出或者非数字或者数字字符串，则默认第一页
					showCount: 5, //分页栏显示的数量
					pageSizeList: [20, 25, 30, 35, 40], //自定义分页数，默认[5,10,15,20,50]
					defaultPageSize: pagesize, //默认选中的分页数,默认选中第一个。如果未匹配到数组或者默认数组中，则也为第一个
					isJump: true, //是否包含跳转功能，默认false
					isPageNum: true, //是否显示分页下拉选择，默认false
					isPN: true, //是否显示上一页和下一面，默认true
					isFL: true, //是否显示首页和末页，默认true
					jump: function(curPage, pageSize) { //跳转功能回调，传递回来2个参数，当前页和每页大小。如果没有设置分页下拉，则第二个参数永远为0。这里的this被指定为一个空对象，如果回调中需用到this请自行使用bind方法
						$.ajax({
							type: 'get',
							url: encodeURI(url2 + '&max_results=' + pageSize + '&page=' + curPage),
							dataType: 'json',
							headers: {
								"Authorization": "Basic " + auth
							},
							success: function(data) {
								$('#show_label em').text(data._meta.total);
								setTopicHtml(data);
							},
							error: function(e) {
								console.log(e);
							}
						})
					},
				});
				setTopicHtml(data);
			} else {
				$('#topic-selTagPage').remove(); //移除page容器
				$('#topic-tagContainer').html('<div style="color:gray;text-align:center;font-size:20px;">没有对应的标签</div>'); //清空容器
			}
		},
		error: function(e) {
			errorTip('error');
		}
	});
}
//选择的标签事件
$('#topic-del-tag,.topic-tag .topic-tag-container').on('mouseover', 'li', function(e) {
	$(this).find('.topic-del').show();
	return false;
})
$('#topic-del-tag,.topic-tag .topic-tag-container').on('mouseout', 'li', function(e) {
	$(this).find('.topic-del').hide();
	return false;
})
$('#topic-del-tag,.topic-tag .topic-tag-container').on('click', '.topic-del', function(e) {
	$(this).parent().remove();
	return false;
})
//弹出框选择输入完确认按钮
$('#topic-isure').click(function() {
	var val = $('#topic-sureValue').val();
	if(val && val.length && val.trim() == '') {
		errorTip('请输入要添加的标签');
		return;
	}
	var len = getByteLen(val);
	if(len >= 1) {
		//判断容器是否存在与添加的标签值相等
		if($('#topic-del-tag li').length) {
			var exist = false;
			$.each($('#topic-del-tag li'), function(i, e) {
				if($(this).text() == val.trim()) {
					exist = true;
					errorTip('添加的标签已经存在');
					return;
				}
			})
			if(!exist) {
				$('#topic-del-tag').append('<li>' + val + '<span class="topic-del"></span></li>');
				$('#topic-sureValue').val('');
				topictagSureAjax(val);
			}
		} else {
			$('#topic-del-tag').append('<li>' + val + '<span class="topic-del"></span></li>');
			$('#topic-sureValue').val('');
			topictagSureAjax(val);
		}
	} else {
		$('#topic-sureValue').val('');
		errorTip('添加标签的字符长度不在一个字符以上');
	}
})
/*回车键*/
$('#topic-sureValue').bind('keypress', function(event) {
	if(event.keyCode == "13") {
		$('#topic-isure').trigger('click');
	}
});
$('#topic-searInput').bind('keypress', function(event) {
	if(event.keyCode == "13") {
		$('#topic-fre-sure').trigger('click');
	}
});

function topictagSureAjax(val) {
	$.ajax({
		type: "post",
		url: baseUrl + 'tag',
		data: {
			'标签名称': val
		},
		dataType: 'json',
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data._status == 'OK') {
				//清空文本框的值
				$('#topic-sureValue').val('');
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			/*console.log(XMLHttpRequest);
			errorTip(XMLHttpRequest.responseJSON._issues['标签名称']);*/
		}
	});
}
/*选择专题标签部分end*/
$('#subm,#submBack').click(function() {
	var tag = [];
	var topictag = [];
	var obj = {};
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
	//获取专题标签列表
	if($('#topic-tagCon-new').text()) {
		$.each($('#topic-tagCon-new li'), function(i, e) {
			topictag.push($(this).text());
		})
	}
	obj['标签'] = tag;
	obj['专题标签'] = topictag;
	//给传给后台的对象赋值,必须传给后台的值
	obj["类别"] = "subject";
	obj['标题'] = title;
	obj['作者'] = autor;
	obj['来源'] = source;
	obj['发布时间'] = publishtime;
	obj['缩略图'] = {
		'url': $('#previewImg').attr('src'),
		'size': $('#previewImg').attr('datasize')
	};;
	obj['简介'] = introduce;
	obj['宣传画'] = {
		'url': $('#posterpreviewImg').attr('src'),
		'size': $('#posterpreviewImg').attr('datasize')
	};;
	obj['副标题'] = newsubheadObj;
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
	}
	//当缩略图选择了之后，判断简介
	if(getByteLen(introduce) < setContentLimitData['简介'][0] || getByteLen(introduce) > setContentLimitData['简介'][1]) {
		errorTip('简介输入的字符范围为' + setContentLimitData['简介'][0] + '-' + setContentLimitData['简介'][1] + '之间');
		return
	}
	//当简介正确的时候，判断宣传画	
	if($('#posterpreviewImg').attr('src') == 'img/add.png') {
		errorTip('请选择宣传画图片');
		return
	}
	//power
	if($('#newSelect').val() == '') {
		errorTip('请选择查看权限');
		return
	} else {
		obj['开放用户级别'] = parseInt($('#newSelect option:selected').attr('dataLevel'));
	}
	//当宣传画选择了的时候，判断专题列表是否存在
	if(!topictag.length) {
		errorTip('请选择专题标签');
		return;
	}
	newBuiltAjax(obj, $(this).attr('id'), 'subject');
})
//新建页，返回页点击提交
$('#back').click(function() {
	$('#r-content2').show(); //显示新建列表页	
	$('#r-content1,#r-content').hide(); //隐藏编辑页面和新建页面
	getAllList(); //刷新列表
})
$('#editback').click(function() {
	getIsEditPageModifiy();
	continueSave();
})
function continueSave() {
	if(isEditPageModifiy) {
		if(confirm('您还未保存修改，是否要进行接下来的操作？')) {
			$('#r-content2').show(); //显示新建列表页	
			$('#r-content1,#r-content').hide(); //隐藏编辑页面和新建页面
			getAllList(); //刷新文章列表
			doingEdit = false;
			isEditPageModifiy = false;
		}
	} else {
		$('#r-content2').show(); //显示新建列表页	
		$('#r-content1,#r-content').hide(); //隐藏编辑页面和新建页面
		getAllList(); //刷新文章列表
		doingEdit = false;
		isEditPageModifiy = false;
	}
}

function getIsEditPageModifiy() {
	var tag = [];
	var topictag = [];
	var obj = {};
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
	//获取专题标签列表
	if($('#topic-tagCon-edit').text()) {
		$.each($('#topic-tagCon-edit li'), function(i, e) {
			topictag.push($(this).text());
		})
	}
	//设置语言		
	if($('#sel-lang1 .sel-dt').text() != editData['语言']) {
		isEditPageModifiy = true;
	}
	//数组判断是否相等
	if(tag.toString() != editData['标签'].toString()) {
		isEditPageModifiy = true;
	}
	if(topictag.toString() != editData['专题标签'].toString()) {
		isEditPageModifiy = true;
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
	//判断宣传画
	if($('#editposterpreviewImg').attr('src') != editData['宣传画'].url) {
		isEditPageModifiy = true;
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
}

function clearNew() {
	//重置新建副标题对象
	newsubheadObj['时间'] = true;
	newsubheadObj['作者'] = true;
	newsubheadObj['浏览人数'] = true;
	newsubheadObj['来源'] = true;
	newsubheadObj['上下条'] = true;
	picList = []; //图片项列表设置为空
	$('#r-content .title input').val('');
	$('#r-content .autor input').val('');
	$('#r-content .source input').val('');
	$('#r-content .publish-time input').val(getNowFormatDate());
	$('#previewImg').attr('src', 'img/add.png');
	$('#r-content .introduce textarea').val('');
	$('#posterpreviewImg').attr('src', 'img/add.png');
	//清除右侧悬浮高亮显示去除隐藏右侧浮层
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
	$('.tag-container,.topic-tag-container').html('');
	$('.itext,.topic-itext').val('');
	//清除红色的框
	$('.error-red').removeClass('error-red');
}

function clearEdit() {
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
	$('#editpreviewImg').attr('src', 'img/add.png')
	$('#r-content1 .introduce textarea').val('');
	//power
	$('#editSelect').val('');
	$('#editposterpreviewImg').attr('src', 'img/add.png');
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
	$('.tag-container,.topic-tag-container').html('');
	$('.itext,.topic-itext').val('');
	//清除红色的框
	$('.error-red').removeClass('error-red');
}
//点击创建按钮
$('#built').click(function() {
	clearNew(); //清空文本框
	$('#r-content').show(); //显示新建页面
	$('#r-content1,#r-content2').hide(); //隐藏编辑页面和列表页面	
})
var editData = []; //每一项列表数据存储容器
$('.footer table tbody').on('click', '.icon2', function() {
	doingEdit = true;
	//投票
	clearEdit(); //清空编辑器原有的东西
	$('#r-content1').show();
	$('#r-content,#r-content2').hide();
	//获取当前编辑专题的数据
	editData = getCommonHtmlFromId($(this).parent().parent().attr('dataId'));
	$('#r-content1 .title input').val(editData['标题']);
	$('#r-content1 .autor input').val(editData['作者']);
	$('#r-content1 .source input').val(editData['来源']);
	$('#r-content1 .publish-time input').val(editData['发布时间']);
	//设置缩略图
	$('#editpreviewImg').attr('src', editData['缩略图'].url);
	//设置宣传画	
	$('#editposterpreviewImg').attr('src', editData['宣传画'].url);
	$('#r-content1 .introduce textarea').val(editData['简介']);
	//power
	if(power != null && power.length != 0) {
		$.each(power, function(i, e) {
			if(e['级别'] == editData['开放用户级别']) {
				$('#editSelect').val(e['名称']);
				return false;
			}
		});
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
		$('.tag-container').html('');
		$.each(editData['标签'], function(i, e) {
			$('.tag-container').append('<li>' + e + '<span class="del"></span></li>');
		});
	}
	//设置专题标签
	if(editData['专题标签'] && editData['专题标签'].length) {
		$('.topic-tag-container').html('');
		$.each(editData['专题标签'], function(i, e) {
			$('.topic-tag-container').append('<li>' + e + '<span class="topic-del"></span></li>');
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
	//设置专题列表
	getTopicList(editData['专题标签']);
})

function getTopicList(data) {
	var url1 = baseUrl + '/content?where={"类别":{"$nin":["subject"]},"标签":{"$all":' + JSON.stringify(data) + '}}&max_results=' + pagesize + '&page=' + curpage;
	var url2 = baseUrl + '/content?where={"类别":{"$nin":["subject"]},"标签":{"$all":' + JSON.stringify(data) + '}}';
	topicListAjax(url1, url2);
}

function getTopicListHtml(data) {
	var str;
	var category;
	topicList = data._items; //存储专题列表渲染值
	$('.topic-list-con .main').html(''); //清空容器
	$.each(data._items, function(i, e) {
		if(e["类别"] == 'article') {
			category = '文章'
		} else if(e["类别"] == 'gallery') {
			category = '画廊'
		} else if(e["类别"] == 'video') {
			category = '视频'
		} else if(e["类别"] == 'music') {
			category = '音乐'
		} else if(e["类别"] == 'subject') {
			category = '专题'
		} else if(e["类别"] == 'book') {
			category = '图书杂志'
		} else if(e["类别"] == 'live') {
			category = '直播频道'
		}
		str = '<div class="item" dataId=' + i + '><span>' + category + '</span><span>' + e["标题"] + '</span><span>' + e._created + '</span><span>' + e["作者"] + '</span><span><img src="img/edit.png" class="topicedit-edit"/>&nbsp;&nbsp;<img src="img/del.png" class="topicedit-del"/></span></div>'
		$('.topic-list-con .main').append(str);
	})
}
var topicList; //存储专题列表项的值
function topicListAjax(url1, url2) {
	//全局变量
	var totalNum = null; //多少条数据
	var totalSize = null; //分多少页
	var strHtml = null;
	$.ajax({
		type: "get",
		url: encodeURI(url1),
		dataType: 'json',
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data != null && data._items != null && data._items.length) {
				totalNum = data._meta.total;
				$('#topicListPage').remove(); //移除page容器
				$('#topicListPageParent').append('<div id="topicListPage"></div>'); //追加page容器
				pageUtil.initPage('topicListPage', {
					totalCount: totalNum, //总页数，一般从回调函数中获取。如果没有数据则默认为1页
					curPage: 1, //初始化时的默认选中页，默认第一页。如果所填范围溢出或者非数字或者数字字符串，则默认第一页
					showCount: 5, //分页栏显示的数量
					pageSizeList: [20, 25, 30, 35, 40], //自定义分页数，默认[5,10,15,20,50]
					defaultPageSize: pagesize, //默认选中的分页数,默认选中第一个。如果未匹配到数组或者默认数组中，则也为第一个
					isJump: true, //是否包含跳转功能，默认false
					isPageNum: true, //是否显示分页下拉选择，默认false
					isPN: true, //是否显示上一页和下一面，默认true
					isFL: true, //是否显示首页和末页，默认true
					jump: function(curPage, pageSize) { //跳转功能回调，传递回来2个参数，当前页和每页大小。如果没有设置分页下拉，则第二个参数永远为0。这里的this被指定为一个空对象，如果回调中需用到this请自行使用bind方法
						$.ajax({
							type: 'get',
							url: encodeURI(url2 + '&max_results=' + pageSize + '&page=' + curPage),
							dataType: 'json',
							headers: {
								"Authorization": "Basic " + auth
							},
							success: function(data) {
								$('#show_label em').text(data._meta.total);
								getTopicListHtml(data);
							},
							error: function(e) {
								console.log(e);
							}
						})
					},
				});
				getTopicListHtml(data);
			} else {
				$('.topic-list-con .main').html(''); //清空容器
				$('#topicListPage').remove(); //移除page容器
			}
		},
		error: function() {

		}
	})
}
//编辑部分保存修改
$('#save').click(function() {
	var tag = [];
	var topictag = [];
	var obj = {};
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
	//获取专题标签列表
	if($('#topic-tagCon-edit').text()) {
		$.each($('#topic-tagCon-edit li'), function(i, e) {
			topictag.push($(this).text());
		})
	}
	//设置语言		
	if($('#sel-lang1 .sel-dt').text() != editData['语言']) {
		obj['语言'] = $('#sel-lang1 .sel-dt').text();
	}
	//数组判断是否相等
	if(tag.toString() != editData['标签'].toString()) {
		obj['标签'] = tag;
	}
	if(topictag.toString() != editData['专题标签'].toString()) {
		obj['专题标签'] = topictag;
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
	//判断宣传画
	if($('#editposterpreviewImg').attr('src') != editData['宣传画'].url) {
		obj['宣传画'] = {
			'url': $('#editposterpreviewImg').attr('src'),
			'size': $('#editposterpreviewImg').attr('datasize')
		};
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
	//判断宣传画
	if($('#editposterpreviewImg').attr('src') == 'img/add.png') {
		errorTip('请选择宣传画图片');
		return
	}
	//判断专题是否存在
	if(!topictag.length) {
		errorTip('请选择专题标签');
		return
	}
	editBuiltAjax(obj, null, editData);
})
//专题编辑-专题列表编辑
$('.topic-list-con .main').on('click', '.topicedit-edit', function() {
	//专题类型
	var type = $(this).parent().parent().find('span').eq(0).text();
	//获取此专题所在专题列表行位置
	var index = $(this).parent().parent().attr('dataId');
	console.log(index);
	//获取此专题所有信息项
	console.log(topicList);
	var topicItemValue = topicList[index];
	console.log(topicItemValue);
	sessionStorage.setItem("data", JSON.stringify(topicItemValue));
	if(type == '文章') {
		window.location.href = '/content-article.html?from=topic'
	} else if(type == '画廊') {
		window.location.href = '/content-gallery.html?from=topic'
	} else if(type == '视频') {
		window.location.href = '/content-video.html?from=topic'
	} else if(type == '音乐') {
		window.location.href = '/content-music.html?from=topic'
	} else if(type == '专题') {
		window.location.href = '/content-topic.html?from=topic'
	} else if(type == '图书杂志') {
		window.location.href = '/content-book.html?from=topic'
	} else if(type == '直播频道') {
		window.location.href = '/content-live.html?from=topic'
	}
})
//专题编辑-专题列表删除
$('.topic-list-con .main').on('click', '.topicedit-del', function() {

})