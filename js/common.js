var defaultLang = sessionStorage.getItem('defaultLang');
var isEditPageModifiy = false; //是否修改了编辑页了
var doingEdit = false; //记录是否处在编辑页，如果处在编辑页，进行页面跳转的时候判断编辑页数据是否有改变
//是否在上传文件
var mediauploading = false;
var switchTo; //存储文件上传要切换的页面
$.ajaxSetup({
	cache: false
}); //设置ajax全局对象
var manageId; //管理员Id
var baseUrl = '/api/'; //url前缀
var auth = "{{auth}}";

function switchPage(page) {
	editStateDoing(); //处在编辑状态的话进行判断，获取编辑页是否修改状态
	if(!mediauploading && !isEditPageModifiy) {
		window.location = page;
	} else if(mediauploading) {
		$('#continueUpload,#mark').show();
		switchTo = page;
	} else if(isEditPageModifiy) {
		if(confirm('您还未保存修改，是否要进行接下来的操作？')) {
			window.location = page;
		}
	}
}

function editStateDoing() {
	if(doingEdit) {
		getIsEditPageModifiy();
	}
}
//导航栏点击事件
function navClick() {
	$('#nav-ul li .header').off('click').on('click', function() {
		var id = $(this).parent().attr('data-id');
		switch(id) {
			case 'tag':
				switchPage('assort-tag.html'); //是否终止正在上传的文件
				break;
			case 'contentInput':
				if($(this).parent().find('.content').css('display') == 'none') {
					$(this).parent().parent().find('.content').slideUp();
					$(this).parent().parent().find('.header span').removeClass('click-arrow-icon').addClass('arrow-icon');
					$(this).parent().find('.content').slideDown();
					$(this).find('span').addClass('click-arrow-icon').removeClass('arrow-icon');
				} else {
					$(this).parent().find('.content').slideUp();
					$(this).find('span').removeClass('click-arrow-icon').addClass('arrow-icon');
				}
				break
			case 'media':
				if($(this).parent().find('.content').css('display') == 'none') {
					$(this).parent().parent().find('.content').slideUp();
					$(this).parent().parent().find('.header span').removeClass('click-arrow-icon').addClass('arrow-icon');
					$(this).parent().find('.content').slideDown();
					$(this).find('span').addClass('click-arrow-icon').removeClass('arrow-icon');
				} else {
					$(this).parent().find('.content').slideUp();
					$(this).find('span').removeClass('click-arrow-icon').addClass('arrow-icon');
				}
				break
			case 'management':
				if($(this).parent().find('.content').css('display') == 'none') {
					$(this).parent().parent().find('.content').slideUp();
					$(this).parent().parent().find('.header span').removeClass('click-arrow-icon').addClass('arrow-icon');
					$(this).parent().find('.content').slideDown();
					$(this).find('span').addClass('click-arrow-icon').removeClass('arrow-icon');
				} else {
					$(this).parent().find('.content').slideUp();
					$(this).find('span').removeClass('click-arrow-icon').addClass('arrow-icon');
				}
				break
			case 'web':
				switchPage('aibws.html'); //是否终止正在上传的文件
				if($(this).parent().find('.content').css('display') == 'none') {
					$(this).parent().parent().find('.content').slideUp();
					$(this).parent().parent().find('.header span').removeClass('click-arrow-icon').addClass('arrow-icon');
					$(this).parent().find('.content').slideDown();
					$(this).find('span').addClass('click-arrow-icon').removeClass('arrow-icon');
				} else {
					$(this).parent().find('.content').slideUp();
					$(this).find('span').removeClass('click-arrow-icon').addClass('arrow-icon');
				}
				break
		}
		return false;
	})
	//内容录入处理函数
	$('#article').on('click', function() {
		switchPage('content-article.html'); //是否终止正在上传的文件
		//window.location = 'content-article.html'
		return false; //阻止冒泡
	})
	$('#gallery').on('click', function() {
		switchPage('content-gallery.html'); //是否终止正在上传的文件
		//window.location = 'content-gallery.html'
		return false; //阻止冒泡
	})
	$('#vedio').on('click', function() {
		switchPage('content-video.html'); //是否终止正在上传的文件
		//window.location = 'content-video.html'
		return false; //阻止冒泡
	})
	$('#music').on('click', function() {
		switchPage('content-music.html'); //是否终止正在上传的文件
		//window.location = 'content-music.html'
		return false; //阻止冒泡
	})
	$('#topic').on('click', function() {
		switchPage('content-subject.html'); //是否终止正在上传的文件
		//window.location = 'content-subject.html'
		return false; //阻止冒泡
	})
	$('#bookessay').on('click', function() {
		switchPage('content-book.html'); //是否终止正在上传的文件
		//window.location = 'content-book.html'
		return false; //阻止冒泡
	})
	$('#playreport').on('click', function() {
		switchPage('content-live.html'); //是否终止正在上传的文件
		//window.location = 'content-live.html'
		return false; //阻止冒泡
	})
	//媒资中心处理函数
	$('#media-pic').on('click', function() {
		switchPage('media-pic.html'); //是否终止正在上传的文件
		//window.location = 'media-pic.html';
		return false; //阻止冒泡
	})
	$('#media-video').on('click', function() {
		switchPage('media-video.html'); //是否终止正在上传的文件
		//window.location = 'media-video.html';
		return false; //阻止冒泡
	})
	$('#media-music').on('click', function() {
		switchPage('media-music.html'); //是否终止正在上传的文件
		//window.location = 'media-music.html';
		return false; //阻止冒泡
	})
	$('#media-file').on('click', function() {
		switchPage('media-file.html'); //是否终止正在上传的文件
		//window.location = 'media-file.html';
		return false; //阻止冒泡
	})
	//管理中心处理函数
	$('#manage-user').on('click', function() {
		switchPage('management-register.html'); //是否终止正在上传的文件
		//window.location = 'management-register.html';
		return false; //阻止冒泡
	})
	$('#manage-comment').on('click', function() {
		switchPage('management-comment.html'); //是否终止正在上传的文件
		//window.location = 'management-comment.html';
		return false; //阻止冒泡
	})
	$('#manage-manager').on('click', function() {
		switchPage('management-manage.html'); //是否终止正在上传的文件
		//window.location = 'management-manage.html';
		return false; //阻止冒泡
	})
	$('#manage-system').on('click', function() {
		switchPage('management-system.html'); //是否终止正在上传的文件
		//window.location = 'management-system.html';
		return false; //阻止冒泡
	})
}
//页面初始化
function init() {
	navClick(); //加在公共部分之后 才能绑定点击事件
	setCommpanyName(); //重新设置公司名称
	//设置右侧容器宽度
	$('#main > .right,#r-content>.top,#r-content1>.top,#r-content2>.top,#r-content2>.top2,#r-content3>.top').width($(window).width() - $('#nav-ul').width() - 33);
	$('#main > .right').css('min-height', $(window).height() - 100);
}
$(window).on('resize', function() {
	$('#main > .right,#r-content>.top,#r-content1>.top,#r-content2>.top,#r-content2>.top2,#r-content3>.top').width($(window).width() - $('#nav-ul').width() - 20);
	$('#main > .right').css('min-height', $(window).height() - 100);
})
//点击document 隐藏一些弹框
$(document).on('click', function() {
	$('.sel-dd').hide();
	$('#admin .list').hide();
	$('.moredo .dd').hide();
})

function getSize(size) {
	if(size > 1024 * 1024) {
		size = (Math.round(size / (1024 * 1024))).toString() + 'MB';
	} else {
		size = (Math.round(size / 1024)).toString() + 'KB';
	}
	return size;
}
//获取字符串长度（汉字算两个字符，字母数字算一个）
function getByteLen(val) {
	var len = 0;
	for(var i = 0; i < val.length; i++) {
		var a = val.charAt(i);
		if(a.match(/[^\x00-\xff]/ig) != null) {
			len += 1;
		} else {
			len += 1;
		}
	}
	return len;
}
/*顶部右侧头像start*/
$(document).on('click', '#backLogin', function() {
	window.location.href = '/logout';
})
$(document).on('click', '#admin', function() {
	$(this).find('.list').toggle();
})
//点击修改密码
$(document).on('click', '#modefiyPassword', function() {
	$('#modifiy-psw').show();
	$('#mark').show();
	$('#admin .list').hide();
	return false;
})
$(document).on('click', '#modifiy-psw,#admin', function() {
	return false;
})
/*顶部右侧头像end*/
//设置公司名称
function setCommpanyName() {
	$.ajax({
		type: "get",
		url: baseUrl + 'config/fullname',
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data != null && data.fullname != null) {
				//设置公司全称
				if(data.fullname != null) {
					$('#companyFullName').text(data.fullname);
				}
			}
		}
	});
}
//获取管理员Id
function getManageId() {
	$.ajax({
		type: "get",
		url: '/get_admin_info',
		dataType: 'json', //返回值类型 一般设置为json
		success: function(data) {
			if(data != null && data.item != null && data.item._id) {
				manageId = data.item._id;
				if(data.item['显示名称'] != null) {
					$('#admin>.list').before('<span></span>');
					$('#admin>span').text(data.item['显示名称']);
				}
			}
		}
	});
}
getManageId();
//提交修改密码
$(document).on('click', '#modifyPswSubmit', function() {
	var oldpsw = $('#oldpsw').val().trim();
	var newpswone = $('#newpswone').val().trim();
	var newpswtwo = $('#newpswtwo').val().trim();
	if(oldpsw == '') {
		errorTip('请输入旧密码');
		return
	}
	if(newpswone == '') {
		errorTip('请输入您的新密码');
		return
	}
	if(newpswtwo == '') {
		errorTip('请再次输入您的新密码不能为空');
		return
	}
	if(newpswtwo != newpswone) {
		errorTip('新密码与再次输入的新密码不匹配');
		return
	}
	var obj = {};
	obj.id = manageId;
	obj.old_passwd = oldpsw;
	obj.new_passwd = newpswtwo;
	$.ajax({
		type: "post",
		url: baseUrl + 'admin/update-passwd',
		dataType: 'json', //返回值类型 一般设置为json
		contentType: "application/json;charset=UTF-8",
		data: JSON.stringify(obj),
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data.success == 'OK') {
				errorTip('保存成功');
				$('#modifiy-psw,#mark').hide();
			}
		},
		error: function(data) {
			errorTip('输入的旧密码有错误')
		}
	});
})
//*取消修改密码*/
$(document).on('click', '#modifyPswCancel', function() {
	$('#modifiy-psw,#mark').hide();
})