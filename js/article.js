/*
 * 
 * autor xzf
 * date  2017/9/21
 * 
 * */
init(); //初始化页面	
//power
getPower(); //获取查看权限
getLanguage(); //获取语言列表
//实例化编辑器
//建议使用工厂方法getEditor创建和引用编辑器实例，如果在某个闭包下引用该编辑器，直接调用UE.getEditor('editor')就能拿到相关的实例
var ueditorConfig = {
	serverUrl: "/ueditor/upload/",
	//这里可以选择自己需要的工具按钮名称,此处仅选择如下五个
	toolbars: [
		[
			//'source', //源代码
			'removeformat', //清除格式
			'|', //分割线
			'bold', //加粗
			'italic', //斜体
			'underline', //下划线			
			'|', //分割线
			'forecolor', //字体颜色
			'backcolor', //背景色			
			'fontfamily', //字体
			'fontsize', //字号
			'paragraph', //段落格式
			'lineheight', //行间距
			'justifyleft', //居左对齐
			'justifyright', //居右对齐
			'justifycenter', //居中对齐
			'justifyjustify', //两端对齐			
			'insertorderedlist', //有序列表
			'insertunorderedlist', //无序列表
			'edittable', //表格属性
			'inserttable', //插入表格
			'pagebreak', //分页
			'simpleupload', //单图上传			
			'link', //超链接
			'unlink', //取消链接
			'insertvideo', //视频
			'insertimage', //多图上传
			'attachment', //附件			
			'music', //音乐
			//'help', //帮助
			//'imagecenter', //居中
			//'wordimage', //图片转存				
			'showmsg' //添加QQ
		]

	],
	//focus时自动清空初始化时的内容
	autoClearinitialContent: true,
	//关闭字数统计
	wordCount: false,
	//关闭elementPath
	elementPathEnabled: false,
	//默认的编辑区域高度
	initialFrameHeight: 300,
	autoHeightEnabled: false //不随着内容增加自动长高
	//更多其他参数，请参考ueditor.config.js中的配置项
};
var ue = UE.getEditor('editor', ueditorConfig);
var editorue = UE.getEditor('editeditor', ueditorConfig);
//编辑器初始化后
var topicEditData, thisURL, getval, showval;
editorue.ready(function() {
	//如果是从专题列表编辑过来的，打开文章编辑 页面	
	thisURL = document.URL;
	getval = thisURL.split('?')[1];
	if(getval) {
		showval = getval.split("=")[1];
		if(showval == 'topic') {
			//设置编辑的值
			topicEditData = JSON.parse(sessionStorage.getItem('data'));
			initEditData(topicEditData)
		}
	}
})
//创建文章时清空之前新建的文本框
function clearNew() {
	//投票
	postTicket = null;
	$('#r-content .filelist').html('');
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
	$('#previewImg').attr('src', 'img/add.png')
	$('#r-content .introduce textarea').val('');
	if(ue.getContent() != '') {
		ue.setContent('');
	}
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
	//投票
	dataIdMore = [];
	editPostTicket = null;
	$('#r-content1 .filelist').html('');
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
	if(editorue.getContent() != '') {
		editorue.setContent('');
	}
	//清楚右侧悬浮高亮显示去除隐藏右侧浮层
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
//文章新建提交
$('#subm,#submBack').click(function() {
	var tag = [];
	var obj = {};
	var title = $('#r-content .title input').val();
	var autor = $('#r-content .autor input').val();
	var source = $('#r-content .source input').val();
	var publishtime = $('#r-content .publish-time input').val();
	var introduce = $('#r-content .introduce textarea').val();
	var findpower = $('#r-content .find-power select').val();
	var word = ue.getContent();
	obj['语言'] = $('#sel-lang1 .sel-dt').text();
	console.log(obj['语言']);
	//获取标签列表	
	console.log($('#tagCon-new').text());
	if($('#tagCon-new').text()) {
		$.each($('#tagCon-new li'), function(i, e) {
			tag.push($(this).text());
		})
	}
	console.log($('#tagCon-new').text())
	obj['标签'] = tag;
	//给传给后台的对象赋值,必须传给后台的值
	obj["类别"] = "article";
	obj['标题'] = title;
	obj['作者'] = autor;
	obj['来源'] = source;
	obj['发布时间'] = publishtime;
	obj['简介'] = introduce;
	obj['正文'] = word;
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
	//当简介正确的时候，判断正文是否符合要求
	if(getByteLen(word) < setContentLimitData['正文'][0]) {
		errorTip('正文输入的字符长度大于' + setContentLimitData['正文'][0]);
		return
	}
	//判断附件
	if($('#newfilelist li').length) {
		var objList = [];
		$.each($('#newfilelist li'), function(i, e) {
			objList.push({
				'url': $(this).attr('dataId')
			});
		})
		obj['附件'] = objList;
	}
	console.log(obj);
	//提交之前进行判断必需填的是否正确
	newBuiltAjax(obj, $(this).attr('id'), 'article');
})
//点击创建文章按钮
$('#built').click(function() {
	clearNew(); //清空文本框
	$('#r-content').show(); //显示新建页面
	$('#r-content1,#r-content2').hide(); //隐藏编辑页面和列表页面		
})
//点击新建文章页面或者编辑文章页面返回按钮返回按钮
$('#editback').click(function() {
	getIsEditPageModifiy();
	continueSave();
})
function getIsEditPageModifiy(){
	var tag = [];
	var title = $('#r-content1 .title input').val();
	var autor = $('#r-content1 .autor input').val();
	var source = $('#r-content1 .source input').val();
	var publishtime = $('#r-content1 .publish-time input').val();
	var introduce = $('#r-content1 .introduce textarea').val();
	var findpower = $('#r-content1 .find-power select').val();
	var word = editorue.getContent();
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
	if(showval == 'topic') {
		//设置语言
		if($('#sel-lang1 .sel-dt').text() != topicEditData['语言']) {
			isEditPageModifiy = true;
		}
		if(flag1 != topicEditData['置顶']) {
			isEditPageModifiy = true;
		}
		if(flag2 != topicEditData['推荐']) {
			isEditPageModifiy = true;
		}
		if(flag4 != topicEditData['评论']) {
			isEditPageModifiy = true;
		}
		//设置投票
		if(editPostTicket != null && editPostTicket['标题'] != null) {
			if((topicEditData['投票'] != null && topicEditData['投票']['标题'] != null && editPostTicket['标题'] != topicEditData['投票']['标题']) || topicEditData['投票'] == null) {
				isEditPageModifiy = true;
			}
		}
		//数组判断是否相等
		if(tag.toString() != topicEditData['标签'].toString()) {
			isEditPageModifiy = true;
		}
		if(title != topicEditData['标题']) {
			isEditPageModifiy = true;
		}
		if(autor != topicEditData['作者']) {
			isEditPageModifiy = true;
		}
		if(source != topicEditData['来源']) {
			isEditPageModifiy = true;
		}
		if(publishtime != topicEditData['发布时间']) {
			isEditPageModifiy = true;
		}
		//判断缩略图
		if($('#editpreviewImg').attr('src') != topicEditData['缩略图'].url) {
			isEditPageModifiy = true;
		}
		if(introduce != topicEditData['简介']) {
			isEditPageModifiy = true;
		}
		//power
		if(power != null && power.length) {
			$.each(power, function(i, e) {
				if(findpower == e['名称']) {
					if(e['级别'] != topicEditData['开放用户级别']) {
						isEditPageModifiy = true;
					}
					return false;
				}
			});
		}
		//判断副标题
		if(((editsubheadObj['时间'] == topicEditData['副标题']['时间']) && (editsubheadObj['来源'] == topicEditData['副标题']['来源']) && (editsubheadObj['作者'] == topicEditData['副标题']['作者']) && (editsubheadObj['浏览人数'] == topicEditData['副标题']['浏览人数']) && (editsubheadObj['上下条'] == topicEditData['副标题']['上下条'])) == false) {
			isEditPageModifiy = true;
		}
		//判断正文
		if(word != topicEditData['正文']) {
			isEditPageModifiy = true;
		}
	} else {
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
		//判断正文
		if(word != editData['正文']) {
			isEditPageModifiy = true;
		}
	}	
}
function continueSave(){
	if(isEditPageModifiy) {
		if(confirm('您还未保存修改，是否要进行接下来的操作？')) {			
			if(showval == 'topic') {
				window.location.href = '/content-subject.html'
			} else {
				$('#r-content2').show(); //显示新建列表页	
				$('#r-content1,#r-content').hide(); //隐藏编辑页面和新建页面
				getAllList(); //刷新文章列表
				doingEdit = false;
				isEditPageModifiy = false;
			}
		}
	} else {
		if(showval == 'topic') {
			window.location.href = '/content-subject.html'
		} else {
			$('#r-content2').show(); //显示新建列表页	
			$('#r-content1,#r-content').hide(); //隐藏编辑页面和新建页面
			getAllList(); //刷新文章列表
			doingEdit = false;
			isEditPageModifiy = false;
		}
	}
}
$('#back').click(function() {
	$('#r-content2').show(); //显示新建列表页	
	$('#r-content1,#r-content').hide(); //隐藏编辑页面和新建页面
	getAllList(); //刷新文章列表
})

function initEditData(editData) {
	if(showval != 'topic') {
		clearEdit(); //清空编辑器原有的东西
	}
	$('#r-content1').show();
	$('#r-content,#r-content2').hide();
	$('#r-content1 .title input').val(editData['标题']);
	$('#r-content1 .autor input').val(editData['作者']);
	$('#r-content1 .source input').val(editData['来源']);
	$('#r-content1 .publish-time input').val(editData['发布时间']);
	//设置缩略图
	$('#editpreviewImg').attr('src', editData['缩略图'].url);
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
	//正文部分
	editorue.setContent(editData['正文']);
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
	//附件
	if(editData['附件'] != null && editData['附件'].length) {
		$("#r-content1 .filelist").html('');
		$.each(editData['附件'], function(i, e) {
			$("#r-content1 .filelist").append("<li dataId=" + e.url + "><span class='filename'>" + e.filename + "</span><span class='progressnum'>" + getSize(e.size) + "</span><span class='del'></span></li>");
		});
	}
}
//编辑文章初始化
var editData = []; //每一项文章的列表数据存储容器
$('.footer table tbody').on('click', '.icon2', function() {
	doingEdit = true;
	//获取当前编辑文章的数据
	editData = getCommonHtmlFromId($(this).parent().parent().attr('dataId'));
	initEditData(editData);
})
//编辑部分保存修改
$('#save').click(function() {
	var tag = [];
	var obj = {};
	var title = $('#r-content1 .title input').val();
	var autor = $('#r-content1 .autor input').val();
	var source = $('#r-content1 .source input').val();
	var publishtime = $('#r-content1 .publish-time input').val();
	var introduce = $('#r-content1 .introduce textarea').val();
	var findpower = $('#r-content1 .find-power select').val();
	var word = editorue.getContent();
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
	if(showval == 'topic') {
		//设置语言
		if($('#sel-lang1 .sel-dt').text() != topicEditData['语言']) {
			obj['语言'] = $('#sel-lang1 .sel-dt').text();
		}
		if(flag1 != topicEditData['置顶']) {
			obj['置顶'] = flag1;
		}
		if(flag2 != topicEditData['推荐']) {
			obj['推荐'] = flag2;
		}
		if(flag4 != topicEditData['评论']) {
			obj['评论'] = flag4;
		}
		//设置投票
		if(editPostTicket != null && editPostTicket['标题'] != null) {
			if((topicEditData['投票'] != null && topicEditData['投票']['标题'] != null && editPostTicket['标题'] != topicEditData['投票']['标题']) || topicEditData['投票'] == null) {
				obj['投票'] = editPostTicket;
			}
		}
		//数组判断是否相等
		if(tag.toString() != topicEditData['标签'].toString()) {
			obj['标签'] = tag;
		}
		if(title != topicEditData['标题']) {
			obj['标题'] = title;
		}
		if(autor != topicEditData['作者']) {
			obj['作者'] = autor;
		}
		if(source != topicEditData['来源']) {
			obj['来源'] = source;
		}
		if(publishtime != topicEditData['发布时间']) {
			obj['发布时间'] = publishtime;
		}
		//判断缩略图
		if($('#editpreviewImg').attr('src') != topicEditData['缩略图'].url) {
			obj['缩略图'] = {
				'url': $('#editpreviewImg').attr('src'),
				'size': $('#editpreviewImg').attr('datasize')
			};
		}
		if(introduce != topicEditData['简介']) {
			obj['简介'] = introduce;
		}
		//power
		if(power != null && power.length) {
			$.each(power, function(i, e) {
				if(findpower == e['名称']) {
					if(e['级别'] != topicEditData['开放用户级别']) {
						obj['开放用户级别'] = e['级别'];
					}
					return false;
				}
			});
		}
		//判断副标题
		if(((editsubheadObj['时间'] == topicEditData['副标题']['时间']) && (editsubheadObj['来源'] == topicEditData['副标题']['来源']) && (editsubheadObj['作者'] == topicEditData['副标题']['作者']) && (editsubheadObj['浏览人数'] == topicEditData['副标题']['浏览人数']) && (editsubheadObj['上下条'] == topicEditData['副标题']['上下条'])) == false) {
			obj['副标题'] = editsubheadObj;
		}
		//判断正文
		if(word != topicEditData['正文']) {
			obj['正文'] = word;
		}
	} else {
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
		//判断正文
		if(word != editData['正文']) {
			obj['正文'] = word;
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
	//当简介正确的时候，判断正文是否符合要求
	if(getByteLen(word) < setContentLimitData['正文'][0]) {
		errorTip('正文输入的字符长度大于' + setContentLimitData['正文'][0]);
		return
	}
	//判断附件
	if($('#editfilelist li').length) {
		var objList = [];
		$.each($('#editfilelist li'), function(i, e) {
			objList.push({
				'url': $(this).attr('dataId')
			});
		})
		obj['附件'] = objList;
	}
	//提交之前进行判断必需填的是否正确
	editBuiltAjax(obj, showval,editData);	
})