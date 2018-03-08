var setContentLimitData; //存储内容限制
var postTicket; //存储新建投票的信息
var editPostTicket; //存储编辑投票的信息
var pagesize = 10;
var curpage = 1;
var flag = '常用';
var winW = $(window).width(); //浏览器可视区宽度
var winH = $(window).height(); //浏览器可视区高度
var tagBoxW; //标签弹框宽
var tagBoxH; //标签弹框高
var addGalleryW; //添加画廊弹框宽
var addGalleryH; //添加画廊弹框高
var len; //文本框弹出事件验证字符长度
var detailList; //获取列表页数据
var editOrnewForMedia; //区分是编辑页还是新建页
var power; //存储查看权限列表
var newsubheadObj = { //副标题对象
	"时间": true,
	"作者": true,
	"来源": true,
	"浏览人数": true,
	"上下条": true
}
var editsubheadObj = { //副标题对象
	"时间": true,
	"作者": true,
	"来源": true,
	"浏览人数": true,
	"上下条": true
}
//右侧列表置顶、推荐、点击事件
var rItem1 = {
	'置顶': false
}; //存置顶值对象，是true or false
var rItem2 = {
	'推荐': false
}; //存推荐值对象，是true or false
var rItem4 = {
	'评论': false
}; //存评论值对象，是true or false
var edititem1 = {
	'置顶': false
}; //存置顶值对象，是true or false
var edititem2 = {
	'推荐': false
}; //存推荐值对象，是true or false
var edititem4 = {
	'评论': false
}; //存评论值对象，是true or false

//判断路径，获取当前路径下的类别
var contentType;
if(window.location.pathname == '/content-gallery.html') {
	contentType = 'gallery';
} else if(window.location.pathname == '/content-article.html') {
	contentType = 'article';
} else if(window.location.pathname == '/content-video.html') {
	contentType = 'video';
} else if(window.location.pathname == '/content-music.html') {
	contentType = 'music';
} else if(window.location.pathname == '/content-subject.html') {
	contentType = 'subject';
} else if(window.location.pathname == '/content-book.html') {
	contentType = 'book';
} else if(window.location.pathname == '/content-live.html') {
	contentType = 'live';
}
//获取查看权限
function getPower() {
	$.ajax({
		type: "get",
		url: baseUrl + "/get_register_level",
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			console.log(data)
			if(data != null && data.item != null && data.item.length != 0) {
				power = data.item;
				$.each(data.item, function(i, e) {
					$('#editSelect,#newSelect').append('<option value="' + e["名称"] + '" dataLevel="' + e['级别'] + '">' + e["名称"] + '</option>');
					$("#editSelect option:first,#newSelect option:first").prop("selected", 'selected');
					//设置批量权限列表
					$('#setpower').append('<div dataId="' + e['级别'] + '">' + e["名称"] + '</div>');
				});
			}
		}
	});
}
//选择语言
$('#sel-lang1 .sel-dt').click(function() {
	$(this).parent().find('.sel-dd').toggle();
	return false;
})
//列表页选择语言
$('#sel-lang1 .sel-dd').on('click', 'li', function() {
	var $that = $(this);
	//设置选中语言勾选状态
	$.each($('#sel-lang1 .sel-dd').find('li'), function(i, e) {
		if($(this).text() == $that.text()) {
			$(this).addClass('active-bg').siblings().removeClass('active-bg');
		}
	});
	$('#sel-lang1 .sel-dt').text($(this).text());
	$(this).parent().hide();
	//存储选择后的语言	
	sessionStorage.setItem('defaultLang', $(this).text());
	defaultLang = sessionStorage.getItem('defaultLang');
	//新建页或者编辑页 或取对应内容长度限制
	contentLimit(); //初始化查询对应内容各种长度限制
	getAllList();
	return false;
})
//右侧加号点击事件
$('.click-add').click(function() {
	$('.exta-list').toggle();
	return false;
})

function rightItemClick() {
	//置顶
	$('#item1').click(function() {
		if($(this).hasClass('active-bg')) {
			rItem1['置顶'] = false;
			$(this).removeClass();
			$(this).find('i').removeClass().addClass('icon1');
		} else {
			rItem1['置顶'] = true;
			$(this).removeClass().addClass('active-bg');
			$(this).find('i').removeClass().addClass('active-icon1');
		}
		return false;
	})
	$('#edititem1').click(function() {
		if($(this).hasClass('active-bg')) {
			edititem1['置顶'] = false;
			$(this).removeClass();
			$(this).find('i').removeClass().addClass('icon1');
		} else {
			edititem1['置顶'] = true;
			$(this).removeClass().addClass('active-bg');
			$(this).find('i').removeClass().addClass('active-icon1');
		}
		return false;
	})
	//推荐
	$('#edititem2').click(function() {
		if($(this).hasClass('active-bg')) {
			edititem2['推荐'] = false;
			$(this).removeClass();
			$(this).find('i').removeClass().addClass('icon2');
		} else {
			edititem2['推荐'] = true;
			$(this).removeClass().addClass('active-bg');
			$(this).find('i').removeClass().addClass('active-icon2');
		}
		return false;
	})
	$('#item2').click(function() {
		if($(this).hasClass('active-bg')) {
			rItem2['推荐'] = false;
			$(this).removeClass();
			$(this).find('i').removeClass().addClass('icon2');
		} else {
			rItem2['推荐'] = true;
			$(this).removeClass().addClass('active-bg');
			$(this).find('i').removeClass().addClass('active-icon2');
		}
		return false;
	})
	//投票
	$('#item3').mouseover(function() {
		$('#itemlist').show();
	})
	$('#item3').mouseout(function() {
		$('#itemlist').hide();
	})
	$('#edititem3').mouseover(function() {
		$('#edititemlist').show();
	})
	$('#edititem3').mouseout(function() {
		$('#edititemlist').hide();
	})
	$('#item3 div').click(function() {
		if($(this).hasClass('active-bg2')) {
			$(this).removeClass('active-bg2');
		} else {
			$(this).addClass('active-bg2').siblings().removeClass('active-bg2');
		}
		var text = $(this).text();
		$.ajax({
			type: "get",
			aysnc: false,
			url: baseUrl + 'get_vote?keyword=' + text,
			headers: {
				"Authorization": "Basic " + auth
			},
			success: function(data) {
				postTicket = data.item;
			},
			error: function() {

			}
		});
		return false;
	})
	$('#edititem3 div').click(function() {
		if($(this).hasClass('active-bg2')) {
			$(this).removeClass('active-bg2');
		} else {
			$(this).addClass('active-bg2').siblings().removeClass('active-bg2');
		}
		var text = $(this).text();
		$.ajax({
			type: "get",
			aysnc: false,
			url: baseUrl + 'get_vote?keyword=' + text,
			headers: {
				"Authorization": "Basic " + auth
			},
			success: function(data) {
				editPostTicket = data.item;
			},
			error: function() {

			}
		});
		return false;
	})
	//评论
	$('#item4').click(function() {
		if($(this).hasClass('active-bg')) {
			rItem4['评论'] = false;
			$(this).removeClass();
			$(this).find('i').removeClass().addClass('icon4');
		} else {
			rItem4['评论'] = true;
			$(this).removeClass().addClass('active-bg');
			$(this).find('i').removeClass().addClass('active-icon4');
		}
		return false;
	})
	$('#edititem4').click(function() {
		if($(this).hasClass('active-bg')) {
			edititem4['推荐'] = false;
			$(this).removeClass();
			$(this).find('i').removeClass().addClass('icon4');
		} else {
			edititem4['推荐'] = true;
			$(this).removeClass().addClass('active-bg');
			$(this).find('i').removeClass().addClass('active-icon4');
		}
		return false;
	})
}
rightItemClick();
/*选择标签部分start*/
//新建部分添加标签名称
$('#r-content .addbtn').click(function() {
	var ipt = $(this).parent().find('.itext').val();
	if(ipt.trim() == '') {
		errorTip('请输入要添加的标签');
		return;
	}
	var len = getByteLen(ipt);
	if(len >= 1) {
		//判断容器是否存在与添加的标签值相等
		if($('#r-content .tag-container li').length) {
			var exist = false;
			$.each($('#r-content .tag-container li'), function(i, e) {
				if($(this).text() == ipt.trim()) {
					exist = true;
					errorTip('添加的标签已经存在');
					return;
				}
			})
			if(!exist) {
				$('#r-content .tag-container').append('<li>' + ipt + '<span class="del"></span></li>');
				$(this).parent().find('.itext').val('');
			}
		} else {
			$('#r-content .tag-container').append('<li>' + ipt + '<span class="del"></span></li>');
			$(this).parent().find('.itext').val('');
		}
	} else {
		$(this).parent().find('.itext').val('');
		errorTip('添加标签的字符长度不在一个字符以上');
	}
})
//编辑部分添加标签名称
$('#r-content1 .addbtn').click(function() {
	var ipt = $(this).parent().find('.itext').val();
	if(ipt && ipt.length && ipt.trim() == '') {
		errorTip('请输入要添加的标签');
		return;
	}
	var len = getByteLen(ipt);
	if(len >= 1) {
		//判断容器是否存在与添加的标签值相等
		if($('#r-content1 .tag-container li').length) {
			var exist = false;
			$.each($('#r-content1 .tag-container li'), function(i, e) {
				if($(this).text() == ipt.trim()) {
					exist = true;
					errorTip('添加的标签已经存在');
					return;
				}
			})
			if(!exist) {
				$('#r-content1 .tag-container').append('<li>' + ipt + '<span class="del"></span></li>');
				$(this).parent().find('.itext').val('');
			}
		} else {
			$('#r-content1 .tag-container').append('<li>' + ipt + '<span class="del"></span></li>');
			$(this).parent().find('.itext').val('');
		}
	} else {
		$(this).parent().find('.itext').val('');
		errorTip('添加标签的字符长度不在一个字符以上');
	}
})
//选择标签弹框位置设置
//新建部分点击标签选择按钮
$('.tag-box').click(function() {
	return false;
})
$('#r-content .selTag').click(function() {
	$('.tag-box,#mark').show(); //显示弹框	
	$('#del-tag').html($('#r-content .tag .tag-container').html()); //添加的按钮在弹框选择按钮容器位置显示		
	getInitAllTag(); //查询所有的标签
	tagBoxW = $('.tag-box').width(); //选择标签弹框的宽度
	tagBoxH = $('.tag-box').height(); //选择标签弹框的高度
	//设置弹框位置
	$('.tag-box').css({
		'left': (winW - tagBoxW) * 0.7,
		'top': (winH - tagBoxH) * 0.5
	})
	return false;
})
//编辑部分点击标签选择按钮
$('#r-content1 .selTag').click(function() {
	$('.tag-box,#mark').show(); //显示弹框	
	$('#del-tag').html($('#r-content1 .tag .tag-container').html()); //添加的按钮在弹框选择按钮容器位置显示		
	getAllTag(); //查询所有的标签
	tagBoxW = $('.tag-box').width(); //选择标签弹框的宽度
	tagBoxH = $('.tag-box').height(); //选择标签弹框的高度
	//设置弹框位置
	$('.tag-box').css({
		'left': (winW - tagBoxW) * 0.7,
		'top': (winH - tagBoxH) * 0.5
	})
	return false;
})
//查询所有常用标签
function getInitAllTag() {
	$('#use').removeClass('active-orange');
	var url1 = baseUrl + 'tag?where={"引用次数":{"$gte":1},"语言":"' + defaultLang + '"}&sort=[("引用次数",-1)]&max_results=' + pagesize + '&page=' + curpage;
	var url2 = baseUrl + 'tag?where={"引用次数":{"$gte":1},"语言":"' + defaultLang + '"}&sort=[("引用次数",-1)]';
	tagAjax(url1, url2);
}

function getAllTag() {
	$('#use').addClass('active-orange').parent().find('.spell').children().removeClass('active-orange') //高亮显示  排他
	var url1 = baseUrl + 'tag?where={"引用次数":{"$gte":1},"语言":"' + defaultLang + '"}&sort=[("引用次数",-1)]&max_results=' + pagesize + '&page=' + curpage;
	var url2 = baseUrl + 'tag?where={"引用次数":{"$gte":1},"语言":"' + defaultLang + '"}&sort=[("引用次数",-1)]';
	tagAjax(url1, url2);
}
//常用标签点击事件
$('#use').off('click').on('click', function() {
	getAllTag(); //全部查询标签名称
})
//点击英文字母  拼音查询对应的标签
var spellArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
$('#spell span').click(function() {
	var data = spellArr[$(this).index()]; //获取当前点击的关联词
	var url1 = encodeURI(baseUrl + 'tag?where={"拼音": {"$regex":"^' + data + '","$options": "i"},"语言":"' + defaultLang + '"}&sort=[("_created",-1)]&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]');
	var url2 = baseUrl + 'tag?where={"拼音": {"$regex":"^' + data + '","$options": "i"},"语言":"' + defaultLang + '"}&sort=[("_created",-1)]';
	$(this).addClass('active-orange').siblings().removeClass('active-orange').end().parent().siblings().removeClass('active-orange'); //点击高亮显示排他
	tagAjax(url1, url2);
})
//关键字查询标签  ,点击搜索按钮
$('#fre-sure').click(function() {
	var data = $('#searInput').val(); //文本框值	
	$('#use,#spell span').removeClass('active-orange'); //移出常用或者拼音字母高亮 
	var url1 = encodeURI(baseUrl + 'tag?where={"$or":[{"标签名称":{"$regex":"' + data + '"},"语言":"' + defaultLang + '"},{"拼音":{"$regex":"' + data + '"}}]}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]');
	var url2 = baseUrl + 'tag?where={"$or":[{"标签名称":{"$regex":"' + data + '"},{"拼音":{"$regex":"' + data + '"}}],"语言":"' + defaultLang + '"}}';
	tagAjax(url1, url2);
})
//点击标签选框取消按钮,隐藏选择标签框
$('.tag-box .cancel').click(function() {
	$('.tag-box,#mark').hide();
})
//选择标签框确认按钮,隐藏选择标签框，并且将弹出框选择出来的标签显示在文章列表页面添加按钮上
$('.tag-box .sure').click(function() {
	$('.tag-box,#mark').hide();
	$('.tag-container').html($('#del-tag').html())

})
/*回车键*/
$('#sureValue').bind('keypress', function(event) {
	if(event.keyCode == "13") {
		$('#isure').trigger('click');
	}
});
$('#searInput').bind('keypress', function(event) {
	if(event.keyCode == "13") {
		$('#fre-sure').trigger('click');
	}
});
$('#search').bind('keypress', function(event) {
	if(event.keyCode == "13") {
		$('.search s').trigger('click');
	}
});

function setCommonTagHtml(data) {
	$('#searInput').val('');
	$('#tagContainer').html(''); //清空容器
	$.each(data, function(i, e) {
		$('#tagContainer').append('<li data-id=' + e._id + '>' + e["标签名称"] + '</li>');
	})
	$('#tagContainer li').click(function() {
		var value = $(this).text();
		$(this).addClass('active-blue').siblings().removeClass('active-blue');
		if($('#del-tag li').length) {
			var exist = false;
			$.each($('#del-tag li'), function(i, e) {
				if($(this).text() == value) {
					exist = true;
					errorTip('添加的标签已经存在');
					return;
				}
			})
			if(!exist) {
				$('#del-tag').append('<li>' + $(this).text() + '<span class="del"></span></li>');
			}
		} else {
			$('#del-tag').append('<li>' + $(this).text() + '<span class="del"></span></li>');
		}
	})
}
//获取标签名称公共ajax部分
function tagAjax(url1, url2) {
	//全局变量
	var totalNum = null; //多少条数据
	$.ajax({
		type: "get",
		url: url1,
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data != null && data._items != null && data._items.length) {
				totalNum = data._meta.total;
				$('#selTagPage').remove(); //移除page容器
				$('#selTagPageParent').append('<div id="selTagPage"></div>'); //追加page容器
				pageUtil.initPage('selTagPage', {
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
							url: encodeURI(url2 + '&max_results=' + pageSize + '&page=' + curPage),
							dataType: 'json',
							headers: {
								"Authorization": "Basic " + auth
							},
							success: function(data) {
								$('#show_label em').text(data._meta.total);
								setCommonTagHtml(data._items);
							},
							error: function(e) {
								console.log(e);
							}
						})
					},
				});
				setCommonTagHtml(data._items);
			} else {
				$('#tagContainer').html('<div style="color:gray;text-align:center;font-size:20px;">没有对应的标签</div>'); //清空容器
				$('#selTagPage').remove(); //移除page容器
			}
		},
		error: function(e) {

		}
	});
}
//选择的标签事件
$('#del-tag,.tag .tag-container').on('mouseover', 'li', function(e) {
	$(this).find('.del').show();
	return false;
}).on('mouseout', 'li', function(e) {
	$(this).find('.del').hide();
	return false;
}).on('click', '.del', function(e) {
	$(this).parent().remove();
	return false;
})
//弹出框选择输入完确认按钮
$('#isure').click(function() {
	var val = $('#sureValue').val();
	if(val.trim() == '') {
		errorTip('请输入要添加的标签');
		return;
	}
	var len = getByteLen(val);
	if(len >= 1) {
		//判断容器是否存在与添加的标签值相等
		if($('#del-tag li').length) {
			var exist = false;
			$.each($('#del-tag li'), function(i, e) {
				if($(this).text() == val.trim()) {
					exist = true;
					errorTip('添加的标签已经存在');
					return;
				}
			})
			if(!exist) {
				$('#del-tag').append('<li>' + val + '<span class="del"></span></li>');
				$('#sureValue').val('');
				tagSureAjax(val);
			}
		} else {
			$('#del-tag').append('<li>' + val + '<span class="del"></span></li>');
			$('#sureValue').val('');
			tagSureAjax(val);
		}
	} else {
		$('#sureValue').val('');
		errorTip('添加标签的字符长度不在一个字符以上');
	}
})

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
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			/*console.log(XMLHttpRequest);
			errorTip(XMLHttpRequest.responseJSON._issues['标签名称']);*/
		}
	});
}
/*选择标签部分end*/
/*新建编辑文本框失去焦点事件start*/
/*$('#newT,#editT').blur(function() {
	len = getByteLen($(this).val());
	if(len < 2 || len > 50) {
		$(this).removeClass('right-gray').addClass('error-red');
	} else {
		$(this).removeClass('error-red').addClass('right-gray');
	}
	return false;
})
$('#newA,#editA').blur(function() {
	len = getByteLen($(this).val());
	if(len < 2 || len > 10) {
		$(this).removeClass('right-gray').addClass('error-red');
	} else {
		$(this).removeClass('error-red').addClass('right-gray');
	}
	return false;
})
$('#newS,#editS').blur(function() {
	len = getByteLen($(this).val());
	if(len < 2 || len > 50) {
		$(this).removeClass('right-gray').addClass('error-red');
	} else {
		$(this).removeClass('error-red').addClass('right-gray');
	}
	return false;
})
$('#newI,#editI').blur(function() {
	len = getByteLen($(this).val());
	if(len < 10 || len > 1000) {
		$(this).removeClass('right-gray').addClass('error-red');
	} else {
		$(this).removeClass('error-red').addClass('right-gray');
	}
	return false;
})*/

/*新建编辑文本框失去焦点事件end*/
//按日期查询  列表渲染
$('#byTime').click(function() {
	var url1, url2;
	var time = $('#time').val().trim()
	if(time == '') {
		errorTip('请选择时间');
	} else {
		var selway = $('#select-way').val();
		if(contentType == 'article') {
			if(selway == 0) {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}&projection={"正文":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}&projection={"正文":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}';
			} else if(selway == -1 || selway == -3 || selway == -5 || selway == -7) {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + addDate(time, selway) + ' 00:00:00","$lte":"' + time + ' 00:00:00"}}&projection={"正文":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + addDate(time, selway) + ' 00:00:00","$lte":"' + time + ' 00:00:00"}}&projection={"正文":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}';
			} else {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 23:59:59","$lte":"' + addDate(time, selway) + ' 23:59:59"}}&projection={"正文":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 23:59:59","$lte":"' + addDate(time, selway) + ' 23:59:59"}}&projection={"正文":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}';
			}
		} else if(contentType == 'gallery') {
			if(selway == 0) {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"图片列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"图片列表":0}';
			} else if(selway == -1 || selway == -3 || selway == -5 || selway == -7) {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + addDate(time, selway) + ' 00:00:00","$lte":"' + time + ' 00:00:00"}}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"图片列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + addDate(time, selway) + ' 00:00:00","$lte":"' + time + ' 00:00:00"}}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"图片列表":0}';
			} else {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 23:59:59","$lte":"' + addDate(time, selway) + ' 23:59:59"}}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"图片列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 23:59:59","$lte":"' + addDate(time, selway) + ' 23:59:59"}}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"图片列表":0}';
			}
		} else if(contentType == 'video') {
			if(selway == 0) {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"视频列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"视频列表":0}';
			} else if(selway == -1 || selway == -3 || selway == -5 || selway == -7) {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + addDate(time, selway) + ' 00:00:00","$lte":"' + time + ' 00:00:00"}}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"视频列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + addDate(time, selway) + ' 00:00:00","$lte":"' + time + ' 00:00:00"}}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"视频列表":0}';
			} else {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 23:59:59","$lte":"' + addDate(time, selway) + ' 23:59:59"}}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"视频列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 23:59:59","$lte":"' + addDate(time, selway) + ' 23:59:59"}}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"视频列表":0}';
			}
		} else if(contentType == 'music') {
			if(selway == 0) {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"音频列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"音频列表":0}';
			} else if(selway == -1 || selway == -3 || selway == -5 || selway == -7) {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + addDate(time, selway) + ' 00:00:00","$lte":"' + time + ' 00:00:00"}}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"音频列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + addDate(time, selway) + ' 00:00:00","$lte":"' + time + ' 00:00:00"}}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"音频列表":0}';
			} else {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 23:59:59","$lte":"' + addDate(time, selway) + ' 23:59:59"}}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"音频列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 23:59:59","$lte":"' + addDate(time, selway) + ' 23:59:59"}}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"音频列表":0}';
			}
		} else if(contentType == 'subject') {
			if(selway == 0) {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}&projection={"宣传画":0,"专题标签":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}&projection={"宣传画":0,"专题标签":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}';
			} else if(selway == -1 || selway == -3 || selway == -5 || selway == -7) {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + addDate(time, selway) + ' 00:00:00","$lte":"' + time + ' 00:00:00"}}&projection={"宣传画":0,"专题标签":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + addDate(time, selway) + ' 00:00:00","$lte":"' + time + ' 00:00:00"}}&projection={"宣传画":0,"专题标签":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}';
			} else {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 23:59:59","$lte":"' + addDate(time, selway) + ' 23:59:59"}}&projection={"宣传画":0,"专题标签":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 23:59:59","$lte":"' + addDate(time, selway) + ' 23:59:59"}}&projection={"宣传画":0,"专题标签":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}';
			}
		} else if(contentType == 'book') {
			if(selway == 0) {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}&projection={"出版日期":0,"出版社":0,"缩略图":0,"副标题":0,"简介":0,"来源":0,"章节列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}&projection={"出版日期":0,"出版社":0,"缩略图":0,"副标题":0,"简介":0,"来源":0,"章节列表":0}';
			} else if(selway == -1 || selway == -3 || selway == -5 || selway == -7) {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + addDate(time, selway) + ' 00:00:00","$lte":"' + time + ' 00:00:00"}}&projection={"出版日期":0,"出版社":0,"缩略图":0,"副标题":0,"简介":0,"来源":0,"章节列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + addDate(time, selway) + ' 00:00:00","$lte":"' + time + ' 00:00:00"}}&projection={"出版日期":0,"出版社":0,"缩略图":0,"副标题":0,"简介":0,"来源":0,"章节列表":0}';
			} else {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 23:59:59","$lte":"' + addDate(time, selway) + ' 23:59:59"}}&projection={"出版日期":0,"出版社":0,"缩略图":0,"副标题":0,"简介":0,"来源":0,"章节列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 23:59:59","$lte":"' + addDate(time, selway) + ' 23:59:59"}}&projection={"出版日期":0,"出版社":0,"缩略图":0,"副标题":0,"简介":0,"来源":0,"章节列表":0}';
			}
		} else if(contentType == 'live') {
			if(selway == 0) {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 00:00:00","$lte":"' + time + ' 23:59:59"}}';
			} else if(selway == -1 || selway == -3 || selway == -5 || selway == -7) {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + addDate(time, selway) + ' 00:00:00","$lte":"' + time + ' 00:00:00"}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + addDate(time, selway) + ' 00:00:00","$lte":"' + time + ' 00:00:00"}}';
			} else {
				url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 23:59:59","$lte":"' + addDate(time, selway) + ' 23:59:59"}}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
				url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '", "_created":{"$gte":"' + time + ' 23:59:59","$lte":"' + addDate(time, selway) + ' 23:59:59"}}';
			}
		}
		newtagAjax(url1, url2);
	}
})

function addDate(date, days) {
	var d = new Date(date);
	days = parseInt(days);
	d.setDate(d.getDate() + days);
	var m = d.getMonth() + 1;
	return d.getFullYear() + '-' + m + '-' + d.getDate();
}

function autor(autorName) {
	var url1, url2;
	if(contentType == 'article') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","作者":"' + autorName + '"}&projection={"正文":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","作者":"' + autorName + '"}&projection={"正文":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}';
	} else if(contentType == 'gallery') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","作者":"' + autorName + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"图片列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","作者":"' + autorName + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"图片列表":0}';
	} else if(contentType == 'video') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","作者":"' + autorName + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"视频列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","作者":"' + autorName + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"视频列表":0}';
	} else if(contentType == 'music') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","作者":"' + autorName + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"音频列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","作者":"' + autorName + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"音频列表":0}';
	} else if(contentType == 'subject') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","作者":"' + autorName + '"}&projection={"宣传画":0,"专题标签":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","作者":"' + autorName + '"}&projection={"宣传画":0,"专题标签":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}';
	} else if(contentType == 'book') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","作者":"' + autorName + '"}&projection={"出版日期":0,"出版社":0,"缩略图":0,"副标题":0,"简介":0,"来源":0,"章节列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","作者":"' + autorName + '"}&projection={"出版日期":0,"出版社":0,"缩略图":0,"副标题":0,"简介":0,"来源":0,"章节列表":0}';
	} else if(contentType == 'live') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","作者":"' + autorName + '"}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","作者":"' + autorName + '"}';
	}
	newtagAjax(url1, url2);
}

function checkPerson(checkId) {
	var url1, url2;
	if(contentType == 'article') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","审核.审核人":"' + checkId + '"}&projection={"正文":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","审核.审核人":"' + checkId + '"}&projection={"正文":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}';
	} else if(contentType == 'gallery') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","审核.审核人":"' + checkId + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"图片列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","审核.审核人":"' + checkId + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"图片列表":0}';
	} else if(contentType == 'video') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","审核.审核人":"' + checkId + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"视频列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","审核.审核人":"' + checkId + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"视频列表":0}';
	} else if(contentType == 'music') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","审核.审核人":"' + checkId + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"音频列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","审核.审核人":"' + checkId + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"音频列表":0}';
	} else if(contentType == 'subject') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","审核.审核人":"' + checkId + '"}&projection={"宣传画":0,"专题标签":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","审核.审核人":"' + checkId + '"}&projection={"宣传画":0,"专题标签":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}';
	} else if(contentType == 'book') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","审核.审核人":"' + checkId + '"}&projection={"出版日期":0,"出版社":0,"缩略图":0,"副标题":0,"简介":0,"来源":0,"章节列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","审核.审核人":"' + checkId + '"}&projection={"出版日期":0,"出版社":0,"缩略图":0,"副标题":0,"简介":0,"来源":0,"章节列表":0}';
	} else if(contentType == 'live') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","审核.审核人":"' + checkId + '"}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","审核.审核人":"' + checkId + '"}';
	}
	newtagAjax(url1, url2);
}

function inputUser(inputUserId) {
	var url1, url2;
	if(contentType == 'article') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","录入人ID.用户名":"' + inputUserId + '"}&projection={"正文":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","录入人ID.用户名":"' + inputUserId + '"}&projection={"正文":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}';
	} else if(contentType == 'gallery') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","录入人ID.用户名":"' + inputUserId + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"图片列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","录入人ID.用户名":"' + inputUserId + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"图片列表":0}';
	} else if(contentType == 'video') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","录入人ID.用户名":"' + inputUserId + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"视频列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","录入人ID.用户名":"' + inputUserId + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"视频列表":0}';
	} else if(contentType == 'music') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","录入人ID.用户名":"' + inputUserId + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"音频列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","录入人ID.用户名":"' + inputUserId + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"音频列表":0}';
	} else if(contentType == 'subject') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","录入人ID.用户名":"' + inputUserId + '"}&projection={"宣传画":0,"专题标签":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","录入人ID.用户名":"' + inputUserId + '"}&projection={"宣传画":0,"专题标签":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}';
	} else if(contentType == 'book') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","录入人ID.用户名":"' + inputUserId + '"}&projection={"出版日期":0,"出版社":0,"缩略图":0,"副标题":0,"简介":0,"来源":0,"章节列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","录入人ID.用户名":"' + inputUserId + '"}&projection={"出版日期":0,"出版社":0,"缩略图":0,"副标题":0,"简介":0,"来源":0,"章节列表":0}';
	} else if(contentType == 'live') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","录入人ID.用户名":"' + inputUserId + '"}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","录入人ID.用户名":"' + inputUserId + '"}';
	}
	newtagAjax(url1, url2);
}
/*标识点第一次按作者、审核人、录入人筛选   第二次全部查询*/
var clickAutorOddOrEven = 'odd',
	clickCheckPersonOddOrEven = 'odd',
	clickInputUserOddOrEven = 'odd';
//点击作者
$('.common-table').on('click', '.autor', function() {
	var autorName = $(this).text();
	if(clickAutorOddOrEven == 'odd') {
		autor(autorName);
		clickAutorOddOrEven = 'even';
	} else {
		clickAutorOddOrEven = 'odd';
		getAllList();
	}
})
//点击审核人
$('.common-table').on('click', '.checkPerson', function() {
	var checkId = $(this).text();
	if(checkId != undefined) {
		if(clickCheckPersonOddOrEven == 'odd') {
			clickCheckPersonOddOrEven = 'even';
			checkPerson(checkId);
		} else {
			clickCheckPersonOddOrEven = 'odd';
			getAllList();
		}
	}
})
//点击录入人
$('.common-table').on('click', '.inputUser', function() {
	var inputUserId = $(this).text();
	if(clickInputUserOddOrEven == 'odd') {
		clickInputUserOddOrEven = 'even';
		inputUser(inputUserId);
	} else {
		clickInputUserOddOrEven = 'odd';
		getAllList();
	}

})

//查询列表
function getAllList() {
	var url1, url2;
	if(contentType == 'article') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '"}&projection={"正文":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '"}&projection={"正文":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}';
	} else if(contentType == 'gallery') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"图片列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"图片列表":0}';
	} else if(contentType == 'video') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"视频列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"视频列表":0}';
	} else if(contentType == 'music') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"音频列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '"}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"音频列表":0}';
	} else if(contentType == 'subject') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '"}&projection={"宣传画":0,"专题标签":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '"}&projection={"宣传画":0,"专题标签":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}';
	} else if(contentType == 'book') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '"}&projection={"出版日期":0,"出版社":0,"缩略图":0,"副标题":0,"简介":0,"来源":0,"章节列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '"}&projection={"出版日期":0,"出版社":0,"缩略图":0,"副标题":0,"简介":0,"来源":0,"章节列表":0}';
	} else if(contentType == 'live') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '"}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '"}';
	}
	newtagAjax(url1, url2);
}

function getCommonHtmlFromId(id) {
	var url1 = baseUrl + 'content/' + id;
	$.ajax({
		type: "get",
		url: encodeURI(url1),
		async: false,
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			detailList = data;
		}
	});
	return detailList;
}

function setCommonHtml(data) {
	var str;
	$('#search').val('');
	$('#checkAll').prop("checked", false); //去除沟
	$('.footer tbody').html('');
	$.each(data._items, function(i, e) {
		if(contentType == 'gallery') {
			strHtml = '<tr>' +
				'<td><input type="checkbox"/></td>' +
				'<td>' +
				'<s data-toggle="tooltip" title="置顶状态" class="flag1"></s>' +
				'<s data-toggle="tooltip" title="推荐状态" class="flag2"></s>' +
				'<s data-toggle="tooltip" title="允许评论" class="flag3"></s>' +
				'<s data-toggle="tooltip" class="flag4"></s>' +
				'</td>' +
				'<td class="power" data-toggle="tooltip"></td>' +
				'<td data-toggle="tooltip" class="title"></td>' +
				'<td data-toggle="tooltip" class="tagList"></td>' +
				'<td data-toggle="tooltip" class="pubtime"></td>' +
				'<td data-toggle="tooltip" class="commentnum"></td>' +
				'<td data-toggle="tooltip" class="look"></td>' +
				'<td data-toggle="tooltip" class="pv"></td>' +
				'<td data-toggle="tooltip" title="画廊数：" class="listnum"></td>' +
				'<td class="autor" data-toggle="tooltip"></td>' +
				'<td class="checkPerson" data-toggle="tooltip"></td>' +
				'<td class="inputUser" data-toggle="tooltip" title></td>' +
				'<td class="action" dataIndex=' + i + ' data-toggle="tooltip">' +
				'<s class="checkpass" data-toggle="tooltip"></s>' +
				'<s class="icon1" data-toggle="tooltip" title="查看详情"></s>' +
				'<s class="icon2" data-toggle="tooltip" title="编辑"></s>' +
				'<s class="icon3" data-toggle="tooltip" title="删除"></s>' +
				'</td>' +
				'</tr>';
		} else if(contentType == 'video') {
			strHtml = '<tr>' +
				'<td><input type="checkbox"/></td>' +
				'<td>' +
				'<s data-toggle="tooltip" title="置顶状态" class="flag1"></s>' +
				'<s data-toggle="tooltip" title="推荐状态" class="flag2"></s>' +
				'<s data-toggle="tooltip" title="允许评论" class="flag3"></s>' +
				'<s data-toggle="tooltip" class="flag4"></s>' +
				'</td>' +
				'<td class="power" data-toggle="tooltip"></td>' +
				'<td data-toggle="tooltip" class="title"></td>' +
				'<td data-toggle="tooltip" class="tagList"></td>' +
				'<td data-toggle="tooltip" class="pubtime"></td>' +
				'<td data-toggle="tooltip" class="commentnum"></td>' +
				'<td data-toggle="tooltip" class="look"></td>' +
				'<td data-toggle="tooltip" class="pv"></td>' +
				'<td data-toggle="tooltip" title="视频数：" class="listnum"></td>' +
				'<td class="autor" data-toggle="tooltip"></td>' +
				'<td class="checkPerson" data-toggle="tooltip"></td>' +
				'<td class="inputUser" data-toggle="tooltip" title></td>' +
				'<td class="action" dataIndex=' + i + ' data-toggle="tooltip">' +
				'<s class="checkpass" data-toggle="tooltip"></s>' +
				'<s class="icon1" data-toggle="tooltip" title="查看详情"></s>' +
				'<s class="icon2" data-toggle="tooltip" title="编辑"></s>' +
				'<s class="icon3" data-toggle="tooltip" title="删除"></s>' +
				'</td>' +
				'</tr>';
		} else if(contentType == 'music') {
			strHtml = '<tr>' +
				'<td><input type="checkbox"/></td>' +
				'<td>' +
				'<s data-toggle="tooltip" title="置顶状态" class="flag1"></s>' +
				'<s data-toggle="tooltip" title="推荐状态" class="flag2"></s>' +
				'<s data-toggle="tooltip" title="允许评论" class="flag3"></s>' +
				'<s data-toggle="tooltip" class="flag4"></s>' +
				'</td>' +
				'<td class="power" data-toggle="tooltip"></td>' +
				'<td data-toggle="tooltip" class="title"></td>' +
				'<td data-toggle="tooltip" class="tagList"></td>' +
				'<td data-toggle="tooltip" class="pubtime"></td>' +
				'<td data-toggle="tooltip" class="commentnum"></td>' +
				'<td data-toggle="tooltip" class="look"></td>' +
				'<td data-toggle="tooltip" class="pv"></td>' +
				'<td data-toggle="tooltip" title="音乐数：" class="listnum"></td>' +
				'<td class="autor" data-toggle="tooltip"></td>' +
				'<td class="checkPerson" data-toggle="tooltip"></td>' +
				'<td class="inputUser" data-toggle="tooltip" title></td>' +
				'<td class="action" dataIndex=' + i + ' data-toggle="tooltip">' +
				'<s class="checkpass" data-toggle="tooltip"></s>' +
				'<s class="icon1" data-toggle="tooltip" title="查看详情"></s>' +
				'<s class="icon2" data-toggle="tooltip" title="编辑"></s>' +
				'<s class="icon3" data-toggle="tooltip" title="删除"></s>' +
				'</td>' +
				'</tr>';
		} else if(contentType == 'book') {
			strHtml = '<tr>' +
				'<td><input type="checkbox"/></td>' +
				'<td>' +
				'<s data-toggle="tooltip" title="置顶状态" class="flag1"></s>' +
				'<s data-toggle="tooltip" title="推荐状态" class="flag2"></s>' +
				'<s data-toggle="tooltip" title="允许评论" class="flag3"></s>' +
				'<s data-toggle="tooltip" class="flag4"></s>' +
				'</td>' +
				'<td class="power" data-toggle="tooltip"></td>' +
				'<td data-toggle="tooltip" class="title"></td>' +
				'<td data-toggle="tooltip" class="tagList"></td>' +
				'<td data-toggle="tooltip" class="pubtime"></td>' +
				'<td data-toggle="tooltip" class="commentnum"></td>' +
				'<td data-toggle="tooltip" class="look"></td>' +
				'<td data-toggle="tooltip" class="pv"></td>' +
				'<td data-toggle="tooltip" title="章节数：" class="listnum"></td>' +
				'<td class="autor" data-toggle="tooltip"></td>' +
				'<td class="checkPerson" data-toggle="tooltip"></td>' +
				'<td class="inputUser" data-toggle="tooltip" title</td>' +
				'<td class="action" dataIndex=' + i + ' data-toggle="tooltip">' +
				'<s class="checkpass" data-toggle="tooltip"></s>' +
				'<s class="icon1" data-toggle="tooltip" title="查看详情"></s>' +
				'<s class="icon2" data-toggle="tooltip" title="编辑"></s>' +
				'<s class="icon3" data-toggle="tooltip" title="删除"></s>' +
				'</td>' +
				'</tr>';
		} else if(contentType == 'article') {
			strHtml = '<tr>' +
				'<td><input type="checkbox"/></td>' +
				'<td>' +
				'<s data-toggle="tooltip" title="置顶状态" class="flag1"></s>' +
				'<s data-toggle="tooltip" title="推荐状态" class="flag2"></s>' +
				'<s data-toggle="tooltip" title="允许评论" class="flag3"></s>' +
				'<s data-toggle="tooltip" class="flag4"></s>' +
				'</td>' +
				'<td class="power" data-toggle="tooltip"></td>' +
				'<td data-toggle="tooltip" class="title"></td>' +
				'<td data-toggle="tooltip" class="tagList"></td>' +
				'<td data-toggle="tooltip" class="pubtime"></td>' +
				'<td data-toggle="tooltip" class="commentnum"></td>' +
				'<td data-toggle="tooltip" class="look"></td>' +
				'<td data-toggle="tooltip" class="pv"></td>' +
				'<td class="autor" data-toggle="tooltip"></td>' +
				'<td class="checkPerson" data-toggle="tooltip"></td>' +
				'<td class="inputUser" data-toggle="tooltip" title></td>' +
				'<td class="action" dataIndex=' + i + ' data-toggle="tooltip">' +
				'<s class="checkpass" data-toggle="tooltip"></s>' +
				'<s class="icon1" data-toggle="tooltip" title="查看详情"></s>' +
				'<s class="icon2" data-toggle="tooltip" title="编辑"></s>' +
				'<s class="icon3" data-toggle="tooltip" title="删除"></s>' +
				'</td>' +
				'</tr>';
		} else if(contentType == 'subject') {
			strHtml = '<tr>' +
				'<td><input type="checkbox"/></td>' +
				'<td>' +
				'<s data-toggle="tooltip" title="置顶状态" class="flag1"></s>' +
				'<s data-toggle="tooltip" title="推荐状态" class="flag2"></s>' +
				'<s data-toggle="tooltip" title="允许评论" class="flag3"></s>' +
				'<s data-toggle="tooltip" class="flag4"></s>' +
				'</td>' +
				'<td class="power" data-toggle="tooltip"></td>' +
				'<td data-toggle="tooltip" class="title"></td>' +
				'<td data-toggle="tooltip" class="tagList"></td>' +
				'<td data-toggle="tooltip" class="pubtime"></td>' +
				'<td class="autor" data-toggle="tooltip"></td>' +
				'<td class="checkPerson" data-toggle="tooltip"></td>' +
				'<td class="inputUser" data-toggle="tooltip" title></td>' +
				'<td class="action" dataIndex=' + i + ' data-toggle="tooltip">' +
				'<s class="checkpass" data-toggle="tooltip"></s>' +
				'<s class="icon1" data-toggle="tooltip" title="查看详情"></s>' +
				'<s class="icon2" data-toggle="tooltip" title="编辑"></s>' +
				'<s class="icon3" data-toggle="tooltip" title="删除"></s>' +
				'</td>' +
				'</tr>';

		} else if(contentType == 'live') {
			strHtml = '<tr>' +
				'<td><input type="checkbox"/></td>' +
				'<td>' +
				'<s data-toggle="tooltip" title="置顶状态" class="flag1"></s>' +
				'<s data-toggle="tooltip" title="推荐状态" class="flag2"></s>' +
				'<s data-toggle="tooltip" title="允许评论" class="flag3"></s>' +
				'<s data-toggle="tooltip" class="flag4"></s>' +
				'</td>' +
				'<td class="power" data-toggle="tooltip"></td>' +
				'<td data-toggle="tooltip" class="title"></td>' +
				'<td data-toggle="tooltip" class="tagList"></td>' +
				'<td data-toggle="tooltip" class="pubtime"></td>' +
				'<td data-toggle="tooltip" class="commentnum"></td>' +
				'<td data-toggle="tooltip" class="look"></td>' +
				'<td data-toggle="tooltip" class="pv"></td>' +
				'<td class="autor" data-toggle="tooltip"></td>' +
				'<td class="checkPerson" data-toggle="tooltip"></td>' +
				'<td class="inputUser" data-toggle="tooltip" title></td>' +
				'<td data-toggle="tooltip" class="playstatus"></td>' +
				'<td data-toggle="tooltip" class="playchannel"></td>' +
				'<td class="action" dataIndex=' + i + '>' +
				'<s class="checkpass" data-toggle="tooltip"></s>' +
				'<s class="icon4" data-toggle="tooltip" title="查看已发布直播"></s>' +
				'<s class="icon1" data-toggle="tooltip" title="查看详情"></s>' +
				'<s class="icon2" data-toggle="tooltip" title="编辑"></s>' +
				'<s class="icon3" data-toggle="tooltip" title="删除"></s>' +
				'</td>' +
				'</tr>';

		}
		$('.footer tbody').append(strHtml);
		if(e['审核'] != null) {
			$('.footer tbody').find('tr').eq(i).find('td.checkPerson').text(e['审核']['审核人']).attr('title', '审核人：' + e['审核']['审核人']);;
		}
		if(e['录入人ID'] != null && e['录入人ID']['用户名'] != null) {
			$('.footer tbody').find('tr').eq(i).find('td.inputUser').text(e['录入人ID']['用户名']).attr('title', '录入人：' + e['录入人ID']['用户名']);
		}
		//设置dataId
		$('.footer tbody').find('tr').eq(i).attr('dataId', e._id);
		if(e['置顶'] == true) {
			$('.footer tbody').find('tr').eq(i).find('.flag1').show();
		} else {
			$('.footer tbody').find('tr').eq(i).find('.flag1').hide();
		}
		if(e['推荐'] == true) {
			$('.footer tbody').find('tr').eq(i).find('.flag2').show();
		} else {
			$('.footer tbody').find('tr').eq(i).find('.flag2').hide();
		}
		if(e['评论'] == true) {
			$('.footer tbody').find('tr').eq(i).find('.flag3').show();
			$('.footer tbody').find('tr').eq(i).find('.flag3').addClass('commentIcon');
		} else {
			$('.footer tbody').find('tr').eq(i).find('.flag3').hide();
			$('.footer tbody').find('tr').eq(i).find('.flag3').removeClass('commentIcon');
		}
		//设置投票
		if(e['投票'] != null && e['投票']['关闭投票'] == false) {
			$('.footer tbody').find('tr').eq(i).find('.flag4').show();
		} else {
			$('.footer tbody').find('tr').eq(i).find('.flag4').hide();
		}
		if(e['投票'] != null && e['投票']['标题'] != null) {
			if(e['投票']['标题'] == '点赞') {
				$('.footer tbody').find('tr').eq(i).find('.flag4').removeClass().addClass('ticket3').attr('title', '允许点赞');
			} else if(e['投票']['标题'] == '献烛') {
				$('.footer tbody').find('tr').eq(i).find('.flag4').removeClass().addClass('ticket2').attr('title', '允许献烛');
			} else if(e['投票']['标题'] == '献花') {
				$('.footer tbody').find('tr').eq(i).find('.flag4').removeClass().addClass('ticket1').attr('title', '允许献花');
			}
		}
		//设置标签值						
		if($(e['标签'])) {
			var tagVal = '';
			$.each($(e['标签']), function(i, e) {
				tagVal += e;
				tagVal += '、';
			});
			$('.footer tbody tr').eq(i).find('.tagList').text(tagVal.substring(0, tagVal.length - 1));
			$('.footer tbody tr').eq(i).find('.tagList').attr('title', '标签：' + tagVal.substring(0, tagVal.length - 1))
		}
		//设置发布时间
		if(e['发布时间'] != null) {
			$('.footer tbody').find('tr').eq(i).find('td.pubtime').text(e['发布时间']);
			$('.footer tbody').find('tr').eq(i).find('td.pubtime').attr('title', '发布时间：' + e['发布时间']);
		}
		//设置评论数
		if(e['评论数'] != null) {
			$('.footer tbody').find('tr').eq(i).find('td.commentnum').text(e['评论数']);
			$('.footer tbody').find('tr').eq(i).find('td.commentnum').attr('title', '评论数：' + e['评论数']);
		}
		//设置浏览量
		if(e['浏览量'] != null) {
			$('.footer tbody').find('tr').eq(i).find('td.look').text(e['浏览量']);
			$('.footer tbody').find('tr').eq(i).find('td.look').attr('title', '浏览量：' + e['浏览量']);
		}
		//设置pv值
		if(e['PV'] != null) {
			$('.footer tbody').find('tr').eq(i).find('td.pv').text(e['PV']);
			$('.footer tbody').find('tr').eq(i).find('td.pv').attr('title', 'PV值：' + e['PV']);
		}
		//设置标题
		if(e['标题'] != null) {
			$('.footer tbody').find('tr').eq(i).find('td.title').text(e['标题']);
			$('.footer tbody').find('tr').eq(i).find('td.title').attr('title', '标题：' + e['标题']);
		}
		//设置作者
		if(e['作者'] != null) {
			$('.footer tbody').find('tr').eq(i).find('td.autor').text(e['作者']);
			$('.footer tbody').find('tr').eq(i).find('td.autor').attr('title', '作者：' + e['作者']);
		}
		//判断列表数
		if(e['列表数'] != null) {
			$('.footer tbody').find('tr').eq(i).find('td.listnum').text(e['列表数']);
			$('.footer tbody').find('tr').eq(i).find('td.listnum').attr('title', $('.footer tbody').find('tr').eq(i).find('td.listnum').attr('title') + e['列表数']);
		}
		//设置直播状态
		if(e['直播状态'] != null) {
			$('.footer tbody').find('tr').eq(i).find('.playstatus').text(e['直播状态']);
			$('.footer tbody').find('tr').eq(i).find('.playstatus').attr('title', '直播状态：' + e['直播状态']);
		}
		//设置直播频道
		if(e['频道'] != null && e['频道']['频道名称'] != null) {
			$('.footer tbody').find('tr').eq(i).find('.playchannel').text(e['频道']['频道名称']);
			$('.footer tbody').find('tr').eq(i).find('.playchannel').attr('title', '频道名称：' + e['频道']['频道名称']);
		}
		//设置审核通过、未通过、审核中
		if(e['审核状态'] !== undefined) {
			if(e['审核状态'] == 1) {
				$('.footer tbody').find('tr').eq(i).find('s.checkpass').removeClass('icon6,icon7').addClass('icon5');
				$('.footer tbody').find('tr').eq(i).find('s.checkpass').attr('dataCheckStatus', 1).attr('title', '审核通过');
			} else if(e['审核状态'] == 0) {
				$('.footer tbody').find('tr').eq(i).find('s.checkpass').removeClass('icon5,icon7').addClass('icon6');
				$('.footer tbody').find('tr').eq(i).find('s.checkpass').attr('dataCheckStatus', 0).attr('title', '审核中');
			} else if(e['审核状态'] == -1) {
				$('.footer tbody').find('tr').eq(i).find('s.checkpass').removeClass('icon5,icon6').addClass('icon7');
				if(e['审核'] != null && e['审核']['意见'] != null && e['审核']['意见'].trim() != '') {
					$('.footer tbody').find('tr').eq(i).find('s.checkpass').attr('dataCheckStatus', -1).attr('title', '审核未通过(原因：' + e['审核']['意见'] + ')');
				} else {
					$('.footer tbody').find('tr').eq(i).find('s.checkpass').attr('dataCheckStatus', -1).attr('title', '审核未通过(原因：未说明审核未通过原因)');
				}
			}
			if(e['审核'] != null && e['审核']['意见'] != null) {
				$('.footer tbody').find('tr').eq(i).find('s.checkpass').attr('dataSuject', e['审核']['意见']);
			}
		}
		//设置用户级别
		if(e['开放用户级别'] !== null) {
			$('.footer tbody').find('tr').eq(i).find('td.power').text(e['开放用户级别']);
			if(power.length > e['开放用户级别']) {
				$('.footer tbody').find('tr').eq(i).find('td.power').attr('title', '权限：' + power[e['开放用户级别']]['名称']);
			} else {
				$('.footer tbody').find('tr').eq(i).find('td.power').attr('title', '权限：未知');
			}

		}
	})
}
//查询列表通用ajax
function newtagAjax(url1, url2) {
	//全局变量
	var totalNum = null; //多少条数据
	$.ajax({
		type: "get",
		url: encodeURI(url1),
		headers: {
			"Authorization": "Basic " + auth
		},
		beforeSend: function() {
			$("body").append('<div id="loading" class="loader-inner ball-clip-rotate" style="position:fixed;top:0;left:0;bottom:0;right:0;background-color: #000;opacity: .6;z-index: 10002;"><div style="position:fixed;left:50%;top:50%;"></div></div>')
		},
		success: function(data) {
			if(data != null && data._items != null && data._items.length) {
				totalNum = data._meta.total;
				$('#articlePage').remove(); //移除page容器
				$('#articlePageParent').append('<div id="articlePage"></div>'); //追加page容器
				pageUtil.initPage('articlePage', {
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
							url: encodeURI(url2 + '&max_results=' + pageSize + '&page=' + curPage),
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
									setCommonHtml(data);
								} catch(e) {
									console.log(e)
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
					setCommonHtml(data);
				} catch(e) {
					console.log(e)
				}
			} else {
				if(contentType == 'article') {
					$('.footer tbody').html('<tr><td style="color:gray;font-size: 20px;text-align:center" colspan="12">查询无结果</td></tr>');
				} else if(contentType == 'gallery' || contentType == 'video' || contentType == 'music' || contentType == 'book') {
					$('.footer tbody').html('<tr><td style="color:gray;font-size: 20px;text-align:center" colspan="13">查询无结果</td></tr>');
				} else if(contentType == 'subject') {
					$('.footer tbody').html('<tr><td style="color:gray;font-size: 20px;text-align:center" colspan="9">查询无结果</td></tr>');
				} else if(contentType == 'live') {
					$('.footer tbody').html('<tr><td style="color:gray;font-size: 20px;text-align:center" colspan="14">查询无结果</td></tr>');
				}

				$('#articlePage').remove(); //移除page容器
			}

		},
		complete: function() {
			$('#loading').remove();
		},
		error: function(e) {
			//errorTip('error');
		}
	});

}
//列表单行删除，重新渲染列表
$('.footer table tbody').on('click', '.icon3', function() {
	var msg = "您真的确定要删除吗？\n\n请确认！";
	if(confirm(msg) == true) {
		var dataId = $(this).parent().parent().attr('dataId');
		deleteOne(dataId);
	} else {
		return false;
	}
})
//点击评论图标 跳转到管理评论页 管理评论页根据传过来的id查询评论列表
$('.footer table tbody').on('click', '.commentIcon', function() {
	var dataId = $(this).parent().parent().attr('dataId');
	sessionStorage.setItem('commentIcon', dataId);
	window.location.href = '/management-comment.html';
})

function deleteOne(dataId) {
	$.ajax({
		type: "delete",
		url: baseUrl + 'content/' + dataId,
		headers: {
			"Authorization": "Basic " + auth
		},
		contentType: "application/json;charset=UTF-8",
		success: function(data) {
			if(data) {
				errorTip('删除失败')
			} else {
				errorTip('删除成功');
				getAllList(); //刷新列表
			}

		},
		error: function() {
			errorTip('error')
		}
	})
}

function deleteMore(dataIdMore) {
	$.ajax({
		type: "post",
		url: baseUrl + 'content/batch-delete',
		data: JSON.stringify(dataIdMore),
		contentType: "application/json;charset=UTF-8",
		dataType: 'json',
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data.success == 'OK') {
				errorTip('删除成功');
				getAllList(); //刷新列表
			}
		},
		error: function() {
			errorTip('删除失败')
		}
	})
}
//批量删除
$('#delT').click(function() {
	var dataIdMore = []; //要删除文章的id
	$.each($('.footer tbody input'), function(i, e) {
		if($(this).get(0).checked) {
			var id = $(this).parent().parent().attr('dataId')
			dataIdMore.push({
				'id': id
			});
		}
	});
	//对象不为空执行删除操作
	if(dataIdMore.toString()) {
		var msg = "您真的确定要删除吗？\n\n请确认！";
		if(confirm(msg) == true) {
			deleteMore(dataIdMore); //批量删除
		} else {
			return false;
		}
	} else {
		errorTip('请选择要删除的')
	}
})
//点击全选按钮
$('#checkAll').click(function() {
	$('.footer tbody input').prop("checked", $(this).prop("checked"));
})
//点击行checkbox按钮
$('.footer tbody').on('click', 'input', function() {
	$('#checkAll').prop("checked", $('.footer tbody input').length === $(".footer tbody input:checked").length);
})
//列表页批量操作
$('.moredo .dt').click(function(e) {
	$('.moredo .dd').toggle();
	return false;
})
//鼠标移入批量操作的每一项
$('.son1,.son2,.son3,.son4,.son5,.son6').mouseover(function() {
	$(this).find('.son').show().end().siblings().find('.son').hide();
	$(this).addClass('active-orange').siblings().removeClass('active-orange'); //高亮显示
})
//鼠标移出批量操作的每一项
$('.son1,.son2,.son3,.son4,.son5,.son6').mouseout(function() {
	$(this).find('.son').hide().end().siblings().find('.son').hide();
	$(this).removeClass('active-orange').siblings().removeClass('active-orange'); //高亮显示
})
$('.son5').mouseover(function() {
	$(this).find('.son').show().end().siblings().find('.son').hide();
	$(this).addClass('active-orange').siblings().removeClass('active-orange'); //高亮显示
})
//点击除投票项批量操作的每一项里边的子项
$('.son1 .son ,.son2 .son ,.son3 .son ,.son4 .son ,.son6 .son ').on('click', 'div', function() {
	//$(this).toggleClass('active-bg1').siblings().removeClass('active-bg1');
	//获取要操作文章的id列表
	$('.moredo .dd').hide();
	var obj = {};
	var dataIdList = [];
	var $inputChecked = $(".footer tbody input:checked")
	if($inputChecked.length) {
		var wayName = $(this).parent().attr('dataId'); //获取批量操作项名称
		var wayValue = $(this).attr('dataBool'); //获取批量操作项设置的布尔值
		if(wayName == '审核状态') {
			if(wayValue == 'true') {
				wayValue = 1;
			} else if(wayValue == 'false') {
				wayValue = -1;
			}
		} else if(wayName == '开放用户级别') {
			wayValue = parseInt($(this).attr('dataId'));
		} else {
			if(wayValue == 'true') {
				wayValue = true;
			} else if(wayValue == 'false') {
				wayValue = false;
			}
		}

		obj[wayName] = wayValue;
		$.each($inputChecked, function(i, e) {
			dataIdList.push($(this).parent().parent().attr('dataId'));
		});
		obj.id = dataIdList;
		//发送请求
		$.ajax({
			type: "post",
			url: baseUrl + 'content/batch-update', //用于文件上传的服务器端请求地址
			dataType: 'json', //返回值类型 一般设置为json
			contentType: "application/json;charset=UTF-8",
			data: JSON.stringify(obj),
			headers: {
				"Authorization": "Basic " + auth
			},
			success: function(data) //服务器成功响应处理函数
			{
				if(data.success == 'OK') {
					getAllList();
				}
			},
			error: function(data, status, e) //服务器响应失败处理函数
			{

			}
		})

	} else {
		errorTip('请勾选要进行批量操作的')
	}
	//获取置顶或推荐或评论或屏蔽的boolean值
	return false;
})
//点击投票项进行筛选
$('.son5 .son div').click(function() {
	$('.moredo .dd').hide();
	var obj = {};
	var dataIdList = [];
	var $inputChecked = $(".footer tbody input:checked")
	if($inputChecked.length) {
		var wayValue = $(this).text(); //获取批量操作项设置的布尔值
		obj['keyword'] = wayValue;
		$.each($inputChecked, function(i, e) {
			dataIdList.push($(this).parent().parent().attr('dataId'));
		});
		obj.id = dataIdList;
		//发送请求
		$.ajax({
			type: "post",
			url: baseUrl + 'vote/batch-update', //用于文件上传的服务器端请求地址
			dataType: 'json', //返回值类型 一般设置为json
			contentType: "application/json;charset=UTF-8",
			data: JSON.stringify(obj),
			headers: {
				"Authorization": "Basic " + auth
			},
			success: function(data) //服务器成功响应处理函数
			{
				if(data.success == 'OK') {
					getAllList();
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
//列表根据标题名字搜索
$('.search s').click(function() {
	var iptVal = $('.search input').val()
	if(iptVal.trim()) {
		searchList(iptVal);
	} else { //如果搜索框值为空
		getAllList();
	}
})
//根据关键字进行搜索
function searchList(iptVal) {
	var url1, url2;
	if(contentType == 'article') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":[{"标题":{"$regex":"' + iptVal + '"}},{"标签":{"$regex":"' + iptVal + '"}}]}&projection={"正文":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":[{"标题":{"$regex":"' + iptVal + '"}},{"标签":{"$regex":"' + iptVal + '"}}]}&projection={"正文":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}';
	} else if(contentType == 'gallery') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":[{"标题":{"$regex":"' + iptVal + '"}},{"标签":{"$regex":"' + iptVal + '"}}]}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"图片列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":[{"标题":{"$regex":"' + iptVal + '"}},{"标签":{"$regex":"' + iptVal + '"}}]}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"图片列表":0}';
	} else if(contentType == 'video') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":[{"标题":{"$regex":"' + iptVal + '"}},{"标签":{"$regex":"' + iptVal + '"}}]}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"视频列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":[{"标题":{"$regex":"' + iptVal + '"}},{"标签":{"$regex":"' + iptVal + '"}}]}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"视频列表":0}';
	} else if(contentType == 'music') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":[{"标题":{"$regex":"' + iptVal + '"}},{"标签":{"$regex":"' + iptVal + '"}}]}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"音频列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":[{"标题":{"$regex":"' + iptVal + '"}},{"标签":{"$regex":"' + iptVal + '"}}]}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"音频列表":0}';
	} else if(contentType == 'subject') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":[{"标题":{"$regex":"' + iptVal + '"}},{"标签":{"$regex":"' + iptVal + '"}}]}&projection={"宣传画":0,"专题标签":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":[{"标题":{"$regex":"' + iptVal + '"}},{"标签":{"$regex":"' + iptVal + '"}}]}&projection={"宣传画":0,"专题标签":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}';
	} else if(contentType == 'book') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":[{"标题":{"$regex":"' + iptVal + '"}},{"标签":{"$regex":"' + iptVal + '"}}]}&projection={"出版日期":0,"出版社":0,"缩略图":0,"副标题":0,"简介":0,"来源":0,"章节列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":[{"标题":{"$regex":"' + iptVal + '"}},{"标签":{"$regex":"' + iptVal + '"}}]}&projection={"出版日期":0,"出版社":0,"缩略图":0,"副标题":0,"简介":0,"来源":0,"章节列表":0}';
	} else if(contentType == 'live') {
		url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":[{"标题":{"$regex":"' + iptVal + '"}},{"标签":{"$regex":"' + iptVal + '"}}]}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
		url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":[{"标题":{"$regex":"' + iptVal + '"}},{"标签":{"$regex":"' + iptVal + '"}}]}';
	}
	newtagAjax(url1, url2)
}
//点击每项查看详情
$('.footer table tbody').on('click', '.icon1', function() {
	//获取当前文章的id
	//http://172.16.0.146/post.html?id=59ccea7ac3666ee3c1f89fa0（发送数据的请求格式）
	var dataId = $(this).parent().parent().attr('dataId');
	//跳转到详情页
	if(contentType == 'article') {
		window.location.href = '/post.html?id=' + dataId;
	} else if(contentType == 'gallery') {
		window.location.href = '/picture.html?id=' + dataId;
	} else if(contentType == 'video') {
		window.location.href = '/video.html?id=' + dataId;
	} else if(contentType == 'music') {
		window.location.href = '/music.html?id=' + dataId;
	} else if(contentType == 'subject') {
		window.location.href = '/subject.html?id=' + dataId;
	} else if(contentType == 'book') {
		window.location.href = '/book.html?id=' + dataId;
	} else if(contentType == 'live') {
		window.location.href = '/live.html?id=' + dataId;
	}
})
//设置当前系统时间
function getNowFormatDate() {
	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
	if(month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if(strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	if(hours >= 0 && hours <= 9) {
		hours = "0" + hours;
	}
	if(minutes >= 0 && minutes <= 9) {
		minutes = "0" + minutes;
	}
	if(seconds >= 0 && seconds <= 9) {
		seconds = "0" + seconds;
	}
	var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
		" " + hours + seperator2 + minutes +
		seperator2 + seconds;
	return currentdate;
}

function editBuiltAjax(obj, showval) {
	if(JSON.stringify(obj) != '{}') {
		//来自专题跳转过来的
		if(showval != null && showval == 'topic') {
			$.ajax({
				type: "patch",
				url: baseUrl + 'content/' + topicEditData._id, //用于文件上传的服务器端请求地址
				dataType: 'json', //返回值类型 一般设置为json
				contentType: "application/json;charset=UTF-8",
				data: JSON.stringify(obj),
				headers: {
					"Authorization": "Basic " + auth
				},
				beforeSend: function() {
					$("body").append('<div id="loading" class="loader-inner ball-clip-rotate" style="position:fixed;top:0;left:0;bottom:0;right:0;background-color: #000;opacity: .6;z-index: 10002;"><div style="position:fixed;left:50%;top:50%;"></div></div>')
				},
				success: function(data) //服务器成功响应处理函数
				{
					if(data._status == 'OK') {
						errorTip('保存成功');
						window.location.href = '/content-subject.html'
					}
				},
				complete: function() {
					$('#loading').remove();
				},
				error: function(data, status, e) //服务器响应失败处理函数
				{
					errorTip('保存失败');
				}
			})
		} else {
			$.ajax({
				type: "patch",
				url: baseUrl + 'content/' + editData._id, //用于文件上传的服务器端请求地址
				dataType: 'json', //返回值类型 一般设置为json
				contentType: "application/json;charset=UTF-8",
				data: JSON.stringify(obj),
				headers: {
					"Authorization": "Basic " + auth
				},
				beforeSend: function() {
					$("body").append('<div id="loading" class="loader-inner ball-clip-rotate" style="position:fixed;top:0;left:0;bottom:0;right:0;background-color: #000;opacity: .6;z-index: 10002;"><div style="position:fixed;left:50%;top:50%;"></div></div>')
				},
				success: function(data) //服务器成功响应处理函数
				{
					if(data._status == 'OK') {
						//遍历obj对象，保存到editData中
						for(var key in obj) {
							editData[key] = obj[key];
						}
						isEditPageModifiy = false;
						errorTip('保存成功');
					}
				},
				complete: function() {
					$('#loading').remove();
				},
				error: function(data, status, e) //服务器响应失败处理函数
				{
					errorTip('保存失败');
				}
			})
		}

	}
}

function newBuiltAjax(obj, target) {
	$.ajax({
		type: "post",
		url: baseUrl + 'content', //用于文件上传的服务器端请求地址
		dataType: 'json', //返回值类型 一般设置为json
		contentType: "application/json;charset=UTF-8",
		data: JSON.stringify(obj),
		headers: {
			"Authorization": "Basic " + auth
		},
		beforeSend: function() {
			$("body").append('<div id="loading" class="loader-inner ball-clip-rotate" style="position:fixed;top:0;left:0;bottom:0;right:0;background-color: #000;opacity: .6;z-index: 10002;"><div style="position:fixed;left:50%;top:50%;"></div></div>')
		},
		success: function(data) //服务器成功响应处理函数
		{
			if(data._status == 'OK') {
				errorTip('提交成功');
				//提交后返回				
				if(target == 'submBack') {
					clearNew();
					$('#r-content2').show(); //显示新建列表页	
					$('#r-content1,#r-content').hide(); //隐藏编辑页面和新建页面
					getAllList();
				} else {
					//提交后再建
					clearNew();
				}
			}
		},
		complete: function() {
			$('#loading').remove();
		},
		error: function(data, status, e) //服务器响应失败处理函数
		{
			errorTip('提交失败');
		}
	})
}
/*筛选start*/
function getFilterAllList() {
	var url1, url2, flag = false;
	$.each(filterObj, function(i, e) {
		for(var key in e) {
			if(e[key] !== '') {
				flag = true;
				return false;
			}
		}
	})
	if(flag) {
		if(contentType == 'article') {
			url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":' + JSON.stringify(filterObj) + '}&projection={"正文":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
			url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":' + JSON.stringify(filterObj) + '}&projection={"正文":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}';
		} else if(contentType == 'gallery') {
			url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":' + JSON.stringify(filterObj) + '}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"图片列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
			url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":' + JSON.stringify(filterObj) + '}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"图片列表":0}';
		} else if(contentType == 'video') {
			url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":' + JSON.stringify(filterObj) + '}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"视频列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
			url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":' + JSON.stringify(filterObj) + '}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"视频列表":0}';
		} else if(contentType == 'music') {
			url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":' + JSON.stringify(filterObj) + '}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"音频列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
			url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":' + JSON.stringify(filterObj) + '}&projection={"缩略图":0,"副标题":0,"简介":0,"来源":0,"音频列表":0}';
		} else if(contentType == 'subject') {
			url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":' + JSON.stringify(filterObj) + '}&projection={"宣传画":0,"专题标签":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
			url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":' + JSON.stringify(filterObj) + '}&projection={"宣传画":0,"专题标签":0,"缩略图":0,"副标题":0,"简介":0,"来源":0}';
		} else if(contentType == 'book') {
			url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":' + JSON.stringify(filterObj) + '}&projection={"出版日期":0,"出版社":0,"缩略图":0,"副标题":0,"简介":0,"来源":0,"章节列表":0}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
			url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":' + JSON.stringify(filterObj) + '}&projection={"出版日期":0,"出版社":0,"缩略图":0,"副标题":0,"简介":0,"来源":0,"章节列表":0}';
		} else if(contentType == 'live') {
			url1 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":' + JSON.stringify(filterObj) + '}&max_results=' + pagesize + '&page=' + curpage + '&sort=[("_created",-1)]';
			url2 = baseUrl + 'content?where={"类别":"' + contentType + '","语言":"' + defaultLang + '","$or":' + JSON.stringify(filterObj) + '}';
		}
		newtagAjax(url1, url2);
	} else {
		getAllList();
	}
}
//审核
var filterObj = [{
	'推荐': ''
}, {
	'置顶': ''
}, {
	'审核状态': ''
}, {
	'审核状态': ''
}, {
	'审核状态': ''
}];
$('#filterOne').click(function() {
	if($(this).hasClass('filter-way1')) {
		$(this).removeClass('filter-way1').addClass('filter-way11');
		filterObj[0]['推荐'] = true;
	} else {
		$(this).removeClass('filter-way11').addClass('filter-way1');
		filterObj[0]['推荐'] = '';
	}
	getFilterAllList();
})
$('#filterTwo').click(function() {
	if($(this).hasClass('filter-way2')) {
		$(this).removeClass('filter-way2').addClass('filter-way22');
		filterObj[1]['置顶'] = true;
	} else {
		$(this).removeClass('filter-way22').addClass('filter-way2');
		filterObj[1]['置顶'] = '';
	}
	getFilterAllList();
})
$('#filterThree').click(function() {
	if($(this).hasClass('filter-way3')) {
		$(this).removeClass('filter-way3').addClass('filter-way33');
		filterObj[2]['审核状态'] = 1;
	} else {
		$(this).removeClass('filter-way33').addClass('filter-way3');
		filterObj[2]['审核状态'] = '';
	}
	getFilterAllList();
})
$('#filterFour').click(function() {
	if($(this).hasClass('filter-way4')) {
		$(this).removeClass('filter-way4').addClass('filter-way44');
		filterObj[3]['审核状态'] = 0;
	} else {
		$(this).removeClass('filter-way44').addClass('filter-way4');
		filterObj[3]['审核状态'] = '';
	}
	getFilterAllList();
})
$('#filterFive').click(function() {
	if($(this).hasClass('filter-way5')) {
		$(this).removeClass('filter-way5').addClass('filter-way55');
		filterObj[4]['审核状态'] = -1;
	} else {
		$(this).removeClass('filter-way55').addClass('filter-way5');
		filterObj[4]['审核状态'] = '';
	}
	getFilterAllList();
})
/*筛选end*/
//新建页面对副标题进行设置
$('#newsubhead-time,#newsubhead-autor,#newsubhead-personnum,#newsubhead-source,#newsubhead-updown').click(function() {
	newsubheadObj[$(this).val()] = $(this).prop('checked');
	console.log(newsubheadObj);
})
//编辑页面对副标题进行设置
$('#editsubhead-time,#editsubhead-autor,#editsubhead-personnum,#editsubhead-source,#editsubhead-updown').click(function() {
	editsubheadObj[$(this).val()] = $(this).prop('checked');
	console.log(editsubheadObj);
})
/*点击审核相关的按钮*/
$('#checkStatus').click(function(e) {
	e.stopPropagation();
})
var checkFromId; //审核哪篇文章
var checkSuject; //审核内容
var checkStatus; //审核状态
$('.footer table tbody').on('click', '.checkpass', function(e) {
	checkFromId = $(this).parent().parent().attr('dataId');
	checkSuject = $(this).attr('dataSuject');
	checkStatus = $(this).attr('dataCheckStatus');
	$('#checkCon').val(checkSuject);
	if(checkStatus == 1 || checkStatus === 0) {
		$('#checkradio1').prop('checked', true);
		$('#checkradio2').prop('checked', false);
	} else {
		$('#checkradio1').prop('checked', false);
		$('#checkradio2').prop('checked', true)
	}
	$('#checkStatus,#mark').show();
	e.stopPropagation();
})
$('#checkradio1').click(function() {
	if($(this).prop('checked') == true) {
		checkStatus = 1;
		$('#checkradio2').prop('checked', false)
	} else {
		checkStatus = -1;
		$('#checkradio2').prop('checked', true)
	}
})
$('#checkradio2').click(function() {
	if($(this).prop('checked') == true) {
		checkStatus = -1;
		$('#checkradio1').prop('checked', false)
	} else {
		checkStatus = 1;
		$('#checkradio1').prop('checked', true)
	}
})
$('#checkStatus .sure').click(function() {
	checkSuject = $('#checkCon').val();
	var obj = {        
		"意见": checkSuject,
		"审核状态": parseInt(checkStatus)
	}
	$.ajax({
		type: "patch",
		url: baseUrl + 'content/check/' + checkFromId,
		dataType: 'json', //返回值类型 一般设置为json
		contentType: "application/json;charset=UTF-8",
		data: JSON.stringify(obj),
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data.success == 'OK') {
				$('#checkStatus,#mark').hide();
				getAllList();
			}
		}
	});
})
$('#checkStatus .cancel').click(function() {
	$('#checkStatus,#mark').hide();
})
/*点击审核相关的按钮*/
/*获取语言列表*/
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
				getAllList(); //初始化列表
				contentLimit(); //初始化查询对应内容各种长度限制
			}
		}
	});
}
//根据类型和语言，查询对应内容各种长度限制
function contentLimit() {
	$.ajax({
		type: "post",
		url: baseUrl + 'config/get_language_set',
		data: JSON.stringify({
			'类型': contentType,
			'语言': defaultLang
		}),
		dataType: 'json',
		contentType: "application/json;charset=UTF-8",
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data.item) {
				setContentLimitData = data.item;
				setTextPlaceholder(); //初始化公共提示语
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {

		}
	});
}
//设置文本框提示语
function setTextPlaceholder() {
	$('#newT,#editT').attr('placeholder', '请输入' + setContentLimitData['标题'][0] + '到' + setContentLimitData['标题'][1] + '个字符');
	$('#newA,#editA').attr('placeholder', '请输入' + setContentLimitData['作者'][0] + '到' + setContentLimitData['作者'][1] + '个字符');
	$('#newS,#editS').attr('placeholder', '请输入' + setContentLimitData['来源'][0] + '到' + setContentLimitData['来源'][1] + '个字符');
	$('#newI,#editI').attr('placeholder', '请输入' + setContentLimitData['简介'][0] + '到' + setContentLimitData['简介'][1] + '个字符');
	$('#sureValue,.addtag .itext').attr('placeholder', '请输入' + setContentLimitData['标签'][0] + '到' + setContentLimitData['标签'][1] + '个字符');
	if(contentType == 'gallery') {
		$('#addT,#newEditT,#updateT,#editaddT').attr('placeholder', '请输入' + setContentLimitData['图片列表']['标题'][0] + '到' + setContentLimitData['图片列表']['标题'][1] + '个字符');
		$('#addI,#newEditI,#updateI,#editaddI').attr('placeholder', '请输入' + setContentLimitData['图片列表']['简介'][0] + '到' + setContentLimitData['图片列表']['简介'][1] + '个字符或者可以为空')
	} else if(contentType == 'video') {
		$('#addT,#newEditT,#updateT,#editaddT').attr('placeholder', '请输入' + setContentLimitData['视频列表']['标题'][0] + '到' + setContentLimitData['视频列表']['标题'][1] + '个字符');
		$('#addI,#newEditI,#updateI,#editaddI').attr('placeholder', '请输入' + setContentLimitData['视频列表']['简介'][0] + '到' + setContentLimitData['视频列表']['简介'][1] + '个字符或者可以为空')
	} else if(contentType == 'music') {
		$('#addT,#newEditT,#updateT,#editaddT').attr('placeholder', '请输入' + setContentLimitData['音频列表']['标题'][0] + '到' + setContentLimitData['音频列表']['标题'][1] + '个字符');
		$('#addI,#newEditI,#updateI,#editaddI').attr('placeholder', '请输入' + setContentLimitData['音频列表']['简介'][0] + '到' + setContentLimitData['音频列表']['简介'][1] + '个字符或者可以为空')
	} else if(contentType == 'subject') {
		$('#topic-sureValue,.topic-addtag .topic-itext').attr('placeholder', '请输入' + setContentLimitData['标签'][0] + '到' + setContentLimitData['标签'][1] + '个字符');
	} else if(contentType == 'book') {
		$('#r-content .publish input,#r-content1 .publish input').attr('placeholder', '请输入' + setContentLimitData['出版社'][0] + '到' + setContentLimitData['出版社'][1] + '个字符');
	}
}