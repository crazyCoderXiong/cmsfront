/*
 * 
 * autor xzf
 * date  2017/9/22
 * 
 * */
init(); //初始化页面	
//power
getPower(); //获取查看权限
getLanguage();//获取语言列表
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
var editor = UE.getEditor('editor', ueditorConfig);
var newEditEditor = UE.getEditor('newEditEditor', ueditorConfig);
var updateEditor = UE.getEditor('updateEditor', ueditorConfig);
var editaddEditor = UE.getEditor('editaddEditor', ueditorConfig);
editor.ready(function() {
	$('#editor .edui-editor').css({'z-index': 100000,'width':'100%'})
})
newEditEditor.ready(function() {
	$('#newEditEditor .edui-editor').css({'z-index': 100000,'width':'100%'})
})
updateEditor.ready(function() {
	$('#updateEditor .edui-editor').css({'z-index': 100000,'width':'100%'})
})
editaddEditor.ready(function() {
	$('#editaddEditor .edui-editor').css({'z-index': 100000,'width':'100%'})
})
//如果是从专题列表编辑过来的，打开文章编辑 页面	
var topicEditData, thisURL, getval, showval;
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
	$('#r-content1 .publish input').val(editData['出版社']);
	$('#r-content1 .publishDate input').val(editData['出版日期']);
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
	//设置投票 
	if(editData['投票'] != null && editData['投票']['关闭投票'] != null&&editData['投票']['关闭投票'] === false &&editData['投票']['标题'] != null) {
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
	//章节列表设置
	if(editData['章节列表'].length) {
		//将章节列表项渲染
		$('#r-content1 .book-list-con .main').html(''); //清空容器
		$.each(editData['章节列表'], function(i, e) {
			$('#middleword').html('');
			$('#middleword').append(e['正文']);
			str = '<div class="item"><span>' + (i + 1) + '</span><span>' + e['标题'] + '</span><span>' + $('#middleword').text().substr(0, 10) + '</span><span><img src="img/edit.png"/ class="editImg">&nbsp;&nbsp;<img src="img/del.png" class="delImg"/></span></div>';
			$('#r-content1 .book-list-con .main').append(str);
		})
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
}
//设置添加章节和更新视频的弹框
addGalleryW = $('.addGallery,.updateGallery,.newEditGallery,.editaddGallery').width(); //选择标签弹框的宽度
addGalleryH = $('.addGallery.updateGallery,.newEditGallery,.editaddGallery').height(); //选择标签弹框的高度
//显示弹框
$('.addGallery,.updateGallery,.newEditGallery,.editaddGallery').css({
	'top': (winH - addGalleryH) * 0.1
})
//新建页面添加章节列表
$('#addpic').click(function(e) {
	$('.addGallery,#mark').show();
	//清空弹框列表内容
	$('.addGallery .title .form-box').val('');
	editor.setContent('');
	e.stopPropagation();
})
//编辑页面添加图片列表
$('#editaddpic').click(function(e) {
	$('.editaddGallery,#mark').show();
	//清空弹框列表内容
	$('.editaddGallery .title .form-box').val('');
	e.stopPropagation();
})
$('.addGallery,.newEditGallery,.updateGallery,.editaddGallery').click(function(e) {
	e.stopPropagation();
})
//添加章节取消按钮点击事件
$('.addGallerycancel').click(function() {
	$('.addGallery,#mark').hide();
})
$('.editaddGallerycancel').click(function() {
	$('.editaddGallery,#mark').hide();
})
$('.updateGallerycancel').click(function() {
	$('.updateGallery,#mark').hide();
})
$('.newEditGallerycancel').click(function() {
	$('.newEditGallery,#mark').hide();
})
//新建页面添加图片确定按钮点击事件
var picList = []; //章节项列表
var beforeNewEdit = []; //添加章节编辑前的章节项的值
$('.addGallerySure').click(function(e) {
	var title = $('.addGallery .title .form-box').val();
	var instroduce = editor.getContent();
	var realText = editor.getContentTxt().substr(0, 10);
	var obj = {};
	var str;
	//添加成功之前进行验证，验证提交的数据是否符合
	//判断标题
	if(getByteLen(title) < setContentLimitData['章节列表']['标题'][0] || getByteLen(title) > setContentLimitData['章节列表']['标题'][1]) {
		errorTip('章节名输入的字符范围为'+setContentLimitData['章节列表']['标题'][0]+'-'+setContentLimitData['章节列表']['标题'][1]+'之间');
		return false;
	} else {
		obj['标题'] = title;
	}
	if(editor.getContentTxt() != '' && editor.getContentTxt().length >= setContentLimitData['章节列表']['正文'][0]) {
		obj['正文'] = instroduce;
	} else {
		errorTip('正文字符至少为'+setContentLimitData['章节列表']['正文'][0]+'个字符');
		return false;
	}

	picList.push(obj);
	str = '<div class="item"><span>1</span><span>' + title + '</span><span>' + realText + '</span><span><img src="img/edit.png"/ class="editImg">&nbsp;&nbsp;<img src="img/del.png" class="delImg"/></span></div>';
	$('#r-content .book-list-con .main').append(str);
	//设置序号的值
	$('#r-content .book-list-con .main .item').eq($('#r-content .book-list-con .main .item').length - 1).find('span').eq(0).text($('#r-content .book-list-con .main .item').length);
	$('.addGallery,#mark').hide();
})
$('.newEditGallerySure').click(function(e) {
	var title = $('.newEditGallery .title .form-box').val();
	var instroduce = newEditEditor.getContent();
	var realText = newEditEditor.getContentTxt().substr(0, 10);
	//编辑确认之前进行验证，验证提交的数据是否符合
	//判断标题
	if(getByteLen(title) < setContentLimitData['章节列表']['标题'][0] || getByteLen(title) > setContentLimitData['章节列表']['标题'][1]) {
		errorTip('章节名输入的字符范围为'+setContentLimitData['章节列表']['标题'][0]+'-'+setContentLimitData['章节列表']['标题'][1]+'之间');
		return false;
	}
	if(newEditEditor.getContentTxt() != '' && newEditEditor.getContentTxt().length >= setContentLimitData['章节列表']['正文'][0]) {} else {
		errorTip('正文字符至少为'+setContentLimitData['章节列表']['正文'][0]+'个字符');
		return false;
	}
	picList[editIndex - 1]['标题'] = title;
	picList[editIndex - 1]['正文'] = instroduce;
	$('#r-content .book-list-con .main .item').eq(editIndex - 1).find('span').eq(1).text(title).end().end().find('span').eq(2).text(realText);
	$('.newEditGallery,#mark').hide();
})
var editIndex; //编辑哪一行
$('#r-content .book-list-con .main').on('click', '.editImg', function(e) {
	//显示弹框
	editIndex = $(this).parent().parent().find('span').eq(0).text();
	var data = picList[editIndex - 1];
	$('.newEditGallery,#mark').show();
	//清空弹框列表内容
	$('.newEditGallery .title .form-box').val(data['标题']);
	newEditEditor.setContent(data['正文']);
	e.stopPropagation();
})
//新建页面点击章节列表里的删除按钮
$('#r-content .book-list-con .main').on('click', '.delImg', function() {
	if(confirm('确定删除这行吗')) {
		picList.splice($(this).parent().parent().find('span').eq(0).text() - 1, 1); //删除行对应的picList存储的值
		$(this).parent().parent().remove();
		if($('#r-content .book-list-con .main .item').length) {
			$.each($('#r-content .book-list-con .main .item'), function(i, e) {
				$(this).find('span').eq(0).text(i + 1);
			});
		}
	}
	console.log(picList);

})

//新建页点击提交
$('#subm,#submBack').click(function() {
	var tag = [];
	var obj = {};
	var title = $('#r-content .title input').val();
	var autor = $('#r-content .autor input').val();
	var source = $('#r-content .source input').val();
	var publishtime = $('#r-content .publish-time input').val(); //发布日期
	var introduce = $('#r-content .introduce textarea').val();
	var publish = $('#r-content .publish input').val();
	var findpower = $('#r-content .find-power select').val();
	var publishDate = $('#r-content .publishDate input').val(); //出版日期
	obj['语言'] = $('#sel-lang1 .sel-dt').text();
	//获取标签列表
	if($('#tagCon-new').text()) {
		$.each($('#tagCon-new li'), function(i, e) {
			tag.push($(this).text());
		})
	}
	obj['标签'] = tag;
	//给传给后台的对象赋值,必须传给后台的值
	obj["类别"] = "book";
	obj['标题'] = title;
	obj['作者'] = autor;
	obj['来源'] = source;
	obj['发布时间'] = publishtime;
	obj['简介'] = introduce;
	obj['出版社'] = publish;
	obj['出版日期'] = publishDate;
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
		errorTip('标题输入的字符范围为'+setContentLimitData['标题'][0]+'-'+setContentLimitData['标题'][1]+'之间');
		return
	}
	//当标题正确的时候,判断作者
	if(getByteLen(autor) < setContentLimitData['作者'][0] || getByteLen(autor) > setContentLimitData['作者'][1]) {
		errorTip('作者输入的字符范围为'+setContentLimitData['作者'][0]+'-'+setContentLimitData['作者'][1]+'之间')
		return
	}
	//当作者正确的时候,判断来源
	if(getByteLen(source) < setContentLimitData['来源'][0] || getByteLen(source) > setContentLimitData['来源'][1]) {
		errorTip('来源输入的字符范围为'+setContentLimitData['来源'][0]+'-'+setContentLimitData['来源'][1]+'之间');
		return
	}
	//当来源正确的时候，判断缩略图是不是插入图片
	if($('#previewImg').attr('src') == 'img/add.png') {
		errorTip('请选择缩略图图片');
		return
	}else {
		obj['缩略图'] = {'url':$('#previewImg').attr('src'),'size':$('#previewImg').attr('datasize')};
	}
	//当缩略图选择了之后，判断简介
	if(getByteLen(introduce) < setContentLimitData['简介'][0] || getByteLen(introduce) > setContentLimitData['简介'][1]) {
		errorTip('简介输入的字符范围为'+setContentLimitData['简介'][0]+'-'+setContentLimitData['简介'][1]+'之间');
		return
	}
	//power
	if($('#newSelect').val() == '') {
		errorTip('请选择查看权限');
		return
	} else {
		obj['开放用户级别'] = parseInt($('#newSelect option:selected').attr('dataLevel'));
	}
	//判断出版社
	if(getByteLen(publish) < setContentLimitData['出版社'][0] || getByteLen(publish) > setContentLimitData['出版社'][1]) {
		errorTip('出版社输入的字符范围为'+setContentLimitData['出版社'][0]+'-'+setContentLimitData['出版社'][1]+'之间');
		return
	}
	//出版日期
	if(publishDate == '') {
		errorTip('请选择出版日期');
		return
	}
	//当简介正确的时候，判断正文是否符合要求
	if(!picList.length) {
		errorTip('请添加章节列表');
		return
	} else {
		//赋值前对picList进行处理，简介或者链接为空的话，删除这个属性		
		obj['章节列表'] = picList;
	}

	//当picList列表大于等于1的时候	
	newBuiltAjax(obj, $(this).attr('id'), 'book');
})

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
	$('#r-content .publishDate input').val(getNowFormatDate());
	$('#previewImg').attr('src', 'img/add.png')
	$('#r-content .introduce textarea').val('');
	$('#r-content .publish input').val('');
	$('#r-content .book-list-con .main').html('');
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
	$('.tag-container').html('');
	$('.itext').val('');
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
	$('#r-content1 .publishDate input').val(getNowFormatDate());
	$('#editpreviewImg').attr('src', 'img/add.png')
	$('#r-content1 .introduce textarea').val('');
	//power
	$('#editSelect').val('');
	$('#r-content1 .publish input').val('');
	$('#r-content1 .book-list-con .main').html('');
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
//点击创建按钮
$('#built').click(function() {
	clearNew(); //清空文本框
	$('#r-content').show(); //显示新建页面
	$('#r-content1,#r-content2').hide(); //隐藏编辑页面和列表页面	
})
//新建页，返回页点击提交
$('#editback').click(function() {
	getIsEditPageModifiy();
	continueSave();
})
function getIsEditPageModifiy(){
	var tag = [];
	var obj = {};
	var title = $('#r-content1 .title input').val();
	var autor = $('#r-content1 .autor input').val();
	var source = $('#r-content1 .source input').val();
	var publishtime = $('#r-content1 .publish-time input').val();
	var introduce = $('#r-content1 .introduce textarea').val();
	var findpower = $('#r-content1 .find-power select').val();
	var publish = $('#r-content1 .publish input').val(); //出版社
	var publishDate = $('#r-content1 .publishDate input').val(); //出版日期
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
			if((topicEditData['投票']!=null&&topicEditData['投票']['标题']!=null&&editPostTicket['标题']!=topicEditData['投票']['标题'])||topicEditData['投票']==null) {
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
		if(publish != topicEditData['出版社']) {
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
		if(publishDate != topicEditData['出版日期']) {
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
			if((editData['投票']!=null&&editData['投票']['标题']!=null&&editPostTicket['标题']!=editData['投票']['标题'])||editData['投票'] == null) {
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
		if(publish != editData['出版社']) {
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
		if(publishDate != editData['出版日期']) {
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
	getAllList(); 
})
//编辑初始化
var editData=[]; //每一项的列表数据存储容器 数组
var updateEditId;
$('.footer table tbody').on('click', '.icon2', function() {
	doingEdit = true;
	editData = getCommonHtmlFromId($(this).parent().parent().attr('dataId'));
	initEditData(editData)
})

//编辑页面更新图片列表确认按钮点击事件
$('.updateGallerySure').click(function(e) {
	var title = $('.updateGallery .title .form-box').val();
	var instroduce = updateEditor.getContent();
	var realText = updateEditor.getContentTxt().substr(0, 10);
	//判断标题
	if(getByteLen(title) < setContentLimitData['章节列表']['标题'][0] || getByteLen(title) > setContentLimitData['章节列表']['标题'][1]) {
		errorTip('章节名输入的字符范围为'+setContentLimitData['章节列表']['标题'][0]+'-'+setContentLimitData['章节列表']['标题'][1]+'之间');
		return false;
	}
	if(updateEditor.getContentTxt() != '' && updateEditor.getContentTxt().length >= setContentLimitData['章节列表']['正文'][0]) {} else {
		errorTip('正文至少为'+setContentLimitData['章节列表']['正文'][0]+'个字符');
		return false;
	}
	//如果链接存在，显示链接图标，并且移上去可显示链接地址
	//行编辑完成后,改变存储行所在容器自身的值
	if(showval == 'topic') {
		topicEditData['章节列表'][updateEditId - 1]['标题'] = title;
		topicEditData['章节列表'][updateEditId - 1]['正文'] = instroduce;
	} else {
		editData['章节列表'][updateEditId - 1]['标题'] = title;
		editData['章节列表'][updateEditId - 1]['正文'] = instroduce;
	}

	$('#r-content1 .book-list-con .main .item').eq(updateEditId - 1).find('span').eq(1).text(title).end().end().find('span').eq(2).text(realText);
	$('.updateGallery,#mark').hide();
})
//编辑页面添加图片确定按钮点击事件
$('.editaddGallerySure').click(function(e) {
	var title = $('.editaddGallery .title .form-box').val();
	var instroduce = editaddEditor.getContent();
	var realText = editaddEditor.getContentTxt().substr(0, 10);
	var obj = {};
	obj['标题'] = title;
	//判断标题
	if(getByteLen(title) < setContentLimitData['章节列表']['标题'][0] || getByteLen(title) > setContentLimitData['章节列表']['标题'][1]) {
		errorTip('章节名输入的字符范围为'+setContentLimitData['章节列表']['标题'][0]+'-'+setContentLimitData['章节列表']['标题'][1]+'之间');
		return false;
	}
	if(editaddEditor.getContentTxt() != '' && editaddEditor.getContentTxt().length >= setContentLimitData['章节列表']['正文'][0]) {
		obj['正文'] = instroduce;
	} else {
		errorTip('正文字符至少为'+setContentLimitData['章节列表']['正文'][0]+'个字符');
		return false;
	}
	if(showval == 'topic') {
		topicEditData['章节列表'].push(obj);
	} else {
		editData['章节列表'].push(obj);
	}
	var str;
	str = '<div class="item"><span>1</span><span>' + title + '</span><span>' + realText + '</span><span><img src="img/edit.png"/ class="editImg">&nbsp;&nbsp;<img src="img/del.png" class="delImg"/></span></div>';
	$('#r-content1 .book-list-con .main').append(str);
	//设置序号的值
	$('#r-content1 .book-list-con .main .item').eq($('#r-content1 .book-list-con .main .item').length - 1).find('span').eq(0).text($('#r-content1 .book-list-con .main .item').length);
	$('.editaddGallery,#mark').hide();
})
//编辑页面点击图片列表里的编辑按钮
$('#r-content1 .book-list-con .main').on('click', '.editImg', function(e) {
	//显示弹框
	updateEditId = $(this).parent().parent().find('span').eq(0).text();
	var data;
	if(showval == 'topic') {
		data = topicEditData['章节列表'][updateEditId - 1];
	} else {
		data = editData['章节列表'][updateEditId - 1];
	}
	$('.updateGallery,#mark').show();
	//清空弹框列表内容
	$('.updateGallery .title .form-box').val(data['标题']);
	updateEditor.setContent(data['正文']);
	e.stopPropagation();
})
//点击图片列表里的删除按钮
$('#r-content1 .book-list-con .main').on('click', '.delImg', function() {
	if(confirm('确定删除这行吗')) {
		if(showval == 'topic') {
			topicEditData['章节列表'].splice($(this).parent().parent().find('span').eq(0).text() - 1, 1); //删除行对应的picList存储的值
		} else {
			editData['章节列表'].splice($(this).parent().parent().find('span').eq(0).text() - 1, 1); //删除行对应的picList存储的值
		}
		$(this).parent().parent().remove();
		if($('#r-content1 .book-list-con .main .item').length) {
			$.each($('#r-content1 .book-list-con .main .item'), function(i, e) {
				$(this).find('span').eq(0).text(i + 1);
			});
		}
	}
	console.log(picList);
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
	var publish = $('#r-content1 .publish input').val(); //出版社
	var publishDate = $('#r-content1 .publishDate input').val(); //出版日期
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
			if((topicEditData['投票']!=null&&topicEditData['投票']['标题']!=null&&editPostTicket['标题']!=topicEditData['投票']['标题'])||topicEditData['投票']==null) {
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
			obj['缩略图'] = {'url':$('#editpreviewImg').attr('src'),'size':$('#editpreviewImg').attr('datasize')};
		}
		if(introduce != topicEditData['简介']) {
			obj['简介'] = introduce;
		}
		if(publish != topicEditData['出版社']) {
			obj['出版社'] = publish;
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
		if(publishDate != topicEditData['出版日期']) {
			obj['出版日期'] = publishDate;
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
			if((editData['投票']!=null&&editData['投票']['标题']!=null&&editPostTicket['标题']!=editData['投票']['标题'])||editData['投票'] == null) {
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
			obj['缩略图'] = {'url':$('#editpreviewImg').attr('src'),'size':$('#editpreviewImg').attr('datasize')};;
		}
		if(introduce != editData['简介']) {
			obj['简介'] = introduce;
		}
		if(publish != editData['出版社']) {
			obj['出版社'] = publish;
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
		if(publishDate != editData['出版日期']) {
			obj['出版日期'] = publishDate;
		}
	}
	//判断标题
	if(getByteLen(title) < setContentLimitData['标题'][0] || getByteLen(title) > setContentLimitData['标题'][1]) {
		errorTip('标题输入的字符范围为'+setContentLimitData['标题'][0]+'-'+setContentLimitData['标题'][1]+'之间');
		return
	}
	//当标题正确的时候,判断作者
	if(getByteLen(autor) < setContentLimitData['作者'][0] || getByteLen(autor) > setContentLimitData['作者'][1]) {
		errorTip('作者输入的字符范围为'+setContentLimitData['作者'][0]+'-'+setContentLimitData['作者'][1]+'之间')
		return
	}
	//当作者正确的时候,判断来源
	if(getByteLen(source) < setContentLimitData['来源'][0] || getByteLen(source) > setContentLimitData['来源'][1]) {
		errorTip('来源输入的字符范围为'+setContentLimitData['来源'][0]+'-'+setContentLimitData['来源'][1]+'之间');
		return
	}
	//当来源正确的时候，判断缩略图是不是插入图片
	if($('#editpreviewImg').attr('src') == 'img/add.png') {
		errorTip('请选择缩略图图片');
		return
	}
	//当缩略图选择了之后，判断简介
	if(getByteLen(introduce) < setContentLimitData['简介'][0] || getByteLen(introduce) > setContentLimitData['简介'][1]) {
		errorTip('简介输入的字符范围为'+setContentLimitData['简介'][0]+'-'+setContentLimitData['简介'][1]+'之间');
		return
	}
	//判断出版社
	if(getByteLen(publish) < setContentLimitData['出版社'][0] || getByteLen(publish) > setContentLimitData['出版社'][1]) {
		errorTip('出版社输入的字符范围为'+setContentLimitData['出版社'][0]+'-'+setContentLimitData['出版社'][1]+'之间');
		return
	}
	//出版日期
	if(publishDate == '') {
		errorTip('请选择出版日期');
		return
	}
	//当简介正确的时候，判断正文是否符合要求
	//章节列表设置
	if(showval == 'topic') {
		if(!topicEditData['章节列表'].length) {
			errorTip('请添加章节列表');
			return
		} else {
			obj['章节列表'] = topicEditData['章节列表'];
		}
	} else {
		if(!editData['章节列表'].length) {
			errorTip('请添加章节列表');
			return
		} else {
			obj['章节列表'] = editData['章节列表'];
		}
	}

	editBuiltAjax(obj, showval,editData);
})

var len; //字符串长度
//添加画廊部分文本框弹出事件验证字符长度
$('#addT,#updateT,#newEditT,#editaddT').blur(function() {
	len = getByteLen($(this).val());
	if(len < 2 || len > 30) {
		$(this).removeClass('right-gray').addClass('error-red');
	} else {
		$(this).removeClass('error-red').addClass('right-gray');
	}
	return false;
})
$('#addI,#updateI,#newEditI,#editaddI').blur(function() {
	len = getByteLen($(this).val().trim());
	if((len >= 10 && len <= 100) || (len == 0)) {
		$(this).removeClass('error-red').addClass('right-gray');
	} else {
		$(this).removeClass('right-gray').addClass('error-red');
	}
	return false;
})
$('#addL,#updateL,#newEditL,#editaddL').blur(function() {
	len = getByteLen($(this).val().trim());
	if(len >= 8 || len == 0) {
		$(this).removeClass('error-red').addClass('right-gray');
	} else {
		$(this).removeClass('right-gray').addClass('error-red');
	}
	return false;
})