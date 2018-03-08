var pagesize = 10;
var curpage = 1;
var starturl1;
var starturl2;
init(); //初始化页面
getLanguage(); //获取语言列表
/*看是否是从内容录入跳转过来的*/
var commentIconDataId = sessionStorage.getItem('commentIcon');
if(commentIconDataId != null) {
	sessionStorage.removeItem('commentIcon');
	starturl1 = baseUrl + 'comment?where={"内容ID":"' + commentIconDataId + '","语言":"' + defaultLang + '"}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
	starturl2 = baseUrl + 'comment?where={"内容ID":"' + commentIconDataId + '","语言":"' + defaultLang + '"}';
} else {
	starturl1 = baseUrl + 'comment?where={"语言":"' + defaultLang + '"}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
	starturl2 = baseUrl + 'comment?where={"语言":"' + defaultLang + '"}';
}
/*看是否是从内容录入跳转过来的*/
function getLanguage() {
	$.ajax({
		type: "get",
		url: baseUrl + "config/get_language",
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			console.log(data);
			if(data != null) {
				if(sessionStorage.getItem('defaultLang') == null) {
					sessionStorage.setItem('defaultLang', data.default);
				}
				$('.sel-lang .sel-dt').text(sessionStorage.getItem('defaultLang'));
				defaultLang = sessionStorage.getItem('defaultLang');
				$('.sel-lang .sel-dd').html('');
				$.each(data.items, function(i, e) {
					$('.sel-lang .sel-dd').append('<li>' + e + '</li>');
				});
				getCommentList(starturl1, starturl2);
			}
		}
	});
}
//选择语言
$('#sel-lang .sel-dt').click(function() {
	$(this).parent().find('.sel-dd').toggle();
	return false;
})
$('#sel-lang .sel-dd').on('click', 'li', function() {
	var $that = $(this);
	//设置选中语言勾选状态
	$.each($('#sel-lang .sel-dd').find('li'), function(i, e) {
		if($(this).text() == $that.text()) {
			$(this).addClass('active-bg').siblings().removeClass('active-bg');
		}
	});
	$('#sel-lang .sel-dt').text($(this).text());
	$(this).parent().hide();
	//存储选择后的语言	
	sessionStorage.setItem('defaultLang', $(this).text());
	defaultLang = sessionStorage.getItem('defaultLang');
	if(commentIconDataId != null) {
		sessionStorage.removeItem('commentIcon');
		starturl1 = baseUrl + 'comment?where={"内容ID":"' + commentIconDataId + '","语言":"' + defaultLang + '"}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		starturl2 = baseUrl + 'comment?where={"内容ID":"' + commentIconDataId + '","语言":"' + defaultLang + '"}';
	} else {
		starturl1 = baseUrl + 'comment?where={"语言":"' + defaultLang + '"}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		starturl2 = baseUrl + 'comment?where={"语言":"' + defaultLang + '"}';
	}
	//新建页或者编辑页 或取对应内容长度限制
	getCommentList(starturl1, starturl2);
	return false;
})

function getCommentList(url1, url2) {
	//全局变量
	var totalNum = null; //多少条数据
	$.ajax({
		type: "get",
		url: url1,
		headers: {
			"Authorization": "Basic " + auth
		},
		beforeSend: function() {
			$("body").append('<div id="loading" class="loader-inner ball-clip-rotate" style="position:fixed;top:0;left:0;bottom:0;right:0;background-color: #000;opacity: .6;z-index: 10002;"><div style="position:fixed;left:50%;top:50%;"></div></div>')
		},
		success: function(data) {
			if(data != null && data._items != null && data._items.length) {
				totalNum = data._meta.total;
				$('#managePage').remove(); //移除page容器
				$('#managePageParent').append('<div id="managePage"></div>'); //追加page容器
				pageUtil.initPage('managePage', {
					totalCount: totalNum, //总页数，一般从回调函数中获取。如果没有数据则默认为1页
					curPage: 1, //初始化时的默认选中页，默认第一页。如果所填范围溢出或者非数字或者数字字符串，则默认第一页
					showCount: 5, //分页栏显示的数量
					pageSizeList: [10, 20, 30, 40, 50], //自定义分页数，默认[5,10,15,20,50]
					defaultPageSize: pagesize, //默认选中的分页数,默认选中第一个。如果未匹配到数组或者默认数组中，则也为第一个
					isJump: true, //是否包含跳转功能，默认false
					isPageNum: true, //是否显示分页下拉选择，默认false
					isPN: true, //是否显示上一页和下一面，默认true
					isFL: true, //是否显示首页和末页，默认true
					jump: function(curPage, pageSize) { //跳转功能回调，传递回来2个参数，当前页和每页大小。如果没有设置分页下拉，则第二个参数永远为0。这里的this被指定为一个空对象，如果回调中需用到this请自行使用bind方法
						$.ajax({
							type: 'get',
							url: encodeURI(url2 + '&max_results=' + pageSize + '&page=' + curPage + '&sort=[("_created",-1)]'),
							dataType: 'json',
							headers: {
								"Authorization": "Basic " + auth
							},
							beforeSend: function() {
								$("body").append('<div id="loading" class="loader-inner ball-clip-rotate" style="position:fixed;top:0;left:0;bottom:0;right:0;background-color: #000;opacity: .6;z-index: 10002;"><div style="position:fixed;left:50%;top:50%;"></div></div>')
							},
							success: function(data) {
								$('#show_label em').text(data._meta.total);
								try {
									setHtml(data);
								} catch(e) {
									console.log(e);
								}
							},
							complete: function() {
								$('#loading').remove();
							},
							error: function(e) {
								console.log(e);
							}
						})
					},
				});
				try {
					setHtml(data);
				} catch(e) {
					console.log(e);
				}
			} else {
				$('#manageBody').html('<tr><td style="color:gray;font-size: 20px;text-align:center" colspan="6">查询无结果</td></tr>');
				$('#managePage').remove(); //移除page容器
			}
		},
		complete: function() {
			$('#loading').remove();
		},
		error: function(data) {

		}
	});
}

function setHtml(data) {
	var str;
	$('#manageBody').html('');
	$('#checkAll').prop("checked", false);
	$.each(data._items, function(i, e) {
		str = '<tr dataId=' + e._id + '>' +
			'<td data-toggle="tooltip"><input type="checkbox"></td>' +
			'<td data-toggle="tooltip"></td>' +
			'<td data-toggle="tooltip"></td>' +
			'<td data-toggle="tooltip"></td>' +
			'<td data-toggle="tooltip"></td>' +
			'<td data-toggle="tooltip"></td></tr>';
		$('#manageBody').append(str);
		if(e['用户名'] != null) {
			$('#manageBody').find('tr').eq(i).find('td').eq(1).text(e['用户名']);
			$('#manageBody').find('tr').eq(i).find('td').eq(1).attr('title', '用户名：' + e['用户名']);
		}
		if(e['标题'] != null) {
			$('#manageBody').find('tr').eq(i).find('td').eq(2).text(e['标题']);
			$('#manageBody').find('tr').eq(i).find('td').eq(2).attr('title', '标题：' + e['标题']);
		}
		if(e['类别'] != null) {
			if(e['类别'] == 'article') {
				e['类别'] = '文章';
			} else if(e['类别'] == 'gallery') {
				e['类别'] = '画廊';
			} else if(e['类别'] == 'video') {
				e['类别'] = '视频';
			} else if(e['分类'] == 'music') {
				e['类别'] = '音乐';
			} else if(e['类别'] == 'subject') {
				e['类别'] = '专题';
			} else if(e['类别'] == 'book') {
				e['类别'] = '图书杂志';
			} else if(e['类别'] == 'live') {
				e['类别'] = '直播频道';
			}
			$('#manageBody').find('tr').eq(i).find('td').eq(3).text(e['类别']);
			$('#manageBody').find('tr').eq(i).find('td').eq(3).attr('title', '类别：' + e['类别'])
		}
		if(e['评论内容'] != null) {
			$('#manageBody').find('tr').eq(i).find('td').eq(4).html(replace_em(e['评论内容']));
			$('#manageBody').find('tr').eq(i).find('td').eq(4).attr('title', '评论内容：' + replace_em(e['评论内容']))
		}
		if(e._created != null) {
			$('#manageBody').find('tr').eq(i).find('td').eq(5).text(e._created);
			$('#manageBody').find('tr').eq(i).find('td').eq(5).attr('title', '注册日期：' + e._created);
		}
		//判断是否屏蔽
		if(e['屏蔽'] == true) {
			$('#manageBody').find('tr').eq(i).css('background-color', '#ccc');
		} else {
			$('#manageBody').find('tr').eq(i).css('background-color', '#fff');
		}
	});
}
getCommentList(starturl1, starturl2); //渲染列表页
//批量筛选
$('#more-select .dt').click(function() {
	$(this).parent().find('.list').toggle();
	$('#more-shield .list').hide();
	return false;
})
//批量筛选
$('#more-select .list-item').click(function() {
	var value = $(this).attr('dataId');
	var url1;
	var url2;
	if(commentIconDataId != null) {
		url1 = baseUrl + 'comment?where={"内容ID":"' + commentIconDataId + '","语言":"' + defaultLang + '","屏蔽":' + value + '}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'comment?where={"内容ID":"' + commentIconDataId + '","语言":"' + defaultLang + '","屏蔽":' + value + '}';
	} else {
		url1 = baseUrl + 'comment?where={"屏蔽":' + value + ',"语言":"' + defaultLang + '"}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'comment?where={"屏蔽":' + value + ',"语言":"' + defaultLang + '"}';
	}
	getCommentList(url1, url2); //渲染列表页
	$(this).parent().hide();
	return false;
})
//批量屏蔽
$('#more-shield .dt').click(function() {
	$(this).parent().find('.list').toggle();
	$('#more-select .list').hide();
	return false;
})
$('#more-shield .list>div').click(function() {
	//获取要操作文章的id列表
	$(this).parent().hide();
	var obj = {};
	var dataIdList = [];
	var $inputChecked = $("#manageBody input:checked")
	if($inputChecked.length) {
		var wayValue = $(this).attr('dataId'); //获取批量操作项设置的布尔值
		if(wayValue == 'true') {
			wayValue = true;
		} else if(wayValue == 'false') {
			wayValue = false;
		}
		$.each($inputChecked, function(i, e) {
			dataIdList.push($(this).parent().parent().attr('dataId'));
		});
		obj.id = dataIdList;
		obj['屏蔽'] = wayValue;
		console.log(obj);
		//发送请求
		$.ajax({
			type: "post",
			url: baseUrl + 'comment/batch-update', //用于文件上传的服务器端请求地址
			dataType: 'json', //返回值类型 一般设置为json
			contentType: "application/json;charset=UTF-8",
			data: JSON.stringify(obj),
			headers: {
				"Authorization": "Basic " + auth
			},
			success: function(data) //服务器成功响应处理函数
			{
				if(data.success == 'OK') {
					getCommentList(starturl1, starturl2); //渲染列表页
				}
			},
			error: function(data, status, e) //服务器响应失败处理函数
			{
				errorTip(e);
			}
		})

	} else {
		errorTip('请勾选要进行批量操作的')
	}

	//获取置顶或推荐或评论或屏蔽的boolean值

	return false;
})
$(document).on('click', function() {
	$('#more-shield .list,#more-select .list').hide()
})
//点击全选按钮
$('#checkAll').click(function() {
	$('#manageBody input').prop("checked", $(this).prop("checked"));
})
//点击行checkbox按钮
$('#manageBody').on('click', 'input', function() {
	$('#checkAll').prop("checked", $('#manageBody input').length === $("#manageBody input:checked").length);
})
//搜索
$('#search s').click(function() {
	var iptVal = $('#search input').val();
	var searchUrl1;
	var searchUrl2;
	if(iptVal.trim() != '') {
		if(commentIconDataId != null) {
			searchUrl1 = baseUrl + 'comment?where={"内容ID":"' + commentIconDataId + '","语言":"' + defaultLang + '","$or":[{"用户名":"' + iptVal + '"},{"标题":{"$regex":"' + iptVal + '"}}]},{"类别":{"$regex":"' + iptVal + '"}]}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
			searchUrl2 = baseUrl + 'comment?where={"内容ID":"' + commentIconDataId + '","语言":"' + defaultLang + '","$or":[{"用户名":"' + iptVal + '"},{"标题":{"$regex":"' + iptVal + '"}}]},{"类别":{"$regex":"' + iptVal + '"}]}'
		} else {
			searchUrl1 = baseUrl + 'comment?where={"$or":[{"用户名":"' + iptVal + '"},{"标题":{"$regex":"' + iptVal + '"}},{"类别":{"$regex":"' + iptVal + '"}}],"语言":"' + defaultLang + '"}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
			searchUrl2 = baseUrl + 'comment?where={"$or":[{"用户名":"' + iptVal + '"},{"标题":{"$regex":"' + iptVal + '"}},{"类别":{"$regex":"' + iptVal + '"}}],"语言":"' + defaultLang + '"}'
		}
		getCommentList(searchUrl1, searchUrl2)
	} else {
		getCommentList(starturl1, starturl2)
	}
})
//日期查询
$('#byTime').click(function() {
	var time = $('#time').val().trim();
	var url1, url2;
	if(time == '') {
		errorTip('请选择时间');
	} else {
		if(commentIconDataId != null) {
			url1 = baseUrl + 'comment?where={"内容ID":"' + commentIconDataId + '","语言":"' + defaultLang + '","_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
			url2 = baseUrl + 'comment?where={"内容ID":"' + commentIconDataId + '","语言":"' + defaultLang + '","_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}';
		} else {
			url1 = baseUrl + 'comment?where={"_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"},"语言":"' + defaultLang + '"}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
			url2 = baseUrl + 'comment?where={"_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"},"语言":"' + defaultLang + '"}';
		}
		getCommentList(url1, url2)
	}
})

function replace_em(str) {

	str = str.replace(/\</g, '&lt;');

	str = str.replace(/\>/g, '&gt;');

	str = str.replace(/\n/g, '<br/>');

	str = str.replace(/\[em_([0-9]*)\]/g, '<img src="img/arclist/$1.gif" border="0" />');

	return str;

}