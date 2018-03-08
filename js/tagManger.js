var pagesize = 20;
var curpage = 1;
var flag = '常用'; //默认常用   主要是为了区分删除标签的时候  该发送哪个接口
var containTag = []; //放要删除标签名称的名称
var newContainTag = [];
var baseUrl = '/api/'; //url前缀

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

function tagSureAjax(val) {
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
				$('#sureValue').val('');
				containTag.push(val);
				$('#del-tag').append('<li>' + val + '<span class="del"></span></li>');
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			flashAlert($("#flashalert"),'添加失败,可能标签已经存在');

		}
	});
}
$(document).on('keypress','#sureValue', function(event) {
	if(event.keyCode == "13") {
		$('#isure').trigger('click');
	}
});
$(document).on('keypress','#searInput', function(event) {
	if(event.keyCode == "13") {
		$('#search').trigger('click');
	}
});
//弹出框选择输入完确认按钮
$(document).on('click','#isure',function() {
	var val = $('#sureValue').val();
	if(val && val.length && val.trim() == '') {
		alert('请输入要添加的标签');
		return;
	}
	var len = getByteLen(val);
	if(len >= 2 && len <= 6) {
		//判断容器是否存在与添加的标签值相等
		if($('#del-tag li').length) {
			var exist = false;
			$.each($('#del-tag li'), function(i, e) {
				if($(this).text() == val.trim()) {
					exist = true;
					flashAlert($("#flashalert"),'添加的标签已经存在');
					return;
				}
			})
			if(!exist) {
				tagSureAjax(val);
			}
		} else {
			tagSureAjax(val);
		}
	} else {
		$('#sureValue').val('');
		flashAlert($("#flashalert"),'添加标签的字符长度不在2-6之间');
	}
})
//单击删除按钮事件
$(document).on('click', '#del-tag .del', function(e) {
	var data = $(this).parent().text();
	if(containTag.length) {
		newContainTag = [];
		$.each(containTag, function(i, e) {
			if(data == e) {
				return;
			} else {
				newContainTag.push(e);
			}
		});
	}
	containTag = newContainTag;
	console.log(containTag, newContainTag);
	$(this).parent().remove();
	return false;
})
$(document).on('mouseover', '#del-tag li', function(e) {
	$(this).find('.del').show();
	return false;
})
$(document).on('mouseout', '#del-tag li', function(e) {
	$(this).find('.del').hide();
	return false;
})
//全部查询 标签名称
function getAllTag() {
	$('#tree2').html(''); //清空容器
	var url1 = baseUrl + 'tag?where={"引用次数":{"$gte":1}}&sort=[("引用次数",-1)]&max_results=' + pagesize + '&page=' + curpage;
	var url2 = baseUrl + 'tag?where={"引用次数":{"$gte":1}}&sort=[("引用次数",-1)]';
	tagAjax(url1, url2);
}
//getAllTag(); //查询所有的标签	
//点击英文字母  拼音查询对应的标签
var spellArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
$(document).on('click', '#spell span', function() {
	var data = spellArr[$(this).index()]; //获取当前点击的关联词
	flag = data;
	//	console.log(flag);
	var url1 = encodeURI(baseUrl + 'tag?where={"拼音": {"$regex":"^' + data + '","$options": "i"}}&sort=[("_created",-1)]&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]');
	var url2 = baseUrl + 'tag?where={"拼音": {"$regex":"^' + data + '","$options": "i"}}&sort=[("_created",-1)]';
	$(this).addClass('active-orange').siblings().removeClass('active-orange').end().parent().siblings().removeClass('active-orange'); //点击高亮显示排他
	$('#tree2').html(''); //清空容器
	tagAjax(url1, url2);
})

//关键字查询标签  ,点击搜索按钮
$(document).on('click', '#search', function() {
	var data = $('#searInput').val(); //文本框值
	$('#tree2').html(''); //清空容器	
	$('#use,#spell span').removeClass('active-orange'); //移出常用或者拼音字母高亮 
	flag = '关键字';
	var url1 = encodeURI(baseUrl + 'tag?where={"$or":[{"标签名称":{"$regex":"' + data + '"}},{"拼音":{"$regex":"' + data + '"}}]}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]');
	var url2 = baseUrl + 'tag?where={"$or":[{"标签名称":{"$regex":"' + data + '"}},{"拼音":{"$regex":"' + data + '"}}]}';
	tagAjax(url1, url2);
})

//左侧树目录初始化
var ztreeArr = [],
	className, curDragNodes;
var setting = {
	view: {
		selectedMulti: false
	},
	edit: {
		enable: true,
		showRemoveBtn: true,
		showRenameBtn: false
	},
	data: {
		simpleData: {
			enable: true
		}
	},
	callback: {
		beforeRemove: zTreebeforeRemove2, //删除目录之前进行的操作
		onRemove: zTreeOnRemove2, //删除的时候进行的操作
		onClick: zTreeOnClick2,
		beforeDrag: zTreeBeforeDrag2 //在拖拽之前禁止所有的树目录之间的拖拽
	}
};
//禁止内部进行拖拽
function zTreeBeforeDrag2(treeId, treeNodes) {
	return false;
};
//删除之前操作
function zTreebeforeRemove2(treeId, treeNode) {
	var con = confirm("Confirm delete node '" + treeNode.name + "' it?")
	return con
}
//删除事件
function zTreeOnRemove2(event, treeId, treeNode) {
	deleteOneTag(treeNode.dataId);
}
//点击事件
function zTreeOnClick2(event, treeId, treeNode) {
	$('#'+treeNode.tId+'_remove').hide();//隐藏树上删除按钮
	for(var i = 0; i < containTag.length; i++) {
		if(treeNode.name == containTag[i]) {
			flashAlert($("#flashalert"),'不能添加相同标签');
			return; //如果已经找到重复的 不需要在比较了  直接return
		}
	}
	containTag.push(treeNode.name);
	$('#del-tag').append($('<li>' + treeNode.name + '<span class="del"></span></li>')); //装载删除标签的容器
	console.log(containTag, newContainTag);
};
function setTagHtml(data) {
	$('#searInput').val('');
	ztreeArr = [];
	$('#tree2').html(''); //清空容器
	$.each(data, function(i, e) {
		var obj = {
			id: 1,
			pId: 0,
			name: "parent node 1",
			open: false,
			dataId: 0
		};
		obj.name = e['标签名称'];
		obj.id = i + 1;
		obj.dataId = e._id;
		ztreeArr.push(obj);
	})
	$.fn.zTree.init($('#tree2'), setting, ztreeArr);
	$('#tree2 > li > span').hide(); //隐藏加号
	$.each($('#tree2 > li > a'), function() {
		$(this).find('span').eq(0).hide(); //隐藏图标
	});
}
//获取标签名称公共ajax部分
function tagAjax(url1, url2) {
	//全局变量
	var totalNum = null; //多少条数据
	var totalSize = null; //分多少页
	$.ajax({
		type: "get",
		url: url1,
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data != null && data._items != null && data._items.length) {
				totalNum = data._meta.total;
				$('#page').remove(); //移除page容器
				$('#parent').append('<div id="page"></div>'); //追加page容器
				pageUtil.initPage('page', {
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
							url: encodeURI(url2 + '&max_results=' + pageSize + '&page=' + curPage + '&sort=[("_created",-1)]'),
							dataType: 'json',
							headers: {
								"Authorization": "Basic " + auth
							},
							success: function(data) {
								$('#show_label em').text(data._meta.total);
								setTagHtml(data._items);
							},
							error: function(e) {}
						})
					},
				});
				setTagHtml(data._items);
			} else {
				$('#tree2').html('<span style="color:red;">没有对应的标签</span>'); //清空数据
				$('#page').remove(); //移除page容器
			}
		},
		error: function(e) {}
	});
}
//单个删除标签
function deleteOneTag(dataId) {
	if(confirm('确定要删除标签吗？')) {
		$.ajax({
			type: "delete",
			url: baseUrl + 'tag/' + dataId,
			headers: {
				"Authorization": "Basic " + auth
			},
			contentType: "application/json;charset=UTF-8",
			success: function(data) {
				//console.log(data, flag);
				if(data) {
					flashAlert($("#flashalert"),'删除失败')
				} else {
					if(flag == '常用') {
						getAllTag(); //全部查询标签名称
					} else if(flag == '关键字') {
						$('#search').trigger('click'); //触发关键字查询事件
					} else {
						$('#spell span').eq(spellArr.indexOf(flag)).trigger('click'); //触发拼音查询事件  对应哪个字母  触发相应的请求
					}

				}
			},
			error: function() {
				flashAlert($("#flashalert"),'发送错误')
			}
		})
	}
}
//常用标签点击事件
$(document).on('click', '#use', function() {
	flag = '常用'; //标识为常用
	//console.log(flag);
	$(this).addClass('active-orange').parent().find('.spell').children().removeClass('active-orange') //高亮显示  排他
	getAllTag(); //全部查询标签名称
})
function setTags(arr) {
	//因为会多次调研这个方法，所以得设置以前设置的标签前，清空装载选中标签的容器
	$('#del-tag').html('');
	containTag = [];
	console.log(arr);
	if(arr.length == 0) {
		return;
	} else {
		$.each(arr, function(i, e) {
			console.log(e,$('#del-tag'));
			$('#del-tag').append('<li>' + e + '<span class="del"></span></li>');
			containTag.push(e);
		});
	}
}
function getTags(){
	return containTag;
}
