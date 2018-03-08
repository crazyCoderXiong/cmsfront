var pagesize = 10;
var curpage = 1;
init(); //初始化页面
var starturl1 = baseUrl + 'admin?max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
var starturl2 = baseUrl + 'admin?';
var lang = '简体中文';

function setHtml(data) {
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
			'<td><s class="icon4" data-toggle="tooltip" title="编辑"></s><s class="icon3" data-toggle="tooltip" title="删除"></s></td></tr>';
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
		var index = i;
		var $select = $('#manageBody').find('tr').eq(i).find('td').eq(5);
		var power = '';
		if(e['权限'] != null && e['权限'].length) {
			$.each(e['权限'], function(i, e) {
				power += e + ' ';
				$select.append('<span>' + e + '&nbsp;&nbsp;</span>');
			});
		}
		$select.attr('title', '权限：' + power)
	});
	console.log(data);
}

function getAdminList(url1, url2) {
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
				$('#manageBody').html('<tr><td style="color:gray;font-size: 20px;text-align:center" colspan="7">查询无结果</td></tr>');
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
getAdminList(starturl1, starturl2); //渲染列表页

//点击全选按钮
var dataIdMore = [];
$('#checkAll').click(function() {
	$('#manageBody input').prop("checked", $(this).prop("checked"));
	dataIdMore = []; //要删除文章的id
	$.each($('#manageBody input'), function(i, e) {
		if($(this).get(0).checked) {
			var id = $(this).parent().parent().attr('dataId')
			dataIdMore.push(id);
		}
	});
	console.log(dataIdMore)
})
//点击行checkbox按钮
$('#manageBody').on('click', 'input', function() {
	$('#checkAll').prop("checked", $('#manageBody input').length === $("#manageBody input:checked").length);
	dataIdMore = []; //要删除文章的id
	$.each($('#manageBody input'), function(i, e) {
		if($(this).get(0).checked) {
			var id = $(this).parent().parent().attr('dataId')
			dataIdMore.push(id);
		}
	});
	console.log(dataIdMore)
})
//批量删除
$('#delMore').click(function() {
	if(confirm('确定要删除')) {
		$.ajax({
			type: "post",
			data: JSON.stringify({
				id: dataIdMore
			}),
			dataType: 'json',
			contentType: "application/json;charset=UTF-8",
			url: baseUrl + 'admin/batch-delete',
			headers: {
				"Authorization": "Basic " + auth
			},
			success: function(data) {
				if(data.success == 'OK') {
					errorTip('删除成功');
					getAdminList(starturl1, starturl2); //刷新列表
				}
			},
			error: function() {
				errorTip('删除失败')
			}
		});
	}
})
//搜索
$('#search').click(function() {
	var iptVal = $('.search input').val();
	///admin?where={“$or”:[{“用户名”:{“$regex”:变量}},{“权限”:变量}]} 按照用户名或者权限模糊查询
	if(iptVal.trim()) {
		var searchUrl1 = baseUrl + 'admin?where={"$or":[{"用户名":{"$regex":"' + iptVal + '"}},{"权限":"' + iptVal + '"}]}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		var searchUrl2 = baseUrl + 'admin?where={"$or":[{"用户名":{"$regex":"' + iptVal + '"}},{"权限":"' + iptVal + '"}]}'
		getAdminList(searchUrl1, searchUrl2)
	} else {
		getAdminList(starturl1, starturl2)
	}
})
//点击取消编辑弹框隐藏
$('#editBuiltManagerCancel').click(function() {
	$('#editBuiltManager').hide()
})
//点击确定，进行验证，刷新页面
var editData;
var dataIndex;
$('#editBuiltManagerSure').click(function() {
	var user = $('#edit-user').val().trim();
	var showName = $('#edit-showname').val().trim();
	var email = $('#edit-email').val().trim();
	var phone = $('#edit-phone').val().trim();
	var selected = [];
	$.each($('#edit-select li'), function(i, e) {
		if($(this).hasClass('current')) {
			selected.push($(this).text())
		}
	})
	var obj = {};
	//验证用户名
	if(getByteLen(user) >= 2 && getByteLen(user) <= 8) {
		userTip = true;
		obj['用户名'] = user;
	} else {
		userTip = false;
		errorTip('用户名 的长度在2-8之间');
		return
	}
	if(showName != '' && showName.length) {
		if(getByteLen(showName) >= 2 && getByteLen(showName) <= 8) {
			obj['显示名称'] = showName;
		} else {
			errorTip('显示名称的长度在2-8之间或者为空');
			return
		}
	} else {
		obj['显示名称'] = user;
	}
	//验证邮箱
	if(email != '') {
		if(!isEmail(email)) {
			errorTip('您输入的邮箱格式有误');
			return
		} else {
			obj['邮箱'] = email;
		}
	}
	//验证手机号
	if(phone != '') {
		if(phone.length == 11 && /^1\d{10}$/.test(phone)) {
			obj['手机号'] = phone;
		} else if(phone.length > 0 && phone.length < 11) {
			errorTip('手机号位数少于11位');
			return;
		} else if(phone.length > 11) {
			errorTip('手机号位数大于11位');
			return;
		} else if(!/^1\d{10}$/.test(phone)) {
			errorTip('不符合手机号规则');
			return;
		}
	}
	//验证权限
	if(selected.length >= 1) {
		obj['权限'] = selected;
	} else {
		errorTip('用户至少有一个权限');
		return
	}
	obj['默认语言'] = lang;
	editData = obj;
	console.log(obj)
	$.ajax({
		type: "patch",
		url: baseUrl + 'admin/' + dataIndex,
		headers: {
			"Authorization": "Basic " + auth
		},
		dataType: 'json', //返回值类型 一般设置为json
		contentType: "application/json;charset=UTF-8",
		data: JSON.stringify(obj),
		success: function(data) {
			if(data._status == 'OK') {
				errorTip('编辑成功');
				$('#edit-user').val('');
				$('#edit-showname').val('');
				$('#edit-email').val('');
				$('#edit-phone').val('');
				$('.builtManager').hide(); //关闭弹框
				getAdminList(starturl1, starturl2); //刷新列表
			}
		},
		error: function() {
			errorTip('编辑失败');
		}
	});
})
//单个查询
$('.manage-manage-table').on('click', '.icon4', function() {
	dataIndex = $(this).parent().parent().attr('dataId');
	$.ajax({
		type: "get",
		url: baseUrl + 'admin/' + $(this).parent().parent().attr('dataId'),
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			$('#editBuiltManager').show();
			editData = data;
			//用户名
			if(data['用户名'] != null) {
				$('#edit-user').val(data['用户名']);
			}
			//显示名称
			if(data['显示名称'] != null) {
				$('#edit-showname').val(data['显示名称']);
			}
			//邮箱
			if(data['邮箱'] != null) {
				$('#edit-email').val(data['邮箱']);
			}
			//手机号
			if(data['手机号'] != null) {
				$('#edit-phone').val(data['手机号']);
			}
			//设置权限前清空权限选中样式
			$.each($('#edit-select li'), function(i, e) {
				if($(this).hasClass('current')) {
					$(this).removeClass('current');
				}
			})
			//权限
			$.each($('#edit-select li'), function(i, e) {
				var $this = $(this);
				$.each(data['权限'], function(i, e) {
					if(e == $this.text()) {
						$this.addClass('current');
						return false;
					}
				});
			})
		},
		error: function() {
			errorTip('查询失败')
		}
	});
})
//单个删除
$('.manage-manage-table').on('click', '.icon3', function() {
	console.log($(this).parent().parent().attr('dataId'));
	if(confirm('确定要删除这行')) {
		$.ajax({
			type: "delete",
			url: baseUrl + 'admin/' + $(this).parent().parent().attr('dataId'),
			headers: {
				"Authorization": "Basic " + auth
			},
			success: function(data) {
				errorTip('删除成功');
				getAdminList(starturl1, starturl2); //刷新列表				
			},
			error: function() {
				errorTip('删除失败')
			}
		});
	}
})
//创建管理员
$('#built').click(function() {
	$('#newBuiltManager').toggle();
})
//点击取消
$('#newBuiltManagerCancel').click(function() {
	$('#newBuiltManager').hide();
})
//创建管理员用户名输入框失去焦点的时候判断显示名称是否为空 为空的时候将用户名的值作为显示名称的值
$('#new-user').blur(function() {
	if($('#new-showname').val().trim() == '') {
		$('#new-showname').val($('#new-user').val());
	}
})
//点击确定
$('#newBuiltManagerSure').click(function() {
	var user = $('#new-user').val().trim();
	var showName = $('#new-showname').val().trim();
	var email = $('#new-email').val().trim();
	var phone = $('#new-phone').val().trim();
	var selected = [];
	$.each($('#new-select li'), function(i, e) {
		if($(this).hasClass('current')) {
			selected.push($(this).text())
		}
	});
	var psw = $('#new-psw').val().trim();
	var obj = {};
	//验证用户名
	if(getByteLen(user) >= 2 && getByteLen(user) <= 8) {
		obj['用户名'] = user;
	} else {
		errorTip('用户名 的长度在2-8之间');
		return
	}
	if(showName != null && showName.length) {
		if(getByteLen(showName) >= 2 && getByteLen(showName) <= 8) {
			obj['显示名称'] = showName;
		} else {
			errorTip('显示名称的长度在2-8之间或者为空');
			return
		}
	} else {
		obj['显示名称'] = user;
	}
	//验证邮箱
	if(email != '') {
		if(!isEmail(email)) {
			errorTip('您输入的邮箱格式有误');
			return
		} else {
			obj['邮箱'] = email;
		}
	}
	//验证手机号
	if(phone != '') {
		if(phone.length == 11 && /^1\d{10}$/.test(phone)) {
			obj['手机号'] = phone;
		} else if(phone.length > 0 && phone.length < 11) {
			errorTip('手机号位数少于11位');
			return;
		} else if(phone.length > 11) {
			errorTip('手机号位数大于11位');
			return;
		} else if(!/^1\d{10}$/.test(phone)) {
			errorTip('不符合手机号规则');
			return;
		}
	}
	//验证密码
	if(getByteLen(psw) >= 2 && getByteLen(psw) <= 50) {
		obj['密码'] = psw;
	} else {
		errorTip('密码的长度在2-50之间');
		return
	}
	//验证权限
	if(selected.length >= 1) {
		obj['权限'] = selected;
	} else {
		errorTip('用户至少有一个权限');
		return
	}
	obj['默认语言'] = lang;
	console.log(obj);
	$.ajax({
		type: "post",
		url: baseUrl + 'admin',
		headers: {
			"Authorization": "Basic " + auth
		},
		data: JSON.stringify(obj),
		dataType: 'json',
		contentType: "application/json;charset=UTF-8",
		success: function(data) {
			if(data._status == 'OK') {
				errorTip('创建成功');
				$('.builtManager').hide(); //关闭弹框
				getAdminList(starturl1, starturl2); //刷新列表
				clearNew(); //清空创建列表
			}
		},
		error: function() {
			errorTip('创建失败');
		}
	});
})

function isEmail(str) {
	var reg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
	return reg.test(str);
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

function clearNew() {
	$('#new-user').val('');
	$('#new-email').val('');
	$.each('#new-select li', function(i, e) {
		if($(this).hasClass('current')) {
			$(this).removeClass('current')
		}
	});
	$('#new-psw').val('');
}
//日期查询
$('#byTime').click(function() {
	var time = $('#time').val().trim();
	var url1, url2;
	if(time == '') {
		errorTip('请选择时间');
	} else {
		url1 = baseUrl + 'admin?where={"_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'admin?where={"_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}';
		getAdminList(url1, url2)
	}
})
//点击选择权限
$('#new-select li,#edit-select li').click(function() {
	$(this).toggleClass('current')
})