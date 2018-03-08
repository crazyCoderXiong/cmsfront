var pagesize = 10;
var curpage = 1;
init(); //初始化页面
$('#main .tag-left,#main .tag-right').css('min-height', $(window).height() - 200); //设置右侧容器高度
$('#main .tag-right .zTreeDemoBackground').css('height', $(window).height() - 300); //设置右侧节点容器的高度
$(window).on('resize', function() {
	$('#main .tag-left,#main .tag-right').css('min-height', $(window).height() - 200); //设置右侧容器高度
	$('#main .tag-right .zTreeDemoBackground').css('height', $(window).height() - 300); //设置右侧节点容器的高度
})
getLanguage(); //获取语言列表
function getLanguage() {
	$.ajax({
		type: "get",
		url: baseUrl + "config/get_language",
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
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
	//新建页或者编辑页 或取对应内容长度限制
	//contentLimit();//初始化查询对应内容各种长度限制
	if($(this).parents('.sel-lang').attr('id') === 'sel-lang') {
		//getAllList();
	}
	return false;
})
var flag = '常用'; //默认常用   主要是为了区分删除标签的时候  该发送哪个接口
var containTag = []; //放要删除标签名称的id
var newContainTag = [];
var isNewNode = false; //标识  是否是新增元素
//批量删除标签部分，单击删除按钮事件
$('#del-tag').on('click', '.del', function(e) {
	var data = $(this).parent().attr('dataId');
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
	$(this).parent().remove();
	if(containTag.length == 0) {
		$('.del-btn').hide();
	}
	return false;
})
$('#del-tag').on('mouseover', 'li', function(e) {
	$(this).find('.del').show();
	return false;
})
$('#del-tag').on('mouseout', 'li', function(e) {
	$(this).find('.del').hide();
	return false;
})
//全部查询 标签名称
function getInitAllTag() {
	$('#tree2').html(''); //清空容器
	var url1 = baseUrl + 'tag?max_results=' + pagesize + '&page=' + curpage;
	var url2 = baseUrl + 'tag?';
	tagAjax(url1, url2);
}
getInitAllTag();

function getAllTag() {
	$('#tree2').html(''); //清空容器
	var url1 = baseUrl + 'tag?where={"引用次数":{"$gte":1}}&sort=[("引用次数",-1)]&max_results=' + pagesize + '&page=' + curpage;
	var url2 = baseUrl + 'tag?where={"引用次数":{"$gte":1}}&sort=[("引用次数",-1)]';
	tagAjax(url1, url2);
}
//点击英文字母  拼音查询对应的标签
var spellArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
$('#spell span').click(function() {
	var data = spellArr[$(this).index()]; //获取当前点击的关联词
	flag = data;
	var url1 = encodeURI(baseUrl + 'tag?where={"拼音": {"$regex":"^' + data + '","$options": "i"}}&sort=[("_created",-1)]&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]');
	var url2 = baseUrl + 'tag?where={"拼音": {"$regex":"^' + data + '","$options": "i"}}&sort=[("_created",-1)]';
	$(this).addClass('active-orange').siblings().removeClass('active-orange');
	$('#use').removeClass('active-orange'); //常用
	$('#tree2').html(''); //清空容器
	tagAjax(url1, url2);
})
//关键字查询标签  ,点击搜索按钮
$('#search').click(function() {
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
		showRenameBtn: false,
		drag: {
			isCopy: true,
			isMove: false,
			prev: false,
			next: false,
			inner: false
		}
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
		beforeDrag: beforeDrag2,
		beforeDrop: beforeDrop2,
		beforeDragOpen: beforeDragOpen2,
		//onDrop: onDrop2
	}
};

function onExpand2(treeId, treeNode) {
	return true;
}

function beforeDragOpen2(treeId, treeNode) {
	return true;
}
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
	$('.del-btn').show(); //显示批量删除按钮	
	$('#' + treeNode.tId + '_remove').hide(); //隐藏树上删除按钮
	if(containTag.length) {
		var flag = false;
		for(var i = 0; i < containTag.length; i++) {
			if(treeNode.dataId != containTag[i]) {
				flag = true;
			} else {
				flag = false;
				errorTip('不要重复添加删除元素');
				return; //如果已经找到重复的 不需要在比较了  直接return
			}
		}
		if(flag) {
			containTag.push(treeNode.dataId);
			$('#del-tag').append($('<li dataId=' + treeNode.dataId + '>' + treeNode.name + '<span class="del"></span></li>')); //装载删除标签的容器
		}
	}
	if(containTag.length == 0) {
		containTag.push(treeNode.dataId);
		$('#del-tag').append($('<li dataId=' + treeNode.dataId + '>' + treeNode.name + '<span class="del"></span></li>')); //装载删除标签的容器			
	}
};

function beforeDrag2(treeId, treeNodes, targetNode) {
	console.log(treeNodes, targetNode);
	return true;
}

function beforeDrop2Ajax(obj, targetNode, treeNodes, moveType) {
	var flag = false;
	$.ajax({
		type: 'post',
		url: baseUrl + 'category1',
		data: JSON.stringify(obj),
		async: false,
		dataType: 'json',
		contentType: "application/json;charset=UTF-8",
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data._status == 'OK') {
				flag = true;
				if(moveType === 'inner') {
					$("#diyBtn_" + targetNode.tId).text('(' + (findNodes(targetNode) + 1) + ')');
					if(targetNode.level === 1) {
						$("#diyBtn_" + treeNodes[0].tId).hide();
					} else {
						$("#diyBtn_" + treeNodes[0].tId).show();
					}
				} else {
					if(targetNode.level === 1 || targetNode.level === 2) {
						$("#diyBtn_" + targetNode.getParentNode().tId).text('(' + (findNodes(targetNode.getParentNode()) + 1) + ')');
					}
					//$("#diyBtn_" + treeNode.tId)
					if(targetNode.level === 0 || targetNode.level === 1) {
						$("#diyBtn_" + treeNodes[0].tId).show();
					} else {
						$("#diyBtn_" + treeNodes[0].tId).hide();
					}
				}
			}
		},
		error: function() {
			flag = false;
		}
	})
	return flag;
}

function beforeDropCommonCode(treeId, treeNodes, targetNode, moveType, isCopy, beforeDropDoingFun) {
	var zTree = $.fn.zTree.getZTreeObj("treeDemo");
	var nodes = zTree.getNodes();
	var total = countLevels(treeNodes[0]) + targetNode.level;
	var targetObj = [];
	var returnVal;
	if((targetNode.name == '文章') && (moveType === 'next' || moveType == 'prev')) {
		errorTip('不能拖拽到文章上方或者下方');
		return false;
	}
	if((targetNode.name == '画廊') && (moveType === 'next' || moveType == 'prev')) {
		errorTip('不能拖拽到画廊上方或者下方');
		return false;
	}
	if((targetNode.name == '视频') && (moveType === 'next' || moveType == 'prev')) {
		errorTip('不能拖拽到视频上方或者下方');
		return false;
	}
	if((targetNode.name == '音乐') && (moveType === 'next' || moveType == 'prev')) {
		errorTip('不能拖拽到音乐上方或者下方');
		return false;
	}
	if((targetNode.name == '专题') && (moveType === 'next' || moveType == 'prev')) {
		errorTip('不能拖拽到专题上方或者下方');
		return false;
	}
	if((targetNode.name == '图书杂志') && (moveType === 'next' || moveType == 'prev')) {
		errorTip('不能拖拽到图书杂志上方或者下方');
		return false;
	}
	if((targetNode.name == '直播频道') && (moveType == 'prev')) {
		errorTip('不能拖拽到直播频道上方');
		return false;
	}
	if(((total === 3) && (moveType != 'prev') && (moveType != 'next')) || (moveType === 'inner' && total > 2) || (total > 3)) {
		//flashAlert($("#flashalert"), '超过层级数的提示不能添加');
		return false;
	}
	if(moveType === 'inner') {
		//如果停靠点层级为0
		if(targetNode.level === 0) {
			var obj = {};
			obj['一级名称'] = targetNode.name;
			obj['二级名称'] = treeNodes[0].name;
			//targetNode孩子存在
			if(targetNode.children != null && targetNode.children.length != null && targetNode.children.length) {
				obj['排序'] = targetNode.children.length + 1;
			} else {
				obj['排序'] = 1;
			}
			targetObj.push(obj);
			if(treeNodes[0].children != null) {
				if(treeNodes[0].children.length == 1) {
					var obj1 = {};
					obj1['一级名称'] = targetNode.name;
					obj1['二级名称'] = treeNodes[0].name;
					obj1['三级名称'] = treeNodes[0].children[0].name;
					obj1['排序'] = 1;
					targetObj.push(obj1);
				} else {
					$.each(treeNodes[0].children, function(i, e) {
						var obj1 = {};
						obj1['一级名称'] = targetNode.name;
						obj1['二级名称'] = treeNodes[0].name;
						obj1['三级名称'] = e.name;
						obj1['排序'] = i + 1;
						targetObj.push(obj1);
					});
				}
			}
		}
		if(targetNode.level === 1) {
			var obj = {};
			obj['一级名称'] = targetNode.getParentNode().name;
			obj['二级名称'] = targetNode.name;
			obj['三级名称'] = treeNodes[0].name;
			if(targetNode.children != null && targetNode.children.length != null && targetNode.children.length) {
				obj['排序'] = targetNode.children.length + 1;
			} else {
				obj['排序'] = 1;
			}
			targetObj.push(obj);
		}
	} else {
		//拖至prev或者next
		//第一层
		if(targetNode.level === 0) {
			var obj = {};
			obj['一级名称'] = treeNodes[0].name;
			//设置根节点排序，需要按prev next
			console.log(nodes);
			$.each(nodes, function(i, e) {
				if(e.name == targetNode.name && moveType == 'prev') {
					obj['排序'] = i + 1;
					return false;
				}
				if(e.name == targetNode.name && moveType == 'next') {
					obj['排序'] = i + 2;
					return false;
				}
			})
			targetObj.push(obj);
			if(treeNodes[0].children != null) {
				//第二层
				if(treeNodes[0].children.length == 1) {
					var obj1 = {};
					obj1['一级名称'] = treeNodes[0].name;
					obj1['二级名称'] = treeNodes[0].children[0].name;
					obj1['排序'] = 1;
					targetObj.push(obj1);
					if(treeNodes[0].children[0].children != null) {
						$.each(treeNodes[0].children[0].children, function(i, e) {
							var obj2 = {};
							obj2['一级名称'] = treeNodes[0].name;
							obj2['二级名称'] = treeNodes[0].children[0].name;
							obj2['三级名称'] = e.name;
							obj2['排序'] = i + 1;
							targetObj.push(obj2);
						});
					}
				} else {
					//第二层
					$.each(treeNodes[0].children, function(i, e) {
						var obj1 = {};
						obj1['一级名称'] = treeNodes[0].name;
						obj1['二级名称'] = treeNodes[0].children[0].name;
						targetObj.push(obj1);
						//第三层
						if(e.children != null) {
							$.each(e.children, function(i, e) {
								var obj2 = {};
								obj2['一级名称'] = treeNodes[0].name;
								obj2['二级名称'] = treeNodes[0].children[0].name;
								obj2['三级名称'] = e.name;
								obj2['排序'] = i + 1;
								targetObj.push(obj2);
							});
						}
					});
				}
			}
		} else if(targetNode.level === 1) {
			var obj = {};
			obj['一级名称'] = targetNode.getParentNode().name;
			obj['二级名称'] = treeNodes[0].name;
			//设置排序		
			console.log(targetNode.getParentNode().children);
			$.each(targetNode.getParentNode().children, function(i, e) {
				if(e.name == targetNode.name && moveType == 'prev') {
					obj['排序'] = i + 1;
					return false;
				}
				if(e.name == targetNode.name && moveType == 'next') {
					obj['排序'] = i + 1;
					return false;
				}
			});
			targetObj.push(obj);
			if(treeNodes[0].children != null) {
				if(treeNodes[0].children.length == 1) {
					var obj1 = {};
					obj1['一级名称'] = targetNode.getParentNode().name;
					obj1['二级名称'] = treeNodes[0].name;
					obj1['三级名称'] = treeNodes[0].children[0].name;
					obj1['排序'] = 1;
					targetObj.push(obj1);
				} else {
					$.each(treeNodes[0].children, function(i, e) {
						var obj1 = {};
						obj1['一级名称'] = targetNode.getParentNode().name;
						obj1['二级名称'] = treeNodes[0].name;
						obj1['三级名称'] = e.name;
						obj1['排序'] = i + 1;
						targetObj.push(obj1);
					});
				}
			}

		} else {
			var obj = {};
			obj['一级名称'] = targetNode.getParentNode().getParentNode().name;
			obj['二级名称'] = targetNode.getParentNode().name;
			obj['三级名称'] = treeNodes[0].name;
			//设置排序			
			$.each(targetNode.getParentNode().children, function(i, e) {
				if(e.name == targetNode.name && moveType == 'prev') {
					obj['排序'] = i + 1;
					return false;
				}
				if(e.name == targetNode.name && moveType == 'next') {
					obj['排序'] = i + 1;
					return false;
				}
			});
			targetObj.push(obj);
		}
	}
	if(targetObj.length) {
		if(beforeDropDoingFun == 'beforeDrop2Ajax') {
			returnVal = beforeDrop2Ajax(targetObj, targetNode, treeNodes, moveType);
		} else {
			returnVal = beforeDropAjax(targetObj, beforeDragObj, targetNode, treeNodes, moveType);
		}
	}
	if(returnVal) {
		return true;
	} else {
		return false;
	}
}

function beforeDrop2(treeId, treeNodes, targetNode, moveType, isCopy) {
	return beforeDropCommonCode(treeId, treeNodes, targetNode, moveType, isCopy, 'beforeDrop2Ajax');
	//判断标识  最终结果返回true还是false
}

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
	if($('#tree2 .node_name').length){
		$.each($('#tree2 .node_name'), function(i,e) {
			$(this).parent().css({'width':$(this).parent().width()+5,'padding-right':0})			
		});
	}
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
				$('#tree2').html('<div style="color:gray;text-align:center;font-size:20px;">没有对应的标签</div>'); //清空数据
				$('#page').remove(); //移除page容器
			}
		},
		error: function(e) {}
	});
}

//添加标签名称
$('.add').click(function() {
	var ipt = $('#addValue').val();
	if(ipt.trim() != '') {
		$.ajax({
			type: "post",
			url: baseUrl + 'tag',
			data: {
				'标签名称': ipt
			},
			dataType: 'json',
			headers: {
				"Authorization": "Basic " + auth
			},
			success: function(data) {
				if(data._status == 'OK') {
					//清空文本框的值
					$('#addValue').val('');
					errorTip('添加成功');
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				console.log(XMLHttpRequest, textStatus, errorThrown)
				errorTip(ipt + XMLHttpRequest.responseJSON._error.message);
				$('#addValue').val('');
			}
		});
	}
})
//单个删除标签
function deleteOneTag(dataId) {
	if(confirm('确定要删除？')) {
		$.ajax({
			type: "delete",
			async: false,
			url: baseUrl + 'tag/' + dataId,
			headers: {
				"Authorization": "Basic " + auth
			},
			contentType: "application/json;charset=UTF-8",
			success: function(data) {
				if(data) {
					errorTip('删除失败')
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

			}
		})
	}
}
//批量删除标签
$('.del-btn').click(function() {
	if(containTag.length) {
		var data = [];
		$.each(containTag, function(i, e) {
			data.push({
				'id': e
			})
		});
		if(confirm('确定要删除？')) {
			$.ajax({
				type: "post",
				url: baseUrl + 'tag/batch-delete',
				data: JSON.stringify(data),
				contentType: "application/json;charset=UTF-8",
				dataType: 'json',
				headers: {
					"Authorization": "Basic " + auth
				},
				success: function(data) {
					if(data.success == 'OK') {
						$('#del-tag').html(''); //容器清空
						containTag = []; //清空容器
						if(flag == '常用') {
							getAllTag(); //全部查询标签名称
						} else if(flag == '关键字') {
							$('#search').trigger('click'); //触发关键字查询事件
						} else {
							$('#spell span').eq(spellArr.indexOf(flag)).trigger('click'); //触发拼音查询事件  对应哪个字母  触发相应的请求
						}
					} else {
						errorTip('删除失败');
					}
				},
				error: function() {
					errorTip('删除失败');
				}
			})
		}

	} else {
		errorTip('请选择要批量删除的元素');
	}

})
//常用标签点击事件
$('#use').off('click').on('click', function() {
	flag = '常用'; //标识为常用
	$(this).addClass('active-orange');
	$('#spell span').removeClass('active-orange');
	getAllTag(); //全部查询标签名称
})
//树目录结构初始化
function ztreeInitHtml(data, nodes) {
	console.log(data);
	var parent1 = [],
		parent2 = [],
		parent3 = [];
	$.each(data._items, function(index, ele) {
		if(ele['级别'] == 1) {
			parent1.push(ele)
		}
		if(ele['级别'] == 2) {
			parent2.push(ele)
		}
		if(ele['级别'] == 3) {
			parent3.push(ele)
		}
	});
	$.each(parent1, function(index, ele) {
		var obj = {};
		obj.id = index + '_' + 1;
		obj.pId = 0;
		obj.name = ele['一级名称'];
		obj.open = false;
		nodes.push(obj);
		var p2 = {}; //存储二级菜单  避免重复
		$.each(parent2, function(index, ele) {
			var idx = 1;
			var obj1 = {};
			if(ele['一级名称'] == obj.name) {
				obj1.id = obj.id + '_' + String(index);
				obj1.pId = obj.id;
				obj1.name = ele['二级名称'];
				obj1.open = false;
				nodes.push(obj1);
				idx++;
				$.each(parent3, function(index, ele) {
					var idx1 = 1;
					if(ele['二级名称'] == obj1.name && ele['一级名称'] == obj.name) {
						var obj2 = {};
						obj2.id = obj1.id + '_' + String(index);
						obj2.pId = obj1.id;
						obj2.name = ele['三级名称'];
						obj2.open = false;
						nodes.push(obj2);
					}
				})
			}

		});
	});
}

function zTreeInit() {
	//setting配置项
	var setting = {
		edit: {
			enable: true,
			editNameSelectAll: true,
			showRenameBtn: showRenameBtn, //显示隐藏重名按钮
			showRemoveBtn: showRemoveBtn, //显示隐藏删除按钮
			drag: {
				autoExpandTrigger: true
			},
			removeTitle: "删除", // 删除按钮的 Title 辅助信息
			renameTitle: "重命名" // 编辑名称按钮的 Title 辅助信息。
		},
		data: {
			simpleData: {
				enable: true, //使用简单数据模式
				idKey: "id",
				pIdKey: "pId",
				rootPId: 0
			}
		},
		view: {
			addDiyDom: addDiyDom, //显示用户自定义控件
			showIcon: false, //是否显示图标
			showLine: false, //是否显示线
			fontCss: setFontCss, //设置样式
			selectedMulti: false, //设置是否允许同时选中多个节点
			addHoverDom: addHoverDom, // 用于当鼠标移动到节点上时，显示用户自定义控件。务必与 setting.view.removeHoverDom 同时使用
			removeHoverDom: removeHoverDom // 用于当鼠标移出节点时，隐藏用户自定义控件。务必与 addHoverDom 同时使用
		},
		callback: {
			beforeDrag: zTreeBeforeDrag, //在拖拽之前禁止所有的树目录之间的拖拽
			//beforeEditName: beforeEditName, // 用于捕获节点编辑按钮的 click 事件，并且根据返回值确定是否允许进入名称编辑状
			beforeRename: zTreeBeforeRename, //重命名目录之前进行的操作
			onRename: zTreeOnRename, //重命名的时候进行的操作
			beforeRemove: zTreebeforeRemove, //删除目录之前进行的操作
			onRemove: zTreeOnRemove, //删除的时候进行的操作
			beforeDrop: beforeDrop, //在拖拽的元素移动到的位置放下之前的操作
			//beforeClick: beforeClick,
			onClick: onClick
		}
	};
	$.ajax({
		type: "get",
		url: baseUrl + "/category1?max_results=5000&sort=[('排序',1)]",
		contentType: "application/json;charset=UTF-8",
		dataType: 'json',
		headers: {
			"Authorization": "Basic " + auth
		},
		beforeSend: function() {
			$("body").append('<div id="loading" class="loader-inner ball-clip-rotate" style="position:fixed;top:0;left:0;bottom:0;right:0;background-color: #000;opacity: .6;z-index: 10002;"><div style="position:fixed;left:50%;top:50%;"></div></div>')
		},
		success: function(data) {
			var nodes = [];
			if(data && data._items && data._items.length) {				
				try {
					ztreeInitHtml(data, nodes);
				}catch(e){
					console.log(e);
				}				
			} else {
				var obj = [{
					'一级名称': '文章',
					'排序': 1
				}, {
					'一级名称': '画廊',
					'排序': 2
				}, {
					'一级名称': '视频',
					'排序': 3
				}, {
					'一级名称': '音乐',
					'排序': 4
				}, {
					'一级名称': '专题',
					'排序': 5
				}, {
					'一级名称': '图书杂志',
					'排序': 6
				}, {
					'一级名称': '直播频道',
					'排序': 7
				}]
				nodes = [{
						id: 1,
						pId: 0,
						name: "文章"
					},
					{
						id: 2,
						pId: 0,
						name: "画廊"
					},
					{
						id: 3,
						pId: 0,
						name: "视频"
					},
					{
						id: 4,
						pId: 0,
						name: "音乐"
					},
					{
						id: 5,
						pId: 0,
						name: "专题"
					},
					{
						id: 6,
						pId: 0,
						name: "图书杂志"
					},
					{
						id: 7,
						pId: 0,
						name: "直播频道"
					}
				];

				$.ajax({
					type: 'post',
					url: baseUrl + 'category1',
					data: JSON.stringify(obj),
					dataType: 'json',
					contentType: "application/json;charset=UTF-8",
					headers: {
						"Authorization": "Basic " + auth
					},
					beforeSend: function() {
						$("body").append('<div id="loading" class="loader-inner ball-clip-rotate" style="position:fixed;top:0;left:0;bottom:0;right:0;background-color: #000;opacity: .6;z-index: 10002;"><div style="position:fixed;left:50%;top:50%;"></div></div>')
					},
					success: function(data) {
						if(data._status == 'OK') {
							$.ajax({
								type: "get",
								url: baseUrl + "/category1?max_results=1000&sort=[('排序',1)]",
								contentType: "application/json;charset=UTF-8",
								dataType: 'json',
								headers: {
									"Authorization": "Basic " + auth
								},
								success: function(data) {
									var nodes = [];
									if(data && data._items && data._items.length) {
										try {
											ztreeInitHtml(data, nodes);
										}catch(e){
											console.log(e);
										}										
									}
									$.fn.zTree.init($("#treeDemo"), setting, nodes);
								},
								complete: function() {
									$('#loading').remove();
								},
								error: function(XMLHttpRequest, textStatus, errorThrown) {
									console.log("ERROR" + textStatus);
								}
							});
						}
					},
					error: function(XMLHttpRequest, textStatus, errorThrown) {
						console.log("ERROR" + textStatus);
					}
				})
			}
			$.fn.zTree.init($("#treeDemo"), setting, nodes);
		},
		complete: function() {
			$('#loading').remove();
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log("ERROR" + textStatus);
		}
	});
}

zTreeInit(); //初始化树目录结构
var newCount = 1;

function beforeEditAjax(obj, treeObj, newName, treeNode) {
	/*if(isNewNode == false) {
		return;
	}*/
	$.ajax({
		type: 'post',
		url: baseUrl + 'category1',
		data: JSON.stringify(obj),
		dataType: 'json',
		contentType: "application/json;charset=UTF-8",
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data._status == 'OK') {
				addedHoverDomFlag = true;
				$.fn.zTree.getZTreeObj("treeDemo").cancelEditName(newName);
				$("#diyBtn_" + treeNode.parentTId).text('(' + findNodes(treeNode.getParentNode()) + ')');
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			errorTip('一个分类下不能添加相同名称的分类名，并且也不能和上级、上上级同名');
		}
	})
}
var addHoverDomFlag = false;
var addHoverDomObj = {};

function addHoverDom(treeId, treeNode) {
	var sObj = $("#diyBtn_" + treeNode.tId);
	if(treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0) return;
	if(treeNode.level >= 2) return;
	var addStr = "<span class='button add' id='addBtn_" + treeNode.tId +
		"' title='添加' onfocus='this.blur();'></span>";
	sObj.after(addStr);
	var btn = $("#addBtn_" + treeNode.tId);
	btn.bind("click", function() {
		var zTree = $.fn.zTree.getZTreeObj("treeDemo");
		if(treeNode.level >= 2) {
			addHoverDomFlag = false;
			errorTip('层级超过不能添加');
			return false;
		} else {
			addHoverDomFlag = true;
			//向后台发送添加到的数据
			addHoverDomObj = {};
			console.log(zTree);
			var addTreeNode = zTree.addNodes(treeNode, {
				id: (100 + newCount),
				pId: treeNode.id,
				name: "新标签" + (newCount++)
			});
			var arr = [];
			if(treeNode.level === 0) {
				addHoverDomObj['一级名称'] = treeNode.name;
				addHoverDomObj['二级名称'] = addTreeNode[0].name;
				//即使treeNode的开始的node为空，但是addTreeNode加上了，所以一定有一个孩子，addTreeNode排序为1
				addHoverDomObj['排序'] = treeNode.children.length;
			} else {
				//treeNode.level === 1
				addHoverDomObj['一级名称'] = treeNode.getParentNode().name;
				addHoverDomObj['二级名称'] = treeNode.name;
				addHoverDomObj['三级名称'] = addTreeNode[0].name;
				addHoverDomObj['排序'] = treeNode.children.length;
			}
			zTree.editName(addTreeNode[0]); //新增节点进入编辑状态			
			isNewNode = true;
		}
	});
};
// 用于当鼠标移出节点时，隐藏用户自定义控件
function removeHoverDom(treeId, treeNode) {
	$("#addBtn_" + treeNode.tId).unbind().remove();
};
//重命名之前该做的
var tagName = null; //用于存储标签原来的名称
var addedHoverDomFlag = false;

function zTreeBeforeRename(treeId, treeNode, newName, isCancel) {
	console.log(treeNode)
	if((isNewNode == false && addHoverDomFlag == false) || (isNewNode == true && addHoverDomFlag == true)) {
		tagName = treeNode.name;
		var zTree = $.fn.zTree.getZTreeObj("treeDemo");
		if(newName.length == 0) {
			errorTip("节点名称不能为空.");
			setTimeout(function() {
				zTree.editName(treeNode)
			}, 10);
			return false;
		}
		/* else if(newName.length < 2 || newName.length > 6) {
					errorTip('节点名称在2-6个字符之间');
					setTimeout(function() {
						zTree.editName(treeNode)
					}, 10);
					return false;
				} */
		else if(addHoverDomFlag) { //增加标签假替换
			if(addedHoverDomFlag) {
				return true;
			}
			if(addHoverDomObj['三级名称']) {
				addHoverDomObj['三级名称'] = newName;
			} else {
				addHoverDomObj['二级名称'] = newName;
			}
			beforeEditAjax(addHoverDomObj, zTree, newName, treeNode);
			return false;
		} else {
			return true;
		}
	}

}
//正在修改名的操作
function zTreeOnRename(event, treeId, treeNode, isCancel) {
	//增加节点假替换
	if(addedHoverDomFlag) {
		addedHoverDomFlag = false;
		return;
	}
	if(treeNode) {
		var pName = null;
		var sName = null;
		var arr = [];
		var obj = {};
		//因为只能有三层
		if(treeNode.pId == 0) {
			arr.unshift(treeNode.name);
		} else {
			arr.unshift(treeNode.name);
			pName = treeNode.getParentNode().name;
			arr.unshift(pName);
			if(treeNode.getParentNode().pId == 0) {
				//			return;
			} else {
				sName = treeNode.getParentNode().getParentNode().name
				arr.unshift(sName);
			}

		}
		//生成替换数据格式
		if(arr.length == 1) {
			obj["当前名称"] = tagName;
			obj["新建名称"] = treeNode.name;
		} else if(arr.length == 2) {
			obj["父级名称"] = arr[0];
			obj["当前名称"] = tagName;
			obj["新建名称"] = treeNode.name;
		} else if(arr.length == 3) {
			obj["祖父级名称"] = arr[0];
			obj["父级名称"] = arr[1];
			obj["当前名称"] = tagName;
			obj["新建名称"] = treeNode.name;
		}
		//console.log(obj)
		if(obj['当前名称'] != obj['新建名称']) { //如果当前名称和新建名称不一样  给后台发送请求
			//给后台发送请求
			$.ajax({
				type: 'post',
				url: baseUrl + 'category1/replace',
				data: JSON.stringify(obj),
				dataType: 'json',
				contentType: "application/json;charset=UTF-8",
				headers: {
					"Authorization": "Basic " + auth
				},
				success: function(data) {
					tagName = null;
					if(data.status == 200) {
						errorTip('替换成功');
						$.each($('#treeDemo a'), function() {
							if($(this).attr('title') == treeNode.name) {
								$(this).find('.node_name').text(obj['新建名称']);
								treeNode.name = obj['新建名称'];
								$(this).attr('title', obj['新建名称']);
							}
						})
					}
				},
				error: function() {
					errorTip('替换失败');
					var zTree = $.fn.zTree.getZTreeObj("treeDemo");
					zTree.editName(treeNode);
				}
			})
		}
	}
}

//删除之前要做的
var beforeRemoveObjOrder;

function zTreebeforeRemove(treeId, treeNode) {
	var zTree = $.fn.zTree.getZTreeObj("treeDemo");
	var nodes = zTree.getNodes();
	var pName = null;
	var sName = null;
	var arr = [];
	var obj = {};
	if(treeNode.pId == 0) {
		//根节点在兄弟之间的排序
		$.each(nodes, function(i, e) {
			if(e.name == treeNode.name) {
				beforeRemoveObjOrder = i + 1;
				return false;
			}
		});
	} else {
		//设置排序
		$.each(treeNode.getParentNode().children, function(i, e) {
			if(e.name == treeNode.name) {
				beforeRemoveObjOrder = i + 1;
				return false;
			}
		})

	}
	var con = confirm("确定要删除分类标签 '" + treeNode.name + "' 吗?")
	return con
}

//正在删除该做的
function zTreeOnRemove(event, treeId, treeNode) {
	var pName = null;
	var sName = null;
	var arr = [];
	var obj = {};
	if(treeNode.pId == 0) {
		arr.unshift(treeNode.name);
	} else {
		arr.unshift(treeNode.name);
		pName = treeNode.getParentNode().name;
		arr.unshift(pName);
		if(treeNode.getParentNode() == null || treeNode.getParentNode().pId == 0) {
			//			return;
		} else {
			sName = treeNode.getParentNode().getParentNode().name
			arr.unshift(sName);
		}
	}
	if(arr) {
		$.each(arr, function(index, elem) {
			if(index == 0) {
				obj['一级名称'] = elem;
			} else if(index == 1) {
				obj['二级名称'] = elem;
			} else {
				obj['三级名称'] = elem;
			}
		});
		obj['排序'] = beforeRemoveObjOrder; //设置排序
	}
	$.ajax({
		type: 'post',
		async: false,
		url: baseUrl + 'category1/delete',
		data: JSON.stringify(obj),
		dataType: 'json',
		contentType: "application/json;charset=UTF-8",
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			$("#diyBtn_" + treeNode.parentTId).text('(' + findNodes(treeNode.getParentNode()) + ')');
		}
	})
}

//移除删除按钮
function showRemoveBtn(treeId, treeNode) {
	if((treeNode.name == '文章' || treeNode.name == '画廊' || treeNode.name == '视频' || treeNode.name == '音乐' || treeNode.name == '专题' || treeNode.name == '图书杂志' || treeNode.name == '直播频道') && (treeNode.pId == 0)) {
		return false
	} else {
		return true
	}
}

//移除编辑按钮
function showRenameBtn(treeId, treeNode) {
	if((treeNode.name == '文章' || treeNode.name == '画廊' || treeNode.name == '视频' || treeNode.name == '音乐' || treeNode.name == '专题' || treeNode.name == '图书杂志' || treeNode.name == '直播频道') && (treeNode.pId == 0)) {
		return false
	} else {
		return true
	}
}

//设置样式
function setFontCss(treeId, treeNode) {
	if((treeNode.level == 0) && (treeNode.name == '文章' || treeNode.name == '画廊' || treeNode.name == '视频' || treeNode.name == '音乐' || treeNode.name == '专题' || treeNode.name == '图书杂志' || treeNode.name == '直播频道')) {
		return {
			color: "#fff",
			background: "#03a9f4"
		}
	} else {
		return {
			color: "#fff",
			background: "#14c3a1"
		}
	}
};
//禁止内部进行拖拽
var beforeDragObj = {}; //存储要操作节点原来的信息
function zTreeBeforeDrag(treeId, treeNodes, targetNode) {
	//节点名称为这些的时候并且节点为第一节点的时候，禁止拖拽
	var order; //设置当前要删除拖拽节点的排序位置
	var zTree = $.fn.zTree.getZTreeObj("treeDemo");
	var nodes = zTree.getNodes();
	if((treeNodes[0].name == '文章' || treeNodes[0].name == '画廊' || treeNodes[0].name == '视频' || treeNodes[0].name == '音乐' || treeNodes[0].name == '专题' || treeNodes[0].name == '图书杂志' || treeNodes[0].name == '直播频道') && (treeNodes[0].pId == 0)) {
		return false
	} else {
		var pName = null;
		var sName = null;
		var arr = [];
		beforeDragObj = {};
		if(treeNodes[0].pId == 0) {
			arr.unshift(treeNodes[0].name);
			//根节点在兄弟之间的排序
			$.each(nodes, function(i, e) {
				if(e.name == treeNodes[0].name) {
					order = i + 1;
					return false;
				}
			});
		} else {
			arr.unshift(treeNodes[0].name);
			pName = treeNodes[0].getParentNode().name;
			arr.unshift(pName);
			if(treeNodes[0].getParentNode() == null || treeNodes[0].getParentNode().pId == 0) {
				//			return;
			} else {
				sName = treeNodes[0].getParentNode().getParentNode().name;
				arr.unshift(sName);
			}
			//设置排序
			$.each(treeNodes[0].getParentNode().children, function(i, e) {
				if(e.name == treeNodes[0].name) {
					order = i + 1;
					return false;
				}
			})

		}
		if(arr) {
			$.each(arr, function(index, elem) {
				if(index == 0) {
					beforeDragObj['一级名称'] = elem;
				} else if(index == 1) {
					beforeDragObj['二级名称'] = elem;
				} else {
					beforeDragObj['三级名称'] = elem;
				}
			});
			//设置排序
			beforeDragObj['排序'] = order;
		}
		return true
	}
};

function countLevels(treeNode) {
	if(treeNode == null) return 0;
	else if(treeNode.children == null) return 1;
	else {
		var count = 1;
		var maxcount = 0;
		for(var i = 0; i < treeNode.children.length; i++) {
			var subnode = treeNode.children[i];
			var scount = countLevels(subnode);
			maxcount = Math.max(maxcount, scount);
		}
		return count + maxcount;
	}
}

function beforeDropAjax(obj, beforeDragObj, targetNode, treeNodes, moveType) {
	var flag = false;
	$.ajax({
		type: 'post',
		url: baseUrl + 'category1/delete',
		async: false,
		data: JSON.stringify(beforeDragObj),
		dataType: 'json',
		contentType: "application/json;charset=UTF-8",
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data.success == 'OK') {
				//添加成功后对移动的节点进行删除
				$.ajax({
					type: 'post',
					url: baseUrl + 'category1',
					data: JSON.stringify(obj),
					async: false,
					dataType: 'json',
					contentType: "application/json;charset=UTF-8",
					headers: {
						"Authorization": "Basic " + auth
					},
					success: function(data) {
						if(data._status == 'OK') {
							flag = true;
							if(moveType === 'inner') {
								$("#diyBtn_" + targetNode.tId).text('(' + (findNodes(targetNode) + 1) + ')');
								$("#diyBtn_" + treeNodes[0].getParentNode().tId).text('(' + (findNodes(treeNodes[0].getParentNode()) - 1) + ')');
								if(targetNode.level === 1) {
									$("#diyBtn_" + treeNodes[0].tId).hide();
								} else {
									$("#diyBtn_" + treeNodes[0].tId).show();
								}
							} else {
								if(targetNode.level === 1 || targetNode.level === 2) {
									$("#diyBtn_" + targetNode.getParentNode().tId).text('(' + (findNodes(targetNode.getParentNode()) + 1) + ')');
									$("#diyBtn_" + treeNodes[0].getParentNode().tId).text('(' + (findNodes(treeNodes[0].getParentNode()) - 1) + ')');
								}
								if(targetNode.level === 0 || targetNode.level === 1) {
									$("#diyBtn_" + treeNodes[0].tId).show();
								} else {
									$("#diyBtn_" + treeNodes[0].tId).hide();
								}
							}
						}
					}
				})
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			if((XMLHttpRequest.status == 422) || (XMLHttpRequest.status == 403)) {
				flag = false;
			}
		}
	})
	return flag;
}

function beforeDrop(treeId, treeNodes, targetNode, moveType, isCopy) {
	return beforeDropCommonCode(treeId, treeNodes, targetNode, moveType, isCopy, 'beforeDropAjax')
}

function findNodes(treeNode) {
	var count;
	/*判断是不是父节点,是的话找出子节点个数，加一是为了给新增节点*/
	if(treeNode.isParent) {
		count = treeNode.children.length;
	} else {
		/*如果不是父节点,说明没有子节点,设置为1*/
		count = 0;
	}
	return count;
}

function addDiyDom(treeId, treeNode) {
	var aObj = $("#" + treeNode.tId + "_span");
	if($("#diyBtn_" + treeNode.tId).length > 0) return;
	var editStr = "<span class='diyBtn1' id='diyBtn_" + treeNode.tId +
		"' title='" + treeNode.name + "' onfocus='this.blur();'></span>";
	aObj.after(editStr);
	var btn = $("#diyBtn_" + treeNode.tId);
	btn.text('(' + findNodes(treeNode) + ')');
	//分类管理中，第三级的标签名称后面的数量始终为0，可以取消
	if(treeNode.level === 2) {
		btn.hide();
	}
};

function onClick(event, treeId, treeNode, clickFlag) {
	var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
	var pName = null;
	var sName = null;
	var arr = [];
	var obj = {};
	//因为只能有三层
	if(treeNode.pId == 0) {
		treeObj.expandAll();
		treeObj.expandNode(treeNode, true, true, null);
		arr.unshift(treeNode.name);
	} else {
		arr.unshift(treeNode.name);
		pName = treeNode.getParentNode().name;
		arr.unshift(pName);
		if(treeNode.getParentNode().pId == 0) {} else {
			sName = treeNode.getParentNode().getParentNode().name
			arr.unshift(sName);
		}

	}
	//console.log(arr)
	if(typeof getCatelogs !== "undefined")
		getCatelogs(arr);
	else
		console.log("not set callback.");
}

//设值页面初始化选中分类的高亮提示
function setcatelogs(arr) {
	if(arr.length > 3 || arr.length == 0 || arr == null) {
		return;
	}
	var ztree = $.fn.zTree.getZTreeObj("treeDemo");
	if(ztree == null) {
		//console.log("分类ztree初始化错误，不能显示");
		return;
	}
	var nodes = ztree.getNodes();
	if(arr.length == 1) {
		$.each(nodes, function(i, e) {
			if(e.name == arr[0]) {
				ztree.expandNode(e, true, true, null);
				ztree.selectNode(e);
				return false;
			}
		});
	}
	if(arr.length == 2) {
		$.each(nodes, function(i, e) {
			if(e.name == arr[0]) {
				ztree.expandNode(e, true, true, null);
				$.each(e.children, function(i, e) {
					if(e.name == arr[1]) {
						ztree.selectNode(e);
						return false;
					}
				});
				return false;
			}
		});
	}
	if(arr.length == 3) {
		$.each(nodes, function(i, e) {
			if(e.name == arr[0]) {
				ztree.expandNode(e, true, true, null);
				$.each(e.children, function(i, e) {
					if(e.name == arr[1]) {
						$.each(e.children, function(i, e) {
							if(e.name == arr[2]) {
								ztree.selectNode(e);
								return false;
							}
						});
						return false;
					}
				});
				return false;
			}
		});
	}
}
$(document).ready(function() {
	$(".tag-right .zTreeDemoBackground").niceScroll({
		cursorcolor: "rgba(3,169,242,.3)",
		horizrailenabled: false,
		autohidemode: "scroll",
		cursoropacitymax: 1,
		oneaxismousemode: false,
		touchbehavior: false,
		cursorwidth: "10px",
		cursorborder: "0",
		hidecursordelay: 0,
		cursorborderradius: "4px"
	});
})
//按esc键
$(document).keyup(function(event) {
	switch(event.keyCode) {
		case 27:
			//新增的节点  并且处于编辑状态  并且是选中
			var zTree = $.fn.zTree.getZTreeObj("treeDemo");
			var node = zTree.getSelectedNodes()[0];
			console.log(node);
			if(isNewNode == true && node.editNameFlag == true) {
				zTreeOnRemove(event, 'treeDemo', node);
				zTree.removeNode(node);
				isNewNode = false;
				//errorTip('isNewNode:'+isNewNode+' addHoverDomFlag:'+addHoverDomFlag);
			}
			/*else {
				errorTip('isNewNode:'+isNewNode+' addHoverDomFlag:'+addHoverDomFlag);
			}*/
	}
});
$(document).on('click', function() {
	$('.catagoryBox').hide();
})
/*回车键*/
$('#addValue').bind('keypress', function(event) {
	if(event.keyCode == "13") {
		$('.add').trigger('click');
	}
});
$('#searInput').bind('keypress', function(event) {
	if(event.keyCode == "13") {
		$('#search').trigger('click');
	}
});
//添加一级分类
$('#catagoryBtn').click(function(e) {
	$('.catagoryBox,#mark').show();
	e.stopPropagation();
	/*var ztree = $.fn.zTree.getZTreeObj("treeDemo");
	var newNode = {
		name: "newNode1"
	};
	//获取一级节点名称，判断新增节点是否重名
	newNode = ztree.addNodes(null, newNode);*/
	//console.log(getRoots());
	//beforeEditAjax(obj, treeObj, newName)
})
$('.catagoryBox').click(function(e) {
	e.stopPropagation();
})

function getRoots() {
	var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
	//返回根节点集合  
	var nodes = treeObj.getNodesByFilter(function(node) {
		return node.level == 0
	});
	return nodes;
}
$('.catagoryBox .sure').click(function() {
	//判断是否在2-6个字符之间
	var iptVal = $('#catagoryIptValue').val().trim();
	if(iptVal == '') {
		alert('请输入一级分类名称');
		return
	}
	/*if(iptVal.length < 2 || iptVal.length > 6) {
		alert('一级分类名称的长度为2-6个字符');
		return;
	}*/
	addNewRootNode(iptVal); //新增节点函数	
})
$('.catagoryBox .cancel').click(function() {
	$('.catagoryBox,#mark').hide();
	$('#catagoryIptValue').val('');
})

function addNewRootNode(newNodeName) {
	var ztree = $.fn.zTree.getZTreeObj("treeDemo")
	var flag = true;
	var obj = {};
	$.each(getRoots(), function(i, e) {
		if(e.name == newNodeName) {
			flag = false;
			errorTip('同级目录下不能有重名');
			return false;
		}
	});
	if(flag) {
		obj['一级名称'] = newNodeName;
		obj['排序'] = getRoots().length + 1;
		$.ajax({
			type: 'post',
			url: baseUrl + 'category1',
			data: JSON.stringify(obj),
			dataType: 'json',
			contentType: "application/json;charset=UTF-8",
			headers: {
				"Authorization": "Basic " + auth
			},
			success: function(data) {
				if(data._status == 'OK') {
					ztree.addNodes(null, {
						'name': newNodeName
					});
					$('.catagoryBox,#mark').hide();
					$('#catagoryIptValue').val('');
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {

			}
		})

	}
}