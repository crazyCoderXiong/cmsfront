/*
 * 
 * autor xzf
 * date  2017/9/22
 * 
 * */
var pagesize = 30;
var curpage = 1;
init(); //初始化页面
var showWhat = 'list'; //showWaht为list项或者pic项
//存储点击节点的id
var lSelectednodeId = [];
var rSelectednodeId = [];
var dataIdMore = []; //进行批量操作的文件的id  //存储为列表项的id
var mediaType; //媒体中心类型
var locationHref = window.location.href.substr(window.location.href.lastIndexOf('/'));
if(locationHref == "/media-pic.html") {
	mediaType = 'image';
} else if(locationHref == "/media-video.html") {
	mediaType = 'video';
} else if(locationHref == "/media-music.html") {
	mediaType = 'audio';
} else if(locationHref == "/media-file.html") {
	mediaType = 'attachment';
}
//设置存储空间大小
//get_datasize/image 图片文件
function setStorage() {
	$.ajax({
		type: "get",
		url: 'get_datasize/' + mediaType,
		dataType: 'json',
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			console.log(data)
			if(data != null && data.datasize != null && data.datasize.size != null) {
				$('#storage s').text(getSize(data.datasize.size));
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log("ERROR" + textStatus);
		}
	});
}
setStorage();

function upload(uploadId, mediaType, lSelectednodeId) {
	$('#' + uploadId).change(function(e) {
		var file = this.files[0];
		console.log(file)
		var fileName = file.name.substring(file.name.lastIndexOf("."), file.name.length).toLowerCase();
		var exp;
		if(mediaType == 'image') {
			exp = /(\.gif|\.jpeg|\.png|\.jpg|\.bmp)/;
			if(!exp.test(fileName)) {
				errorTip('请上传图片格式的文件');
				return;
			}
		} else if(mediaType == 'video') {
			//swf|flv|mp4|rmvb|avi|mpeg|ra|ram|mov|wmv
			exp = /(\.flv|\.rvmb|\.mp4|\.avi|\.wmv)/;
			if(!exp.test(fileName)) {
				errorTip('请上传视频格式的文件');
				return;
			}

		} else if(mediaType == 'audio') {
			exp = /(\.mp3|\.wav|\.wma|\.ogg|\.ape|\.acc)/;
			if(!exp.test(fileName)) {
				errorTip('请上传音频格式的文件');
				return;
			}
		}
		ajaxFileUpload(uploadId, mediaType, lSelectednodeId);
	});
}

function ajaxFileUpload(uploadId, mediaType, lSelectednodeId) {
	//像后台发送请求
	if(!lSelectednodeId.length) {
		$.ajaxFileUpload({
			type: 'post',
			data: {},
			url: baseUrl + 'media_file', //用于文件上传的服务器端请求地址
			secureuri: false, //是否需要安全协议，一般设置为false
			fileElementId: uploadId, //文件上传域的ID
			dataType: 'xml', //返回值类型 一般设置为json
			headers: {
				"Authorization": "Basic " + auth
			},
			success: function(data) //服务器成功响应处理函数
			{
				if($(data).find('_status').text() == 'OK') {
					setStorage(); //刷新存储空间
					upload(uploadId, mediaType, lSelectednodeId); //重新绑定事件				
					getFileList(mediaType, lSelectednodeId);
				}
			},
			error: function(data, status, e) //服务器响应失败处理函数
			{
				errorTip(e);
			}
		})
	} else {
		console.log(lSelectednodeId);
		$.ajaxFileUpload({
			type: 'post',
			data: {
				"directory": lSelectednodeId
			},
			url: baseUrl + 'media_file', //用于文件上传的服务器端请求地址
			secureuri: false, //是否需要安全协议，一般设置为false
			fileElementId: uploadId, //文件上传域的ID
			dataType: 'xml', //返回值类型 一般设置为json
			headers: {
				"Authorization": "Basic " + auth
			},
			success: function(data) //服务器成功响应处理函数
			{
				if($(data).find('_status').text() == 'OK') {
					upload(uploadId, mediaType, lSelectednodeId); //重新绑定事件
					getFileList(mediaType, lSelectednodeId); //有选中的目录，刷新文件
				}
			},
			error: function(data, status, e) //服务器响应失败处理函数
			{
				errorTip(e);
			}
		})
	}
}

//树目录结构初始化
//setting配置项   树1
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
		showIcon: false, //是否显示图标
		showLine: false, //是否显示先
		fontCss: setFontCss, //设置样式
		selectedMulti: false, //设置是否允许同时选中多个节点
		addHoverDom: addHoverDom, // 用于当鼠标移动到节点上时，显示用户自定义控件。务必与 setting.view.removeHoverDom 同时使用
		removeHoverDom: removeHoverDom // 用于当鼠标移出节点时，隐藏用户自定义控件。务必与 addHoverDom 同时使用
	},
	callback: {
		beforeRename: zTreeBeforeRename, //重命名目录之前进行的操作
		onRename: zTreeOnRename, //重命名的时候进行的操作
		beforeRemove: zTreebeforeRemove, //删除目录之前进行的操作
		onRemove: zTreeOnRemove, //删除的时候进行的操作
		beforeDrag: beforeDrag,
		onAsyncSuccess: ztreeOnAsyncSuccess,
		onClick: ztreeOnAsyncSuccess
	}
};

function zTreeInit(mediaType, ztreeId) {
	mediacatagory(mediaType, ztreeId, setting); //渲染目录
	getFileList(mediaType, lSelectednodeId); //渲染文件
}
zTreeInit(mediaType, 'tree1'); //初始化树目录结构
//渲染目录
function mediacatagory(mediaType, ztreeId, settings) {
	$.ajax({
		type: "get",
		async: false,
		url: baseUrl + 'media_center?where={"media_type":"' + mediaType + '","parent":{"$exists":false}}',
		contentType: "application/json;charset=UTF-8",
		dataType: 'json',
		headers: {
			"Authorization": "Basic " + auth
		},
		beforeSend: function() {
			$("body").append('<div id="loading" class="loader-inner ball-clip-rotate" style="position:fixed;top:0;left:0;bottom:0;right:0;background-color: #000;opacity: .6;z-index: 10002;"><div style="position:fixed;left:50%;top:50%;"></div></div>')
		},
		success: function(data) {
			try {
				var nodes = [];
				if(data && data._items && data._items.length) {
					$.each(data._items, function(i, e) {
						nodes.push({
							id: e._id,
							pId: 1,
							name: e.name
						});
					});
				}
				//树2不需要有根目录
				if(ztreeId == 'tree1') {
					nodes.push({
						id: 1,
						pId: 0,
						name: '媒体中心'
					})
				}
				$.fn.zTree.init($('#' + ztreeId), settings, nodes);
				$.fn.zTree.getZTreeObj("tree1").expandAll(true);
			} catch(e) {
				console.log(e);
			}
		},
		complete: function() {
			$('#loading').remove();
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log("ERROR" + textStatus);
		}
	});
}

function setFileHtml(data) {
	console.log(data._items);
	$('#mediaCheckAll').prop("checked", false); //去除沟
	$('#mediaPicContainer,#mediaPicContainer2').html('');
	//设置列表页
	$.each(data._items, function(i, e) {
		str = '<div class="item" dataId=' + e._id + '>' +
			'<span><input type="checkbox"/></span>' +
			'<span data-toggle="tooltip"></span>' +
			'<span data-toggle="tooltip"></span>' +
			'<span data-toggle="tooltip"></span>' +
			'<span data-toggle="tooltip" class="linkSpan"></span></div>'
		$('#mediaPicContainer').append(str);
		if(e.filename != null) {
			$('#mediaPicContainer').find('.item').eq(i).find('span').eq(1).text(e.filename);
			$('#mediaPicContainer').find('.item').eq(i).find('span').eq(1).attr('title', '文件名称：' + e.filename);
		}
		if(e._created != null) {
			$('#mediaPicContainer').find('.item').eq(i).find('span').eq(2).text(e._created);
			$('#mediaPicContainer').find('.item').eq(i).find('span').eq(2).attr('title', '文件上传日期：' + e._created);
		}
		if(e.size != null) {
			$('#mediaPicContainer').find('.item').eq(i).find('span').eq(3).text(getSize(e.size));
			$('#mediaPicContainer').find('.item').eq(i).find('span').eq(3).attr('title', '文件存储大小：' + getSize(e.size));
		}
		if(e.file != null && e.file.file != null) {
			$('#mediaPicContainer').find('.item').eq(i).find('span').eq(4).text(window.location.origin + e.file.file);
			if(mediaType == 'image') {
				$('#mediaPicContainer').find('.item').eq(i).find('span').eq(4).attr('title', '图片链接：' + e.file.file);
			} else if(mediaType == 'video') {
				$('#mediaPicContainer').find('.item').eq(i).find('span').eq(4).attr('title', '视频链接：' + e.file.file);
			} else if(mediaType == 'audio') {
				$('#mediaPicContainer').find('.item').eq(i).find('span').eq(4).attr('title', '音乐链接：' + e.file.file);
			} else if(mediaType == 'attachment') {
				$('#mediaPicContainer').find('.item').eq(i).find('span').eq(4).attr('title', '附件链接：' + e.file.file);
			}

		}
	})
	//设置图片页
	$.each(data._items, function(i, e) {
		str = '<div class="item" dataId=' + e._id + '>' +
			'<img src="' + e.file.file + '"/>' +
			'<span class="mask"></span>' +
			'<s></s></div>'
		$('#mediaPicContainer2').append(str);

	})
}
$('#mediaPicContainer').on('click', '.linkSpan', function() {
	window.open($(this).text());
})
//getFileList 一个参数页面刷新的时候初始化页面，两个参数有目录选中时，刷新文件，三个参数代表搜索时候查询文件
function getFileList(mediaType, id, arr) {
	//全局变量
	var totalNum = null; //多少条数据
	var url1, url2;
	if(arr != null && arr.length) {
		url1 = arr[0];
		url2 = arr[1];
	} else if(id != null && id.length && id != 1) { //id=1是根目录
		url1 = baseUrl + 'media_file?where={"media_type": "' + mediaType + '","directory":"' + id + '"}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'media_file?where={"media_type": "' + mediaType + '","directory":"' + id + '"}';
	} else {
		url1 = baseUrl + 'media_file?where={ "media_type": "' + mediaType + '","directory":{"$exists":false}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'media_file?where={ "media_type": "' + mediaType + '","directory":{"$exists":false}}';
	}
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
			dataIdMore = [];
			if(data != null && data._items != null && data._items.length) {
				totalNum = data._meta.total;
				$('#mediaPage').remove(); //移除page容器
				$('#media-pageParent').append('<div id="mediaPage"></div>'); //追加page容器
				pageUtil.initPage('mediaPage', {
					totalCount: totalNum, //总页数，一般从回调函数中获取。如果没有数据则默认为1页
					curPage: 1, //初始化时的默认选中页，默认第一页。如果所填范围溢出或者非数字或者数字字符串，则默认第一页
					showCount: 5, //分页栏显示的数量
					pageSizeList: [6, 12, 18, 24, 30], //自定义分页数，默认[5,10,15,20,50]
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
								try {
									setFileHtml(data);
								} catch(e) {
									console.log(e);
								}
							},
							error: function(e) {
								console.log(e);
							}
						})
					},
				});
				try {
					setFileHtml(data);
				} catch(e) {
					console.log(e);
				}

			} else {
				$('#mediaPicContainer,#mediaPicContainer2').html('<div style="color:gray;font-size: 20px;margin-top:20px;text-align:center">查询无结果</div>');
				$('#mediaPage').remove();
			}
		},
		complete: function() {
			$('#loading').remove();
		},
		error: function(data) {
			errorTip('获取文件失败');
			dataIdMore = [];
		}
	});
}

function getSize(size) {
	if(size > 1024 * 1024) {
		size = (Math.round(size / (1024 * 1024))).toString() + 'MB';
	} else {
		size = (Math.round(size / 1024)).toString() + 'KB';
	}
	return size;
}
//左侧树异步加载目录
function ztreeOnAsyncSuccess(event, treeId, treeNode) {
	$.fn.zTree.getZTreeObj("tree1").selectNode(treeNode);
	lSelectednodeId = []; //清空，只能存一个数据
	lSelectednodeId.push($.fn.zTree.getZTreeObj("tree1").getSelectedNodes()[0].id); //选中的节点存储起来，便于上传的时候用
	//如果是根目录，直接渲染根目录的文件
	if(treeNode.pId == 0) {
		getFileList(mediaType, treeNode.id);
		return
	}
	if(treeNode.children != null && treeNode.children.length) {
		getFileList(mediaType, treeNode.id); //获取文件列表
		return;
	}
	var url = baseUrl + '/media_center?where={"parent":"' + treeNode.id + '"}';
	$.ajax({
		type: "get",
		url: url,
		dataType: "json",
		async: true,
		contentType: "application/json;charset=UTF-8",
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			console.log(data);
			if(data != null) {
				var items = data._items;
				var nodes = [];
				if(items != null && items.length != 0) {
					$.each(items, function(i, e) {
						nodes.push({
							id: e._id,
							pId: e.parent,
							name: e.name
						});
					});
					$.fn.zTree.getZTreeObj("tree1").addNodes(treeNode, nodes, true); //如果是加载子节点，那么就是父节点下面加载 
					$.fn.zTree.getZTreeObj("tree1").expandNode(treeNode, true, false, false); // 将新获取的子节点展开  					
				}
			}
			getFileList(mediaType, treeNode.id); //获取文件列表
		},
		error: function() {
			errorTip("请求错误！");
		}
	});

}
//弹出层里边树异步加载函数
function ztreeOnAsyncSuccess2(event, treeId, treeNode) {
	rSelectednodeId = [];
	rSelectednodeId.push($.fn.zTree.getZTreeObj("tree2").getSelectedNodes()[0].id); //选中的节点存储起来，便于上传的时候用
	if(treeNode.children != null && treeNode.children.length) {
		return;
	}
	var url = baseUrl + '/media_center?where={"parent":"' + treeNode.id + '"}';
	$.ajax({
		type: "get",
		url: url,
		dataType: "json",
		async: true,
		contentType: "application/json;charset=UTF-8",
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			console.log(data);
			if(data != null) {
				var items = data._items;
				var nodes = [];
				if(items != null && items.length != 0) {
					$.each(items, function(i, e) {
						nodes.push({
							id: e._id,
							pId: e.parent,
							name: e.name
						});
					});
					$.fn.zTree.getZTreeObj("tree2").addNodes(treeNode, nodes, true); //如果是加载子节点，那么就是父节点下面加载 
					//$.fn.zTree.getZTreeObj("tree2").expandAll(false);
					$.fn.zTree.getZTreeObj("tree2").expandNode(treeNode, true, false, false); // 将新获取的子节点展开  					
				}
			}
		},
		error: function() {
			errorTip("请求错误！");
		}
	});

}

function beforeDrag(treeId, treeNodes, targetNode) {
	return false;
}
var newCount = 1;

function beforeEditAjax(obj, treeObj, newName, addTreeNode) {
	$.ajax({
		type: 'post',
		url: baseUrl + 'media_center',
		data: JSON.stringify(obj),
		dataType: 'json',
		contentType: "application/json;charset=UTF-8",
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data._status == 'OK') {
				console.log(data);
				addTreeNode[0].id = data._id; //设置添加成功后返回的id给新节点
				addedHoverDomFlag = true;
				$.fn.zTree.getZTreeObj("tree1").cancelEditName(newName);
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			if(XMLHttpRequest.status == 422 || XMLHttpRequest.status == 403) {
				$.fn.zTree.getZTreeObj("tree1").editName(newName);
				errorTip('一个分类下不能添加相同名称的分类名，并且也不能和上级、上上级同名');
			}
		}
	})
}

var addHoverDomFlag = false;
var addHoverDomObj = {};
var addTreeNode; //添加的节点
function addHoverDom(treeId, treeNode) {
	var sObj = $("#" + treeNode.tId + "_span");
	//console.log(treeId,treeNode);
	if(treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0) return;
	var addStr = "<span class='button add' id='addBtn_" + treeNode.tId +
		"' title='添加' onfocus='this.blur();'></span>";
	sObj.after(addStr);
	var btn = $("#addBtn_" + treeNode.tId);
	btn.bind("click", function() {
		var zTree = $.fn.zTree.getZTreeObj("tree1");
		addHoverDomFlag = true;
		//向后台发送添加到的数据
		addHoverDomObj = {};
		console.log(zTree);
		addTreeNode = zTree.addNodes(treeNode, {
			id: (100 + newCount),
			pId: treeNode.id,
			name: "新标签" + (newCount++)
		});
		//如果是根目录进行添加，不发送parent这个属性,发送媒体中心类型
		if(addTreeNode[0].pId != 1) {
			addHoverDomObj.parent = addTreeNode[0].pId;
		} else {
			addHoverDomObj.media_type = mediaType;
		}
		addHoverDomObj.name = addTreeNode[0].name;
		zTree.editName(addTreeNode[0]); //新增节点进入编辑状态
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
		errorTip("节点名称不能为空.");
		var zTree = $.fn.zTree.getZTreeObj("tree1");
		setTimeout(function() {
			zTree.editName(treeNode)
		}, 10);
		return false;
	} else if(newName.length < 2 || newName.length > 6) {
		errorTip('节点名称长度在2-6之间');
		var zTree = $.fn.zTree.getZTreeObj("tree1");
		setTimeout(function() {
			zTree.editName(treeNode)
		}, 10);
		return false;
	} else if(addHoverDomFlag) { //增加标签假替换
		if(addedHoverDomFlag) {
			return true;
		}
		var treeObj = $.fn.zTree.getZTreeObj("tree1");
		console.log(addHoverDomObj);
		addHoverDomObj.name = newName;
		beforeEditAjax(addHoverDomObj, zTree, newName, addTreeNode);
		return false;
	} else {
		return true;
	}

}

//正在修改名的操作
function zTreeOnRename(event, treeId, treeNode, isCancel) {
	//console.log('onrename');
	//增加节点假替换
	if(addedHoverDomFlag) {
		addedHoverDomFlag = false;
		return;
	}
	if(tagName != treeNode.name) { //如果当前名称和新建名称不一样  给后台发送请求
		//给后台发送请求
		$.ajax({
			type: 'patch',
			url: baseUrl + 'media_center/' + treeNode.id,
			data: JSON.stringify({
				name: treeNode.name
			}),
			dataType: 'json',
			contentType: "application/json;charset=UTF-8",
			headers: {
				"Authorization": "Basic " + auth
			},
			success: function(data) {
				tagName = null;
				if(data.status == 200) {
					errorTip('替换成功');
					$.each($('#tree1 a'), function() {
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
				var zTree = $.fn.zTree.getZTreeObj("tree1");
				zTree.editName(treeNode);
			}
		})
	}

}

//删除之前要做的
function zTreebeforeRemove(treeId, treeNode) {
	var con = confirm("确定要删除目录 '" + treeNode.name + "' 吗?")
	return con
}

//正在删除该做的,批量删除目录
function zTreeOnRemove(event, treeId, treeNode) {
	$.ajax({
		type: 'delete',
		url: baseUrl + '/media_center/' + treeNode.id,
		dataType: 'json',
		contentType: "application/json;charset=UTF-8",
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			console.log(data);
			if(data.success == 'OK') {
				errorTip('删除成功')
			}
		},
		error: function() {
			errorTip('删除失败')
		}
	})
}
//移除删除按钮
function showRemoveBtn(treeId, treeNode) {
	if(treeNode.name == '媒体中心') return false;
	return true;
}
//移除编辑按钮
function showRenameBtn(treeId, treeNode) {
	if(treeNode.name == '媒体中心') return false;
	return true;
}
//设置样式
function setFontCss(treeId, treeNode) {
	return {
		color: "#fff",
		background: "#14c3a1"
	}
};
//移除删除按钮
function showRemoveBtn2(treeId, treeNode) {
	return false;
}

//移除编辑按钮
function showRenameBtn2(treeId, treeNode) {
	return false;
}
//树目录结构初始化
//setting配置项   树2
var setting2 = {
	edit: {
		enable: true,
		editNameSelectAll: true,
		showRenameBtn: showRenameBtn2, //显示隐藏重名按钮
		showRemoveBtn: showRemoveBtn2, //显示隐藏删除按钮
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
		showIcon: false, //是否显示图标
		showLine: false, //是否显示先
		fontCss: setFontCss, //设置样式
		selectedMulti: false //设置是否允许同时选中多个节点	
	},
	callback: {
		beforeDrag: beforeDrag,
		onAsyncSuccess: ztreeOnAsyncSuccess2,
		onClick: ztreeOnAsyncSuccess2
	}
};

function zTreeInit2(mediaType, ztreeId) {
	mediacatagory(mediaType, ztreeId, setting2);
}
//点击全选按钮
$('#mediaCheckAll').click(function() {
	$('#mediaPicContainer input').prop("checked", $(this).prop("checked"));
	dataIdMore = []; //要删除文章的id
	$.each($('#mediaPicContainer input'), function(i, e) {
		if($(this).get(0).checked) {
			var id = $(this).parent().parent().attr('dataId')
			dataIdMore.push(id);
		}
	});
})
//点击行checkbox按钮
$('#mediaPicContainer').on('click', 'input', function() {
	$('#mediaCheckAll').prop("checked", $('#mediaPicContainer input').length === $("#mediaPicContainer input:checked").length);
	dataIdMore = []; //要删除文章的id
	$.each($('#mediaPicContainer input'), function(i, e) {
		if($(this).get(0).checked) {
			var id = $(this).parent().parent().attr('dataId')
			dataIdMore.push(id);
		}
	});
})
//点击删除按钮
$('#media-del').click(function() {
	//对象不为空执行删除操作
	if(dataIdMore.toString()) {
		var msg = "您真的确定要删除吗？\n\n请确认！";
		if(confirm(msg) == true) {
			deleteMore(dataIdMore);
		} else {
			return false;
		}
	} else {
		errorTip('请选择要删除的')
	}
})

function deleteMore(dataIdMore) {
	var obj = {};
	obj.id = dataIdMore;
	//如果选中的是根节点,或者没选中根节点，默认就是根节点
	if(lSelectednodeId[0] == 1 || lSelectednodeId[0] === undefined) {

	} else {
		obj.parent_id = lSelectednodeId[0];
	}
	$.ajax({
		type: "post",
		url: baseUrl + 'media_file/batch-delete',
		data: JSON.stringify(obj),
		contentType: "application/json;charset=UTF-8",
		dataType: 'json',
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data.success == 'OK') {
				dataIdMore = [];
				errorTip('删除成功');
				getFileList(mediaType, lSelectednodeId);
				setStorage(); //刷新存储空间
			}
		},
		error: function() {
			dataIdMore = [];
			errorTip('删除失败');
		}
	})
}
//移动到
$('#moveto').click(function() {
	$('.ztreeBox').show();
	zTreeInit2(mediaType, 'tree2'); //初始化树目录结构
})
$(document).ready(function() {
	$("#tree2").niceScroll({
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
//树目录取消
$('.cancelBtn').click(function() {
	$('.ztreeBox').hide();
	return false;
})
//树目录确定
$('.sureBtn').click(function() {
	var obj = {};
	//rSelectednodeId选中的id
	if(lSelectednodeId != null && lSelectednodeId.length && lSelectednodeId[0] != 1) {
		obj.parent_id = lSelectednodeId[0];
	}
	if(rSelectednodeId != null && rSelectednodeId.length) {
		obj.target_id = rSelectednodeId[0];
	} else {
		errorTip('请选择移动到的目录');
		return
	}
	if(dataIdMore != null && dataIdMore.length) {
		obj.id = dataIdMore;
	} else {
		errorTip('请选择要移动的文件');
		return
	}
	removeMore(obj); //移动
	return false;
})
//移动文件
function removeMore(obj) {
	$.ajax({
		type: "post",
		url: baseUrl + 'media_center/move_file',
		data: JSON.stringify(obj),
		contentType: "application/json;charset=UTF-8",
		dataType: 'json',
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			errorTip('移动成功');
			getFileList(mediaType, lSelectednodeId); //刷新列表
			$('.ztreeBox').hide(); //移动成功之后关闭弹框
		},
		error: function() {
			errorTip('移动失败')
		}
	})
}
//按时间，大小，关键字搜索
$('#search').click(function() {
	var time = $('#time').val().trim();
	var smallSize = $('#smallSize').val().trim();
	var largeSize = $('#largeSize').val().trim();
	var importantwords = $('#importantwords').val().trim();
	if(time == '' && smallSize == '' && largeSize == '' && importantwords == '') {
		getFileList(mediaType, lSelectednodeId); //渲染文件
		return
	}
	if(smallSize == '' && largeSize != '') {
		errorTip('请输入大小的最小值');
		return
	}
	if(smallSize != '' && largeSize == '') {
		errorTip('请输入大小的最大值');
		return
	}
	var url1, url2, arr = [];
	//只有时间
	if(time != '' && smallSize == '' && largeSize == '' && importantwords == '') {
		if(lSelectednodeId[0] == 1 || lSelectednodeId[0] === undefined) {
			url1 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","_created":{"$gte":"' + time + ' 00:00:00","$lt":"' + time + ' 23:59:59"}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]'
			url2 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","_created":{"$gte":"' + time + ' 00:00:00","$lt":"' + time + ' 23:59:59"}}'
		} else {
			url1 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","directory":"' + lSelectednodeId[0] + '","_created":{"$gte":"' + time + ' 00:00:00","$lt":"' + time + ' 23:59:59"}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]'
			url2 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","directory":"' + lSelectednodeId[0] + '","_created":{"$gte":"' + time + ' 00:00:00","$lt":"' + time + ' 23:59:59"}}'
		}
		arr.push(url1, url2);
		getFileList(mediaType, lSelectednodeId, arr);
		return;
	}
	//只有大小
	if(time == '' && smallSize != '' && largeSize != '' && importantwords == '') {
		if(lSelectednodeId[0] == 1 || lSelectednodeId[0] === undefined) {
			url1 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","size":{"$gte":' + smallSize + ',"$lte":' + largeSize + '}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]'
			url2 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","size":{"$gte":' + smallSize + ',"$lte":' + largeSize + '}}'
		} else {
			url1 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","directory":"' + lSelectednodeId[0] + '","size":{"$gte":' + smallSize + ',"$lte":' + largeSize + '}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]'
			url2 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","directory":"' + lSelectednodeId[0] + '","size":{"$gte":' + smallSize + ',"$lte":' + largeSize + '}}'
		}
		arr.push(url1, url2);
		getFileList(mediaType, lSelectednodeId, arr);
		return;
	}
	//只有关键字
	if(time == '' && smallSize == '' && largeSize == '' && importantwords != '') {
		if(lSelectednodeId[0] == 1 || lSelectednodeId[0] === undefined) {
			url1 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","filename":{"$regex":"' + importantwords + '"}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]'
			url2 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","filename":{"$regex":"' + importantwords + '"}}'
		} else {
			url1 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","directory":"' + lSelectednodeId[0] + '","filename":{"$regex":"' + importantwords + '"}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]'
			url2 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","directory":"' + lSelectednodeId[0] + '","filename":{"$regex":"' + importantwords + '"}}'
		}
		arr.push(url1, url2);
		getFileList(mediaType, lSelectednodeId, arr);
		return;
	}
	//都有
	if(time != '' && smallSize != '' && largeSize != '' && importantwords != '') {
		if(lSelectednodeId[0] == 1 || lSelectednodeId[0] === undefined) {
			url1 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","filename":{"$regex":"' + importantwords + '"},"size":{"$gte":' + smallSize + ',"$lte":' + largeSize + '},"_created":{"$gte":"' + time + ' 00:00:00","$lt":"' + time + ' 23:59:59"}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]'
			url2 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","filename":{"$regex":"' + importantwords + '"},"size":{"$gte":' + smallSize + ',"$lte":' + largeSize + '},"_created":{"$gte":"' + time + ' 00:00:00","$lt":"' + time + ' 23:59:59"}}'
		} else {
			url1 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","directory":"' + lSelectednodeId[0] + '","filename":{"$regex":"' + importantwords + '"},"size":{"$gte":' + smallSize + ',"$lte":' + largeSize + '},"_created":{"$gte":"' + time + ' 00:00:00","$lt":"' + time + ' 23:59:59"}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]'
			url2 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","directory":"' + lSelectednodeId[0] + '","filename":{"$regex":"' + importantwords + '"},"size":{"$gte":' + smallSize + ',"$lte":' + largeSize + '},"_created":{"$gte":"' + time + ' 00:00:00","$lt":"' + time + ' 23:59:59"}}'
		}
		arr.push(url1, url2);
		getFileList(mediaType, lSelectednodeId, arr);
		return;
	}
	//只有时间和大小
	if(time != '' && smallSize != '' && largeSize != '' && importantwords == '') {
		if(lSelectednodeId[0] == 1 || lSelectednodeId[0] === undefined) {
			url1 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","size":{"$gte":' + smallSize + ',"$lte":' + largeSize + '},"_created":{"$gte":"' + time + ' 00:00:00","$lt":"' + time + ' 23:59:59"}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]'
			url2 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","size":{"$gte":' + smallSize + ',"$lte":' + largeSize + '},"_created":{"$gte":"' + time + ' 00:00:00","$lt":"' + time + ' 23:59:59"}}'
		} else {
			url1 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","directory":"' + lSelectednodeId[0] + '","size":{"$gte":' + smallSize + ',"$lte":' + largeSize + '},"_created":{"$gte":"' + time + ' 00:00:00","$lt":"' + time + ' 23:59:59"}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]'
			url2 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","directory":"' + lSelectednodeId[0] + '","size":{"$gte":' + smallSize + ',"$lte":' + largeSize + '},"_created":{"$gte":"' + time + ' 00:00:00","$lt":"' + time + ' 23:59:59"}}'
		}
		arr.push(url1, url2);
		getFileList(mediaType, lSelectednodeId, arr);
		return;
	}
	//只有时间和关键字
	if(time != '' && smallSize == '' && largeSize == '' && importantwords != '') {
		if(lSelectednodeId[0] == 1 || lSelectednodeId[0] === undefined) {
			url1 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","filename":{"$regex":"' + importantwords + '"},"_created":{"$gte":"' + time + ' 00:00:00","$lt":"' + time + ' 23:59:59"}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]'
			url2 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","filename":{"$regex":"' + importantwords + '"},"_created":{"$gte":"' + time + ' 00:00:00","$lt":"' + time + ' 23:59:59"}}'
		} else {
			url1 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","directory":"' + lSelectednodeId[0] + '","filename":{"$regex":"' + importantwords + '"},"_created":{"$gte":"' + time + ' 00:00:00","$lt":"' + time + ' 23:59:59"}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]'
			url2 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","directory":"' + lSelectednodeId[0] + '","filename":{"$regex":"' + importantwords + '"},"_created":{"$gte":"' + time + ' 00:00:00","$lt":"' + time + ' 23:59:59"}}'
		}
		arr.push(url1, url2);
		getFileList(mediaType, lSelectednodeId, arr);
		return;
	}
	//只有关键字和大小
	if(time == '' && smallSize != '' && largeSize != '' && importantwords != '') {
		if(lSelectednodeId[0] == 1 || lSelectednodeId[0] === undefined) {
			url1 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","filename":{"$regex":"' + importantwords + '"},"size":{"$gte":' + smallSize + ',"$lte":' + largeSize + '}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]'
			url2 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","filename":{"$regex":"' + importantwords + '"},"size":{"$gte":' + smallSize + ',"$lte":' + largeSize + '}}'
		} else {
			url1 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","directory":"' + lSelectednodeId[0] + '","filename":{"$regex":"' + importantwords + '"},"size":{"$gte":' + smallSize + ',"$lte":' + largeSize + '}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]'
			url2 = baseUrl + 'media_file?where={"media_type":"' + mediaType + '","directory":"' + lSelectednodeId[0] + '","filename":{"$regex":"' + importantwords + '"},"size":{"$gte":' + smallSize + ',"$lte":' + largeSize + '}}'
		}
		arr.push(url1, url2);
		getFileList(mediaType, lSelectednodeId, arr);
		return;
	}
})
//多文件上传
$(function() {
	var i = 0;
	var j = 0;

	$("#fileMutiply,#upload").change(function eventStart() {
		var ss = this.files; //获取当前选择的文件对象
		var exp;
		for(var m = 0; m < ss.length; m++) { //循环添加进度条
			efileName = ss[m].name;
			//判断当前媒体中心所在类型
			if(mediaType == 'image') {
				exp = /(\.gif|\.jpeg|\.png|\.jpg|\.bmp)/;
				if(!exp.test(efileName)) {
					mediauploading = false;
					errorTip('请上传图片格式的文件');
					return;
				}
			} else if(mediaType == 'video') {
				//swf|flv|mp4|rmvb|avi|mpeg|ra|ram|mov|wmv
				exp = /(\.flv|\.rvmb|\.mp4|\.avi|\.wmv)/;
				if(!exp.test(efileName)) {
					mediauploading = false;
					errorTip('请上传视频格式的文件');
					return;
				}

			} else if(mediaType == 'audio') {
				exp = /(\.mp3|\.wav|\.wma|\.ogg|\.ape|\.acc)/;
				if(!exp.test(efileName)) {
					mediauploading = false;
					errorTip('请上传音频格式的文件');
					return;
				}
			}
			mediauploading = true; //正在上传文件
			sfileSize = getSize(ss[m].size);
			$(".filelist").append("<li  id=" + m + "file><div class='progress'><div id=" + m + "barj class='progressbar'></div></div><span class='filename'>" + efileName + "</span><span id=" + m + "pps class='progressnum'></span><span>" + sfileSize + "</span></li>");
		}
		sendAjax();

		function sendAjax() {
			if(j >= ss.length) //采用递归的方式循环发送ajax请求
			{
				setStorage(); //刷新存储空间
				getFileList(mediaType, lSelectednodeId); //渲染文件列表
				$("#fileMutiply").val("");
				$('#upload').val("");
				j = 0;
				mediauploading = false; //视频上传结束
				return;
			}
			var formData = new FormData();
			formData.append('file', ss[j]); //将该file对象添加到formData对象中
			$.ajax({
				url: baseUrl + 'media_file',
				type: 'POST',
				cache: false,
				//data: {}, //需要什么参数，自己配置
				data: formData, //文件以formData形式传入
				processData: false,
				//必须false才会自动加上正确的Content-Type 
				contentType: false,
				xhr: function() { //监听用于上传显示进度
					var xhr = $.ajaxSettings.xhr();
					if(onprogress && xhr.upload) {
						xhr.upload.addEventListener("progress", onprogress, false);
						return xhr;
					}
				},
				headers: {
					"Authorization": "Basic " + auth
				},
				success: function(data) {
					console.log(data);
					$(".filelist").find("#" + j + "file").remove(); //移除进度条样式
					j++; //递归条件
					sendAjax();
				},
				error: function(xhr) {
					$(".filelist").remove();
					errorTip("上传出错");
				}
			});
		}
	})

	function onprogress(evt) {
		if(evt.lengthComputable) {
			var loaded = evt.loaded; //已经上传大小情况 
			var tot = evt.total; //附件总大小 
			var per = Math.floor(100 * loaded / tot); //已经上传的百分比 
			$(".filelist").find("#" + j + "pps").text(per + "%");
			$(".filelist").find("#" + j + "barj").css("width", per + "%");
		}
	};
})
//批量操作项隐藏
$('#moredo .dt').click(function() {
	$(this).parent().find('.list').toggle();
})
//点击切换模式按钮
$('#showList').click(function() {
	dataIdMore = []; //清空容器
	//清空勾选的checkbox框
	$('#media-list .content1 input').prop('checked', false);
	$(this).removeClass('i1').addClass('i11');
	$('#showPic').removeClass('i22').addClass('i2');
	$('#media-list .content1').show();
	$('#media-list .content2').hide();
})
$('#showPic').click(function() {
	dataIdMore = []; //清空容器
	//清空选中的图片勾选按钮 以及模态框
	$('#media-list .content2 .mask,#media-list .content2 s').hide();
	$(this).removeClass('i2').addClass('i22');
	$('#showList').removeClass('i11').addClass('i1');
	$('#media-list .content1').hide();
	$('#media-list .content2').show();
})
//点击图片
$('#mediaPicContainer2').on('click', '.item', function() {
	var dataId = $(this).attr('dataId');
	$(this).find('span').toggle();
	$(this).find('s').toggle();
	//存储id
	if($(this).find('s').is(":hidden")) { //从显示变隐藏：未选中 dataIdMore里边不能存对应的dataId
		if(dataIdMore.length) {
			$.each(dataIdMore, function(i, e) {
				if(e == dataId) {
					dataIdMore.splice(i, 1); //
					return false;
				}
			});
		}
	} else { //从隐藏变显示：选中
		dataIdMore.push(dataId);
	}
})
/*是否中断文件上传*/
//点击确定 跳转到相应的页面
$('#continueUpload .sure').click(function() {
	window.location = switchTo;
})
$('#continueUpload .cancel').click(function() {
	$('#continueUpload,#mark').hide();
})
$(document).click(function() {
	$('#moredo .list').hide();
})
$('#moredo>span').click(function() {
	return false;
})