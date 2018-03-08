var pagesize = 10;
var curpage = 1;
init(); //初始化页面
var starturl1 = baseUrl + 'members?max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
var starturl2 = baseUrl + 'members?';

function setHtml(data, strHtml) {
	var str;
	$('#manageBody').html('');
	$.each(data._items, function(i, e) {
		str = '<tr dataId=' + e._id + '>' +
			'<td><input type="checkbox"></td>' +
			'<td data-toggle="tooltip"></td>' +
			'<td data-toggle="tooltip"></td>' +
			'<td data-toggle="tooltip"></td>' +
			'<td data-toggle="tooltip"></td>' +
			'<td data-toggle="tooltip"></td>' +
			'<td data-toggle="tooltip"></td>' +
			'<td><s class="icon11 lock"></s><s class="icon22 comment"></s><s class="icon3" data-toggle="tooltip" title="删除"></s></td>';
		var index = i; //当前行位置
		$('#manageBody').append(str);
		if(e['用户名'] != null) {
			$('#manageBody').find('tr').eq(i).find('td').eq(1).text(e['用户名']);
			$('#manageBody').find('tr').eq(i).find('td').eq(1).attr('title', '用户名：' + e['用户名']);
		}
		if(e['邮箱'] != null) {
			$('#manageBody').find('tr').eq(i).find('td').eq(2).text(e['邮箱']);
			$('#manageBody').find('tr').eq(i).find('td').eq(2).attr('title', '邮箱：' + e['邮箱']);
		}
		if(e['手机号'] != null) {
			$('#manageBody').find('tr').eq(i).find('td').eq(3).text(e['手机号']);
			$('#manageBody').find('tr').eq(i).find('td').eq(3).attr('title', '手机号：' + e['手机号']);
		}
		if(e._created != null) {
			$('#manageBody').find('tr').eq(i).find('td').eq(4).text(e._created);
			$('#manageBody').find('tr').eq(i).find('td').eq(4).attr('title', '注册日期：' + e._created);
		}
		if(e['会员身份'] != null) {
			$('#manageBody').find('tr').eq(i).find('td').eq(5).text(e['会员身份']);
			$('#manageBody').find('tr').eq(i).find('td').eq(5).attr('title', '会员身份：' + e['会员身份']);
		}
		var $select = $('#manageBody').find('tr').eq(i).find('td').eq(6);
		var power = '';
		$.each(e['权限'], function(i, e) {
			power += e + ' ';
			$select.append('<span>' + e + '&nbsp;&nbsp;</span>');
			if(e == '登录') {
				$('#manageBody').find('tr').eq(index).find('td').eq(7).find('s').eq(0).removeClass('icon11').addClass('icon1');
			}
			if(e == '评论') {
				$('#manageBody').find('tr').eq(index).find('td').eq(7).find('s').eq(1).removeClass('icon22').addClass('icon2');
			}
		});
		$select.attr('title', '权限：' + power);
		if($('#manageBody').find('tr').eq(index).find('td').eq(7).find('s').eq(0).hasClass('icon1')) {
			$('#manageBody').find('tr').eq(index).find('td').eq(7).find('s').eq(0).attr('title', '激活状态')
		} else {
			$('#manageBody').find('tr').eq(index).find('td').eq(7).find('s').eq(0).attr('title', '冻结状态')
		}
		if($('#manageBody').find('tr').eq(index).find('td').eq(7).find('s').eq(1).hasClass('icon2')) {
			$('#manageBody').find('tr').eq(index).find('td').eq(7).find('s').eq(1).attr('title', '允许评论')
		} else {
			$('#manageBody').find('tr').eq(index).find('td').eq(7).find('s').eq(1).attr('title', '禁止评论')
		}
	});
}

function getMembersList(url1, url2) {
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
				$('#manageBody').html('<tr><td style="color:gray;font-size: 20px;text-align:center" colspan="8">查询无结果</td></tr>');
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
getMembersList(starturl1, starturl2); //渲染列表页
//点击全选按钮
$('#checkAll').click(function() {
	$('#manageBody input').prop("checked", $(this).prop("checked"));
})
//点击行checkbox按钮
$('#manageBody').on('click', 'input', function() {
	$('#checkAll').prop("checked", $('#manageBody input').length === $("#manageBody input:checked").length);
})

//日期查询
$('#byTime').click(function() {
	var time = $('#time').val().trim();
	var url1, url2;
	if(time == '') {
		errorTip('请选择时间');
	} else {
		url1 = baseUrl + 'members?where={"_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'members?where={"_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}';
		getMembersList(url1, url2)
	}
})
//列表页批量操作
/*$('.moredo .dt').click(function(e) {
	$('.moredo .dd').toggle();
	return false;
})*/
$('.son1,.son2,.son3,.son4,.son5').click(function(e) {
	$(this).parent().hide();
	var obj = {};
	var dataIdList = [];
	var $inputChecked = $("#manageBody input:checked")
	if($inputChecked.length) {
		var wayName = $(this).text(); //获取批量操作项名称
		$.each($inputChecked, function(i, e) {
			dataIdList.push($(this).parent().parent().attr('dataId'));
		});
		obj.id = dataIdList;
		obj[wayName] = true;
		console.log(obj);
		doMore(obj); //批量操作
	} else {
		errorTip('请勾选要进行批量操作的')
	}
	return false;
})
$('.son6').mouseover(function() {
	$(this).addClass('active-orange').find('.son').show()
}).mouseout(function() {
	$(this).removeClass('active-orange').find('.son').hide()
})
$('#levelList').on('click', 'div', function() {
	$(this).parents('.moredo .dd').hide();
	var obj = {};
	var dataIdList = [];
	var $inputChecked = $("#manageBody input:checked")
	if($inputChecked.length) {
		$.each($inputChecked, function(i, e) {
			dataIdList.push($(this).parent().parent().attr('dataId'));
		});
		obj.id = dataIdList;
		obj['会员级别'] = parseInt($(this).attr('dataLevel'));
		obj['级别名称'] = $(this).text();
		doMore(obj); //批量操作
	} else {
		errorTip('请勾选要进行批量操作的')
	}
	return false;
})
//获取级别列表
function getLevelList() {
	$.ajax({
		type: "get",
		url: baseUrl + 'config/get_members_level',
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data.items != null) {
				$('#levelList').html('');
				$.each(data.items, function(i, e) {
					$('#levelList').append('<div dataLevel=' + e['级别'] + '>' + e['名称'] + '</div>')
				});
			}
		}
	});
}
getLevelList()

function doMore(obj) {
	//发送请求
	$.ajax({
		type: "post",
		url: baseUrl + 'members/batch-update', //用于文件上传的服务器端请求地址
		dataType: 'json', //返回值类型 一般设置为json
		contentType: "application/json;charset=UTF-8",
		data: JSON.stringify(obj),
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) //服务器成功响应处理函数
		{
			if(data.success == 'OK') {
				getMembersList(starturl1, starturl2); //渲染列表页
			}
		},
		error: function(data, status, e) //服务器响应失败处理函数
		{
			errorTip(e);
		}
	})
}
//搜索
$('.search s').click(function() {

	var iptVal = $('.search input').val();
	///admin?where={“$or”:[{“用户名”:{“$regex”:变量}},{“权限”:变量}]} 按照用户名或者权限模糊查询
	if(iptVal.trim()) {
		var searchUrl1 = baseUrl + 'members?where={"$or":[{"用户名":{"$regex":"' + iptVal + '"}},{"权限":"' + iptVal + '"}]}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		var searchUrl2 = baseUrl + 'members?where={"$or":[{"用户名":{"$regex":"' + iptVal + '"}},{"权限":"' + iptVal + '"}]}'
		getMembersList(searchUrl1, searchUrl2)
	} else {
		getMembersList(starturl1, starturl2)
	}
})
//点击锁按钮
$('#manageBody').on('click', '.lock', function() {
	var wayName;
	var obj = {};
	var dataIdList = [];
	dataIdList.push($(this).parent().parent().attr('dataId'));
	obj.id = dataIdList;
	if($(this).hasClass('icon1')) {
		//冻结		
		$(this).removeClass('icon1').addClass('icon11').attr('title', '冻结状态');
		wayName = '冻结';
	} else {
		$(this).removeClass('icon11').addClass('icon1').attr('title', '激活状态');
		wayName = '激活';
	}
	obj[wayName] = true;
	doMore(obj); //批量操作
	return false;
})
//点击评论按钮
$('#manageBody').on('click', '.comment', function() {
	var wayName;
	var obj = {};
	var dataIdList = [];
	dataIdList.push($(this).parent().parent().attr('dataId'));
	obj.id = dataIdList;
	if($(this).hasClass('icon2')) {
		//禁止评论		
		$(this).removeClass('icon2').addClass('icon22').attr('title', '禁止评论');
		wayName = '禁止评论';
	} else {
		//可以评论
		$(this).removeClass('icon22').addClass('icon2').attr('title', '允许评论');
		wayName = '可以评论';
	}
	obj[wayName] = true;
	doMore(obj); //批量操作
	return false;
})
//点击删除按钮
$('#manageBody').on('click', '.icon3', function() {
	var wayName = '删除';
	var obj = {};
	var dataIdList = [];
	var $inputChecked = $("#manageBody input:checked")
	if($inputChecked.length) {
		$.each($inputChecked, function(i, e) {
			dataIdList.push($(this).parent().parent().attr('dataId'));
		});
		obj.id = dataIdList;
		obj[wayName] = true;
		doMore(obj); //批量操作
	} else {
		errorTip('请勾选要进行批量操作的')
	}
	return false;
})
//筛选
var filterOne = false,
	filterTwo = false,
	filterThree = false,
	filterFour = false;
$('#filterOne').click(function() {
	if($(this).hasClass('filter-way1')) {
		$(this).removeClass('filter-way1').addClass('filter-way11');
		filterOne = false;
	} else {
		$(this).removeClass('filter-way11').addClass('filter-way1');
		filterOne = '大众会员';
	}
	getMembersFilterList();
})
$('#filterTwo').click(function() {
	if($(this).hasClass('filter-way2')) {
		$(this).removeClass('filter-way2').addClass('filter-way22');
		filterTwo = false;
	} else {
		$(this).removeClass('filter-way22').addClass('filter-way2');
		filterTwo = '黄金会员';
	}
	getMembersFilterList();
})
$('#filterThree').click(function() {
	if($(this).hasClass('filter-way3')) {
		$(this).removeClass('filter-way3').addClass('filter-way33');
		filterThree = false;
	} else {
		$(this).removeClass('filter-way33').addClass('filter-way3');
		filterThree = '铂金会员';
	}
	getMembersFilterList();
})
$('#filterFour').click(function() {
	if($(this).hasClass('filter-way4')) {
		$(this).removeClass('filter-way4').addClass('filter-way44');
		filterFour = false;
	} else {
		$(this).removeClass('filter-way44').addClass('filter-way4');
		filterFour = '钻石会员';
	}
	getMembersFilterList();
})

function getMembersFilterList() {
	//[{"会员身份":"大众会员" },{"会员身份":"黄金会员" },{"会员身份":"铂金会员" },{"会员身份":"钻石会员" }];
	var listFilterObj = [];
	if(filterOne != false) {
		listFilterObj.push({
			'会员身份': filterOne
		})
	}
	if(filterTwo != false) {
		listFilterObj.push({
			'会员身份': filterTwo
		})
	}
	if(filterThree != false) {
		listFilterObj.push({
			'会员身份': filterThree
		})
	}
	if(filterFour != false) {
		listFilterObj.push({
			'会员身份': filterFour
		})
	}
	var url1, url2;
	if(listFilterObj.length) {
		url1 = baseUrl + 'members?where={"$or":' + JSON.stringify(listFilterObj) + '}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'members?where={"$or":' + JSON.stringify(listFilterObj) + '}';
		getMembersList(url1, url2)
	} else {
		getMembersList(starturl1, starturl2);
	}

}