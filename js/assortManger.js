//全局变量
var baseUrl = '/api/'; //url前缀

var selectedCatalogs=[];//当前选中的分类链//var zTree = $.fn.zTree.getZTreeObj("treeDemo");
//树目录结构初始化
function ztreeInitHtml(data,nodes) {
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
		obj.id = index +'_' + 1;
		obj.pId = 0;
		obj.name = ele['一级名称'];
		obj.open = false;
		nodes.push(obj);
		var p2 = {}; //存储二级菜单  避免重复
		$.each(parent2, function(index, ele) {
			var idx = 1;
			var obj1 = {};
			if(ele['一级名称'] == obj.name) {
				obj1.id = obj.id +'_' +String(index);
				obj1.pId = obj.id;
				obj1.name = ele['二级名称'];
				obj1.open = false;
				nodes.push(obj1);
				idx++;
				$.each(parent3, function(index, ele) {
					var idx1 = 1;
					if(ele['二级名称'] == obj1.name && ele['一级名称'] == obj.name) {
						var obj2 = {};
						obj2.id = obj1.id +'_' + String(index);
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
function zTreeInit(initnames) {
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
			showLine: false, //是否显示先
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
		url: baseUrl + "/category1?max_results=1000",
		contentType: "application/json;charset=UTF-8",
		dataType: 'json',
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			var nodes = [];
			if(data && data._items && data._items.length) {
				ztreeInitHtml(data,nodes);
			} else {
				var obj = [{
					'一级名称': '文章',
					'排序':1
				}, {
					'一级名称': '画廊',
					'排序':2
				}, {
					'一级名称': '视频',
					'排序':3
				}, {
					'一级名称': '音乐',
					'排序':4
				}, {
					'一级名称': '专题',
					'排序':5
				}, {
					'一级名称': '图书杂志',
					'排序':6
				}, {
					'一级名称': '直播频道',
					'排序':7
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
					success: function(data) {
						if(data._status == 'OK') {
							$.ajax({
								type: "get",
								url: baseUrl + "/category1?max_results=1000",
								contentType: "application/json;charset=UTF-8",
								dataType: 'json',
								headers: {
									"Authorization": "Basic " + auth
								},
								success: function(data) {
									var nodes = [];
									if(data && data._items && data._items.length) {
										ztreeInitHtml(data,nodes);
									}
									$.fn.zTree.init($("#treeDemo"), setting, nodes);
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
			setcatelogs(initnames);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log("ERROR" + textStatus);
		}
	});
}

// zTreeInit(); //初始化树目录结构
var newCount = 1;

function beforeEditAjax(obj, treeObj, newName,treeNode) {
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
				$("#diyBtn_" + treeNode.parentTId).text('(' + findNodes(treeNode.getParentNode())+')');
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			if(XMLHttpRequest.status == 422 || XMLHttpRequest.status == 403) {
				$.fn.zTree.getZTreeObj("treeDemo").editName(newName);
			
			}
		}
	})
}

var addHoverDomFlag = false;
var addHoverDomObj = {};

function addHoverDom(treeId, treeNode) {
	var sObj = $("#diyBtn_" + treeNode.tId);
    if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0) return;
    if (treeNode.level >= 2) return;
	var addStr = "<span class='button add' id='addBtn_" + treeNode.tId +
		"' title='添加' onfocus='this.blur();'></span>";
	sObj.after(addStr);
	var btn = $("#addBtn_" + treeNode.tId);
    btn.bind("click", function () {
		var zTree = $.fn.zTree.getZTreeObj("treeDemo");
		//treeNode.level>=2,不添加
        if (treeNode.level >= 2) {
			addHoverDomFlag = false;
	
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
            if (treeNode.level === 0) {
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
		}
		//treeNode.level<2的话

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
	tagName = treeNode.name;
	if(newName.length == 0) {
		alert("节点名称不能为空.");
		var zTree = $.fn.zTree.getZTreeObj("treeDemo");
		setTimeout(function() {
			zTree.editName(treeNode)
		}, 10);
		return false;
	} else if(newName.length < 2 || newName.length > 6) {
		alert('节点名称长度在2-6之间');
		var zTree = $.fn.zTree.getZTreeObj("treeDemo");
		setTimeout(function() {
			zTree.editName(treeNode)
		}, 10);
		return false;
	} else if(addHoverDomFlag) { //增加标签假替换
		if(addedHoverDomFlag) {
			return true;
		}
		var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
		//treeObj.cancelEditName(newName);
		//console.log(newName);
		if(addHoverDomObj['三级名称']) {
			addHoverDomObj['三级名称'] = newName;
		} else {
			addHoverDomObj['二级名称'] = newName;
		}
		console.log(addHoverDomObj);
		beforeEditAjax(addHoverDomObj, zTree, newName,treeNode);
		return false;
	} else {
		return true;
	}
}

//正在修改名的操作
function zTreeOnRename(event, treeId, treeNode, isCancel) {
	console.log('onrename');
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
		//console.log(arr);
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
						// alert('替换成功');
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
					alert('替换失败');
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
	//alert(treeNode.name);
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
	//	console.log(arr)
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
		obj['排序'] = beforeRemoveObjOrder;//设置排序
	}
	console.log(obj)

	$.ajax({
		type: 'post',
		url: baseUrl + 'category1/delete',
		data: JSON.stringify(obj),
		dataType: 'json',
		contentType: "application/json;charset=UTF-8",
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data.success == 'OK') {
				$("#diyBtn_" + treeNode.parentTId).text('(' + findNodes(treeNode.getParentNode())+')');		
			}
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
function zTreeBeforeDrag(treeId, treeNodes) {
	//节点名称为这些的时候并且节点为第一节点的时候，禁止拖拽
	//console.log(treeNodes)
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

function beforeDropAjax(obj, beforeDragOsbj, targetNode, treeNodes, moveType) {
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
				//alert('删除成功');
				//添加成功后对移动的节点进行删除
				console.log(beforeDragObj)
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
	if((targetNode.name == '文章')&&(moveType === 'next'||moveType == 'prev')) {
		alert('不能拖拽到文章上方或者下方');
		return false;
	}
	if((targetNode.name == '画廊')&&(moveType === 'next'||moveType == 'prev')) {
		alert('不能拖拽到画廊上方或者下方');
		return false;
	}
	if((targetNode.name == '视频')&&(moveType === 'next'||moveType == 'prev')) {
		alert('不能拖拽到视频上方或者下方');
		return false;
	}
	if((targetNode.name == '音乐')&&(moveType === 'next'||moveType == 'prev')) {
		alert('不能拖拽到音乐上方或者下方');
		return false;
	}
	if((targetNode.name == '专题')&&(moveType === 'next'||moveType == 'prev')) {
		alert('不能拖拽到专题上方或者下方');
		return false;
	}
	if((targetNode.name == '图书杂志')&&(moveType === 'next'||moveType == 'prev')) {
		alert('不能拖拽到图书杂志上方或者下方');
		return false;
	}
	if((targetNode.name == '直播频道')&&(moveType == 'prev')) {
		alert('不能拖拽到直播频道上方');
		return false;
	}
	console.log('targetNodeLevels=' + countLevels(targetNode));
	console.log('srcNodeLevels=' + (countLevels(treeNodes[0]) + targetNode.level));
	var zTree = $.fn.zTree.getZTreeObj("treeDemo");
	var nodes = zTree.getNodes();
	var total = countLevels(treeNodes[0]) + targetNode.level;
	var targetObj = [];
	if(((total === 3) && (moveType != 'prev') && (moveType != 'next')) || (moveType === 'inner' && total > 2) || (total > 3)) {
		flashAlert($("#flashalert"), '超过层级数的提示不能添加');
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
					obj['排序'] = i + 1;
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
	var returnVal;
	if(targetObj.length) {
		console.log(targetObj);
		returnVal = beforeDropAjax(targetObj, beforeDragObj, targetNode, treeNodes, moveType);
	}
	console.log(returnVal);
	if(returnVal) {
		return true;
	} else {
		return false;
	}
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
	console.log(treeObj.getSelectedNodes()[0]);
	console.log(treeNode, treeNode.tId, treeNode.name);
	var pName = null;
	var sName = null;
	var obj = {};
	selectedCatalogs = [];//再次点击清空
	//因为只能有三层
	if(treeNode.pId == 0) {
		treeObj.expandAll();
		treeObj.expandNode(treeNode, true, true, null);
		selectedCatalogs.unshift(treeNode.name);
	} else {
		selectedCatalogs.unshift(treeNode.name);
		pName = treeNode.getParentNode().name;
		selectedCatalogs.unshift(pName);
		if(treeNode.getParentNode().pId == 0) {} else {
			sName = treeNode.getParentNode().getParentNode().name
			selectedCatalogs.unshift(sName);
		}
	}

}

//返回当前选中的分类链
function getCatelogs() {
	return selectedCatalogs;
}

//设值页面初始化选中分类的高亮提示
function setcatelogs(arr) {
	selectedCatalogs = [];
	if(arr == null || arr.length == 0 || arr.length > 3  ) {
		return;
	}
	var ztree = $.fn.zTree.getZTreeObj("treeDemo");
	if(ztree == null) {
		console.log("分类ztree初始化错误，不能显示");
		return;
	}
	var nodes = ztree.getNodes();
	if(arr.length == 1) {
		$.each(nodes, function(i, e) {
			if(e.name == arr[0]) {
				ztree.expandNode(nodes, true, true, null);
				ztree.selectNode(e);
				return false;
			}
		});
		selectedCatalogs.unshift(arr[0]);
	}
	if(arr.length == 2) {
		$.each(nodes, function(i, e) {
			if(e.name == arr[0]) {
				ztree.expandNode(nodes, true, true, null);
                if (e.children) {
                    $.each(e.children, function (i, e) {
                        if (e.name == arr[1]) {
                            ztree.selectNode(e);
                            return false;
                        }
                    });
                }
				return false;
			}
		});
		selectedCatalogs.unshift(arr[1]);
		selectedCatalogs.unshift(arr[0]);
	}
	if(arr.length == 3) {
		$.each(nodes, function(i, e) {
			if(e.name == arr[0]) {
				ztree.expandNode(nodes, true, true, null);
                if (e.children) {
                    $.each(e.children, function (i, e) {
                        if (e.name == arr[1]) {
                            if (e.children) {
                                $.each(e.children, function (i, e) {
                                    if (e.name == arr[2]) {
                                        ztree.selectNode(e);
                                        return false;
                                    }
                                });
                            }
                            return false;
                        }
                    });
                }
				return false;
			}
		});
		selectedCatalogs.unshift(arr[2]);
		selectedCatalogs.unshift(arr[1]);
		selectedCatalogs.unshift(arr[0]);
	}
}

$(document).ready(function () {
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