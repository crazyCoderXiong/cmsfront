var dragBox = null // 被拖动元素的原始父元素
var dragIndex = 0 // 被拖动元素的原始index
var dragElement = null; //正在拖动的元素
var elementCopy = null; //正在拖动元素的镜像(拖拽过程中的图像)
var dragCopy = null; //复制的追加到容器中的元素
var mouseOffset = null; //鼠标相对于元素的位置信息
var dropBox = null; //元素拖拽进去的容器
var canCreate = true; //防止元素在鼠标移动过程中多次追加元素
var dottedElement = null; //拖动到容器时的虚线框
var canAppend = true; //防止在元素移动过程中多次追加虚线框
var isIn; //保存拖拽元素是否在容器中的状态
var leftDistance = 0;/*容器元素相对于body左边的距离*/
var topDistance = 0;/*容器元素相对于body上边的距离*/
var data = {
	"title": "",
	"keywords": [],
	"theme": "blue",
	"header": [],
	"section": [],
	"footer": [],
	"style": {
		"header": {
			"css": ""
		},
		"section": {
			"css": ""
		},
		"footer": {
			"css": ""
		}
	}
};/*存储向后台传输的数据*/
var jsonBox = [];
var HTML = "";
var contentHTML = "";
var startNum = 0; //当前打开页面是否已保存0未保存1已保存
var presentId = ""; //当前页面id
var presentName = ""; //当前页面显示名称
var presentPageName = "";//当前页面文件名称
var removedJson = {};//被移动的模块对应的json数据
var changeState = 0 // 判断页面data是否被修改
var playerNum = 0 // 视频模块id序号
var auth = "{{auth}}";
//auth="dGVzdDp0ZXN0";
var baseurl = '';
console.log("{{auth}}");
//baseurl="http://172.16.0.145";
var canupdate = true
/*拖动行为开始*/
function dragStart(ele) {
	elementCopy.style.opacity = ".5";
	getDistance(ele);
	elementCopy.style.left = leftDistance + "px";
	elementCopy.style.top = (topDistance + $(document).scrollTop()) + "px";
	var parents = $(ele).parents();
	if(parents.hasClass("modelBox")) {
		elementCopy.style.width = "500px";
	} else if(parents.hasClass("demo")) {
		elementCopy.style.width = ele.offsetWidth + "px";
	}
	elementCopy.style.display = "block";
	elementCopy.appendChild(ele.cloneNode(true)); //插入克隆出的副本元素
}

/*拖动过程中*/
function drag(mousePosition) {
	elementCopy.style.left = (mousePosition.x - mouseOffset.offsetLeft) + "px";
	if(elementCopy.style.width == "500px") {
		elementCopy.style.top = (mousePosition.y - mouseOffset.offsetTop + $(document).scrollTop()) + "px";
	} else {
		elementCopy.style.top = (mousePosition.y - mouseOffset.offsetTop) + "px";
	}
}

/*获取鼠标相对于元素的坐标*/
function mouseOffsetElement(dragEle, e) {
	getDistance(dragEle);
	return {
		offsetLeft: (e.pageX - leftDistance),
		offsetTop: (e.pageY - topDistance)
	}
}

/*获取鼠标相对于页面的坐标*/
function getMousePosition(e) {
	var x = e.pageX,
		y = e.pageY
	var left = $('#nav-ul').width() + 10
	if($('#r-content').position().left < left) {
		// 获取#r-content滚动过的距离
		x += left - $('#r-content').position().left
	}
	return {
		x: x,
		y: y
	}
}

function getDistance(ele) {
	leftDistance = ele.offsetLeft;
	topDistance = ele.offsetTop;
	while(ele = ele.offsetParent) {
		leftDistance += ele.offsetLeft;
		topDistance += ele.offsetTop;
	}
}
/*判断元素是否拖至容器元素内*/
function inDrop(e, dropEle) {
	var ePosition = getMousePosition(e);
	getDistance(dropEle);
	if(ePosition.x > leftDistance && ePosition.y > topDistance &&
		ePosition.x < (leftDistance + dropEle.offsetWidth) && ePosition.y < (topDistance + dropEle.offsetHeight)) {
		return true
	} else {
		return false
	}
}

/*拖动时鼠标相对于预计的兄弟元素的位置*/
function appendPosition(e, siblingEle) {
	getDistance(siblingEle);
	var ePosition = {
		y: e.pageY
	};
	if(ePosition.y < topDistance) {
		return "before";
	} else if(ePosition.y > topDistance + siblingEle.offsetHeight) {
		return "after";
	}
}

/*向容器内追加被拖拽的元素或虚线框*/
function appendEle(e, dragEle, boxEle) {
	if($(dropBox).children(".ui-draggable").length) {
		for(var i = 0; i < $(dropBox).children(".ui-draggable").length; i++) {
			if(appendPosition(e, $(dropBox).children(".ui-draggable")[i]) == "before") {
				if($(boxEle).parents().hasClass("demo")) {
					boxEle.insertBefore(dragEle, $(boxEle).children(".ui-draggable")[i]);
				} else {
					boxEle.insertBefore(dragEle, $(boxEle).children()[i]);
				}
				return
			} else if(appendPosition(e, $(dropBox).children(".ui-draggable")[i]) == "after" && $(dropBox).children(".ui-draggable")[i + 1] &&
				appendPosition(e, $(dropBox).children(".ui-draggable")[i + 1]) == "before") {
				if($(boxEle).parents().hasClass("demo")) {
					boxEle.insertBefore(dragEle, $(boxEle).children(".ui-draggable")[i + 1]);
				} else {
					boxEle.insertBefore(dragEle, $(boxEle).children()[i + 1]);
				}
				return
			} else {
				boxEle.appendChild(dragEle);
			}
		}
	} else {
		boxEle.appendChild(dragEle);
	}
}

/*移除虚线框 设置可追加虚线框为true*/
function removeDotted() {
	if(document.getElementsByClassName("dotted").length) {
		$(".dotted").parent()[0].removeChild($(".dotted")[0]);
		canAppend = true;
	}
}
/* 将拖拽失败的元素恢复到原始位置 */
function restoreDragPosition () {
	if (dragBox) {
		dragCopy = $(elementCopy).children()[0].cloneNode(true);
		if (dragBox.children().eq(dragIndex).length) {
			dragBox.children().eq(dragIndex).before(dragCopy)
		} else {
			dragBox.append(dragCopy)
		}
		changeJson($(dragCopy))
		console.log(removedJson)
		if ($(dragCopy).hasClass('row-draggable')) {
			if (dragBox[0].className == "container-box") {
				if (dragBox.find('.ui-draggable').length) {
					jsonBox.splice($(dragCopy).index() - 1, 0, removedJson);
					removedJson = {}
				} else {
					jsonBox[0] = removedJson
					removedJson = {}
				}
			} else {
				if (jsonBox.layouts) {
					jsonBox.layouts.splice($(dragCopy).index() - 1, 0, removedJson);
					removedJson = {};
				} else {
					jsonBox["layouts"] = []
					jsonBox.layouts[0] = removedJson
					removedJson = {}
				}
			}
		} else {
			jsonBox["model"] = removedJson
		}
	}
}

/*条件及副本元素初始化*/
function reset() {
	elementCopy.innerHTML = "";
	elementCopy.style.display = "none";
	dragElement = null;
	if(dragCopy) {
		getDistance(dragCopy);
		dragCopy = null;
	}
	canCreate = true;
	dropBox = null;
	dragBox = null
	dragIndex = 0
	canAppend = true;
	jsonBox = [];
	removedJson = {}
}

function limitCount(a, b, count) {
	if(count >= a && count <= b) {
		return true;
	} else {
		return false;
	}
}

/*图文混排模块调整图片大小及居中*/
function widthCenter(obj) {
	var pictureWidth, pictureHeight;
	if($(obj).parents().hasClass("pic-slide")) {
		pictureWidth = parseFloat($(obj).find(".picture").css("width"));
		pictureHeight = parseFloat($(obj).find(".picture").css("height"));
	} else {
		pictureWidth = $(obj).find(".picture").width();
		pictureHeight = $(obj).find(".picture").height();
	}
	var pictureRatio = pictureWidth / pictureHeight;
	var img = document.createElement("img");
	img.src = $(obj).find(".picture img").attr("src");
	var imgWidth = img.width;
	var imgHeight = img.height;
	var imgRatio = imgWidth / imgHeight;
	if($(obj).parents(".tab").hasClass("adaptive") || ($(obj).parents(".model").hasClass("pic-slide") && $(obj).parents(".model").find(".tab").hasClass("adaptive"))) {
		if(pictureRatio <= imgRatio) {
			fillWidth(obj);
		} else if(pictureRatio > imgRatio) {
			fillHeight(obj);
		}
	} else {
		if(pictureRatio >= imgRatio) {
			//当picture的比率大于图片本身的比率时。让图片宽度=picture的宽度，求出图片高度，并居中图片
			fillWidth(obj);
		} else if(pictureRatio < imgRatio) {
			//当picture的比率小于图片本身的比率时。让图片高度=picture的高度，求出图片宽度，并居中图片
			fillHeight(obj);
		}
	}

	function fillWidth(obj) {
		//设置图片的新宽度
		$(obj).find(".picture img").css({
			"width": pictureWidth + "px"
		});
		var imgNewWidth = $(obj).find(".picture img").width();
		//计算并设置图片的新高度
		var imgNewHeight = imgNewWidth / imgRatio;
		$(obj).find(".picture img").css({
			"height": imgNewHeight + "px"
		});
		//让图片多出来的高度部分居中显示
		var imgHalfMoreHeight = (imgNewHeight - pictureHeight) / 2;
		$(obj).find(".picture img").css({
			"margin-top": -imgHalfMoreHeight + "px",
			"margin-left": 0
		});
	}

	function fillHeight(obj) {
		//设置图片的新高度
		$(obj).find(".picture img").css({
			"height": pictureHeight + "px"
		});
		var imgNewHeight2 = $(obj).find(".picture img").height();
		//计算并设置图片的新宽度
		var imgNewWidth2 = imgNewHeight2 * imgRatio;
		$(obj).find(".picture img").css({
			"width": imgNewWidth2 + "px"
		});
		//让图片多出来的高度部分居中显示
		var imgHalfMoreWidth = (imgNewWidth2 - pictureWidth) / 2;
		$(obj).find(".picture img").css({
			"margin-left": -imgHalfMoreWidth + "px",
			"margin-top": 0
		});
	}
}

function changeJson(obj) {
	var part = obj.parents(".row-container").parent();
	if($(part).is("header")) {
		jsonBox = data.header;
	} else if($(part).is("section")) {
		jsonBox = data.section;
	} else if($(part).is("footer")) {
		jsonBox = data.footer;
	}
	var rowdrag = obj.parents(".row-draggable");
	if($(rowdrag).length) {
		if($(rowdrag).length == 1) {
			jsonBox = jsonBox[$(rowdrag).eq(0).prevAll().length].layout[obj.parents(".column").eq(0).prevAll().length];
		} else if($(rowdrag).length == 2) {
			jsonBox = jsonBox[$(rowdrag).eq(1).prevAll().length].layout[obj.parents(".column").eq(1).prevAll().length].layouts[$(rowdrag).eq(0).prevAll().length].layout[obj.parents(".column").eq(0).prevAll().length];
		}
	}
	changeState = 1
}

/*追加元素内容*/
function appendModel(obj) {
	var html = "",
		iconHtml = "";
	if(obj.parents(".model").hasClass("pic-pictures")) {
		for(var i = 0; i < obj.parents(".content-handle").find(".item-row input").val(); i++) {
			html += "<ol class='lists clearfix'>";
			for(var j = 0; j < obj.parents(".content-handle").find(".item-col input").val(); j++) {
				html += " <li class='item pull-left'  style='width:";
				var num = (100 / obj.parents(".content-handle").find(".item-col input").val()).toFixed(2);
				if(obj.parents(".content-handle").find(".item-col input").val() == 6 || obj.parents(".content-handle").find(".item-col input").val() == 7) {
					num -= 0.01;
				}
				html += num + "%;'><div class='picture' style='height:" + obj.parents(".content-handle").find(".pic-height input").val() + "px;'><a href='javascript:;'><img src='images/air_03.jpg' alt='它是如何上去的' class='jqthumb'></a>"
				if(obj.parents(".content-handle").find('.title-display input[value="block"]').parent().attr('class') === 'checked') {
					html += "<div class='mod'><h3><a href='javascript:;' title='它是如何上去的'>它是如何上去的</a></h3></div>"
				}
				html += "</div></li>"
			}
			html += "</ol>"
		}
	} else if (obj.parents(".model").hasClass("video-playing")) {
		html += '<div class="lists"><div class="player" style="width:100%"><div id="player' + playerNum + '" style="width:100%;height:400px;alignment: center;display: inline-block">&nbsp;</div></div></div>'
	} else if (obj.parents(".model").hasClass("timer-axis")) {
		html += '<ol class="lists cont' + obj.parents(".content-handle").find(".content-row input").val() + '">'
		for (var i = 0; i < obj.parents(".content-handle").find(".item-row input").val(); i++) {
			html += '<li class="item"><div class="time-point clearfix"><div class="time-left clearfix"><div class="date">' + setTimeStyle(obj.parents('.content-handle').find('.time-style .checked input').val()) +'</div><p class="time-line"><span class="circle"><img src="images/Group20.png" alt=""></span><span class="vertical-line"></span></p></div><div class="time-right">'
			if (obj.parents('.model').find('.title-display .checked input').val() == 'block') {
				html += '<h3>商业摄影</h3>'
			}
			if (obj.parents('.model').find('.content-display .checked input').val() == 'block') {
				html += '<p><span>商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影</span><b>...</b></p>'
			}
			html += '</div></div></li>'
		}
		html += '</ol>'
	} else {
		for(var i = 0; i < obj.parents(".content-handle").find(".item-col input").val(); i++) {
			if(obj.parents(".model").hasClass("text-title") || obj.parents(".model").hasClass("file-download")) {
				html += "<ol class='lists col-md-" + parseInt(12 / obj.parents(".content-handle").find(".item-col input").val()) + " " + obj.parents(".content-handle").find(".prefix-style .checked input").val() + " " + obj.parents(".content-handle").find(".alignment .checked input").val() + " text'"
				if (obj.parents(".model").hasClass("text-title")) {
					html += " start=" + (parseInt(i * obj.parents(".content-handle").find(".item-row input").val()) + 1)
				}
				html += ">";
			} else if(obj.parents(".model").hasClass("text-titleCont") || obj.parents(".model").hasClass("pictureText-vertical") || obj.parents(".model").hasClass("pictureText-crosswise") || obj.parents(".model").hasClass("music")) {
				html += "<ol class='lists col col-md-" + parseInt(12 / obj.parents(".content-handle").find(".item-col input").val()) + "'>";
			} else if(obj.parents(".model").hasClass("pictureText-surround")) {
				html += "<ol class='lists col col-md-" + parseInt(12 / obj.parents(".content-handle").find(".item-col input").val()) + " " + obj.parents(".content-handle").find(".prefix-style .checked input").val() + "'><li class='item'><div class='picture'><a href='javascript:;'><img src='images/background-index.png' class='jqthumb'></a></div><ol class='title-line'>"
			} else if(obj.parents(".model").hasClass("pic-slide")) {
				html += "<li class='picture' data-number='" + (i + 1) + "' style='height:" + obj.parents(".model").find(".pic-height input").val() + "px;'><a href='javascript:;'><img src='images/air_03.jpg' alt='南海西沙风景如此美丽' class='jqthumb'></a>"
				if(obj.parents(".model").find('.title-display input[value="block"]').parent().attr('class') === 'checked') {
					html += "<div class='mod'><h3><a href='javascript:;' title='南海西沙风景如此美丽'>南海西沙风景如此美丽</a></h3></div>"
				}
				html += "</li>";
				iconHtml += "<li data-number='" + (i + 1);
				if(obj.parents(".model").find(".icon-style .checked input").val() == "thumbnailLists") {
					var iconNum = (100 / obj.parents(".content-handle").find(".item-col input").val()).toFixed(2);
					if(obj.parents(".content-handle").find(".item-col input").val() == 6 || obj.parents(".content-handle").find(".item-col input").val() == 7) {
						iconNum -= 0.01;
					}
					iconHtml += "' style='width:" + iconNum + "%";
				}
				iconHtml += "'>";
				if(obj.parents(".model").find(".icon-style .checked input").val() == "thumbnailLists") {
					iconHtml += "<a href='javascript:;'><img src='images/air_03.jpg' class='jqthumb'/></a>";
				}
				iconHtml += "</li>";
			}
			for(var j = 0; j < obj.parents(".content-handle").find(".item-row input").val(); j++) {
				if(obj.parents(".model").hasClass("text-titleCont")) {
					html += "<li class='item'><h3><a href='#'><span class='title-text'";
					if(obj.parents(".content-handle").find(".date-display .checked input").val() != "none") {
						html += "style='width:" + obj.parents(".content-handle").find(".date-display .checked input").val() + "'";
					}
					html += ">马云遭实业家集体炮轰！阿里反击了马云遭实业家集体炮轰！阿里反击了马云遭实业家集体炮轰！阿里反击了</span>";
					if(obj.parents(".content-handle").find(".date-display .checked input").val() != "none") {
						html += "<span class='title-date'>2017-6-26</span>";
					}
					html += "</a></h3><p class='Row Row" + obj.parents(".content-handle").find(".content-row input").val() + "'><a href='#'>互联网只是个工具，商业的本质从来没有变过，商业的残酷性也从来没有变过，商业不会因为资历老就尊重你，也不会因为年轻就忍让你！只有勇于改变敢于变革的人才能互联网只是个工具，商业的本质从来没有变过，商业的残酷性也从来没有变过商业不会因为资历老就尊重你，也不会因为年轻就忍让你！只有勇于改变敢于变革的人才能活</a></p></li>"
				} else if(obj.parents(".model").hasClass("pictureText-crosswise")) {
					html += "<li class='item clearfix'><div class='media'><div class='picture pull-left'><div class='media-object'><a href='#'><img src='images/background-index.png' class='jqthumb'></a></div>"
					if(obj.parents(".content-handle").find('.title-display input[value="block"]').parent().attr('class') === 'checked') {
						html += "<div class='mod'><h3><a href='#'>路虎汽车</a></h3></div>"
					}
					html += "</div><div class='media-body'><p class='Row Row" + obj.parents(".content-handle").find(".content-row input").val() + "'><a href='#'>北京市土地交易市场发布了石景山，平谷2宗自住型商品住房用地出让公告，涉及土地面积约13万公顷建筑规模约17万平方米</a></p></div></div></li>";
				} else if(obj.parents(".model").hasClass("pictureText-vertical")) {
					html += "<li class='item clearfix'><div class='picture center-block'><a href='#'><img class='media-object' src='images/beijing.png' class='jqthumb'></a>"
					if(obj.parents(".content-handle").find('.title-display input[value="block"]').parent().attr('class') === 'checked') {
						html += "<div class='mod'><h3><a href='#'>朝鲜&美国</a></h3></div>"
					}
					html += "</div><div class='media-body'><p class='Row Row" + obj.parents(".content-handle").find(".content-row input").val() + "'><a href='javascript:;'>朝鲜抨击美国恶化半岛局势 美对朝动武声调 朝鲜抨击美国恶化半岛局势 美对朝动武声调</a></p></div></li>"
				} else if(obj.parents(".model").hasClass("text-title") || obj.parents(".model").hasClass("file-download")) {
					html += "<li class='item'><a href='javascript:;'>";
					if (obj.parents(".model").hasClass("text-title")) {
						if(obj.parents(".content-handle").find(".prefix-style .checked input").val() == "prefix-disc") {
							html += "<i></i>";
						} else if(obj.parents(".content-handle").find(".prefix-style .checked input").val() == "prefix-icon") {
							html += "<i class='glyphicon glyphicon-record'></i>";
						}
					}
					html += "<span class='title-text'";
					if(obj.parents(".content-handle").find(".date-display .checked input").val() != "none") {
						html += "style='width:" + obj.parents(".content-handle").find(".date-display .checked input").val() + "'";
					}
					html += ">听音乐大脑在干什么 萌妹子的太谷之心</span>";
					if(obj.parents(".content-handle").find(".date-display .checked input").val() != "none") {
						html += "<span class='title-date'>2017-6-26</span>";
					}
					html += "</a></li>";
				} else if(obj.parents(".model").hasClass("pictureText-surround")) {
					html += "<li><a href='javascript:;'>";
					if(obj.parents(".content-handle").find(".prefix-style .checked input").val() == "prefix-disc") {
						html += "<i></i>";
					} else if(obj.parents(".content-handle").find(".prefix-style .checked input").val() == "prefix-icon") {
						html += "<i class='glyphicon glyphicon-record'></i>";
					}
					html += "约23.6万奥迪Q4 PK宝马X2</a></li>";
				} else if (obj.parents(".model").hasClass("music")) {
					html += '<li class="item"><div class="music-name"><a href="javascript:;">歌曲名称</a></div><div class="music-player"><audio preload="auto" controls="controls"><source src="images/horse.ogg" type="audio/ogg"><source src="images/horse.mp3" type="audio/mpeg"></audio></div></li>'
				}
			}
			if(obj.parents(".model").hasClass("pictureText-surround")) {
				html += "</ol></li>";
			}
			html += "</ol>";
		}
	}
	if(obj.parents(".model").hasClass("pic-slide")) {
		obj.parents(".model").find(".pictureSlide").html(html);
		obj.parents(".model").find(".rolling-style").html(iconHtml);
		obj.parents(".model").find(".picture").width(obj.parents(".model").find(".tab").width());
		$(".demo .pictureSlide").each(function() {
			widthCenter($(this).parent(".item"));
			pictureSlide(this);
		});
	} else {
		obj.parents(".model").find("li.tab.active").html(html);
	}
	if (obj.parents(".model").hasClass("music")) {
		obj.parents(".model").find('audio').audioPlayer()
	} else if (obj.parents(".model").hasClass("video-playing")) {
		playerNum++
		var id = obj.parents('.model').find('.player').children().attr('id')
		vidioPlay(id)
	} else if (obj.parents(".model").hasClass("timer-axis")) {
		setTimeAxisWidth(obj.parents(".model"))
	}
	changeJson(obj);
}

/*写出操作界面*/
function generateConfigHtml(DaTaBox, obj) {
	HTML = "";
	var config = "config";

	//HTML += $('.demo ' + obj + ' .container-config-handel')[0].outerHTML
	if(DaTaBox.length) {
		for(var j = 0; j < DaTaBox.length; j++) {
			HTML += "<div class='row-draggable ui-draggable'>"
			HTML += $('.row-draggable .template-handle')[0].outerHTML + "<span class='draggable-title'>"
			if(DaTaBox[j].layout.length == 1) {
				HTML += "1";
			} else {
				HTML += DaTaBox[j].layout[0].size;
				for(var k = 1; k < DaTaBox[j].layout.length; k++) {
					HTML += ":" + DaTaBox[j].layout[k].size;
				}
			}
			HTML += "栏</span><div class='view'><div class='row'>";
			for(var l = 0; l < DaTaBox[j].layout.length; l++) {
				HTML += "<div class='column col-md-" + DaTaBox[j].layout[l].size + "'>";
				if(DaTaBox[j].layout[l].model) {
					var mname = DaTaBox[j].layout[l].model.name;
					HTML += "<div class='col-draggable ui-draggable'>"
					HTML += $('.' + mname).parents('.ui-draggable').find('.template-handle')[0].outerHTML
					HTML += "<span class='draggable-title'>";
					HTML += modelName(mname);
					HTML += "</span><div class='view'><ul class='model " + mname + "'>";
					generateModelHtml(DaTaBox[j].layout[l].model, config);
					HTML += "</ul></div></div>";
				} else if(DaTaBox[j].layout[l].layouts) {
					for(var m = 0; m < DaTaBox[j].layout[l].layouts.length; m++) {
						var layout = DaTaBox[j].layout[l].layouts[m].layout;
						HTML += "<div class='row-draggable ui-draggable'>"
						HTML += $('.row-draggable .template-handle')[0].outerHTML + "<span class='draggable-title'>"
						if(layout.length == 1) {
							HTML += "1";
						} else {
							HTML += layout[0].size;
							for(var n = 1; n < layout.length; n++) {
								HTML += ":" + layout[n].size;
							}
						}
						HTML += "栏</span><div class='view'><div class='row'>";
						for(var o = 0; o < layout.length; o++) {
							HTML += "<div class='column col-md-" + layout[o].size + "'>";
							if(layout[o].model) {
								var mname = layout[o].model.name;
								HTML += "<div class='col-draggable ui-draggable'>"
								HTML += $('.' + mname).parents('.ui-draggable').find('.template-handle')[0].outerHTML
								HTML += "<span class='draggable-title'>";
								HTML += modelName(mname);
								HTML += "</span><div class='view'><ul class='model " + mname + "'>";
								generateModelHtml(layout[o].model, config);
								HTML += "</ul></div></div>";
							}
							HTML += "</div>";
						}
						HTML += "</div></div></div>";
					}
				}
				HTML += "</div>";
			}
			HTML += "</div></div></div>";
		}
	} else {
		HTML += "<div class='prompt-text'>拖放布局添加到" + findObj(obj) + "内容区域</div>"
	}
	$(".demo " + obj + " .container-box").html(HTML);
}

function modelName(name) {
	var mname = "";
	if(name == "text-title") {
		mname = "纯标题";
	} else if(name == "text-titleCont") {
		mname = "标题内容";
	} else if(name == "pictureText-surround") {
		mname = "环绕";
	} else if(name == "pictureText-crosswise") {
		mname = "横排";
	} else if(name == "pictureText-vertical") {
		mname = "竖排";
	} else if(name == "pic-pictures") {
		mname = "多图";
	} else if(name == "pic-slide") {
		mname = "幻灯片";
	} else if(name == "nav-text") {
		mname = "纯文字导航条";
	} else if(name == "searchBox") {
		mname = "搜索导航条";
	} else if(name == "nav-footer") {
		mname = "页脚导航条";
	} else if(name == "nav-classic") {
		mname = "企业经典导航条";
	} else if(name == "nav-button") {
		mname = "按钮导航条";
	} else if(name == "nav-classicButton") {
		mname = "经典按钮导航条";
	}
	return mname;
}

/*写出模块*/
function generateModelHtml(obj, config) {
	if(obj.tabsDisplay == "block") {
		HTML += "<li class='content-bar title"
		if (obj.tabsCenter != 'no') {
			HTML += ' ' + obj.tabsCenter
		}
		HTML += "'>";
		if(obj.tabsStyle == "horizontal") {
			HTML += "<ul><li class='content-bar_click'><span>";
			if(obj.tabs[0] && obj.tabs[0].tabName) {
				HTML += obj.tabs[0].tabName;
			} else {
				HTML += "添加页签名";
			}
			HTML += "</span></li>";
			for(var m = 1; m < obj.tabs.length; m++) {
				HTML += "<li><span>" + obj.tabs[m].tabName + "</span></li>";
			}
			HTML += "</ul>";
		} else if(obj.tabsStyle == "dropdown") {
			HTML += "<div class='more'><h3 class='left'><strong>";
			if(obj.tabs[0] && obj.tabs[0].tabName) {
				HTML += obj.tabs[0].tabName;
			} else {
				HTML += "添加页签名";
			}
			HTML += "</strong><i></i></h3><ul class='menu'>";
			if(obj.tabs.length) {
				HTML += "<li><span>" + obj.tabs[0].tabName + "</span></li>";
			} else {
				HTML += "<li><span>添加页签名</span></li>";
			}
			for(var m = 1; m < obj.tabs.length; m++) {
				HTML += "<li><span>" + obj.tabs[m].tabName + "</span></li>";
			}
			HTML += "</ul></div>";
		}
		if(config) {
			HTML += "<i class='handleLabel'></i>";
		}
		if (obj.moreStyle != 'none') {
			HTML += "<a href='javascript:;'><i class='" + obj.moreStyle + "'>";
			if(obj.moreStyle == "more-text") {
				HTML += "更多&gt;";
			}
			HTML += "</i></a>"
		}
		HTML += "</li>";
	}
	var str = new RegExp("nav-");
	if(str.test(obj.name)) {
		// console.log("根据导航配置写出模块：", obj);
		if(obj.name == "nav-searchBox") {
			HTML += "<li class='tab tab-nav clearfix active'><form><input type='text' placeholder='搜索..'><div class='search'></div></form></li>";
		} else if(obj.name == "nav-visitcount") {
			HTML += "<li class='tab active tab-nav text-center clearfix'><ol class='lists clearfix'><li class='item'>您是第<span class='red'><span id='visit-count'>n</span></span>位访客</li></ol></li>"
		} else {
			HTML += "<li class='tab clearfix active tab-nav";
			if(obj.name == "nav-button" || obj.name == "nav-classicButton" || obj.name == "nav-text") {
				HTML += " ";
				if(obj.alignment) {
					HTML += obj.alignment;
				} else {
					HTML += "full";
				}
			} else if(obj.name == "nav-footer") {
				HTML += " text-center";
			}
			HTML += "'>";
			if(obj.name == "nav-button" || obj.name == "nav-classicButton" || obj.name == "nav-text" || obj.name == "nav-footer") {
				var x = 0;
				for(var o = 0; o < obj.tabCol.length; o++) {
					HTML += "<ol class='lists clearfix'>";
					if(config) {
						HTML += "<i class='handleLabel'></i>";
					}
					for(var p = 0; p < obj.tabCol[o]; p++) {
						HTML += makeNavItem(obj, x, o);
						x++;
					}
					HTML += "</ol>";
				}
			} else if(obj.name == "nav-classic") {
				HTML += "<ol class='lists clearfix pull-left'>";
				if(config) {
					HTML += "<i class='handleLabel'></i>";
				}
				for(var x = 0; x < obj.tabCol[0]; x++) {
					HTML += makeNavItem(obj, x);
				}
				HTML += "</ol><form class='clearfix pull-left'><input placeholder='搜索...' type='text'><div class='search'></div></form><ol class='lists clearfix pull-right'>";
				if(config) {
					HTML += "<i class='handleLabel'></i>";
				}
				for(var y = obj.tabCol[0]; y < (parseInt(obj.tabCol[0]) + parseInt(obj.tabCol[1])); y++) {
					HTML += makeNavItem(obj, y);
				}
				HTML += "</ol>";
			} else {
				console.log("unknown nav type:" + obj.name);
			}
		}
		HTML += "</li>";
	} else {
		//非导航类模块
		if (obj.name === 'offer-candle') {
			HTML += '<li class="tab active ' + obj.alignment + ' clearfix" data-contentId=' + obj.contentId + '><ol class="lists clearfix"><li class="item clearfix"><span class="pull-left">献烛：</span><ul class="pull-left"><li><img src="images/fire3.gif"></li><li><img src="images/fire3.gif"></li><li><img src="images/fire3.gif"></li><li><img src="images/fire3.gif"></li><li><img src="images/fire3.gif"></li><li><img src="images/copy6.png"></li><li><img src="images/copy6.png"></li><li><img src="images/copy6.png"></li><li><img src="images/copy6.png"></li><li><img src="images/copy6.png"></li></ul><p class="pull-left"><span>献烛</span><b>5</b></p></li></ol></li>'
		} else {
			if(obj.tabs.length) {
				for(var n = 0; n < obj.tabs.length; n++) {
					HTML += "<li class='tab clearfix";
					if(n == 0) {
						HTML += " active"
					}
					if(obj.name == "pic-pictures" || obj.name == "pic-slide" || obj.name == "pictureText-surround" || obj.name == "pictureText-crosswise" || obj.name == "pictureText-vertical") {
						HTML += " " + obj.tabs[n].fillStyle + ' ' + obj.tabs[n].mouseMove;
						if (obj.name == "pic-pictures" || obj.name == "pic-slide") {
							HTML += ' ' + obj.tabs[n].linkWay + ' '
							if (obj.tabs[n].mouseClick !== 'no-action') {
								HTML += obj.tabs[n].mouseClick
							} else {
								HTML += 'no-click-action'
							}
						}
					} else if (obj.name == 'timer-axis') {
						HTML += ' time-' + obj.tabs[n].timeDirection
					}
					HTML += "'";
					if(obj.name == "pic-slide" && obj.tabs[n].height) {
						HTML += " style='height:" + obj.tabs[n].height + "px;'";
					}
					if(config && obj.tabs[n].sourceType) { // 还原CMS内容设置
						HTML += " data-sourceType='" + obj.tabs[n].sourceType;
						HTML += "' data-tabName='" + obj.tabs[n].tabName;
						if(obj.tabs[n].sourceName)
							HTML += "' data-sourceName='" + (obj.tabs[n].sourceName ? obj.tabs[n].sourceName : "");
						if(obj.tabs[n].link)
							HTML += "' data-link='" + (obj.tabs[n].link);
						HTML += "'";
					}
					HTML += ">";
					if(obj.name == "pic-slide" && obj.tabs[n].itemRow) {
						for(var o = 0; o < obj.tabs[n].itemRow; o++) {
							HTML += "<div class='item'><ul class='pictureSlide";
							if(obj.tabs[n].iconStyle == "thumbnailLists") {
								HTML += " thumb-mod";
							}
							HTML += "'>";
							for(var p = 0; p < obj.tabs[n].itemCol; p++) {
								HTML += "<li class='picture' data-number='" + (p + 1) + "' style='height:" + obj.tabs[n].height + "px;'><a href='javascript:;'><img src='images/air_03.jpg' alt='南海西沙风景如此美丽' class='jqthumb'></a>";
								if(obj.tabs[n].titleDisplay == "block") {
									HTML += "<div class='mod'><h3><a href='javascript:;' title='南海西沙风景如此美丽'>南海西沙风景如此美丽</a></h3></div>";
								}
								HTML += "</li>";
							}
							HTML += "</ul><ul class='arrows'><li class='left-arrow'> &lt; </li><li class='right-arrow'> &gt; </li></ul><ul class='rolling-style " + obj.tabs[n].iconStyle + "'>";
							for(var q = 0; q < obj.tabs[n].itemCol; q++) {
								var num = (100 / obj.tabs[n].itemCol).toFixed(2);
								if(obj.tabs[n].itemCol == 6 || obj.tabs[n].itemCol == 7) {
									num -= 0.01;
								}
								HTML += "<li data-number=" + (q + 1);
								if(obj.tabs[n].iconStyle == "thumbnailLists") {
									HTML += " style='width:" + num + "%'><a href='javascript:;'><img src='images/air_03.jpg' class='jqthumb'/></a>";
								} else {
									HTML += ">";
								}
								HTML += "</li>";
							}
							HTML += "</ul></div>"
						}
					} else if(obj.name == "pic-pictures" && obj.tabs[n].itemRow) {
						for(var o = 0; o < obj.tabs[n].itemRow; o++) {
							HTML += "<ol class='lists clearfix'>";
							for(var p = 0; p < obj.tabs[n].itemCol; p++) {
								var num = (100 / obj.tabs[n].itemCol).toFixed(2);
								if(obj.tabs[n].itemCol == 6 || obj.tabs[n].itemCol == 7) {
									num -= 0.01;
								}
								HTML += "<li class='item pull-left' style='width:" + num + "%'><div class='picture' style='height:" + obj.tabs[n].height + "px'><a href='javascript:;'><img src='images/air_03.jpg' class='jqthumb'/></a>";
								if(obj.tabs[n].titleDisplay == "block") {
									HTML += "<div class='mod'><h3><a href='javascript:;' title='南海西沙风景如此美丽'>南海西沙风景如此美丽</a></h3></div>";
								}
								HTML += "</div></li>"
							}
							HTML += "</ol>";
						}
					} else if (obj.name == "video-playing") {
						HTML += '<div class="lists"><div class="player" style="width:100%"><div id="player'+ playerNum + '" style="width:100%;height:400px;alignment: center;display: inline-block">&nbsp;</div></div></div>'
					} else if (obj.name == 'timer-axis') {
						HTML += "<ol class='lists cont" + obj.tabs[n].contentRow + "' data-timeStyle='" + obj.tabs[n].timeStyle + "'>"
						for (var o = 0; o < obj.tabs[n].itemRow; o++) {
							HTML += '<li class="item"><div class="time-point clearfix"><div class="time-left clearfix"><div class="date">' + setTimeStyle(obj.tabs[n].timeStyle) + '</div><p class="time-line"><span class="circle"><img src="images/Group20.png" alt=""></span><span class="vertical-line"></span></p></div><div class="time-right'
							if (obj.tabs[n].contentDisplay == 'none' && obj.tabs[n].timeDirection == 'horizontal') {
								HTML += ' onlyTitle'
							}
							HTML += '">'
							if (obj.tabs[n].titleDisplay == 'block') {
								HTML += '<h3>商业摄影4</h3>'
							}
							if (obj.tabs[n].contentDisplay == 'block') {
								HTML += '<p><span>商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影</span><b>...</b></p>'
							}
							HTML += '</div></div></li>'
						}
						HTML += '</ol>'
					} else {
						if(obj.tabs[n].itemCol) {
							for(var o = 0; o < obj.tabs[n].itemCol; o++) {
								HTML += "<ol class='lists col col-md-" + parseInt(12 / obj.tabs[n].itemCol);
								if(obj.tabs[n].prefixStyle) {
									HTML += " " + obj.tabs[n].prefixStyle;
								}
								if(obj.tabs[n].alignment) {
									HTML += " " + obj.tabs[n].alignment;
								}
								if(obj.name == "text-title" || obj.name == 'file-download') {
									HTML += " text";
								}
								HTML += "'";
								if(obj.name == "text-title") {
									HTML += " start='" + (o * obj.tabs[n].itemRow + 1) + "'";
								}
								HTML += ">";
								if(obj.name == "text-title") {
									for(var p = 0; p < obj.tabs[n].itemRow; p++) {
										HTML += "<li class='item'><a href='javascript:;'>";
										if(obj.tabs[n].prefixStyle == "prefix-disc") {
											HTML += "<i></i>";
										} else if(obj.tabs[n].prefixStyle == "prefix-icon") {
											HTML += "<i class='glyphicon glyphicon-record'></i>";
										}
										HTML += "<span class='title-text'";
										if(obj.tabs[n].dateDisplay != "none") {
											HTML += "style='width:" + obj.tabs[n].dateDisplay + "'";
										}
										HTML += ">听音乐大脑在干什么 萌妹子的太古之心</span>";
										if(obj.tabs[n].dateDisplay != "none") {
											HTML += "<span class='title-date'>2017-6-26</span>"
										}
										HTML += "</a></li>";
									}
								} else if (obj.name === 'file-download') {
									for(var p = 0; p < obj.tabs[n].itemRow; p++) {
										HTML += "<li class='item'><a href='javascript:;'>"
										if (obj.tabs[n].prefixStyle == "has") {
											HTML += "<i></i>"
										}
										HTML += "<span class='title-text'";
										if(obj.tabs[n].dateDisplay != "none") {
											HTML += "style='width:" + obj.tabs[n].dateDisplay + "'";
										}
										HTML += ">听音乐大脑在干什么 萌妹子的太古之心</span>";
										if(obj.tabs[n].dateDisplay != "none") {
											HTML += "<span class='title-date'>2017-6-26</span>"
										}
										HTML += "</a></li>";
									}
								} else if(obj.name == "pictureText-surround") {
									HTML += "<li class='item'><div class='picture'><a href='javascript:;'><img src='images/background-index.png' class='jqthumb'></a></div><ol class='title-line'>";
									for(var q = 0; q < obj.tabs[n].itemRow; q++) {
										HTML += "<li><a href='javascript:;'>";
										if(obj.tabs[n].prefixStyle == "prefix-disc") {
											HTML += "<i></i>";
										} else if(obj.tabs[n].prefixStyle == "prefix-icon") {
											HTML += "<i class='glyphicon glyphicon-record'></i>";
										}
										HTML += "约23.6万奥迪Q4 PK宝马X2</a></li>";
									}
									HTML += "</ol></li>";
								} else if (obj.name == "music") {
									for(var p = 0; p < obj.tabs[n].itemRow; p++) {
										HTML += '<li class="item"><div class="music-name"><a href="javascript:;">歌曲名称</a></div><div class="music-player"><audio preload="auto" controls="controls"><source src="images/horse.ogg" type="audio/ogg"><source src="images/horse.mp3" type="audio/mpeg"></audio></div></li>';
									}
								} else {
									for(var p = 0; p < obj.tabs[n].itemRow; p++) {
										HTML += "<li class='item'>";
										if(obj.name == "text-titleCont") {
											HTML += "<h3><a href='#'><span class='title-text'";
											if(obj.tabs[n].dateDisplay != "none") {
												HTML += "style='width:" + obj.tabs[n].dateDisplay + "'";
											}
											HTML += ">马云遭实业家集体炮轰！阿里反击了马云遭实业家集体炮轰！阿里反击了马云遭实业家集体炮轰！阿里反击了</span>";
											if(obj.tabs[n].dateDisplay != "none") {
												HTML += "<span class='title-date'>2017-6-26</span>"
											}
											HTML += "</a></h3><p class='Row Row" + obj.tabs[n].contentRow + "'><a href='#'>互联网只是个工具，商业的本质从来没有变过，商业的残酷性也从来没有变过，商业不会因为资历老就尊重你，也不会因为年轻就忍让你！只有勇于改变敢于变革的人才能互联网只是个工具，商业的本质从来没有变过，商业的残酷性也从来没有变过商业不会因为资历老就尊重你，也不会因为年轻就忍让你！只有勇于改变敢于变革的人才能活</a></p>";
										} else if(obj.name == "pictureText-crosswise") {
											HTML += "<div class='media'><div class='picture pull-left'><div class='media-object'><a href='#'><img src='images/bigcar_03.jpg' class='jqthumb'></a>";
											if(obj.tabs[n].titleDisplay == "block") {
												HTML += "<div class='mod'><h3><a href='#'>路虎汽车</a></h3></div>";
											}
											HTML += "</div></div><div class='media-body'><p class='Row Row" + obj.tabs[n].contentRow + "'><a href='#'>北京市土地交易市场发布了石景山，平谷2宗自住型商品住房用地出让公告，涉及土地面积约13万公顷建筑规模约17万平方米</a></p></div></div>";
										} else if(obj.name == "pictureText-vertical") {
											HTML += "<div class='picture center-block'><a href='#'><img class='media-object' src='images/beijing.png' class='jqthumb'></a>";
											if(obj.tabs[n].titleDisplay == "block") {
												HTML += "<div class='mod'><h3><a href='#'>路虎汽车</a></h3></div>";
											}
											HTML += "</div><div class='media-body'><p class='Row Row" + obj.tabs[n].contentRow + "'><a href='javascript:;'>朝鲜抨击美国恶化半岛局势 美对朝动武声调 朝鲜抨击美国恶化半岛局势 美对朝动武声调</a></p></div>";
										}
										HTML += "</li>";
									}
								}
								HTML += "</ol>"
							}
						}
					}
					HTML += "</li>";
				}
			} else {
				HTML += "<li class='tab clearfix active";
				if(obj.name == "pic-pictures" || obj.name == "pic-slide" || obj.name == "pictureText-surround" || obj.name == "pictureText-crosswise" || obj.name == "pictureText-vertical") {
					HTML += " full no-action"
				} else if (obj.name == 'timer-axis') {
					HTML += ' time-horizontal'
				}
				HTML += "'"
				if(obj.name == "pic-slide") {
					HTML += " style='height:334px'><div class='item'><ul class='pictureSlide'><li class='picture' data-number='1' style='height:334px;'><a href='javascript:;'><img src='images/air_03.jpg' alt='南海西沙风景如此美丽' class='jqthumb'></a><div class='mod'><h3><a href='javascript:;' title='南海西沙风景如此美丽'>南海西沙风景如此美丽</a></h3></div></li></ul><ul class='arrows'><li class='left-arrow'> &lt; </li><li class='right-arrow'> &gt; </li></ul><ul class='rolling-style iconLists'><li data-number='1'></li></ul></div></li>";
				} else if (obj.name == 'timer-axis') {
					HTML += "><ol class='lists cont2' data-timeStyle='" + $('.modelBox .timer-axis .lists').attr('data-timeStyle') + "'><li class='item'><div class='time-point clearfix'><div class='time-left clearfix'><div class='date'>" + setTimeStyle($('.modelBox .timer-axis .lists').attr('data-timeStyle')) + "</div><p class='time-line'><span class='circle'><img src='images/Group20.png' alt=''></span><span class='vertical-line'></span></p></div><div class='time-right'><h3>商业摄影</h3><p><span>商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影</span><b>...</b></p></div></div></li><li class='item'><div class='time-point clearfix'><div class='time-left clearfix'><div class='date'>" + setTimeStyle($('.modelBox .timer-axis .lists').attr('data-timeStyle')) + "</div><p class='time-line'><span class='circle'><img src='images/Group20.png' alt=''></span><span class='vertical-line'></span></p></div><div class='time-right'><h3>商业摄影</h3><p><span>商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影</span><b>...</b></p></div></div></li><li class='item'><div class='time-point clearfix'><div class='time-left clearfix'><div class='date'>" + setTimeStyle($('.modelBox .timer-axis .lists').attr('data-timeStyle')) + "</div><p class='time-line'><span class='circle'><img src='images/Group20.png' alt=''></span><span class='vertical-line'></span></p></div><div class='time-right'><h3>商业摄影</h3><p><span>商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影</span><b>...</b></p></div></div></li><li class='item'><div class='time-point clearfix'><div class='time-left clearfix'><div class='date'>" + setTimeStyle($('.modelBox .timer-axis .lists').attr('data-timeStyle')) + "</div><p class='time-line'><span class='circle'><img src='images/Group20.png' alt=''></span><span class='vertical-line'></span></p></div><div class='time-right'><h3>商业摄影</h3><p><span>商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影</span><b>...</b></p></div></div></li></ol></li>"
				} else {
					HTML += "></li>";
				}
			}
			if (obj.name == "video-playing") {
				playerNum++
			}
		}
	}
}

/*添加操作按钮*/
function appendContentHandle(that, thatBox) {
	$("body").find(".content-bar>ul>li.active").removeClass("active");
	$("body").find(".content-bar>.active").removeClass("active");
	$("body").find(".item.active").removeClass("active");
	thatBox.addClass("active");
	if(!$("body").find(".content-handle").parent().hasClass("active")) {
		$("body").find(".content-handle").parent().children(".content-handle").remove();
	}
	var model = that.parents(".model")
	if(!thatBox.find(".content-handle").length) {
		contentHTML += "<div class='content-handle'>";
		if(!model.find(".tab-nav").length && !model.hasClass("video-playing")) {
			contentHTML += "<span class='content-config handleLabel config-btn'></span><div class='config-box content-config-box'><em>&#9670;</em><span>&#9670;</span><div class='box-top'><span>样式配置</span></div>";
		}
		if(model.hasClass("text-title") || model.hasClass("file-download") || model.hasClass("music")) {
			contentHTML += "<form class='item-row'><span>行数:</span><label><input type='text' value='8'/><span>1-" + /* 20 */ "50行(默认8行)</span></label></form><form class='item-col'><span>列数:</span><label><input type='text' value='1'/><span>1-" + /*4*/ "12列(默认1列)</span></label>"
			if (model.hasClass("text-title") || model.hasClass("file-download")) {
				contentHTML += "</form><form class='alignment'><span>对齐方式:</span><label class='checked'><small></small><input type='radio' name='alignment' value='text-left'/><i class='glyphicon glyphicon-align-left'></i></label><label><small></small><input type='radio' name='alignment' value='text-center'/><i class='glyphicon glyphicon-align-center'></i></label><label><small></small><input type='radio' name='alignment' value='text-right'/><i class='glyphicon glyphicon-align-right'></i></label></form>"
				contentHTML += "<form class='prefix-style'><span>前缀样式:</span><label class='checked'><small></small><input type='radio' name='prefix-style' value='prefix-none'/>无前缀</label>"
				if (model.hasClass("text-title")) {
					contentHTML += "<label><small></small><input type='radio' name='prefix-style' value='prefix-disc'/>标题点</label><label><small></small><input type='radio' name='prefix-style' value='prefix-number'/>序号</label><label><small></small><input type='radio' name='prefix-style' value='prefix-icon'/>图标</label>"
				} else {
					contentHTML += "<label><small></small><input type='radio' name='prefix-style' value='has'/>默认前缀</label>"
				}
			}
			contentHTML += "</form>"
			if (model.hasClass("text-title") || model.hasClass("file-download")) {
				contentHTML += "<form class='date-display'><span>是否显示日期:</span><label><small></small><input type='radio' name='date-display' value='block'/>显示</label><label class='checked'><small></small><input type='radio' name='date-display' value='none'/>不显示</label></form>";
			}
			contentHTML += "</div>"
		} else if(model.hasClass("text-titleCont")) {
			contentHTML += "<form class='item-row'><span>行数:</span><label><input type='text' value='2'/><span>1-" + /*5*/ "50行(默认2行)</span></label></form><form class='item-col'><span>列数:</span><label><input type='text' value='1'/><span>1-" + /*3*/ "12列(默认1列)</span></label></form><form class='content-row'><span>内容行数:</span><label><input type='text' value='3'/><span>1-" + /*3*/ "50行(默认3行)</span></label></form><form class='date-display'><span>是否显示日期:</span><label><small></small><input type='radio' name='date-display' value='block'/>显示</label><label class='checked'><small></small><input type='radio' name='date-display' value='none'/>不显示</label></form></div>";
		} else if(model.hasClass("pictureText-surround")) {
			contentHTML += "<form class='item-row'><span>行数:</span><label><input type='text' value='4'/><span>1-" + /*10*/ "50行(默认4行)</span></label></form><form class='item-col'><span>列数:</span><label><input type='text' value='1'/><span>1-" + /*4*/ "12列(默认1列)</span></label></form><form class='prefix-style'><span>前缀样式:</span><label class='checked'><small></small><input type='radio' name='prefix-style' value='prefix-none'/>无前缀</label><label><small></small><input type='radio' name='prefix-style' value='prefix-disc'/>标题点</label><label><small></small><input type='radio' name='prefix-style' value='prefix-number'/>序号</label><label><small></small><input type='radio' name='prefix-style' value='prefix-icon'/>图标</label></form><form class='fill-style'><span>填充样式:</span><label class='checked'><small></small><input type='radio' name='fill-style' value='full'/>充满</label><label><small></small><input type='radio' name='fill-style' value='adaptive'/>自适应</label></form><form class='mouse-move'><span>鼠标移入行为:</span><label class='checked'><small></small><input type='radio' name='mouse-move' value='no-action'/>无行为</label><label><small></small><input type='radio' name='mouse-move' value='scale'/>缩放</label></form><form class='link-way'><span>链接跳转方式:</span><label class='checked'><small></small><input type='radio' name='link-way' value='current-page'/>当前页</label><label><small></small><input type='radio' name='link-way' value='new-page'/>新页面</label></form></div>";
		} else if(model.hasClass("pictureText-crosswise")) {
			contentHTML += "<form class='item-row'><span>行数:</span><label><input type='text' value='1'/><span>1-" + /*3*/ "50行(默认1行)</span></label></form><form class='item-col'><span>列数:</span><label><input type='text' value='1'/><span>1-" + /*6*/ "12列(默认1列)</span></label></form><form class='content-row'><span>内容行数:</span><label><input type='text' value='3'/><span>1-" + /*6*/ "50行(默认3行)</span></label></form><form class='title-display'><span>是否显示标题:</span><label class='checked'><small></small><input type='radio' name='title-display' value='block'/>显示</label><label><small></small><input type='radio' name='title-display' value='none'/>不显示</label></form><form class='fill-style'><span>填充样式:</span><label class='checked'><small></small><input type='radio' name='fill-style' value='full'/>充满</label><label><small></small><input type='radio' name='fill-style' value='adaptive'/>自适应</label></form><form class='mouse-move'><span>鼠标移入行为:</span><label class='checked'><small></small><input type='radio' name='mouse-move' value='no-action'/>无行为</label><label><small></small><input type='radio' name='mouse-move' value='scale'/>缩放</label></form><form class='link-way'><span>链接跳转方式:</span><label class='checked'><small></small><input type='radio' name='link-way' value='current-page'/>当前页</label><label><small></small><input type='radio' name='link-way' value='new-page'/>新页面</label></form></div>";
		} else if(model.hasClass("pictureText-vertical")) {
			contentHTML += "<form class='item-row'><span>行数:</span><label><input type='text' value='1'/><span>1-" + /*3*/ "50行(默认1行)</span></label></form><form class='item-col'><span>列数:</span><label><input type='text' value='1'/><span>1-" + /*4*/ "12列(默认1列)</span></label></form><form class='content-row'><span>内容行数:</span><label><input type='text' value='3'/><span>1-" + /*3*/ "50行(默认3行)</span></label></form><form class='title-display'><span>是否显示标题:</span><label class='checked'><small></small><input type='radio' name='title-display' value='block'/>显示</label><label><small></small><input type='radio' name='title-display' value='none'/>不显示</label></form><form class='fill-style'><span>填充样式:</span><label class='checked'><small></small><input type='radio' name='fill-style' value='full'/>充满</label><label><small></small><input type='radio' name='fill-style' value='adaptive'/>自适应</label></form><form class='mouse-move'><span>鼠标移入行为:</span><label class='checked'><small></small><input type='radio' name='mouse-move' value='no-action'/>无行为</label><label><small></small><input type='radio' name='mouse-move' value='scale'/>缩放</label></form><form class='link-way'><span>链接跳转方式:</span><label class='checked'><small></small><input type='radio' name='link-way' value='current-page'/>当前页</label><label><small></small><input type='radio' name='link-way' value='new-page'/>新页面</label></form></div>";
		} else if(model.hasClass("pic-slide")) {
			contentHTML += "<form class='item-col'><span>图片个数:</span><label><input type='text' value='1'/><span>1-" + /*10*/ "12列(默认1列)</span></label></form><form class='pic-height'><span>图片高度:</span><label><input type='text' value='349'/><span>px</span></label></form><form class='icon-style'><span>滚动效果:</span><label class='checked'><small></small><input type='radio' name='icon-style' value='iconLists'/>圆点</label><label><small></small><input type='radio' name='icon-style' value='lineLists'/>横杠</label><label><small></small><input type='radio' name='icon-style' value='thumbnailLists'/>缩略图</label></form><form class='title-display'><span>是否显示标题:</span><label class='checked'><small></small><input type='radio' name='title-display' value='block'/>显示</label><label><small></small><input type='radio' name='title-display' value='none'/>不显示</label></form><form class='fill-style'><span>填充样式:</span><label class='checked'><small></small><input type='radio' name='fill-style' value='full'/>充满</label><label><small></small><input type='radio' name='fill-style' value='adaptive'/>自适应</label></form><form class='mouse-move'><span>鼠标移入行为:</span><label class='checked'><small></small><input type='radio' name='mouse-move' value='no-action'/>无行为</label><label><small></small><input type='radio' name='mouse-move' value='scale'/>缩放</label></form><form class='mouse-click'><span>鼠标点击行为:</span><label class='checked'><small></small><input type='radio' name='mouse-click' value='to-details'/>至详情页</label><label><small></small><input type='radio' name='mouse-click' value='no-action'/>无行为</label><label><small></small><input type='radio' name='mouse-click' value='to-link'/>至网址链接</label></form><form class='link-way'><span>链接跳转方式:</span><label class='checked'><small></small><input type='radio' name='link-way' value='current-page'/>当前页</label><label><small></small><input type='radio' name='link-way' value='new-page'/>新页面</label></form></div>";
		} else if(model.hasClass("pic-pictures")) {
			contentHTML += "<form class='item-row'><span>行数:</span><label><input type='text' value='1'/><span>1-" + /*4*/ "50行(默认1行)</span></label></form><form class='item-col'><span>列数:</span><label><input type='text' value='1'/><span>1-" + /*8*/ "12列(默认1列)</span></label></form><form class='pic-height'><span>图片高度:</span><label><input type='text' value='230'/><span>px</span></label></form><form class='title-display'><span>是否显示标题:</span><label class='checked'><small></small><input type='radio' name='title-display' value='block'/>显示</label><label><small></small><input type='radio' name='title-display' value='none'/>不显示</label></form><form class='fill-style'><span>填充样式:</span><label class='checked'><small></small><input type='radio' name='fill-style' value='full'/>充满</label><label><small></small><input type='radio' name='fill-style' value='adaptive'/>自适应</label></form><form class='mouse-move'><span>鼠标移入行为:</span><label class='checked'><small></small><input type='radio' name='mouse-move' value='no-action'/>无行为</label><label><small></small><input type='radio' name='mouse-move' value='scale'/>缩放</label></form><form class='mouse-click'><span>鼠标点击行为:</span><label class='checked'><small></small><input type='radio' name='mouse-click' value='to-details'/>至详情页</label><label><small></small><input type='radio' name='mouse-click' value='no-action'/>无行为</label><label><small></small><input type='radio' name='mouse-click' value='to-link'/>至网址链接</label></form><form class='link-way'><span>链接跳转方式:</span><label class='checked'><small></small><input type='radio' name='link-way' value='current-page'/>当前页</label><label><small></small><input type='radio' name='link-way' value='new-page'/>新页面</label></form></div>";
		} else if (model.hasClass('timer-axis')) {
			contentHTML += "<form class='item-row'><span>时间点数:</span><label><input type='text' value='4'/><span>1-" + /*5*/ "50行(默认4行)</span></label></form><form class='title-display'><span>是否显示标题:</span><label class='checked'><small></small><input type='radio' name='title-display' value='block'/>显示</label><label><small></small><input type='radio' name='title-display' value='none'/>不显示</label></form><form class='content-display'><span>是否显示内容:</span><label class='checked'><small></small><input type='radio' name='content-display' value='block'/>显示</label><label><small></small><input type='radio' name='content-display' value='none'/>不显示</label></form><form class='content-row'><span>内容行数:</span><label><input type='text' value='2'/><span>1-" + /*3*/ "50行(默认2行)</span></label></form><form class='time-direction'><span>时间轴方向:</span><label class='checked'><small></small><input type='radio' name='time-direction' value='horizontal'/>横向</label><label><small></small><input type='radio' name='time-direction' value='vertical'/>纵向</label></form><form class='time-style'><span>日期格式:</span><label><small></small><input type='radio' name='time-style' value='<span class=\"month-day\">%Y</span>'/><p>2018</p></label><label><small></small><input type='radio' name='time-style' value='<span class=\"month-day\">%M-%d</span>'/><p>03-07</p></label><label><small></small><input type='radio' name='time-style' value='<span class=\"month-day\">%H:%m</span>'/><p>10:07</p></label><label><small></small><input type='radio' name='time-style' value='<span class=\"month-day\">%Y-%M-%d</span>'/><p>2018-03-07</p></label><label><small></small><input type='radio' name='time-style' value='<span class=\"month-day\">%Y</span><span class=\"year\">%M-%d</span>'/><p>2018</br>03-07</p></label><label class='checked'><small></small><input type='radio' name='time-style' value='<span class=\"month-day\">%M-%d</span><span class=\"year\">%Y</span>'/><p>03-07</br>2018</p></label><label><small></small><input type='radio' name='time-style' value='<span class=\"month-day\">%Y-%M-%d</span><span class=\"year\">%H:%m</span>'/><p>2018-03-07</br>10:07</p></label><label><small></small><input type='radio' name='time-style' value='<span class=\"month-day\">%Y-%M-%d</span><span class=\"year\">%H:%m:%s</span>'/><p>2018-03-07</br>10:07:07</p></label><label><small></small><input type='radio' name='time-style' value='<span class=\"month-day\">%H:%m</span><span class=\"year\">%Y-%M-%d</span>'/><p>10:07</br>2018-03-07</p></label><label><small></small><input type='radio' name='time-style' value='<span class=\"month-day\">%H:%m:%s</span><span class=\"year\">%Y-%M-%d</span>'/><p>10:07:07</br>2018-03-07</p></label></form></div>";
		} else if (model.hasClass('newNav')) {
			contentHTML += '<form class="font-color"><span>文字颜色:</span><label class="checked"><small></small><input type="radio" name="font-color" value="default">默认</label><label for=""><small></small><input type="radio" name="font-color" value="custom"><input type="text" class="picker" readonly placeholder="点击选择"/><p class="showbox"></p></label></form><form class="icon-image"><span>图标设置:</span><label class="checked"><small></small><input type="radio" name="icon-image" value="no">无</label><label for=""><small></small><input type="radio" name="icon-image" value="has"><div></div><em>选择</em></label></form><form class="icon-position disabled"><span>图标位置:</span><label for="" class="checked"><small></small><input type="radio" name="icon-position" value="icon-left"/>文字左侧</label><label for=""><small></small><input type="radio" name="icon-position" value="icon-right"/>文字右侧</label><label for=""><small></small><input type="radio" name="icon-position" value="icon-top"/>文字上方</label><label for=""><small></small><input type="radio" name="icon-position" value="icon-bottom"/>文字下方</label></form><form class="border-display"><span>边框设置:</span><label><small></small><input type="radio" name="border-display" value="has">是</label><label class="checked"><small></small><input type="radio" name="border-display" value="no">否</label></form><form class="border-color disabled"><span>边框颜色:</span><label class="checked"><small></small><input type="radio" name="border-color" value="no">无</label><label for=""><small></small><input type="radio" name="border-color" value="has"><input type="text" class="picker" readonly placeholder="点击选择"/><p class="showbox"></p></label></form><form class="border-width disabled"><span>边框宽度:</span><label><input type="text" name="border-width" value="1">px</label></form><form class="border-style disabled"><span>边框样式:</span><label class="checked"><small></small><input type="radio" name="border-style" value="solid"><i class="border-solid"></i></label><label><small></small><input type="radio" name="border-style" value="dashed"><i class="border-dashed"></i></label><label><small></small><input type="radio" name="border-style" value="dotted"><i class="border-dotted"></i></label></form><form class="background-color"><span>背景颜色:</span><label class="checked"><small></small><input type="radio" name="background-color" value="no">无</label><label for=""><small></small><input type="radio" name="background-color" value="has"><input type="text" class="picker" readonly placeholder="点击选择"/><p class="showbox"></p></label></form><form class="background-image"><span>背景图片:</span><label class="checked"><small></small><input type="radio" name="background-image" value="no">无</label><label for=""><small></small><input type="radio" name="background-image" value="has"><div></div><em>选择</em></label></form><form class="background-repeat disabled"><span>背景平铺:</span><label for="" class="checked"><small></small><input type="radio" name="background-repeat" value="no-repeat"/>不平铺</label><label for=""><small></small><input type="radio" name="background-repeat" value="repeat"/>平铺</label></form><form class="background-size disabled"><span>背景填充:</span><label for="" class="checked"><small></small><input type="radio" name="background-size" value="cover"/>全充满</label><label for=""><small></small><input type="radio" name="background-size" value="contain"/>自适应</label></form><form class="background-position disabled"><span>背景位置:</span><label for="" class="checked"><small></small><input type="radio" name="background-position" value="left top"/>居左</label><label for=""><small></small><input type="radio" name="background-position" value="center top"/>居中</label><label for=""><small></small><input type="radio" name="background-position" value="right top"/>居右</label></form></div>'
		}
		contentHTML += "<span class='cms-config handleLabel config-btn'></span><div class='config-box cms-config-box'><em>&#9670;</em><span>&#9670;</span><div class='box-top'><span>CMS资源</span><span id='flashalert' style='padding-left: 30px;color:firebrick'></span></div>";
		if(!model.find(".tab-nav").length && !model.hasClass('newNav')) {
			contentHTML += "<form class='sort'><span>排序:</span><label class='checked'><small></small><input type='radio' name='sort' value='time'/>时间</label><label><small></small><input type='radio' name='sort' value='recommend'/>推荐</label><label><small></small><input type='radio' name='sort' value='hits'/>点击量</label></form>";
		}
		contentHTML += "<ul class='navbar-cms clearfix'>";
		if(!model.hasClass("nav-footer")) {
			contentHTML += "<li class='classify active'><span>分类</span></li><li class='tabs'><span>标签</span></li>";
		}
		if(model.find(".tab-nav").length || model.hasClass('newNav')) {
			contentHTML += "<li";
			if(model.hasClass("nav-footer")) {
				contentHTML += " class='web-page active'";
			}
			contentHTML += "><span>网站页面</span></li><li class='custom-link'><span>链接</span></li>";
			if(model.hasClass("nav-footer")) {
				contentHTML += "<li class='custom-text'><span>文本</span></li>"
			} else if(model.hasClass("nav-classic") || model.hasClass("nav-button") || model.hasClass('newNav')) {
				contentHTML += "<li class='custom-menu'><span>菜单</span></li>";
			}
		}
		if (model.hasClass('newNav')) {
			contentHTML += '<li class="functions"><span>功能</span></li>'
		}
		contentHTML += "</ul><div class='resources-content'>";
		if(!model.hasClass("nav-footer")) {
			//集成可编辑的分类功能界面
			contentHTML += "<div class=\"tag-right class-box\" style='overflow:auto;max-height: 200px;width:100%;" +
				"'>" +
				"<div class=\"content_wrap\" style='width:100%;height:100%'>" +
				"<div class=\"zTreeDemoBackground\">" +
				"<ul id=\"treeDemo\" class=\"ztree\"></ul>" +
				"</div></div></div>";
			//集成标签控制界面
			contentHTML += "<div class=\"tag-left tab-box\">" +
				"<div class=\"sel-tag clearfix\">" +
				"<ul id=\"del-tag\">" +
				"</ul>" +
				"</div>" +
				"<div class=\"frequent clearfix\">" +
				"<div class=\"l\">" +
				"<div id=\"use\" style=\"cursor: pointer;\">常用</div>&nbsp;&nbsp;" +
				"<div class=\"spell\" id=\"spell\">" +
				"<span>A</span>" +
				"<span>B</span>" +
				"<span>C</span>" +
				"<span>D</span>" +
				"<span>E</span>" +
				"<span>F</span>" +
				"<span>G</span>" +
				"<span>H</span>" +
				"<span>I</span>" +
				"<span>J</span>" +
				"<span>K</span>" +
				"<span>L</span>" +
				"<span>M</span>" +
				"<span>N</span>" +
				"<span>O</span>" +
				"<span>P</span>" +
				"<span>Q</span>" +
				"<span>R</span>" +
				"<span>S</span>" +
				"<span>T</span>" +
				"<span>U</span>" +
				"<span>V</span>" +
				"<span>W</span>" +
				"<span>X</span>" +
				"<span>Y</span>" +
				"<span>Z</span>" +
				"</div>" +
				"</div>" +
				"<div class=\"r\">" +
				"<div class=\"searchbox searchbox1\">" +
				"<input type=\"text\" name=\"\" placeholder=\"输入标签\" id=\"sureValue\" />" +
				"<span id=\"isure\">确定</span>" +
				"</div>" +
				"</div>" +
				"<div class=\"r\">" +
				"<div class=\"searchbox\">" +
				"<input type=\"text\" name=\"\" id=\"searInput\" value=\"\" placeholder=\"搜索关键字\" />" +
				"<s id=\"search\"></s>" +
				"</div>" +
				"</div>" +
				"</div>" +
				"<div class=\"importantwords clearfix\">" +
				"<div class=\"ztree-list\" id=\"tag-name\">" +
				"<ul class=\"clearfix ztree\" id=\"tree2\"></ul>" +
				"</div>" +
				"<div id=\"parent\">" +
				"<div id=\"page\"></div>" +
				"</div>" +
				"</div>" +
				"</div>";
			containTag = [];
			getAllTag();
		}
		if(model.find(".tab-nav").length || model.hasClass('newNav')) {
			contentHTML += "<div class='website-page-box'><ul class='website-page-content clearfix'>";
			var xx = 0;
			addPageMenuHtml(xx);

			function addPageMenuHtml(xx) {
				xx++;
				$.ajax({
					url: baseurl + '/api/webpage?where={"语言":"' + $('.language-menu .active-bg').text() + '"}&max_results=30&page=' + xx + '&sort=-id',
					type: "GET",
					contentType: "application/json;charset=UTF-8",
					headers: {
						"Authorization": "Basic " + auth
					},
					async: false,
					dataType: "json",
					success: function(msg) {
						for(var i = 0; i < msg._items.length; i++) {
							if(msg._items[i]["显示名称"].indexOf("-") != 0) {
								if(msg._items[i]["文件名称"]) {
									contentHTML += "<li data-link='" + msg._items[i]["文件名称"] + "'>";
								} else {
									contentHTML += "<li data-link='javascript:;'>";
								}
								contentHTML += msg._items[i]["显示名称"] + "<i></i></li>";
							}
						}
						if(msg._items.length == 30) {
							addPageMenuHtml(xx);
						}
					},
					error: function(err) {
						console.log(err)
					}
				});
			}

			contentHTML += "</ul></div><div class='custom-link-box'><input type='text' placeholder='请输入自定义名称' class='custom-navName'><input type='text' placeholder='请输入自定义链接' class='custom-navLink'></div>";
			if(model.hasClass("nav-footer")) {
				contentHTML += "<div class='config-footer-box'><ul class='config-footer-content clearfix'>";
				// contentHTML += "<form class='custom-tabName pull-left'><label>自定义名称 <input type='text' placeholder='请输入自定义名称'/></label></form>";
				contentHTML += "</ul></div>";
			} else if(model.hasClass("nav-classic") || model.hasClass("nav-button") || model.hasClass('newNav')) {
				contentHTML += "<div class='custom-menu-box'><input type='text' placeholder='请输入自定义菜单名称' class='custom-menu-title'/><div class='custom-menu-item'><input type='text' placeholder='请输入自定义菜单项名称' class='custom-menu-itemName'/><input type='text' placeholder='请输入自定义菜单项链接' class='custom-menu-itemLink'/><i></i></div></div>"
			}
		}
		if (model.hasClass('newNav')) {
			contentHTML += "<div class='function-box'><ul class='function-content'><li id='empty'>空白按钮</li><li id='parting-line'>分隔线</li></ul></div>"
		}
		contentHTML += "</div>";
		if (!that.parents(".model").hasClass("timer-axis")) {
		contentHTML += "<form class='custom-tabName pull-left'><label>自定义名称 <input type='text' placeholder='请输入自定义名称'/></label></form>";
		}
		contentHTML += "<div class='cms-config-handel pull-right'><a href='javascript:;' class='cancel pull-right'>取消</a><a href='javascript:;' class='confirm pull-right'>确定</a></div></div><span class='delete-content handleLabel'></span></div>";
		thatBox.prepend(contentHTML);
		contentHTML = "";
	}
	if(model.find(".tab-nav").length) {
		that.parents(".model").find(".item-row input").val(that.parents(".model").find("li.tab ol.lists").length);
		that.parents(".model").find(".alignment input[value=" + that.parents(".model").find(".tab.active").attr("class").split(" ")[4] + "]").parent().addClass("checked").siblings(".checked").removeClass("checked");
	} else {
		if(model.hasClass("pic-slide")) {
			model.find(".item-col input").val(model.find(".picture").length);
			model.find(".pic-height input").val(model.find(".picture").height());
			model.find(".icon-style input[value=" + model.find(".rolling-style").attr("class").slice(13) + "]").parent().addClass("checked").siblings(".checked").removeClass("checked");
			if(model.find("li.tab.active .mod").length) {
				model.find(".title-display input[value=block]").parent().addClass("checked").siblings(".checked").removeClass("checked");
			} else {
				model.find(".title-display input[value=none]").parent().addClass("checked").siblings(".checked").removeClass("checked");
			}
			if(model.find(".tab.active").hasClass("full")) {
				model.find(".fill-style input[value=full]").parent().addClass("checked").siblings(".checked").removeClass("checked");
			} else if(model.find(".tab.active").hasClass("adaptive")) {
				model.find(".fill-style input[value=adaptive]").parent().addClass("checked").siblings(".checked").removeClass("checked");
			}
			if (model.find(".tab.active").hasClass("no-action")) {
				model.find('.mouse-move input[value="no-action"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
			} else if (model.find(".tab.active").hasClass("scale")) {
				model.find('.mouse-move input[value="scale"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
			}
			if (model.find(".tab.active").hasClass("no-click-action")) {
				model.find('.mouse-click input[value="no-action"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
			} else if (model.find(".tab.active").hasClass("to-details")) {
				model.find('.mouse-click input[value="to-details"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
			} else if (model.find(".tab.active").hasClass("to-link")) {
				model.find('.mouse-click input[value="to-link"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
			}
			if (model.find(".tab.active").hasClass("current-page")) {
				model.find('.link-way input[value="current-page"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
			} else if (model.find(".tab.active").hasClass("new-page")) {
				model.find('.link-way input[value="new-page"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
			}
		} else {
			if(model.find(".tab.active li").length) {
				if(model.hasClass("pic-pictures")) {
					model.find(".item-row input").val(model.find(".tab.active ol.lists").length);
					model.find(".item-col input").val(model.find(".tab.active ol.lists").eq(0).find("li.item").length);
					model.find(".pic-height input").val(model.find(".tab.active .picture").height());
					if(model.find("li.tab.active .mod").length) {
						model.find(".title-display input[value=block]").parent().addClass("checked").siblings(".checked").removeClass("checked");
					} else {
						model.find(".title-display input[value=none]").parent().addClass("checked").siblings(".checked").removeClass("checked");
					}
					if(model.find(".tab.active").hasClass("full")) {
						model.find(".fill-style input[value=full]").parent().addClass("checked").siblings(".checked").removeClass("checked");
					} else if(model.find(".tab.active").hasClass("adaptive")) {
						model.find(".fill-style input[value=adaptive]").parent().addClass("checked").siblings(".checked").removeClass("checked");
					}
					if (model.find(".tab.active").hasClass("no-action")) {
						model.find('.mouse-move input[value="no-action"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
					} else if (model.find(".tab.active").hasClass("scale")) {
						model.find('.mouse-move input[value="scale"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
					}
					if (model.find(".tab.active").hasClass("no-click-action")) {
						model.find('.mouse-click input[value="no-action"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
					} else if (model.find(".tab.active").hasClass("to-details")) {
						model.find('.mouse-click input[value="to-details"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
					} else if (model.find(".tab.active").hasClass("to-link")) {
						model.find('.mouse-click input[value="to-link"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
					}
					if (model.find(".tab.active").hasClass("current-page")) {
						model.find('.link-way input[value="current-page"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
					} else if (model.find(".tab.active").hasClass("new-page")) {
						model.find('.link-way input[value="new-page"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
					}
				} else if (model.hasClass("timer-axis")) {
					model.find(".item-row input").val(model.find("li.tab.active ol.lists").eq(0).children("li").length)
					if (model.find('.time-right>h3').length) {
						model.find('.title-display input[value="block"]').parent().addClass("checked").siblings(".checked").removeClass("checked");
					} else {
						model.find('.title-display input[value="none"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
						model.find('.content-display').addClass('disabled')
					}
					if (model.find('.time-right>p').length) {
						model.find('.content-display input[value="block"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
						var str = new RegExp("cont")
						var listClass = model.find('.lists').attr('class').split(' ')
						var num
						for (var i = 0 ; i < listClass.length; i++) {
							if (str.test(listClass[i])) {
								num = listClass[i].slice(4)
							}
						}
						model.find('.content-row').removeClass('disabled').find('input').val(num)
					} else {
						model.find('.content-display input[value="none"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
						model.find('.content-row').addClass('disabled').siblings('.title-display').addClass('disabled')
					}
					var directionStr = new RegExp('time-')
					var directionClass = model.find('.tab.active').attr('class').split(' ')
					var direction
					for (var j = 0; j < directionClass.length; j++) {
						if (directionStr.test(directionClass[j])) {
							direction = directionClass[j].slice(5)
						}
					}
					model.find('.time-direction input[value="' + direction + '"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
					model.find(".time-style input[value='" + model.find('.lists').attr('data-timeStyle') + "']").parent().addClass("checked").siblings(".checked").removeClass("checked")
				} else {
					var arr = model.find(".tab.active ol.lists").attr("class").split(" ");
					for(var i = 0; i < arr.length; i++) {
						var pre = new RegExp("prefix-"),
							ali = new RegExp("text-");
						if(pre.test(arr[i])) {
							model.find(".prefix-style input[value=" + arr[i] + "]").parent().addClass("checked").siblings(".checked").removeClass("checked");
						}
						if(ali.test(arr[i])) {
							model.find(".alignment input[value=" + arr[i] + "]").parent().addClass("checked").siblings(".checked").removeClass("checked");
						}
					}
					if(model.find("li.tab.active .mod").length) {
						model.find(".title-display input[value=block]").parent().addClass("checked").siblings(".checked").removeClass("checked");
					} else {
						model.find(".title-display input[value=none]").parent().addClass("checked").siblings(".checked").removeClass("checked");
					}
					if(model.hasClass("text-title") || model.hasClass("file-download")) {
						if(model.find("li.tab.active .item .title-date").length) {
							model.find(".date-display input").eq(0).parent().addClass("checked").siblings(".checked").removeClass("checked");
						} else {
							model.find(".date-display input[value=none]").parent().addClass("checked").siblings(".checked").removeClass("checked");
						}
					} else if(model.hasClass("text-titleCont")) {
						if(model.find("li.tab.active .item h3 .title-date").length) {
							model.find(".date-display input").eq(0).parent().addClass("checked").siblings(".checked").removeClass("checked");
						} else {
							model.find(".date-display input[value=none]").parent().addClass("checked").siblings(".checked").removeClass("checked");
						}
					}
					model.find(".item-col input").val(model.find("li.tab.active ol.lists").length);
					model.find(".item-row input").val(model.find("li.tab.active ol.lists").eq(0).children("li").length);
					if(model.hasClass("pictureText-surround")) {
						model.find(".item-row input").val(model.find("li.tab.active ol.lists").eq(0).find("li.item li").length);
					}
					if(model.find(".tab-nav").length) {
						model.find(".item-row input").val(model.find("li.tab.active ol.lists").length);
					}
					if(model.find(".content-row").length) {
						model.find(".content-row input").val(model.find("li.tab.active p.Row").attr("class").slice(7));
					}
					if (model.hasClass("pictureText-surround") || model.hasClass("pictureText-crosswise") || model.hasClass("pictureText-vertical")) {
						if (model.find(".tab.active").hasClass("no-action")) {
							model.find('.mouse-move input[value="no-action"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
						} else if (model.find(".tab.active").hasClass("scale")) {
							model.find('.mouse-move input[value="scale"]').parent().addClass("checked").siblings(".checked").removeClass("checked")
						}
					}
				}
			}
		}
	}
	if(model.hasClass("pic-slide") || model.hasClass("timer-axis")) {
		thatBox.removeClass("active");
	}
	findTabBox(that);
	// that.parents(".model").find(".custom-tabName input").val(that.children("span").length?that.children("span").text():that.children("a").text());
}

/*标签栏中寻找已配置的cms信息*/
function findTabBox(that) {
	var dataSourceType = that.parents(".model").find("li.tab.active").attr("data-sourceType") ?
		that.parents(".model").find("li.tab.active").attr("data-sourceType") :
		that.attr("data-sourceType");
	if(!dataSourceType) dataSourceType = '分类';
	var dataSourceName = that.parents(".model").find("li.tab.active").attr("data-sourceName") ?
		that.parents(".model").find("li.tab.active").attr("data-sourceName") :
		that.attr("data-sourceName");
	var dataTabName = that.parents(".model").find("li.tab.active").attr("data-tabName") ?
		that.parents(".model").find("li.tab.active").attr("data-tabName") :
		that.attr("data-tabName");
	// console.log("set DataTabName:", dataTabName, $(".custom-tabName input").val());
	if(dataSourceType == "链接") {
		var index = that.parents(".model").hasClass("nav-footer") ? 1 : 3;
		that.parents(".model").find(".navbar-cms li").eq(index).addClass("active").siblings(".active").removeClass("active");
		that.parents(".model").find(".resources-content>div").css("display", "none");
		that.parents(".model").find(".resources-content>div").eq(index).css("display", "block");
		that.parents(".model").find(".custom-navName").val(that.children("a").text());
		that.parents(".model").find(".custom-navLink").val(that.children("a").attr("href"));
		that.parents(".model").find("form.custom-tabName").css("display", "none");
	} else if(dataSourceType == "文本") {
		that.parents(".model").find(".navbar-cms li").eq(2).addClass("active").siblings(".active").removeClass("active");
		that.parents(".model").find(".resources-content>div").css("display", "none");
		that.parents(".model").find(".resources-content>div").eq(2).css("display", "block");
		that.parents(".model").find("form.custom-tabName").css("display", "block");
		that.parents(".model").find(".resources-content").children().eq(2).children("ul").addClass("active");
		for(var k = 0; k < that.parents(".model").find(".resources-content ul.active li").length; k++) {
			if(that.parents(".model").find(".resources-content ul.active li").eq(k).text() == dataSourceName) {
				that.parents(".model").find(".resources-content ul.active li").eq(k).addClass("active");
			}
		}
		$(".custom-tabName input").val(dataTabName);
	} else if(dataSourceType == "菜单") {
		that.parents(".model").find(".navbar-cms li").eq(4).addClass("active").siblings(".active").removeClass("active");
		that.parents(".model").find(".resources-content>div").css("display", "none");
		that.parents(".model").find(".resources-content>div").eq(4).css("display", "block");
		that.parents(".model").find("form.custom-tabName").css("display", "none");
		that.find(".custom-menu-title").val(that.children("a").text());
		var html = "";
		for(var i = 0; i < that.find(".nav-show>li").length; i++) {
			html += "<input type='text' placeholder='请输入自定义菜单项名称' class='custom-menu-itemName' value='" + that.find(".nav-show>li").eq(i).children("a").text() + "'><input type='text' placeholder='请输入自定义菜单项链接' class='custom-menu-itemLink'value='" + that.find(".nav-show>li").eq(i).children("a").attr("href") + "'>";
		}
		html += "<i></i>";
		that.find(".custom-menu-item").html(html);
	} else if(dataSourceType == "标签") {
		that.parents(".model").find(".navbar-cms li").eq(1).addClass("active").siblings(".active").removeClass("active");
		that.parents(".model").find(".resources-content>div").css("display", "none");
		that.parents(".model").find(".resources-content>div").eq(1).css("display", "block");
		that.parents(".model").find(".resources-content").children().eq(1).children().addClass("active");
		if(dataSourceName) {
			setTags(dataSourceName.split("|"))
		}
		$(".custom-tabName input").val(dataTabName);
	} else if(dataSourceType == "网站页面") {
		var index = that.parents(".model").hasClass("nav-footer") ? 0 : 2;
		that.parents(".model").find(".navbar-cms li").eq(index).addClass("active").siblings(".active").removeClass("active");
		that.parents(".model").find(".resources-content>div").css("display", "none");
		that.parents(".model").find(".resources-content>div").eq(index).css("display", "block");
		that.parents(".model").find("form.custom-tabName").css("display", "block");
		that.parents(".model").find(".resources-content").children().eq(index).children("ul").addClass("active");
		for(var k = 0; k < that.parents(".model").find(".resources-content ul.active li").length; k++) {
			if(that.parents(".model").find(".resources-content ul.active li").eq(k).text() == dataSourceName) {
				that.parents(".model").find(".resources-content ul.active li").eq(k).addClass("active");
			}
		}
		$(".custom-tabName").find("input").val(dataTabName);
	} else if(dataSourceType == "分类") { //分类
		that.parents(".model").find(".navbar-cms li").eq(0).addClass("active").siblings(".active").removeClass("active");
		if(dataSourceName) {
			zTreeInit(dataSourceName.split("/"));
		} else {
			zTreeInit();
		}
		$(".custom-tabName input").val(dataTabName);
		// that.parents(".model").find(".resources-content").children().children().removeClass("active");
	} else {
		console.log("Unknown Type: ", dataSourceType);
	}
}

/*图片轮播*/
function pictureSlide(obj) {
	//封装计时器函数，计时器函数里面是切换图片和小圆点
	//设置ul.pictureSlide的总宽度
	var pictureSlideWidth = $(obj).find(".picture").width() * $(obj).find(".picture").length;
	$(obj).css({
		"width": pictureSlideWidth + "px"
	});
	//轮播
	var pictureSlideLeft = $(obj).find(".picture").width();
	var i = 0;
	var timer;
	var totalPicture = $(obj).find(".picture").length;
	//轮播中小圆点，小横杠，小图片集合
	var rollingIcons = $(obj).siblings(".rolling-style").find("li");

	function slide() {
		//轮播图中大图片的切换动画
		if(totalPicture == 1) {
			clearInterval(timer);
			$(obj).css({
				"left": 0
			});
		}
		timer = setInterval(function() {
			i++;
			//切换图片函数
			pictureSlideChange();
			if(i >= rollingIcons.length) {
				i = 0
			}
			//小圆点，小横杠还是缩略图切换
			iconListsChange(i)
		}, 2000);
	}

	slide();
	var arrows = $(obj).siblings(".arrows");
	arrows.hover(function() {
		//鼠标经过左右箭头的时候停止动画
		clearInterval(timer);
	}, function() {
		//鼠标离开左右箭头的时候开始动画
		slide();
	});
	$(obj).siblings(".arrows").children(".left-arrow").on("click", function() {
		if(totalPicture == 1) {
			clearInterval(timer);
			$(obj).css({
				"left": 0
			});
		} else {
			//左箭头点击的时候切换图片
			$(obj).find(".picture").last().prependTo(obj);
			$(obj).css({
				"left": -pictureSlideLeft + "px"
			});
			$(obj).stop().animate({
				"left": 0
			}, 800);
			//左箭头点击的时候切换圆点
			i--;
			if(i < 0) {
				i = rollingIcons.length - 1
			}
			//小圆点，小横杠还是缩略图切换
			iconListsChange(i);
		}
	});
	$(obj).siblings(".arrows").children(".right-arrow").on("click", function() {
		//右箭头点击的时候切换图片
		pictureSlideChange();
		//右箭头点击的时候切换圆点
		i++;
		if(i >= rollingIcons.length) {
			i = 0
		}
		//小圆点，小横杠还是缩略图切换
		iconListsChange(i)
	});
	//鼠标悬停在圆点，横杠，缩略图的时候大图片的轮播停止
	var rolling = $(obj).siblings(".rolling-style");
	rolling.hover(function() {
		clearInterval(timer);
	}, function() {
		slide();
	});
	$(obj).find(".picture").hover(function() {
		clearInterval(timer)
	}, function() {
		slide();
	});
	//鼠标点击圆点，横杠，缩略图的时候大图片轮播
	rolling.find("li").on("mouseover", function() {
		i = $(this).index();
		iconListsChange(i);
		var all = $(this).parents(".model").find(".picture");
		var number = $(this).attr("data-number");
		for(var k = 0; k < all.length; k++) {
			if($(all).eq(k).attr("data-number") == number) {
				pictureSlideChange(k);
				break;
			}
		}
	});

	function pictureSlideChange(number) {
		//轮播图中小圆点、小横杠,缩略图的切换动画
		if(!number && number !== 0) {
			//如果number不存在且number不等于0；
			number = 1;
		}
		if(totalPicture == 1) {
			clearInterval(timer);
			$(obj).css({
				"left": 0
			});
		} else {
			$(obj).stop().animate({
				"left": -pictureSlideLeft * number + "px"
			}, 800, function() {
				for(var i = 0; i < number; i++) {
					$(obj).find(".picture").first().appendTo(obj);
				}
				$(obj).css({
					"left": 0
				})
			});
		}
	}

	var theme = $(".theme").attr("href").split("/")[1].split(".")[0];

	//轮播图中小圆点、小横杠,缩略图的切换动画
	function iconListsChange(number) {
		if(totalPicture == 1) {
			clearInterval(timer);
			$(obj).css({
				"left": 0
			});
		} else {
			if(rolling.prop("className") == "rolling-style thumbnailLists") {
				if(theme == "blue") {
					rollingIcons.eq(number).find("img").css({
						"border-color": "#03a9f4"
					});
				} else if(theme == "black") {
					rollingIcons.eq(number).find("img").css({
						"border-color": "#01c185"
					});
				} else if(theme == "red") {
					rollingIcons.eq(number).find("img").css({
						"border-color": "#dc0101"
					});
				} else if(theme == "green") {
					rollingIcons.eq(number).find("img").css({
						"border-color": "#02c185"
					});
				}
				rollingIcons.eq(number).siblings().find("img").css({
					"border-color": "transparent"
				})
			} else {
				if(theme == "blue") {
					rollingIcons.eq(number).css({
						"background-color": "#03a9f4"
					});
				} else if(theme == "black") {
					rollingIcons.eq(number).css({
						"background-color": "#01c185"
					});
				} else if(theme == "red") {
					rollingIcons.eq(number).css({
						"background-color": "#dc0101"
					});
				} else if(theme == "green") {
					rollingIcons.eq(number).css({
						"background-color": "#02c185"
					});
				}
				rollingIcons.eq(number).siblings().css({
					"background-color": "#fff"
				});
			}
		}

	}
}
// 设置时间轴时间部分显示样式
function setTimeStyle (dateHtml) {
	var add0 = function (time) {
		if (time < 10) {
			return '0' + time
		} else {
			return time
		}
	}
	var newDate = new Date()
	var year = newDate.getFullYear()
	var month = add0(newDate.getMonth() + 1)
	var date = add0(newDate.getDate())
	var hour = add0(newDate.getHours())
	var minute = add0(newDate.getMinutes())
	var second = add0(newDate.getSeconds())
	var newHtml
	newHtml = dateHtml.replace('%Y', year).replace('%M', month).replace('%d', date).replace('%H', hour).replace('%m', minute).replace('%s', second)
	return newHtml
}
// 调整时间轴显示宽度
function setTimeAxisWidth (obj) {
	if (obj.find('.tab.active').hasClass('time-vertical')) {
		obj.find('.time-point').each(function(){
	        var totalWidth=parseInt($(this).css('width'));
	        var leftWidth=Math.ceil(parseInt($(this).find('.time-left').outerWidth(true)))+5;
	        $(this).find('.time-right').css({'width':totalWidth-leftWidth+'px'});
	        $(this).find('.vertical-line').width('')
	    })
	} else {
		obj.find('.vertical-line').each(function(){
	        var itemNum=$(this).parents('.lists').find('.item').length-1;
	        var dateWidth=parseInt($(this).parents('.lists').find('.item:last .time-left').css('width'));
	        var totalWidth=parseInt($(this).parents('.lists').css('width'));
	        var circleWidth=parseInt($(this).siblings('.circle').css('width'));
	        var lineWidth=parseInt((totalWidth-dateWidth-circleWidth*itemNum)/itemNum);
	        $(this).css({'width':lineWidth+'px'});
	        $(this).parents('.time-point').find('.time-right').width('')
	    });
	}
	setTimeWordEllipsis(obj)
}
// 调整时间轴模块文字的省略号显隐
function setTimeWordEllipsis (obj) {
	obj.find('.time-right').each(function(){
		if (!$(this).find('.visibility').length) {
	        var cloneElement=$(this).find('p').clone(true);
	        $(this).append(cloneElement);
	        $(this).find('p:last').addClass('visibility');
		}
		var listClass = $(this).parents('.lists').attr('class').split(' ')
		var str = new RegExp("cont")
		var num
		for (var i = 0 ; i < listClass.length; i++) {
			if (str.test(listClass[i])) {
				num = listClass[i].slice(4)
			}
		}
        if($(this).parents('.tab').hasClass('time-vertical')){
        	$(this).find('p:first').css({'height': $(this).find('p:last span').height() * num + 'px', 'width': ''})
            var actWidth=parseInt($(this).find('.visibility').css('width'));
            if(num*parseInt($(this).find('p:first span').css('width'))<actWidth){
                $(this).find('p:first b').css({'visibility':'visible'});
            } else {
            	$(this).find('p:first b').css({'visibility':'hidden'})
            }
        }else{
        	$(this).find('p:first').css({'width': $(this).find('p:last span').width() * num + 'px', 'height': ''})
            var actWidth=parseInt($(this).find('.visibility span').css('height'));
            if(num*parseInt($(this).find('p:first span').css('height'))<actWidth){
                $(this).find('p:first b').css({'visibility':'visible'});
            } else {
            	$(this).find('p:first b').css({'visibility':'hidden'})
            }
        }
    });
}
//自定义导航的分割线项分割线的高度设置
function partingLint(parting){
    var listsHeight=parseInt(parting.parent().css('height'));
    var marginNum=parting.css('margin-top');
    var marginNum_=marginNum.slice(0,marginNum.length-2);
    var partingMargin=2*Math.ceil(marginNum_);
    parting.css('height',listsHeight-partingMargin+'px');
};
/* 保存页面 */
function savePage(update) {
	canupdate = true
	if($(".preset .page-name").val()) {
		if($(".preset .preset-title").val()) {
			var y = 0
			foundName(y);

			function foundName(y) {
				y++;
				$.ajax({
					url: baseurl + '/api/webpage?where={"语言":"' + $('.language-menu .active-bg').text() + '"}&max_results=30&page=' + y + '&sort=-id',
					type: "GET",
					async: false,
					contentType: "application/json;charset=UTF-8",
					headers: {
						"Authorization": "Basic " + auth
					},
					dataType: "json",
					success: function(msg) {
						var notSameName = true
						if(startNum == 0) {
							if(msg._items.length) {
								for(var i = 0; i < msg._items.length; i++) {
									notSameName = notSameName && ($(".preset .page-name").val() != msg._items[i]["显示名称"]);
								}
							}
							if(msg._items.length == 30 && notSameName) {
								foundName(y);
							}
							if(notSameName && !presentId) {
								$.ajax({
									url: baseurl + "/api/webpage",
									type: "POST",
									async: false,
									headers: {
										"Authorization": "Basic " + auth
									},
									contentType: "application/json;charset=UTF-8",
									data: JSON.stringify({
										"显示名称": $(".preset .page-name").val(),
										"页面配置": data,
										'语言': $('.language-menu .active-bg').text()
									}),
									success: function(msg) {
										presentId = msg._id;
										startNum = 1;
										presentName = $(".preset .page-name").val()
										$.ajax({
											url: baseurl + "/api/webpage/" + presentId,
											type: "GET",
											async: false,
											headers: {
												"Authorization": "Basic " + auth
											},
											contentType: "application/json;charset=UTF-8",
											success: function(sucmsg) {
												presentPageName = sucmsg["文件名称"];
											},
											error: function(err) {
												console.log(err);
											}
										});
										if(!update) {
											errorTip("保存成功");
										}
										changeState = 0
									},
									error: function(err) {
										console.log(err);
									}
								});
							} else {
								errorTip("页面名称不可相同");
								canupdate = false
							}
						} else {
							for(var i = 0; i < msg._items.length; i++) {
								if(msg._items[i]["_id"] != presentId) {
									notSameName = notSameName && ($(".preset .page-name").val() != msg._items[i]["显示名称"]);
								}
							}
							if(msg._items.length == 30) {
								foundName(y, notSameName);
							}
							if(notSameName && presentId) {
								$.ajax({
									url: baseurl + "/api/webpage/" + presentId,
									type: "PATCH",
									async: false,
									headers: {
										"Authorization": "Basic " + auth
									},
									contentType: "application/json;charset=UTF-8",
									data: JSON.stringify({
										"显示名称": $(".preset .page-name").val(),
										"页面配置": data,
										"文件名称": presentPageName,
										'语言': $('.language-menu .active-bg').text()
									}),
									success: function(msg) {
										if(!update) {
											errorTip("保存成功");
										}
										changeState = 0
									},
									error: function(err) {
										console.log(err);
									}
								});
							} else {
								errorTip("页面名称不可相同");
								canupdate = false
							}
						}
					}
				})
			}
		} else {
			errorTip("请输入标题");
			canupdate = false
		}
	} else {
		errorTip("请输入页面名称");
		canupdate = false
	}
}
/*还原操作界面*/
function reducePage() {
	playerNum = 0
	$(".preset-title").val(data.title);
	$(".page-name").val(presentName);
	if(presentName == "首页") {
		$(".page-name").attr("disabled", "disabled");
	} else {
		$(".page-name").removeAttr("disabled");
	}
	if(data.keywords && data.keywords.length) {
		for(var i = 0; i < data.keywords.length; i++) {
			$(".preset-keywords").eq(i).val(data.keywords[i]);
		}
	} else {
		$(".preset-keywords").val("");
	}
	$("link.theme").attr("href", "css/" + data.theme + ".css");
	$(".change-box").find("div.theme-" + data.theme).addClass("active").siblings(".active").removeClass("active");
	generateConfigHtml(data.header, "header");
	HTML = "";
	generateConfigHtml(data.section, "section");
	HTML = "";
	generateConfigHtml(data.footer, "footer");
	HTML = "";
	//配置还原css配置项
	if (data.style) {
		restoreCssConfig('header')
		restoreCssConfig('section')
		restoreCssConfig('footer')
	} else {
		var csstext = {
			'background-image': '',
			'background-repeat': '',
			'background-position': '',
			'background-size': '',
			'background-color': ''
		}
		$('.row-container').css(csstext).find('.background-color input[value="no"]').parents('label').addClass('checked').siblings('label').removeClass('checked').find('input[type="text"]').val('').siblings('.showbox').css('background-color', 'transparent')
		$('.row-container').find('.background-image input[value="no"]').parents('label').addClass('checked').siblings('label').removeClass('checked').find('div').css('background-image', '')
		$('.row-container').find('.background-size').addClass('disabled').find('input[value="cover"]').parents('label').addClass('checked').siblings('label').removeClass('checked')
		$('.row-container').find('.background-position').addClass('disabled').find('input[value="left top"]').parents('label').addClass('checked').siblings('label').removeClass('checked')
		$('.row-container').find('.background-repeat').addClass('disabled').find('input[value="no-repeat"]').parents('label').addClass('checked').siblings('label').removeClass('checked')
	}
	pickcolor()
	$(".demo .item").each(function() {
		widthCenter(this);
	});
	$('.demo .player').each(function () {
		var id = $(this).children().attr('id')
		vidioPlay(id)
	})
	adjustWidth($('.demo .text-title'))
	adjustWidth($('.demo .text-titleCont'))
	for(var x = 0; x < $(".demo").find(".pictureSlide .picture").length; x++) {
		$(".demo").find(".pictureSlide .picture").eq(x).width($(".demo").find(".pictureSlide .picture").eq(x).parents(".tab").width())
	}
	$('audio').audioPlayer()
	$(".demo .pictureSlide").each(function() {
		widthCenter($(this).parent(".item"))
		pictureSlide(this);
	});
	$('.demo .timer-axis').each(function () {
		setTimeAxisWidth($(this))
	})
	changeState = 0
	reduceConfig()
}
/* 还原css配置 */
function restoreCssConfig (obj) {
	$(obj + ' .config-box .background-color').each(function () {
		var part = matchingPart(this)
		var parents
		if ($(this).parents().hasClass('container-config-box')) {
			parents = $(this).parents('.row-container')
		} else if ($(this).parents().hasClass('row-config-box')) {
			parents = $(this).parents('.row-draggable').eq(0)
		} else if ($(this).parents().hasClass('template-config-box') || $(this).parents().hasClass('content-config-box')) {
			parents = $(this).parents('.col-draggable').eq(0)
		}
		if (part && part.css) {
			if (part.css == '{}') {
				setCss()
			} else {
				var configCss = JSON.parse(part.css)
				parents.css(configCss)
				var configBox = $(this).parents('.config-box')
				if (configCss['min-width']) {
					configBox.find('.container-width input[value="adaptive"]').siblings('input').val(configCss['min-width'].slice(0, -2)).parents('label').addClass('checked').siblings('label').removeClass('checked').find('input[type="text"]').val('')
				} else if (configCss['width']) {
					configBox.find('.container-width input[value="limit"]').siblings('input').val(configCss['width'].slice(0, -2)).parents('label').addClass('checked').siblings('label').removeClass('checked').find('input[type="text"]').val('')
				}
				if(configCss['background-color']) {
					configBox.find('.background-color input[value="has"]').siblings('input.picker').val(configCss['background-color'].slice(1)).siblings('p.showbox').css('background-color', configCss['background-color']).parent().addClass('checked').siblings('.checked').removeClass('checked')
				} else {
					configBox.find('.background-color input[value="no"]').parent().addClass('checked').siblings().removeClass('checked').find('input.picker').val('').siblings('p.showbox').css('background-color', 'transparent')
				}
				if(configCss['background-image']) {
					configBox.find('.background-image div').css('background-image', 'url(' + configCss['background-image'].slice(5, -2) + ')').parents('label').addClass('checked').siblings('.checked').removeClass('checked')
					configBox.find('.background-repeat input[value="' + configCss['background-repeat'] + '"]').parents('label').addClass('checked').siblings('.checked').removeClass('checked')
					configBox.find('.background-size input[value="' + configCss['background-size'] + '"]').parents('label').addClass('checked').siblings('.checked').removeClass('checked')
					configBox.find('.background-position input[value="' + configCss['background-position'] + '"]').parents('label').addClass('checked').siblings('.checked').removeClass('checked')
					configBox.find('form.disabled').removeClass('disabled')
				} else {
					configBox.find('.background-image div').css('background-image', '').parents('label').removeClass('checked').siblings().addClass('checked')
					configBox.find('.background-repeat').addClass('disabled').siblings('.background-size').addClass('disabled').siblings('.background-position').addClass('disabled')
				}
				if (configCss['margin']) {
					configBox.find('.margin-distance input').val(configCss['margin'].slice(0,-2))
				} else {
					if (configBox.find('.margin-distance').length) {
						configBox.find('.margin-distance input').val('')
					}
				}
			}
		} else {
			setCss()
		}
		function setCss () {
			var csstext = {
				'background-image': '',
				'background-repeat': '',
				'background-position': '',
				'background-size': '',
				'background-color': ''
			}
			parents.css(csstext).find('.background-color input[value="no"]').parents('label').addClass('checked').siblings('label').removeClass('checked').find('input[type="text"]').val('').siblings('.showbox').css('background-color', 'transparent')
			parents.find('.background-image input[value="no"]').parents('label').addClass('checked').siblings('label').removeClass('checked').find('div').css('background-image', '')
			parents.find('.background-size').addClass('disabled').find('input[value="cover"]').parents('label').addClass('checked').siblings('label').removeClass('checked')
			parents.find('.background-position').addClass('disabled').find('input[value="left top"]').parents('label').addClass('checked').siblings('label').removeClass('checked')
			parents.find('.background-repeat').addClass('disabled').find('input[value="no-repeat"]').parents('label').addClass('checked').siblings('label').removeClass('checked')
		}
	})
}
function findObj(obj) {
	var html
	if(obj == "header") {
		html = "头部";
	} else if(obj == "section") {
		html = "主体";
	} else if(obj == "footer") {
		html = "底部";
	}
	return html
}

function generateDefaultHtml(obj) {
	var HTML = ''
	HTML += '<div class="prompt-text">拖放布局添加到' + findObj(obj) + "内容区域</div>"
	return HTML
}
/*更新操作界面*/
function updatePage() {
	$(".page-name").val("");
	$(".page-name").removeAttr("disabled");
	$(".preset-title").val("");
	$(".preset-keywords").val("");
	$("header .container-box").html(generateDefaultHtml('header'));
	$("section .container-box").html(generateDefaultHtml('section'));
	$("footer .container-box").html(generateDefaultHtml('footer'));
	$('.container-config-box form').each(function() {
		$(this).find('label').eq(0).addClass('checked').siblings('.checked').removeClass('checked')
	})
	$('.container-config-box .background-color input').val('').siblings('p.showbox').css('background-color', '')
	$('.container-config-box .background-image div').css('background-image', '')
	$('.background-repeat').addClass('disabled').siblings('.background-size').addClass('disabled').siblings('.background-position').addClass('disabled')
	var csstext = {
		'background-image': '',
		'background-repeat': '',
		'background-position': '',
		'background-size': '',
		'background-color': ''
	}
	$('header .row-container').css(csstext)
	$('section .row-container').css(csstext)
	$('footer .row-container').css(csstext)
	var theme = $(".theme-change .change-box>div.active").attr("class").slice(6, -7);
	data = {
		"title": "",
		"keywords": [],
		"theme": theme,
		"header": [],
		"section": [],
		"footer": [],
		"style": {
			"header": {
				"css": ""
			},
			"section": {
				"css": ""
			},
			"footer": {
				"css": ""
			}
		}
	};
	startNum = 0;
	presentId = "";
	presentPageName = "";
	changeState = 0
}
/* 还原右侧模块配置项 */
function reduceConfig() {
	$('.demo .col-draggable').each(function() {
		var str = new RegExp("nav-");
		if(!str.test($(this).find('.model').attr('class')) && !$(this).find('.model').hasClass('pic-slide')) {
			//不是导航条且不是轮播图
			var template = $(this).find('.template-config-box')
			if($(this).find('.content-bar').length) {
				template.find('.tabs-display input[value="block"]').parent().addClass('checked').siblings('.checked').removeClass('checked')
				if($(this).find('.content-bar .more').length) {
					template.find('.tabs-style input[value="dropdown"]').parent().addClass('checked').siblings('.checked').removeClass('checked')
				} else {
					template.find('.tabs-style input[value="horizontal"]').parent().addClass('checked').siblings('.checked').removeClass('checked')
				}
				if ($(this).find('.content-bar>a i').length) {
					template.find('.more-style input[value=' + $(this).find('.content-bar>a i').attr('class') + ']').parent().addClass('checked').siblings('.checked').removeClass('checked')
				} else {
					template.find('.more-style input[value="none"]').parent().addClass('checked').siblings('.checked').removeClass('checked')
				}
				if ($(this).find('.content-bar').hasClass('text-center')) {
					template.find('.tabs-center input[value="text-center"]').parent().addClass('checked').siblings('.checked').removeClass('checked')
				} else {
					template.find('.tabs-center input[value="no"]').parent().addClass('checked').siblings('.checked').removeClass('checked')
				}
			} else {
				template.find('.tabs-display input[value="none"]').parent().addClass('checked').siblings('.checked').removeClass('checked')
				template.find('.tabs-style').addClass('disabled').children('.checked').removeClass('checked')
				template.find('.more-style').addClass('disabled').children('.checked').removeClass('checked')
			}
			if($(this).find('.model').hasClass('offer-candle')) {
				var content = $(this).find('.content-config-box')
				if($(this).find('li.tab').hasClass('text-left')) {
					content.find('.alignment input[value="text-left"]').parent().addClass('checked').siblings('.checked').removeClass('checked')
				} else if($(this).find('li.tab').hasClass('text-right')) {
					content.find('.alignment input[value="text-right"]').parent().addClass('checked').siblings('.checked').removeClass('checked')
				} else if($(this).find('li.tab').hasClass('text-center')) {
					content.find('.alignment input[value="text-center"]').parent().addClass('checked').siblings('.checked').removeClass('checked')
				} else {
					content.find('.alignment input[value="full"]').parent().addClass('checked').siblings('.checked').removeClass('checked')
				}
				if ($(this).find('li.tab').attr('data-contentId')) {
					content.find('.content-id input').val($(this).find('li.tab').attr('data-contentId'))
				}
			}
		} else if(str.test($(this).find('.model').attr('class')) && !$(this).find('.model').hasClass('nav-classic') && !$(this).find('.model').hasClass('nav-searchBox') && !$(this).find('.model').hasClass('nav-visitcount')) {
			//是导航条但不是企业经典也不是搜索导航也不是访客记录
			var content = $(this).find('.content-config-box')
			content.find('.item-row input').val($(this).find('li.tab ol').length)
			if(!$(this).find('.model').hasClass('nav-footer')) {
				if($(this).find('li.tab').hasClass('text-left')) {
					content.find('.alignment input[value="text-left"]').parent().addClass('checked').siblings('.checked').removeClass('checked')
				} else if($(this).find('li.tab').hasClass('text-right')) {
					content.find('.alignment input[value="text-right"]').parent().addClass('checked').siblings('.checked').removeClass('checked')
				} else if($(this).find('li.tab').hasClass('text-center')) {
					content.find('.alignment input[value="text-center"]').parent().addClass('checked').siblings('.checked').removeClass('checked')
				} else {
					content.find('.alignment input[value="full"]').parent().addClass('checked').siblings('.checked').removeClass('checked')
				}
			}
		}
	})
}
/*根据配置项弹框与页面间距离调整配置框位置*/
function changeConfigBoxPosition() {
	var str = new RegExp("nav-")
	var childLeft
	if(str.test($('.config-box.active').parents('.model').attr('class'))) {
		childLeft = '15px'
	} else {
		childLeft = '45px'
	}
	if($('.config-box.active').hasClass('cms-config-box')) {
		$('.config-box.active').css({
			'left': '-5px'
		}).children('span').css({
			'left': childLeft
		}).siblings('em').css({
			'left': childLeft
		})
	} else if($('.config-box.active').hasClass('content-config-box')) {
		$('.config-box.active').css({
			'left': '0'
		}).children('span').css({
			'left': '5px'
		}).siblings('em').css({
			'left': '5px'
		})
	} else if($('.config-box.active').hasClass('template-config-box')) {
		$('.config-box.active').css({
			'right': '0'
		}).children('span').css({
			'right': '70px'
		}).siblings('em').css({
			'right': '70px'
		})
	}
	getDistance($('.config-box.active')[0])
	var left = leftDistance
	var parents = $('.config-box.active').parents('.row-draggable').eq($('.config-box.active').parents('.row-draggable').length - 1)[0]
	getDistance(parents)
	var exceed
	if((left + $('.config-box.active')[0].offsetWidth) > (leftDistance + parents.offsetWidth)) {
		exceed = (left + $('.config-box.active')[0].offsetWidth) - (leftDistance + parents.offsetWidth - 20)
		if($('.config-box.active').hasClass('cms-config-box')) {
			$('.config-box.active').css({
				'left': -(5 + exceed) + 'px'
			}).children('span').css({
				'left': parseFloat(childLeft) + exceed + 'px'
			}).siblings('em').css({
				'left': parseFloat(childLeft) + exceed + 'px'
			})
		} else if($('.config-box.active').hasClass('content-config-box')) {
			$('.config-box.active').css({
				'left': -exceed + 'px'
			}).children('span').css({
				'left': 5 + exceed + 'px'
			}).siblings('em').css({
				'left': 5 + exceed + 'px'
			})
		}
	} else if(left < leftDistance) {
		exceed = leftDistance - left
		if($('.config-box.active').hasClass('template-config-box')) {
			$('.config-box.active').css({
				'right': -exceed + 'px'
			}).children('span').css({
				'right': 70 + exceed + 'px'
			}).siblings('em').css({
				'right': 70 + exceed + 'px'
			})
		}
	}
}
/*遍历页面上可能有日期的模块调整宽度*/
function adjustWidth(obj) {
	obj.each(function() {
		var reservedDistance
		var item = obj.find(".tab.active .item")
		item.each(function() {
			if($(this).find('i').length) {
				reservedDistance = 33 //23+10 图标占位及标题与日期间余留距离
			} else {
				reservedDistance = 10 //标题与日期间余留距离
			}
			if($(this).find('.title-date').length) {
				reservedDistance += 75
			}
			if(obj.hasClass("text-title") || obj.hasClass("file-download")) {
				$(this).find(".title-text").css("width", (($(this).width() - reservedDistance) / $(this).width()).toFixed(4) * 100 + "%");
			} else if(obj.hasClass("text-titleCont")) {
				$(this).find("h3 .title-text").css("width", (($(this).width() - reservedDistance) / $(this).width()).toFixed(4) * 100 + "%");
			}
		})
	})
}
/* 匹配背景图等配置对应的部分 */
function matchingPart(obj) {
	if ($(obj).parents().hasClass('container-config-box')) {
		if (!data.style) {
			data['style'] = {"header": {"css": ""}, "section": {"css": ""}, "footer": {"css": ""}}
		}
		if($(obj).parents().is($('header'))) {
			return data.style.header
		} else if($(obj).parents().is($('section'))) {
			return data.style.section
		} else if($(obj).parents().is($('footer'))) {
			return data.style.footer
		}
	} else if ($(obj).parents().hasClass('row-config-box')) {
		var dataBox
		if ($(obj).parents().is('header')) {
			dataBox = data.header
		} else if ($(obj).parents().is('section')) {
			dataBox = data.section
		} else {
			dataBox = data.footer
		}
		var widthCss = JSON.stringify({'width': '1000px'})
		if ($(obj).parents('.row-draggable').length == 1) {
			if (!dataBox[$(obj).parents('.row-draggable').index()].style) {
				dataBox[$(obj).parents('.row-draggable').index()]['style'] = {'css': widthCss}
			}
			return dataBox[$(obj).parents('.row-draggable').index()].style
		} else {
			if ($(obj).parents('.row-draggable').length == 2) {
				if (!dataBox[$(obj).parents('.row-draggable').eq(1).index()].layout[$(obj).parents('.column').eq(0).index()].layouts[$(obj).parents('.row-draggable').eq(0).index()].style) {
					dataBox[$(obj).parents('.row-draggable').eq(1).index()].layout[$(obj).parents('.column').eq(0).index()].layouts[$(obj).parents('.row-draggable').eq(0).index()]['style'] = {'css': widthCss}
				}
				return dataBox[$(obj).parents('.row-draggable').eq(1).index()].layout[$(obj).parents('.column').eq(0).index()].layouts[$(obj).parents('.row-draggable').eq(0).index()].style
			}
		}
	} else if ($(obj).parents().hasClass('template-config-box') || $(obj).parents().hasClass('content-config-box')) {
		var dataBox
		if ($(obj).parents().is('header')) {
			dataBox = data.header
		} else if ($(obj).parents().is('section')) {
			dataBox = data.section
		} else {
			dataBox = data.footer
		}
		var marginCss = JSON.stringify({'margin': '5px'})
		if ($(obj).parents('.row-draggable').length == 1) {
			if (!dataBox[$(obj).parents('.row-draggable').index()].layout[$(obj).parents('.column').eq(0).index()].model.style) {
				dataBox[$(obj).parents('.row-draggable').index()].layout[$(obj).parents('.column').eq(0).index()].model['style'] = {'css': marginCss}
			}
			return dataBox[$(obj).parents('.row-draggable').index()].layout[$(obj).parents('.column').eq(0).index()].model.style
		} else if ($(obj).parents('.row-draggable').length == 2) {
			if (!dataBox[$(obj).parents('.row-draggable').eq(1).index()].layout[0].layouts[$(obj).parents('.row-draggable').eq(0).index()].layout[$(obj).parents('.column').eq(0).index()].model.style) {
				dataBox[$(obj).parents('.row-draggable').eq(1).index()].layout[0].layouts[$(obj).parents('.row-draggable').eq(0).index()].layout[$(obj).parents('.column').eq(0).index()].model['style'] = {'css': marginCss}
			}
			return dataBox[$(obj).parents('.row-draggable').eq(1).index()].layout[0].layouts[$(obj).parents('.row-draggable').eq(0).index()].layout[$(obj).parents('.column').eq(0).index()].model.style
		}
	}
}
/*取色器绑定事件*/
function pickcolor (par) {
	var obj
	if (par) {
		obj = $(par).find('.picker')
	} else {
		obj = $('.demo .picker')
	}
	obj.colpick({
		layout:'hex',
		submit:0,
		onChange:function(hsb,hex,rgb,el,bySetColor) {
			$(el).siblings('p.showbox').css('background-color','#'+hex)
			if ($(el).parents().hasClass('container-config-box')) {
				$(el).parents('.row-container').css('background-color','#'+hex)
			} else if ($(el).parents().hasClass('row-config-box')) {
				$(el).parents('.row-draggable').eq(0).css('background-color','#'+hex)
			} else if ($(el).parents().hasClass('template-config-box') || $(el).parents().hasClass('content-config-box')) {
				$(el).parents('.col-draggable').eq(0).css('background-color','#'+hex)
			}
			if(!bySetColor) $(el).val(hex);
			var part = matchingPart(el)
			var configCss
			if (part.css) {
				configCss = JSON.parse(part.css)
			} else {
				configCss = {}
			}
			configCss['background-color'] = '#'+hex
			part.css = JSON.stringify(configCss)
		}

	}).keyup(function(){
		$(this).colpickSetColor(this.value);
	}).on('click', function () {
		$(this).parents('label').addClass('checked').siblings('.checked').removeClass('checked')
	})
}
// 视频播放
function vidioPlay (id) {
	jwplayer.key = "hoaZuh3OXjh+0RYpnpfTqwpvuTW2jroiTn6WxvIKOsI="
	var width=parseInt($('#' + id).css('width'));
	var height=parseInt($('#' + id).css('height'));
	jwplayer(id).setup({
	    flashplayer: "jwplayer.flash.swf",
	    file: "images/test.mp4",
	    image: "images/picture_03.jpg",
	    width: width,
	    height: height
	})
}
// 对应语言下没有页面信息时默认配置首页
function defaultConfigIndex () {
	$.ajax({
		url: baseurl + '/api/webpage?where={"语言":"' + $('.language .active-bg').text() + '"}&max_results=30&page=1&sort=-id',
		type: "GET",
		async: false,
		contentType: "application/json;charset=UTF-8",
		headers: {
			"Authorization": "Basic " + auth
		},
		dataType: "json",
		success: function(msg) {
			if(!msg._items.length) {
				$(".page-name").val("首页");
				$(".page-name").attr("disabled", "disabled");
			}
		},
		error: function(err) {
			console.log(err)
		}
	});
}
window.onresize = function() {
	adjustWidth($('.demo .text-title'))
	adjustWidth($('.demo .text-titleCont'))
	$('.demo .player').each(function () {
		var id = $(this).children().attr('id')
		vidioPlay(id)
	})
	$('.demo .timer-axis').each(function () {
		setTimeAxisWidth($(this))
	})
}
$(function() {
	//取色器
	pickcolor()
	//获取语言列表
	$.ajax({
		url: baseurl + '/api/config/get_language',
		type: 'GET',
		async: false,
		contentType: "application/json;charset=UTF-8",
		headers: {
			"Authorization": "Basic " + auth
		},
		dataType: "json",
		success: function (data) {
			$('.navbar-right .language>span').text(data.default)
			var html = ''
			for (var i = 0; i < data.items.length; i++) {
				html += '<li'
				if (data.items[i] == data.default) {
					html += ' class="active-bg"'
				}
				html += '>' + data.items[i] + '</li>'
			}
			$('.navbar-right .language-menu').html(html)
		},
		error: function (err) {
			console.log(err)
		}
	})
	defaultConfigIndex()
	/*模拟生成操作界面*/
	$(".preset-title").on("input propertychange", function() {
		data.title = $(this).val();
		if($(this).val()) {
			changeState = 1
		} else {
			changeState = 0
		}
	});
	$(".page-name").on("input propertychange", function() {
		if($(this).val()) {
			changeState = 1
		} else {
			changeState = 0
		}
	});
	$(".preset-keywords").on("input propertychange", function() {
		var keywords = [];
		for(var i = 0; i < $(".preset-keywords").length; i++) {
			if($(".preset-keywords").eq(i).val() != "") {
				keywords.push($(".preset-keywords").eq(i).val());
			}
		}
		data.keywords = keywords;
		if(data.keywords.length) {
			changeState = 1
		} else {
			changeState = 0
		}
	});
	/*页面顶部右侧导航栏提示框及下拉框*/
	$(".navbar-right a").hover(function() {
		$(this).next(".prompt").stop().fadeToggle();
	});
	$(".page-upload a").hover(function() {
		$(this).next(".prompt").stop().fadeToggle();
	});
	// 点击顶部右侧导航栏时 兄弟元素中的下拉框隐藏
	$('.navbar-right li>span').on('click', function() {
		$(this).parent().siblings().find('.dropdown-box').stop().hide()
	})
	// 语言列表
	$(".navbar-right .language>span").on("click", function() {
		$(this).siblings(".dropdown-box").stop().slideToggle().toggleClass('active');
	});
	// 页面颜色
	$(".navbar-right .theme>span").on("click", function() {
		$(this).siblings(".theme-change").stop().fadeIn();
		$(this).siblings(".change-boxMask")[0].style.display = "block";
		/*return false*/
	});
	$(".theme-change .box-close").on("click", function() {
		$(this).parents(".theme-change")[0].style.display = "none";
		$(this).parents(".theme-change").siblings(".change-boxMask")[0].style.display = "none";
		/*return false*/
	});
	// 预览
	$(".navbar-right .preview>span").on("click", function() {
		confirmFrame("是否保存并预览？", preview)

		function preview() {
			if($(".demo").find(".tab-nav .item").length) {
				for(var x = 0; x < $(".demo").find(".tab-nav .item").length; x++) {
					if(!$(".demo").find(".tab-nav .item").eq(x).attr("data-sourceType") && !($(".demo").find(".tab-nav .item").eq(x).parents(".model").hasClass("nav-searchBox") || $(".demo").find(".tab-nav .item").eq(x).parents(".model").hasClass("nav-visitcount"))) {
						errorTip("有未补充的导航栏");
						return
					}
				}
			}
			var str = new RegExp("nav-");
			for(var y = 0; y < $(".demo").find(".model").length; y++) {
				if(!str.test($(".demo").find(".model").eq(y).attr("class"))) {
					for(var z = 0; z < $(".demo").find(".model").eq(y).find(".tab").length; z++) {
						if(!$(".demo").find(".model").eq(y).find(".tab").eq(z).attr("data-sourceType") && !$(".demo").find(".model").eq(y).hasClass('offer-candle')) {
							errorTip("有未补充的标签栏");
							return
						}
					}
				}
			}
			if($(".page-name").val()) {
				if($(".preset-title").val()) {
					var xx = 0;
					uploadPage(xx);
					function uploadPage(xx) {
						xx++;
						$.ajax({
							url: baseurl + '/api/webpage?where={"语言":"' + $('.language-menu .active-bg').text() + '"}&max_results=30&page=' + xx + '&sort=-id',
							type: "GET",
							contentType: "application/json;charset=UTF-8",
							headers: {
								"Authorization": "Basic " + auth
							},
							async: false,
							dataType: "json",
							success: function(msg) {
								var boolean = true;
								if(startNum == 0) {
									if(msg._items.length) {
										for(var i = 0; i < msg._items.length; i++) {
											boolean = boolean && ($(".page-name").val() != msg._items[i]["显示名称"]);
										}
									}
									if(msg._items.length == 30 && boolean) {
										uploadPage(xx);
									}
									if(boolean) {
										$.ajax({
											url: baseurl + "/api/webpage",
											type: "POST",
											headers: {
												"Authorization": "Basic " + auth
											},
											contentType: "application/json;charset=UTF-8",
											async: false,
											data: JSON.stringify({
												"显示名称": $(".page-name").val(),
												"页面配置": data,
												'语言': $('.language-menu .active-bg').text()
											}),
											success: function(msg) {
												presentId = msg._id;
												startNum = 1;
												presentName = $(".preset .page-name").val()
												$.ajax({
													url: baseurl + "/api/webpage/" + presentId,
													type: "GET",
													headers: {
														"Authorization": "Basic " + auth
													},
													async: false,
													contentType: "application/json;charset=UTF-8",
													success: function(msg) {
														presentPageName = msg["文件名称"];
														console.log("preview2 " + presentPageName);
														window.open(presentPageName, '_blank');
													},
													error: function(err) {
														console.log(err);
													}
												});
											},
											error: function(err) {
												console.log(err);
											}
										});
									} else {
										errorTip("页面名称不可相同");
									}
								} else {
									for(var i = 0; i < msg._items.length; i++) {
										if(msg._items[i]["_id"] != presentId) {
											boolean = boolean && ($(".page-name").val() != msg._items[i]["显示名称"]);
										}
									}
									if(msg._items.length == 30) {
										uploadPage(xx);
									}
									if(boolean) {
										$.ajax({
											url: baseurl + "/api/webpage/" + presentId,
											type: "PATCH",
											headers: {
												"Authorization": "Basic " + auth
											},
											async: false,
											contentType: "application/json;charset=UTF-8",
											data: JSON.stringify({
												"显示名称": $(".page-name").val(),
												"页面配置": data,
												"文件名称": presentPageName,
												'语言': $('.language-menu .active-bg').text()
											}),
											success: function(msg) {
												console.log("preview1 " + presentPageName);
												window.open(presentPageName, '_blank')
											},
											error: function(err) {
												console.log(err);
											}
										});
									} else {
										errorTip("页面名称不可相同");
									}
								}
							}
						})
					}
				} else {
					errorTip("请输入标题");
				}
			} else {
				errorTip("请输入页面名称");
			}
		}
	});
	// 页面列表
	$(".navbar-right .menu>span").on("click", function() {
		$("body").find(".dropdown-box.active").removeClass("active");
		if($(this).siblings(".page-menu").css("display") == "none") {
			$(this).siblings(".page-menu").addClass("active");
			var xx = 0,
				html = "";
			addPageLists(xx, html);

			function addPageLists(xx, html) {
				xx++;
				$.ajax({
					url: baseurl + '/api/webpage?where={"语言":"' + $('.language-menu .active-bg').text() + '"}&max_results=30&page=' + xx + '&sort=-id',
					/*url: baseurl + "/api/webpage?max_results=30&page=" + xx + "&sort=-id",*/
					type: "GET",
					async: false,
					contentType: "application/json;charset=UTF-8",
					headers: {
						"Authorization": "Basic " + auth
					},
					dataType: "json",
					success: function(msg) {
						if(msg._items.length) {
							for(var i = 0; i < msg._items.length; i++) {
								if(msg._items[i]["显示名称"].indexOf("-") != 0) {
									if(msg._items[i]["显示名称"] == "首页") {
										html = "<li><a href='javascript:;' data-id='" + msg._items[i]["_id"] + "' data-link='" + msg._items[i]["文件名称"] + "'>" + msg._items[i]["显示名称"] + "</a></li>" + html;
									} else {
										html += "<li><a href='javascript:;' data-id='" + msg._items[i]["_id"] + "' data-link='" + msg._items[i]["文件名称"] + "'>" + msg._items[i]["显示名称"] + "</a><i class='deletePage'></i></li>";
									}
								}
							}
							if(msg._items.length == 30) {
								addPageLists(xx, html);
							}
							html += "<li><a href='javascript:;'><i class='addNewPage'></i></a></li>"
						} else {
							html += "<li><a href='javascript:;'>首页</a></li><li><a href='javascript:;'><i class='addNewPage'></i></a></li>";
						}
						$(".page-menu").html(html);
					},
					error: function(err) {
						console.log(err)
					}
				});

			}
		}
		$(this).siblings(".page-menu").stop().fadeToggle();
		/*return false*/
	});
	/*主题弹出框操作*/
	$(".change-box>div").on("click", function() {
		if(!$(this).hasClass("active")) {
			$("link.theme").attr("href", "css/" + $(this).attr("class").slice(6) + ".css");
			data.theme = $(this).attr("class").slice(6);
			changeState = 1
			$(this).addClass("active").siblings(".active").removeClass("active");
			$(".demo .pictureSlide").each(function() {
				pictureSlide(this);
			});
		}
	});
	/*左侧模块栏下拉框*/
	$(".slide-toggle").on("click", function() {
		/*if(!$(this).parent().hasClass("setLayout")) {
		}*/
		$(this).toggleClass("active");
		/*$(this).siblings(".module-menu:not(.setLayout .module-menu)").stop().slideToggle();*/
		$(this).siblings(".module-menu").stop().slideToggle();
		if($(this).hasClass("active") && $(this).parent().siblings().children(".slide-toggle.active").length) {
			$(this).parent().siblings().children(".slide-toggle.active").removeClass("active");
			$(this).parent().siblings(".dropdown-module:not(.setLayout)").children(".module-menu").stop().slideUp();
		}
		return false;
	});
	/*左侧自定义布局*/
	$(".custom input").on("input propertychange", function() {
		var arr = $(this).val().split(":"),
			sum = 0;
		for(var i = 0; i < arr.length; i++) {
			if(arr[i] != "") {
				sum += parseInt(arr[i]);
			}
		}
		if(sum > 1 && sum < 12 && arr[arr.length - 1] != 1 && arr[arr.length - 1] != "") {
			$(this).val($(this).val() + ":");
		} else if(sum == 12) {
			setTimeout(function() {
				var arr2 = $('.custom input').val().split(":");
				if(arr.toString() == arr2.toString()) {
					var customDiv = document.createElement("div"),
						customHtml = "";
					customDiv.className = "row-draggable ui-draggable custom-draggable";
					customHtml += $('.row-draggable .template-handle')[0].outerHTML
					customHtml += '<span class="draggable-title">' + $(".custom input").val() + "栏</span><div class='view'><div class='row'>"
					for(var i = 0; i < arr.length; i++) {
						customHtml += "<div class='column col-md-" + arr[i] + "'></div>";
					}
					customHtml += "</div></div>";
					customDiv.innerHTML = customHtml;
					$(".custom").before(customDiv);
					$(".custom input").val("");
				}
			}, 2000)
		} else if(arr[arr.length - 1] == 1) {
			setTimeout(function() {
				var arr2 = $('.custom input').val().split(":");
				if(arr.toString() == arr2.toString()) {
					$('.custom input').val($('.custom input').val() + ':');
				}
			}, 1000);
		} else if(sum > 12 || isNaN(sum)) {
			setTimeout(function() {
				errorTip("请输入有效比例");
			}, 500);
		}
	});
	/*保存页面*/
	$(".page-upload").on("click", function() {
		savePage()
	});
	$('.header-footer-replace>span').on("click", function() {
		var page = 0,
			html = "";
		getList(page, html)

		function getList(page, html) {
			page++;
			$.ajax({
				url: baseurl + "/api/webpage?max_results=30&page=" + page + "&sort=-id",
				type: "GET",
				async: false,
				contentType: "application/json;charset=UTF-8",
				headers: {
					"Authorization": "Basic " + auth
				},
				dataType: "json",
				success: function(msg) {
					if(msg._items.length) {
						for(var i = 0; i < msg._items.length; i++) {
							if(msg._items[i]["显示名称"].indexOf("-") != 0) {
								if(presentId != msg._items[i]._id) {
									html += "<li data-id=" + msg._items[i]._id + ">" + msg._items[i]["显示名称"] + "</li>";
								}
							}
						}
						if(msg._items.length == 30) {
							addPageLists(page, html);
						}
					}
					$(".header-footer-replace ul").html(html);
					$(".header-footer-replace ul").css("display", "block")
				},
				error: function(err) {
					console.log(err)
				}
			});
		}

		/*return false*/
	});
	/*拖拽时放置半透明元素的容器*/
	elementCopy = document.createElement("div");
	elementCopy.style.cssText = "position:absolute;display:none;z-index:100";
	document.body.appendChild(elementCopy);
	/*页面拖拽后追加元素的删除提示框*/
	$(".demo").on("mouseenter", ".delete-btn", function() {
		$(this).next(".prompt").stop().fadeIn();
	}).on("mouseout", ".delete-btn", function() {
		$(this).next(".prompt").stop().fadeOut();
	});
	$("body").on('click','.language-menu li', function () {
		// 切换语言
		var span = $(this).parent().siblings('span')
		if ($(this).text() != span.text()) {
			var that = $(this)
			if (changeState != 0) {
				//页面被修改 要先保存再切换语言
				function saveAndOpen () {
					savePage(true)
					if(canupdate) {
						updatePage()
						changeLang()
					}
				}
				function changeAndOpen () {
					updatePage()
					changeLang()
				}
				confirmFrame('是否要保存已修改页面？', saveAndOpen, changeAndOpen)
				that.parent().slideUp()
			} else if (startNum != 0) {
				//页面没被修改但当前打开页面不是要切换到的语言下的页面
				updatePage()
				changeLang()
				that.parent().slideUp()
			} else {
				updatePage()
				changeLang()
				$(this).parent().slideUp()
			}
			function changeLang () {
				that.addClass('active-bg').siblings('.active-bg').removeClass('active-bg')
				span.text(that.text())
				defaultConfigIndex()
			}
		}
	}).on("click", ".page-menu li", function(e) {
		/*还原已有页面*/
		e = e || window.event || arguments.callee.caller.arguments[0];
		if(e.target == this || e.target == $(this).children("a")[0]) {
			if($(".page-menu li:last-child")[0] != this) {
				var that = this
				function openNewPage() {
					startNum = 1;
					presentId = $(that).children("a").attr("data-id");
					if(presentId) {
						$.ajax({
							"url": baseurl + "/api/webpage/" + presentId,
							type: "GET",
							async: false,
							contentType: "application/json;charset=UTF-8",
							headers: {
								"Authorization": "Basic " + auth
							},
							dataType: "json",
							success: function(msg) {
								data = msg["页面配置"];
								presentName = msg["显示名称"];
								presentPageName = msg["文件名称"];
								reducePage();
							},
							error: function(err) {
								console.log(err);
							}
						});
					} else {
						startNum = 0;
						console.log("新建首页？");
						data.title = '首页';
						presentName = "首页";
						reducePage();
					}
					$(that).parents(".page-menu").slideUp()
				}
				if(changeState == 0) {
					openNewPage()
				} else {
					confirmFrame('是否要保存已修改页面？', saveAndOpen, openNewPage)
					$(that).parents(".page-menu").slideUp()

					function saveAndOpen() {
						savePage(true)
						if(canupdate) {
							openNewPage()
						}
					}
				}
			}
		}
		return false;
	}).on("click", ".navbar-right .deletePage", function() {
		/*删除已有页面*/
		var that = $(this);
		function deletePage() {
			$.ajax({
				"url": baseurl + "/api/webpage/" + that.siblings().attr("data-id"),
				type: "DELETE",
				async: false,
				contentType: "application/json;charset=UTF-8",
				headers: {
					"Authorization": "Basic " + auth
				},
				success: function(msg) {
					if(presentId == that.siblings().attr("data-id")) {
						updatePage();
					}
					that.parent().remove();
				},
				error: function(err) {
					console.log(err);
				}
			})
		}
		confirmFrame("是否删除该页面", deletePage)
		return false;
	}).on("click", ".page-menu li:last-child", function() {
		/*创建新页面*/
		if(typeof($(this).parent().children().eq(0).children("a").attr("data-id")) == "undefined") {
			errorTip("请先添加首页内容");
		} else {
			if(changeState == 0) {
				updatePage();
			} else {
				confirmFrame('是否要保存已修改页面？', saveAndUpdate, updatePage)
			}
			$(this).parents(".page-menu").slideUp()

			function saveAndUpdate() {
				savePage(true)
				if(canupdate) {
					updatePage()
				}
			}
		}
		return false;
	}).on("click", ".header-footer-replace li", function(e) {
		/*替换页眉页脚*/
		e = e || window.event || arguments.callee.caller.arguments[0];
		$(".header-footer-replace ul").css("display", "none")
		if(presentId != '') {
			var str = "已经设置页眉页脚，是否用\"" + $(e.target).text() + "\"页的页眉页脚替换?"
			confirmFrame(str, replace)
		} else {
			replace()
		}
		function replace() {
			$.ajax({
				url: baseurl + "/api/webpage/" + $(e.target).attr("data-id"),
				type: "GET",
				async: false,
				contentType: "application/json;charset=UTF-8",
				headers: {
					"Authorization": "Basic " + auth
				},
				dataType: "json",
				success: function(msg) {
					data.header = msg["页面配置"].header
					data.footer = msg["页面配置"].footer
					if (data.style && msg["页面配置"].style) {
						data.style.header = msg["页面配置"].style.header
						data.style.footer = msg["页面配置"].style.footer
					}
					changeState = 1
					generateConfigHtml(data.header, "header");
					HTML = "";
					generateConfigHtml(data.footer, "footer");
					HTML = "";
					restoreCssConfig('header')
					restoreCssConfig('footer')
					$(".demo .item").each(function() {
						widthCenter(this);
					});
					adjustWidth($('.demo .text-title'))
					adjustWidth($('.demo .text-titleCont'))
					for(var x = 0; x < $(".demo").find(".pictureSlide .picture").length; x++) {
						$(".demo").find(".pictureSlide .picture").eq(x).width($(".demo").find(".pictureSlide .picture").eq(x).parents(".tab").width())
					}
					$(".demo .pictureSlide").each(function() {
						widthCenter($(this).parent(".item"))
						pictureSlide(this);
					});
					reduceConfig()
					$(".header-footer-replace ul").css("display", "none")
				},
				error: function(err) {
					console.log(err)
				}
			})
		}
	}).on("click", function(e) {
		/*点击非弹出框位置 弹出框display为none*/
		e = e || window.event || arguments.callee.caller.arguments[0];
		if(!($(e.target).hasClass("config-box") || $(e.target).parents().hasClass("config-box") || $(e.target).is('.container-config') || $(e.target).parents().hasClass('colpick') || $(e.target).is($("#media-box")) || $(e.target).parents().is($("#media-box")))) {
			if($(".config-box").hasClass("active")) {
				//如果背景图为选中状态但没有选择背景图 则背景图为无
				var bgimg = $('.config-box.active').find('.background-image')
				if (bgimg.length) {
					if (bgimg.find('div').css('background-image') == 'none' || !bgimg.find('div').css('background-image') && bgimg.find('div').parents('label').hasClass('checked')) {
						bgimg.find('label.checked').removeClass('checked').siblings().addClass('checked')
					}
				}
				$(".config-box.active").css("display", "none");
				$(".config-box.active").removeClass("active");
				$(".handle-mask").hide();
			}
		}
		if(!($(e.target).is($("#media-box")) || $(e.target).parents().is($("#media-box"))) && (!($(e.target).hasClass("config-box") || $(e.target).parents().hasClass("config-box"))) && $('#media-box').css('display') == 'block') {
			$('#media-box').hide()
			$(".handle-mask").hide();
		}
		if(!($(e.target).hasClass("dropdown-box") || $(e.target).parents().hasClass("dropdown-box") || $(".dropdown-box").siblings().hasClass($(e.target).parent().attr("class")) || $(e.target).is($('.navbar-right li span')))) {
			if($(".dropdown-box").hasClass("active")) {
				$(".dropdown-box.active").css("display", "none");
				$(".dropdown-box.active").removeClass("active");
			}
		}
		if(!($(e.target).hasClass("theme-change") || $(e.target).parents().hasClass("theme-change") || $(e.target).is($('.navbar-right li span')))) {
			$(".theme-change").css("display", "none");
			$(".change-boxMask").css("display", "none");
		}
		if(!($(e.target).parents().hasClass("header-footer-replace") || $(e.target).is($('.header-footer-replace span')))) {
			$(".header-footer-replace ul").css("display", "none")
		}
	}).on("click", ".delete-btn", function() {
		/*模块删除按钮*/
		if($(this).parents().hasClass("col-draggable")) {
			changeJson($(this));
			jsonBox.model = undefined;
		} else {
			changeJson($(this).parents(".row-draggable").eq(0));
			if($(this).parents(".row-draggable").length == 1) {
				jsonBox.splice($(this).parents(".ui-draggable").index(), 1);
			} else if($(this).parents(".row-draggable").length == 2) {
				if($(this).parents(".row-draggable").eq(0).siblings().length) {
					jsonBox.layouts.splice($(this).parents(".ui-draggable").eq(0).index(), 1);
				} else {
					jsonBox.layouts = undefined;
				}
			}
		}
		if($(this).parents(".ui-draggable").length == 1 && !$(this).parents(".ui-draggable").siblings(".ui-draggable").length) {
			var Div = document.createElement("div");
			Div.className = "prompt-text";
			if($(this).parents(".row-container").parent().is("header")) {
				Div.innerHTML = "拖放布局添加到头部内容区域";
			} else if($(this).parents(".row-container").parent().is("section")) {
				Div.innerHTML = "拖放布局添加到主体内容区域";
			} else if($(this).parents(".row-container").parent().is("footer")) {
				Div.innerHTML = "拖放布局添加到底部内容区域";
			}
			$(this).parents(".ui-draggable").parent().append(Div);
		}
		$($(this).parents(".ui-draggable")[0]).remove();
		if(!$('.demo .ui-draggable').length && !data.title && !data.keywords.length && !$('.preset-title').val()) {
			changeState = 0
		}
		return false
	}).on('click', '.container-config', function() {
		// 配置header section footer
		$('.container-config-box.active').removeClass('active').fadeOut()
		$(this).next('.container-config-box').addClass('active').fadeIn()
		/*$(".handle-mask").show();*/
		/*return false*/
	}).on('click', '.container-width label', function() {
		/* 设置布局模块宽度限定方式 */
		if(!$(this).hasClass('checked')) {
			$(this).find('input[type="text"]').val($(this).siblings().find('input[type="text"]').val()).removeAttr('readonly')
			$(this).siblings().find('input[type="text"]').val('').attr('readonly', true)
			var part = matchingPart(this)
			if (part.css) {
				var configCss = JSON.parse(part.css)
				if($(this).find('input[type="radio"]').val() == 'adaptive') {
					configCss['min-width'] = $(this).find('input[type="text"]').val() + 'px'
					configCss['width'] = '100%'
					$(this).parents('.row-draggable').eq(0).find('.row-draggable .container-width').removeClass('disabled')
				} else {
					configCss['width'] = $(this).find('input[type="text"]').val() + 'px'
					configCss['min-width'] = undefined
					if ($(this).parents('.row-draggable').eq(0).find('.row-draggable').length) {
						$(this).parents('.row-draggable').eq(0).find('.row-draggable .container-width').addClass('disabled')
						$(this).parents('.row-draggable').eq(0).find('.row-draggable').each(function () {
							var childPart = matchingPart($(this).find('.container-width')[0])
							var childCss
							if (childPart.css) {
								childCss = JSON.parse(childPart.css)
							} else {
								childCss = {}
							}
							childCss.width = undefined
							childCss['min-width'] = undefined
							childPart.css = JSON.stringify(childCss)
						})
					}
				}
				part.css = JSON.stringify(configCss)
			}
		}
	}).on('blur', '.container-width input[type="text"]', function() {
		/* 设置布局模块 宽度 */
		if($(this).parents('label').hasClass('checked')) {
			if ($(this).val() == "" || isNaN($(this).val()) || $(this).val() < 0) {
				errorTip("请输入有效数值")
				$(this).parents(".config-box").addClass("active").css("display", "block");
				$(".handle-mask").css("display", "block")
			} else {
				if($(this).val() >= 1000) {
					$(this).parents('.row-draggable').eq(0).css('width', $(this).val() + 'px')
					var part = matchingPart(this)
					var configCss
					if (part.css) {
						configCss= JSON.parse(part.css)
					} else {
						configCss={}
					}
					if($(this).siblings('input').val() == 'adaptive') {
						configCss['min-width'] = $(this).val() + 'px'
						configCss['width'] = undefined
					} else {
						configCss['width'] = $(this).val() + 'px'
						configCss['min-width'] = undefined
					}
					part.css = JSON.stringify(configCss)
				} else {
					errorTip('请大于1000px')
				}
			}
		}
	}).on('blur', '.margin-distance input', function () {
		//设置外边距
		if ($(this).val() == "" || isNaN($(this).val()) || $(this).val() < 0) {
			errorTip("请输入有效数值")
			$(this).parents(".config-box").addClass("active").css("display", "block");
			$(".handle-mask").css("display", "block")
		} else {
			$(this).parents('.ui-draggable').eq(0).css('margin', $(this).val() + 'px')
			var part = matchingPart(this)
			if (part.css) {
				var configCss = JSON.parse(part.css)
				configCss['margin'] = $(this).val() + 'px'
				part.css = JSON.stringify(configCss)
			}
		}
	}).on('click', '.background-color label', function() {
		/* 是否设置背景色 */
		if($(this).children('input[type="radio"]').val() === 'no') {
			var part = matchingPart(this)
			if (part.css) {
				var configCss = JSON.parse(part.css)
				configCss['background-color'] = undefined
				part.css = JSON.stringify(configCss)
			}
			var parents
			if ($(this).parents().hasClass('container-config-box')) {
				parents = $(this).parents('.row-container')
			} else if ($(this).parents().hasClass('row-config-box')) {
				parents = $(this).parents('.row-draggable').eq(0)
			} else if ($(this).parents().hasClass('template-config-box') || $(this).parents().hasClass('content-config-box')) {
				parents = $(this).parents('.col-draggable')
			}
			parents.css('background-color', '')
			$(this).siblings().find('input').val('').siblings('p.showbox').css('background-color', '')
		}
	}).on('click', '.background-image label', function() {
		/* 是否设置背景图 */
		if($(this).children('input[type="radio"]').val() === 'no') {
			var part = matchingPart(this)
			if (part.css) {
				var configCss = JSON.parse(part.css)
				configCss['background-image'] = undefined
				configCss['background-repeat'] = undefined
				configCss['background-size'] = undefined
				configCss['background-position'] = undefined
				part.css = JSON.stringify(configCss)
			}
			var parents
			if ($(this).parents().hasClass('container-config-box')) {
				parents = $(this).parents('.row-container')
			} else if ($(this).parents().hasClass('row-config-box')) {
				parents = $(this).parents('.row-draggable').eq(0)
			} else if ($(this).parents().hasClass('template-config-box') || $(this).parents().hasClass('content-config-box')) {
				parents = $(this).parents('.col-draggable')
			}
			parents.css({
				'background-image': '',
				'background-repeat': '',
				'background-position': '',
				'background-size': ''
			})
			$(this).siblings().find('img').attr('src', '')
			parents.find('.background-repeat').addClass('disabled').siblings('.background-size').addClass('disabled').siblings('.background-position').addClass('disabled')
		} else {
			$('#media-box').show()
			$(".handle-mask").show()
		}
	}).on('click', '#media-box .item input[type="checkbox"]', function() {
		/* 背景图单选 */
		if($(this).is(':checked')) {
			$(this).parents('.item').siblings().find('input:checked').prop('checked', false)
		}
	}).on('click', '#media-box .button .cancel', function() {
		/* 关闭背景图弹框 */
		$('#media-box').hide()
		/*$(".handle-mask").hide()*/
		var configBox = $('.config-box.active')
		if(configBox.find('.background-image div').css('background-image') == 'none' || !configBox.find('.background-image div').css('background-image')) {
			configBox.find('.background-image input[value="no"]').parent().addClass('checked').siblings('.checked').removeClass('checked')
		}
	}).on('click', '#media-box .button .sure', function() {
		/* 确定背景图 */
		var parent = $(this).parents('#media-box')
		if(parent.find('.item input:checked').length || parent.find('.item span.mask:visible').length) {
			var item
			if(parent.find('.item input:checked').length) {
				item = parent.find('.item[dataid=' + parent.find('.item input:checked').parents('.item').attr('dataid') + ']')
			} else {
				item = parent.find('.item span.mask:visible').parents('.item')
			}
			var imgsrc = item.find('img').attr('src')
			var configBox = $('.config-box.active')
			console.log(configBox)
			var parents
			if (configBox.hasClass('container-config-box')) {
				parents = configBox.parents('.row-container')
			} else if (configBox.hasClass('row-config-box')) {
				parents = configBox.parents('.row-draggable').eq(0)
			} else if (configBox.hasClass('template-config-box') || configBox.hasClass('content-config-box')) {
				parents = configBox.parents('.col-draggable')
			}
			parents.css({
				'background-image': 'url("' + imgsrc + '")',
				'background-repeat': configBox.find('.background-repeat label.checked input').val(),
				'background-size': configBox.find('.background-size label.checked input').val(),
				'background-position': configBox.find('.background-position label.checked input').val()
			}).find('.background-image div').eq(0).css('background-image', 'url("' + imgsrc + '")')
			configBox.find('form.disabled').removeClass('disabled')
			var part = matchingPart(configBox.find('form')[0])
			var configCss
			if (part.css) {
				configCss = JSON.parse(part.css)
			} else {
				configCss = {}
			}
			configCss['background-image'] = 'url("' + imgsrc + '")'
			configCss['background-repeat'] = configBox.find('.background-repeat label.checked input').val()
			configCss['background-size'] = configBox.find('.background-size label.checked input').val()
			configCss['background-position'] = configBox.find('.background-position label.checked input').val()
			part.css = JSON.stringify(configCss)
			$('#media-box').hide()
			/*$(".handle-mask").hide()*/
		} else {
			errorTip("请选择要添加的图片");
		}
	}).on('click', '.background-repeat label', function() {
		/* 切换背景图平铺样式 */
		var parents
		if ($(this).parents().hasClass('container-config-box')) {
			parents = $(this).parents('.row-container')
		} else if ($(this).parents().hasClass('row-config-box')) {
			parents = $(this).parents('.row-draggable').eq(0)
		} else if ($(this).parents().hasClass('template-config-box') || $(this).parents().hasClass('content-config-box')) {
			parents = $(this).parents('.col-draggable')
		}
		parents.css('background-repeat', $(this).children('input').val())
		var part = matchingPart(this)
		var configCss
		if (part.css) {
			configCss = JSON.parse(part.css)
		} else {
			configCss = {}
		}
		configCss['background-repeat'] = $(this).children('input').val()
		part.css = JSON.stringify(configCss)
		/*var part = matchingPart(this)
		part['background-repeat'] = $(this).children().val()*/
	}).on('click', '.background-size label', function() {
		/* 切换背景图平铺样式 */
		var parents
		if ($(this).parents().hasClass('container-config-box')) {
			parents = $(this).parents('.row-container')
		} else if ($(this).parents().hasClass('row-config-box')) {
			parents = $(this).parents('.row-draggable').eq(0)
		} else if ($(this).parents().hasClass('template-config-box') || $(this).parents().hasClass('content-config-box')) {
			parents = $(this).parents('.col-draggable')
		}
		parents.css('background-size', $(this).children('input').val())
		var part = matchingPart(this)
		var configCss
		if (part.css) {
			configCss = JSON.parse(part.css)
		} else {
			configCss = {}
		}
		configCss['background-size'] = $(this).children('input').val()
		part.css = JSON.stringify(configCss)
	}).on('click', '.background-position label', function() {
		/* 切换背景图位置 */
		var parents
		if ($(this).parents().hasClass('container-config-box')) {
			parents = $(this).parents('.row-container')
		} else if ($(this).parents().hasClass('row-config-box')) {
			parents = $(this).parents('.row-draggable').eq(0)
		} else if ($(this).parents().hasClass('template-config-box') || $(this).parents().hasClass('content-config-box')) {
			parents = $(this).parents('.col-draggable')
		}
		parents.css('background-position', $(this).children('input').val())
		var part = matchingPart(this)
		var configCss
		if (part.css) {
			configCss = JSON.parse(part.css)
		} else {
			configCss = {}
		}
		configCss['background-position'] = $(this).children('input').val()
		part.css = JSON.stringify(configCss)
	}).on('blur', '.content-id input', function () {
		/* 设置献烛模块内容id */
		if ($(this).val()) {
			$(this).parents(".ui-draggable").eq(0).find("li.tab.active").attr('data-contentId', $(this).val())
			changeJson($(this))
			var ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index();
			jsonBox.model.contentId = $(this).val();
		}
	}).on("click", ".config-btn", function() {
		/*页面配置项弹出菜单*/
		$(this).parents(".model").find(".menu").css("display", "none");
		$(this).next(".config-box").stop().fadeToggle();
		if($(this).next(".config-box")[0].style.display == "block") {
			$(".demo").find(".config-box.active").removeClass("active");
			$(this).next(".config-box").addClass("active");
			$(".demo").find(".config-box:not('.active')").hide();
			$(".handle-mask").css("display", "block");
			changeConfigBoxPosition()
		} else {
			$(this).next(".config-box").removeClass("active");
			$(".handle-mask").css("display", "none");
		}
		return false
	}).on("keypress", "form", function(e) {
		/*阻止页面回车提交事件*/
		e = e || window.event || arguments.callee.caller.arguments[0];
		if(e.keyCode == 13 || e.which == 13) {
			return false;
		}
	}).on("click", ".config-box label", function() {
		/*配置菜单中单选按钮*/
		if($(this).find("input[type='radio']").length) {
			$(this).addClass("checked").siblings(".checked").removeClass("checked");
		}
	}).on("click", ".navbar-cms li", function() {
		/*cms配置菜单中分类项与标签项间页面切换*/
		$(this).addClass("active").siblings(".active").removeClass("active");
		$(this).parent().siblings(".resources-content").children().hide();
		$($(this).parent().siblings(".resources-content").children()[$(this).index()]).show();
		if($(".navbar-cms").children("li.custom-link").hasClass("active") || $(".navbar-cms").children("li.custom-menu").hasClass("active") || $(".navbar-cms").children("li.functions").hasClass("active")) {
			$("form.custom-tabName").css("display", "none");
		} else {
			$("form.custom-tabName").css("display", "block");
		}
		if($(this).parents(".model").hasClass("nav-footer")) {
			if($(".navbar-cms").children("li.classify").hasClass("active")) { ////|| $(".navbar-cms").children("li").eq(2).hasClass("active")
				$("form.custom-tabName").css("display", "none");
			} else {
				$("form.custom-tabName").css("display", "block");
			}
		}
		changeConfigBoxPosition()
		var sourceType = $(this).parents(".model").find(".navbar-cms li.active").children().text();
		if(sourceType == '分类') {
			// var ztree = $.fn.zTree.getZTreeObj("treeDemo");
			// console.log('getTreeObject:', ztree);
			zTreeInit();
		}
	}).on("input propertychange", ".cms-config-box input", function() {
		/*切换自定义名称或自定义链接*/
		$(this).parents(".resources-content").find("li.active").removeClass("active");
		$(this).parents(".resources-content").find(".class-name.clicked").removeClass("clicked");
		if($(this).parents().hasClass("custom-menu-box")) {
			$(this).parents(".resources-content").siblings(".custom-tabName").find("input").val("");
			$(this).parents(".resources-content").find(".custom-link-box input").val("");
		} else if($(this).parents().hasClass("custom-link-box")) {
			$(this).parents(".resources-content").siblings(".custom-tabName").find("input").val("");
			$(this).parents(".resources-content").find(".custom-menu-box input").val("");
		} else {
			$(this).parents(".custom-tabName").siblings().find(".custom-link-box input").val("").parent().siblings('.custom-menu-box').find("input").val("")
		}
	}).on("click", ".class-name", function() {
		/*cms配置菜单分类项中折叠框间切换*/
		$(this).addClass("active").siblings(".class-name.active").removeClass("active").siblings(".class-content.active").removeClass("active");
		$(this).next().addClass("active");
		if($(this).parents(".model").find(".tab-nav").length) {
			$(this).parents(".resources-content").find(".custom-link-box input").val("");
			$(this).parents(".resources-content").find(".custom-menu-box input").val("");
		}
	}).on("click", ".resources-content li", function() {
		/*cms配置菜单中标签间切换*/
		if(!$(this).parents().hasClass("tab-box")) {
			$(this).siblings(".active").removeClass("active");
		}
		if($(this).parents().hasClass("tab-box") && $(this).hasClass("active")) {
			$(this).removeClass("active");
		} else {
			$(this).addClass("active");
		}
		$(this).parent().siblings("ul").children(".active").removeClass("active");
		$(this).parent().parent().siblings().find("li.active").removeClass("active");
		$(this).parents(".resources-content").find(".class-name.clicked").removeClass("clicked");
		var sourceType = $(this).parents(".model").find(".navbar-cms li.active").children().text();
		if(sourceType != '分类' && sourceType != '标签') {
			var tabname = $(this).text();
			$(this).parents(".resources-content").siblings(".custom-tabName").find("input").val(tabname);
		}
		if($(this).parents(".model").find(".tab-nav").length) {
			$(this).parents(".resources-content").find(".custom-link-box input").val("");
			$(this).parents(".resources-content").find(".custom-menu-box input").val("");
		}
	}).on("click", ".class-name", function() {
		/*导航栏模块配置分类下菜单*/
		if($(this).parents(".model").hasClass("nav-button") || $(this).parents(".model").hasClass("nav-classic")) {
			$(this).addClass("clicked").siblings(".class-name.clicked").removeClass("clicked");
			$(this).parents(".resources-content").find("li.active").removeClass("active");
			console.log("导航栏模块配置分类下菜单:" + this.innerText);
			$(this).parents(".content-handle").find(".custom-tabName input").val(this.innerText);
		}
	}).on("click", ".custom-menu-item>i", function() {
		/*添加自定义菜单栏的菜单项输入框*/
		var s = document.createElement("s");
		$(this).before(s);
		var input1 = document.createElement("input");
		input1.type = "text";
		input1.placeholder = "请输入自定义菜单项名称";
		input1.className = "custom-menu-itemName";
		$(this).before(input1);
		var input2 = document.createElement("input");
		input2.type = "text";
		input2.placeholder = "请输入自定义菜单项链接";
		input2.className = "custom-menu-itemLink";
		$(this).before(input2);
	}).on("click", ".custom-menu-item>s", function() {
		$(this).prev().remove();
		$(this).prev().remove();
		$(this).remove();
		return false
	}).on("click", ".cms-config-box .cancel", function() {
		/*cms配置菜单中取消按钮*/
		if($(this).parents(".model").find(".tab.active li").length) {
			findTabBox($(this).parents(".content-handle").parent());
			// console.log("cms配置菜单中取消按钮",$(this).parents(".model").find(".resources-content li.active").text());
			// $(this).parents(".model").find(".custom-tabName input").val($(this).parents(".model").find(".resources-content li.active").text());
		} else {
			if($(this).parents(".cms-config-box").children(".resources-content").find(".active").length) {
				$(this).parents(".cms-config-box").children(".resources-content").find("li.active").removeClass("active");
				// $(this).parents(".cms-config-box").children(".custom-tabName").find("input").val("");
			}
		}
		//清空自定义名称
		$(".custom-tabName input").val("");
		$(this).parents(".cms-config-box").css("display", "none");
		$(this).parents(".cms-config-box.active").removeClass("active");
		$(".handle-mask").css("display", "none");
		return false
	}).on("click", ".cms-config-box .confirm", function() {
		/*cms配置菜单中确定按钮*/
		changeJson($(this));
		if ($(this).parents('.config-box').find('.navbar-cms li.active').hasClass('functions')) {
			if ($(this).parents('.config-box').find('.function-box li.active').length) {
				$(this).parents('.model').find('.item.active').attr('class','item active ' + $(this).parents('.config-box').find('.function-box li.active').attr('id')).find('a').html('')
				$(this).parents(".cms-config-box").removeClass("active");
				$(this).parents(".cms-config-box").css("display", "none");
				$(".handle-mask").css("display", "none");
				if ($(this).parents('.config-box').find('.function-box li.active').attr('id') == 'parting-line') {
					partingLint($(this).parents('.model').find('.item.active'))
				}
			}
		} else {
			var sourceTypeObj = getCMSSourceType();
			var sourceInfo = getCMSSource(sourceTypeObj);
			if(sourceInfo == null)
				return false;
			var item = $(this).parents(".item");
			if(item.length == 0) {
				item = $(this).parents(".model").find("li.tab.active");
			}
			var sourceType = sourceTypeObj.text();
			$(item).attr("data-sourceType", sourceType);
			if('tabName' in sourceInfo) {
				$(item).attr("data-tabName", sourceInfo.tabName);
				// $(item).data("tabName", sourceInfo.tabName);
			}
			if('sourceName' in sourceInfo) {
				$(item).attr("data-sourceName", sourceInfo.sourceName);
				// $(item).data("sourceName", sourceInfo.sourceName);
			}
			if('link' in sourceInfo) {
				$(item).attr("data-link", sourceInfo.link);
				// $(item).data("link", sourceInfo.link);
			}
			if('menu' in sourceInfo) {
				$(item).attr('data-menu', sourceInfo.menu)
				$(item).data("menu", sourceInfo.menu);
			}
		}
		var itemIndex = $(this).parents(".model").find("li.item.active").index() - 1;
		for(var x = 0; x < $(this).parents(".model").find("li.item.active").parents().prevAll(".lists").length; x++) {
			itemIndex += $(this).parents(".model").find("li.item.active").parents().prevAll(".lists").eq(x).find("li.item").length;
		}
		jsonBox.model.tabs[itemIndex] = sourceInfo;
		console.log("itemIndex=" + itemIndex + ", jsonBox.model=", jsonBox.model);

		if($(this).parents(".model").hasClass("nav-footer")) { //页脚
			if(sourceType == '网站页面') { //
				$(this).parents(".content-handle").siblings("a").html(sourceInfo.tabName);
				if($(this).parent().siblings(".resources-content").find("li.active").attr("data-link")) {
					$(this).parents(".content-handle").siblings().attr("href", "/" + $(this).parent().siblings(".resources-content").find("li.active").attr("data-link"));
				} else {
					$(this).parents(".content-handle").siblings().attr("href", "javascript:;");
				}
				var tind = $(this).parents(".model").find("li.item.active").index() - 1;
				for(var x = 0; x < $(this).parents(".model").find("li.item.active").parents().prevAll(".lists").length; x++) {
					tind += $(this).parents(".model").find("li.item.active").parents().prevAll(".lists").eq(x).find("li.item").length;
				}
				var tabCol = [];
				for(var y = 0; y < $(this).parents(".model").find("ol.lists").length; y++) {
					tabCol.push($(this).parents(".model").find("ol.lists").eq(y).find("li.item").length);
				}
				jsonBox.model.tabCol = tabCol;
				// var jsonStr = {sourceType: sourceType, tabName: tabName, link: link};
				// jsonBox.model.tabs[tind] = jsonStr;
			} else if(sourceType == '链接') {
				$(this).parents(".content-handle").siblings().html(sourceInfo.tabName);
				$(this).parents(".content-handle").siblings().attr("href", $(this).parents(".model").find(".custom-navLink").val());
				if($(this).parents(".model").find(".custom-navLink").val() == "") {
					$(this).parents(".content-handle").siblings().attr("href", "javascript:;");
				}
				var link = $(this).parents(".model").find(".custom-navLink").val();
				var tind = $(this).parents(".model").find("li.item.active").index() - 1;
				for(var x = 0; x < $(this).parents(".model").find("li.item.active").parents().prevAll(".lists").length; x++) {
					tind += $(this).parents(".model").find("li.item.active").parents().prevAll(".lists").eq(x).find("li.item").length;
				}
				var tabCol = [];
				for(var y = 0; y < $(this).parents(".model").find("ol.lists").length; y++) {
					tabCol.push($(this).parents(".model").find("ol.lists").eq(y).find("li.item").length);
				}
				jsonBox.model.tabCol = tabCol;
				// var jsonStr = {sourceType: sourceType, tabName: tabName, link: link};
				// jsonBox.model.tabs[tind] = jsonStr;
			} else if(sourceType == '文本') {
				$(this).parents(".content-handle").siblings().html(sourceInfo.tabName);
				$(this).parents(".content-handle").siblings().attr("href", "javascript:;");
				var tabCol = [];
				for(var y = 0; y < $(this).parents(".model").find("ol.lists").length; y++) {
					tabCol.push($(this).parents(".model").find("ol.lists").eq(y).find("li.item").length);
				}
				jsonBox.model.tabCol = tabCol;
			} else {
				console.log("unknwon nav-footer sourceType:" + sourceType);
			}
			$(this).parents(".cms-config-box").removeClass("active");
			$(this).parents(".cms-config-box").css("display", "none");
			$(".handle-mask").css("display", "none");
		} else {
			if(sourceType == '分类' || sourceType == '标签' || sourceType == '网站页面') {
				if($(this).parents(".model").find(".tab-nav").length || $(this).parents(".model").hasClass("newNav")) {

					$(this).parents(".content-handle").siblings("a").html(sourceInfo.tabName);
					if($(this).parent().siblings(".resources-content").find("li.active").attr("data-link")) {
						$(this).parents(".content-handle").siblings("a").attr("href", $(this).parent().siblings(".resources-content").find("li.active").attr("data-link"))
					} else {
						$(this).parents(".content-handle").siblings("a").attr("href", "javascript:;")
					}

					if($(this).parent().siblings(".resources-content").find("li.active").length) {
						if($(item).find(".nav-show").length) {
							$(item).children("span").remove();
							$(item).children(".nav-show").remove();
						}
					} else {
						var num = $(this).parent().siblings(".resources-content").find(".class-name.clicked").next(".class-content").children("li").length;
						if(num) {
							if(!$(item).children("span").length) {
								var Span = document.createElement("span");
								Span.className = "bot";
								$(item).append(Span);
								$(item).addClass("character");
							}
							if($(item).children("ul").length) {
								$(item).children("ul").remove();
							}
							var Ul = document.createElement("ul");
							if(num <= 4) {
								Ul.className = "vertical-nav nav-show";
							} else {
								Ul.className = "hover_nav nav-show";
							}
							var html = "";
							for(var k = 0; k < num; k++) {
								html += "<li><a href='javascript:;'>" + $(this).parent().siblings(".resources-content").find(".class-name.clicked").next(".class-content").children("li").eq(k).text() + "</a></li>";
							}
							Ul.innerHTML = html;
							$(item).append(Ul);
						}
					}
				} else {
					if ($(this).parents(".model").hasClass("file-download")) {
						if (sourceType == '分类' && (sourceInfo.sourceName == '专题' || sourceInfo.sourceName.split('/')[0] == '专题' || sourceInfo.sourceName == '图书杂志' || sourceInfo.sourceName.split('/')[0] == '图书杂志' || sourceInfo.sourceName == '直播频道' || sourceInfo.sourceName.split('/')[0] == '直播频道')) {
							errorTip('下载模块不可选择专题、图书杂志及直播频道分类')
							return false
						}
					} else if ($(this).parents(".model").hasClass("music")) {
						if (sourceType == '分类' && (sourceInfo.sourceName !== '音乐' && sourceInfo.sourceName.split('/')[0] !== '音乐')) {
							errorTip('音频模块只可选择音乐分类')
							return false
						}
					} else if ($(this).parents(".model").hasClass("video-playing")) {
						if (sourceType == '分类' && (sourceInfo.sourceName !== '视频' && sourceInfo.sourceName.split('/')[0] !== '视频')) {
							errorTip('视频模块只可选择视频分类')
							return false
						}
					} 
					if($(this).parent().siblings(".resources-content").find("li.active").attr("data-link")) {
						$(this).parents(".content-handle").siblings("a").attr("href", $(this).parent().siblings(".resources-content").find("li.active").attr("data-link"))
					} else {
						$(this).parents(".content-handle").siblings("a").attr("href", "javascript:;")
					}
					if($(this).parents(".model").find(".content-bar").length) {
						$(this).parents(".model").find(".content-bar .content-bar_click>span").html(sourceInfo.tabName);
						if($(this).parents(".model").find(".content-bar .more").length) {
							$(this).parents(".model").find(".content-bar .more strong").html($(this).parent().siblings(".custom-tabName").find("input").val());
						}
					}
					appendModel($(this));
					$(this).parents(".model").find(".tab.active .item").each(function() {
						widthCenter(this);
					});
					// $(this).parents(".model").find("li.tab.active").attr("data-sourceType", $(this).parents(".config-box").find(".navbar-cms li").eq($(this).parent().siblings(".resources-content").find("li.active").parent().parent().index()).text());
				}
				// changeJson($(this));
				var tind = 0;
				if($(this).parents(".ui-draggable").eq(0).find(".content-bar").length || $(this).parents(".model").hasClass("pic-slide") || $(this).parents(".model").hasClass("timer-axis")) {
					tind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index() - 1;
				} else if($(this).parents(".model").find(".tab-nav").length) {
					tind = $(this).parents(".model").find("li.item.active").index() - 1;
					for(var x = 0; x < $(this).parents(".model").find("li.item.active").parents().prevAll(".lists").length; x++) {
						tind += $(this).parents(".model").find("li.item.active").parents().prevAll(".lists").eq(x).find("li.item").length;
					}
				} else {
					tind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index();
				}
				if($(this).parents(".model").find(".tab-nav").length) {
					var alignment = $(this).parents(".ui-draggable").eq(0).find(".alignment .checked input").val();
					var tabCol = [];
					for(var y = 0; y < $(this).parents(".model").find("ol.lists").length; y++) {
						tabCol.push($(this).parents(".model").find("ol.lists").eq(y).find("li.item").length);
					}
					// var jsonStr = {sourceName: sourceName, sourceType: sourceType, tabName: tabName, link: link};
				} else {
					var titleDisplay = $(this).parents(".model").find(".title-display .checked input").val();
					var contentDisplay = $(this).parents(".model").find(".content-display .checked input").val()
					var dateDisplay = $(this).parents(".model").find(".date-display .checked input").val();
					var timeDirection = $(this).parents(".model").find(".time-direction .checked input").val()
					var timeStyle = $(this).parents(".model").find(".time-style .checked input").val()
					var fillStyle = $(this).parents(".model").find(".fill-style .checked input").val();
					var itemRow = $(this).parents(".model").find(".item-row input").val();
					var itemCol = $(this).parents(".model").find(".item-col input").val();
					if($(this).parents(".model").hasClass("pic-slide")) {
						itemRow = $(this).parents(".model").find(".tab>div").length;
						var height = $(this).parents(".model").find(".tab.active .picture").height();
						var iconStyle = $(this).parents(".model").find(".rolling-style").attr("class").slice(14);
					} else if($(this).parents(".model").hasClass("pic-pictures")) {
						var height = $(this).parents(".model").find(".tab.active .picture").height();
					}
					var contentRow = $(this).parents(".model").find(".content-row input").val();
					var alignment = $(this).parents(".ui-draggable").eq(0).find(".alignment .checked input").val();
					var prefixStyle = $(this).parents(".model").find(".prefix-style .checked input").val();
					var mouseMove = $(this).parents('.model').find('.mouse-move .checked input').val();
					var mouseClick = $(this).parents('.model').find('.mouse-click .checked input').val();
					var linkWay = $(this).parents('.model').find('.link-way .checked input').val();
					var sort = $(this).parents(".model").find(".sort .checked input").val();
					// var sourceType = $(this).parents(".model").find(".navbar-cms li").eq($(this).parents(".model").find(".resources-content li.active").parent().parent().index()).children().text();
					var sourceName = sourceInfo.sourceName
					var tabName = sourceInfo.tabName;
					var jsonStr = {
						titleDisplay: titleDisplay,
						contentDisplay: contentDisplay,
						dateDisplay: dateDisplay,
						timeDirection: timeDirection,
						timeStyle: timeStyle,
						fillStyle: fillStyle,
						itemRow: itemRow,
						itemCol: itemCol,
						contentRow: contentRow,
						height: height,
						iconStyle: iconStyle,
						alignment: alignment,
						mouseMove: mouseMove,
						mouseClick: mouseClick,
						linkWay: linkWay,
						prefixStyle: prefixStyle,
						sort: sort,
						sourceType: sourceType,
						sourceName: sourceName,
						tabName: tabName
					};
					jsonBox.model.tabs[tind] = jsonStr;
				}
				// jsonBox.model.tabs[tind] = jsonStr;
				if($(this).parents(".model").find(".tab-nav").length) {
					jsonBox.model.alignment = alignment;
					jsonBox.model.tabCol = tabCol;
				}
				$(this).parents(".cms-config-box").removeClass("active");
				$(this).parents(".cms-config-box").css("display", "none");
				$(".handle-mask").css("display", "none");
			} else if(sourceType == '链接') { //
				// $(item).attr("data-tabName", customNameObj2);
				$(this).parents(".content-handle").siblings().html(sourceInfo.tabName);
				if($(item).find(".nav-show").length) {
					$(item).children("span").remove();
					$(item).children(".nav-show").remove();
				}
				$(this).parents(".content-handle").siblings().attr("href", $(this).parents(".model").find(".custom-navLink").val());
				if($(this).parents(".model").find(".custom-navLink").val() == "") {
					$(this).parents(".content-handle").siblings().attr("href", "javascript:;");
				}
				// var sourceType = $(this).parents(".content-handle").find(".navbar-cms li").eq($(this).parents(".model").find(".custom-navName").parent().index()).children().text(),
				//     tabName = $(this).parents(".model").find(".custom-navName").val(), link = $(this).parents(".model").find(".custom-navLink").val();
				// $(item).attr("data-sourceType", $(this).parents(".content-handle").find(".navbar-cms li").eq($(this).parents(".model").find(".custom-navName").parent().index()).children().text());
				// changeJson($(this));
				var tind = $(this).parents(".model").find("li.item.active").index() - 1;
				for(var x = 0; x < $(this).parents(".model").find("li.item.active").parents().prevAll(".lists").length; x++) {
					tind += $(this).parents(".model").find("li.item.active").parents().prevAll(".lists").eq(x).find("li.item").length;
				}
				var tabCol = [];
				for(var y = 0; y < $(this).parents(".model").find("ol.lists").length; y++) {
					tabCol.push($(this).parents(".model").find("ol.lists").eq(y).find("li.item").length);
				}
				jsonBox.model.tabCol = tabCol;
				// jsonBox.model.tabs[tind] = {sourceType: sourceType, tabName: tabName, link: link};
				$(this).parents(".cms-config-box").removeClass("active");
				$(this).parents(".cms-config-box").css("display", "none");
				$(".handle-mask").css("display", "none");
			} else if(sourceType == '菜单') {
				// $(item).attr("data-tabName", customNameObj3);
				$(this).parents(".content-handle").next("a").html(sourceInfo.tabName);
				if(!$(item).find(".nav-show").length) {
					var span = document.createElement("span");
					span.className = "bot";
					$(item).append(span);
					var ul = document.createElement("ul");
					if ($(this).parents('.model').hasClass('newNav')) {
						$(item).addClass("hasSecondNav");
						ul.className = 'second-nav'
					} else {
						$(item).addClass("character");
						ul.className = "nav-show";
					}
					$(item).append(ul);
				}
				var itemCount = 0,
					itemhtml = "";
				for(var x = 0; x < $(this).parents(".content-handle").find(".custom-menu-box input.custom-menu-itemName").length; x++) {
					if($(this).parents(".content-handle").find(".custom-menu-box input.custom-menu-itemName").eq(x).val() != "") {
						itemCount++;
						itemhtml += "<li><a href='";
						if($(this).parents(".content-handle").find(".custom-menu-box input.custom-menu-itemLink").eq(x).val() != "") {
							itemhtml += $(this).parents(".content-handle").find(".custom-menu-box input.custom-menu-itemLink").eq(x).val();
						} else {
							itemhtml += "javascript:;";
						}
						itemhtml += "'>" + $(this).parents(".content-handle").find(".custom-menu-box input.custom-menu-itemName").eq(x).val() + "</a></li>";
					}
				}
				if(itemCount <= 4) {
					$(item).find(".nav-show").attr("class", "vertical-nav nav-show");
				} else {
					$(item).find(".nav-show").attr("class", "hover_nav nav-show");
				}
				if ($(this).parents('.model').hasClass('newNav')) {
					$(item).find(".second-nav").html(itemhtml);
				} else {
					$(item).find(".nav-show").html(itemhtml);
				}
				// $(item).attr("data-sourceType", $(this).parents(".content-handle").find(".navbar-cms li").eq($(this).parents(".model").find(".custom-menu-title").parent().index()).children().text());
				// changeJson($(this));
				var tind = $(this).parents(".model").find("li.item.active").index() - 1;
				for(var x = 0; x < $(this).parents(".model").find("li.item.active").parents().prevAll(".lists").length; x++) {
					tind += $(this).parents(".model").find("li.item.active").parents().prevAll(".lists").eq(x).find("li.item").length;
				}
				var tabCol = [];
				for(var y = 0; y < $(this).parents(".model").find("ol.lists").length; y++) {
					tabCol.push($(this).parents(".model").find("ol.lists").eq(y).find("li.item").length);
				}
				// var sourceType = $(this).parents(".content-handle").find(".navbar-cms li").eq($(this).parents(".model").find(".custom-menu-title").parent().index()).children().text(),
				//     tabName = $(this).parents(".model").find(".custom-menu-title").val(), menu = [];
				// for (var y = 0; y < $(this).parent().siblings(".resources-content").find(".custom-menu-item").children(".custom-menu-itemName").length; y++) {
				//     var name = $(this).parent().siblings(".resources-content").find(".custom-menu-item").children(".custom-menu-itemName").eq(y).val(),
				//         link = $(this).parent().siblings(".resources-content").find(".custom-menu-item").children(".custom-menu-itemLink").eq(y).val();
				//     menu.push({name: name, link: link});
				// }
				jsonBox.model.tabCol = tabCol;
				// jsonBox.model.tabs[tind] = {sourceType: sourceType, tabName: tabName, menu: menu};
				$(this).parents(".cms-config-box").removeClass("active");
				$(this).parents(".cms-config-box").css("display", "none");
				$(".handle-mask").css("display", "none");
			}
			if($(this).parents('.model').hasClass('text-title') || $(this).parents('.model').hasClass('text-titleCont')) {
				adjustWidth($(this).parents(".model"))
			}
		}
		return false
	}).on("mouseover", ".content-bar>ul>li>span", function() {
		/*标题列表中横排标签切换*/
		var n = $(this).parent().index();
		$(this).parent().addClass("content-bar_click").siblings().removeClass("content-bar_click");
		$(this).parents(".model").find(".tab").removeClass('active');
		$(this).parents(".model").find(".tab").eq(n).addClass("active");
		appendContentHandle($(this).parent(), $(this).parent());
		$(this).parents(".model").find(".tab.active .item").each(function() {
			widthCenter(this);
		});
		if($(this).parents('.model').hasClass('text-title') || $(this).parents('.model').hasClass('text-titleCont')) {
			adjustWidth($(this).parents(".model"))
		}
	}).on("mouseover", ".content-bar>.more", function(e) {
		/*标签下拉列表显示*/
		e = e || window.event || arguments.callee.caller.arguments[0];
		if(!$(e.relatedTarget).parents(".content-handle").length) {
			$(this).find(".menu").css({
				"display": "block"
			});
		}
	}).on("mouseout", ".content-bar>.more", function() {
		$(this).find(".menu").css({
			"display": "none"
		});
	}).on("mouseover", ".menu>li>span", function() {
		/*标签下拉列表切换*/
		$(this).parents(".menu").css({
			"display": "block"
		});
		var n = $(this).parent().index();
		var parentModel = $(this).parents(".model");
		$(this).parent().addClass("content-bar_click").siblings().removeClass("content-bar_click");
		parentModel.find(".tab").removeClass('active');
		parentModel.find(".tab").eq(n).addClass("active");
		var cont = $(this).text();
		$(this).parents(".more").find(".left strong").text(cont);
		appendContentHandle($(this).parent(), $(this).parents(".more"));
		$(this).parents(".model").find(".tab.active .item").each(function() {
			widthCenter(this);
		});
		if($(this).parents('.model').hasClass('text-title') || $(this).parents('.model').hasClass('text-titleCont')) {
			adjustWidth($(this).parents(".model"))
		}
		return false
	}).on("mouseover", ".character", function(e) {
		/*导航栏下拉框*/
		e = e || window.event || arguments.callee.caller.arguments[0];
		if(!$(e.relatedTarget).parents(".content-handle").length && $(e.relatedTarget).parents().hasClass("tab")) {
			$(this).children(".nav-show").css("display", "block");
			$(this).children("span").attr("class", "top");
		}
		return false
	}).on("mouseout", ".character", function() {
		$(this).children(".nav-show").css("display", "none");
		$(this).children("span").attr("class", "bot");
	}).on('mouseover', '.newNav .hasSecondNav', function () {
		// 自定义导航条下拉框
		$(this).children('ul').stop().fadeIn()
		$(this).children("span").attr("class", "top")
	}).on('mouseout', '.newNav .hasSecondNav', function () {
		$(this).children('ul').stop().fadeOut()
		$(this).children("span").attr("class", "bot")
	}).on("mouseover", ".pictureSlide .picture", function() {
		/*轮播图模块添加配置按钮*/
		appendContentHandle($(this).parent(), $(this).parents(".model"));
	}).on("mouseover", ".tab-nav .item,.newNav .item", function(e) {
		/*导航栏切换*/
		e = e || window.event || arguments.callee.caller.arguments[0];
		if(!$(this).parents(".model").hasClass("nav-visitcount")) {
			if($(e.target).hasClass("item") || $(e.target).parent().hasClass("item")) {
				appendContentHandle($(this), $(this));
			}
		}
	}).on('mouseover', '.timer-axis .tab', function () {
		// 时间轴添加配置按钮
		appendContentHandle($(this), $(this).parents(".model"))
	}).on("click", ".delete-content", function() {
		/*删除内容按钮*/
		if($(this).parents(".model").find(".tab-nav").length) {
			if($(this).parents("ol.lists").find("li.item").length > 1) {
				var tind = $(this).parents(".model").find("li.item.active").index() - 1;
				for(var x = 0; x < $(this).parents(".model").find("li.item.active").parents().prevAll(".lists").length; x++) {
					tind += $(this).parents(".model").find("li.item.active").parents().prevAll(".lists").eq(x).find("li.item").length;
				}
				changeJson($(this));
				jsonBox.model.tabs.splice(tind, 1);
				var thatParent = $(this).parents(".lists");
				$(this).parents("li.item").remove();
				var tabCol = [];
				for(var z = 0; z < thatParent.parents(".model").find("ol.lists").length; z++) {
					tabCol.push(thatParent.parents(".model").find("ol.lists").eq(z).find("li.item").length);
				}
				jsonBox.model.tabCol = tabCol;
				if(thatParent.parent().hasClass("full")) {
					var len = 100 / thatParent.find(".item").length.toFixed(2);
					if(thatParent.find(".item").length == 6 || thatParent.find(".item").length == 7) {
						len -= 0.01;
					}
					thatParent.find(".item").css("width", len.toFixed(2) + "%");
				}
			} else {
				errorTip("请点击模块删除按钮来删除本模块");
			}
		} else {
			var that = $(this);
			function deleteJson() {
				changeJson(that);
				var ind = that.parents(".model").find(".content-bar_click").next().index();
				jsonBox.model.tabs.splice(ind, 1);
			}
			if($(this).parents(".model").find(".content-bar_click").prev()[0]) {
				that.parents(".model").find(".content-bar .more strong").html(that.parents(".model").find(".content-bar_click>span").text());
				$(this).parents(".model").find(".content-bar_click").removeClass("content-bar_click").prev().addClass("content-bar_click");
				deleteJson();
				var parent = $(this).parents(".content-bar");
				$(this).parents(".model").find(".tab.active").removeClass("active").prev().addClass("active");
				$(this).parents(".model").find(".tab.active").next().remove();
				$(this).parents(".model").find(".content-bar_click").next().remove();
				if(parent.children().children("li").length == 1) {
					parent.parents(".col-draggable").find(".tabs-display.disabled").removeClass("disabled").find("input[value=block]").parent().addClass("checked");
				}
				if(that.parents(".model").find(".menu").length) {
					that.parents(".model").find(".content-bar .more strong").html(that.parents(".model").find(".content-bar_click>span").text());
				}
			} else if($(this).parents(".model").find(".content-bar_click").next("li")[0]) {
				deleteJson();
				that.parents(".model").find(".content-bar .more strong").html(that.parents(".model").find(".content-bar_click>span").text());
				$(this).parents(".model").find(".content-bar_click").removeClass("content-bar_click").next().addClass("content-bar_click");
				var parent = $(this).parents(".content-bar");
				$(this).parents(".model").find(".tab.active").removeClass("active").next().addClass("active");
				$(this).parents(".model").find(".tab.active").prev().remove();
				$(this).parents(".model").find(".content-bar_click").prev().remove();
				if(parent.find(".menu").children("li").length == 1) {
					parent.parents(".col-draggable").find(".tabs-display.disabled").removeClass("disabled").find("input[value=block]").parent().addClass("checked");
				}
				if(that.parents(".model").find(".menu").length) {
					that.parents(".model").find(".content-bar .more strong").html(that.parents(".model").find(".content-bar_click>span").text());
				}
			} else {
				errorTip("请点击模块删除按钮来删除本模块");
			}
			$(this).parents(".content-bar").find(".more strong").html($(this).parents(".content-bar_click").find("span").text());
		}
	}).on("click", ".title-display label", function() {
		/*标题是否显示*/
		if($(this).children('input').val() == "block") {
			if ($(this).parents('.model').hasClass('timer-axis')) {
				if (!$(this).parents('.model').find('li.tab.active .time-right>h3').length) {
					var h3 = document.createElement('h3')
					h3.innerHTML = '商业摄影'
					$(this).parents('.model').find('li.tab.active .time-right').prepend(h3)
				}
				$(this).parents('.content-config-box').find('.content-display').removeClass('disabled').siblings('.content-row').removeClass('disabled')
			} else {
				if(!$(this).parents(".model").find("li.tab.active div.mod").length) {
					var A = document.createElement("a");
					A.href = "#";
					A.innerHTML = "路虎汽车";
					var H3 = document.createElement("h3");
					H3.appendChild(A);
					var Mod = document.createElement("div");
					Mod.className = "mod";
					Mod.appendChild(H3);
					$(this).parents(".model").find("li.tab.active .picture").append(Mod);
				}
			}
		} else if($(this).children('input').val() == "none") {
			if ($(this).parents('.model').hasClass('timer-axis')) {
				if ($(this).parents('.model').find('li.tab.active .time-right>h3').length) {
					$(this).parents('.model').find('li.tab.active .time-right>h3').remove()
				}
				$(this).parents('.content-config-box').find('.content-display').addClass('disabled')
			} else {
				if($(this).parents(".model").find("li.tab.active div.mod").length) {
					$(this).parents(".model").find("li.tab.active div.mod").remove();
				}
			}
		}
		if ($(this).parents('.model').hasClass('timer-axis')) {
			setTimeAxisWidth($(this).parents('.model'))
		}
		changeJson($(this));
		var ind = 0;
		if($(this).parents(".ui-draggable").eq(0).find(".content-bar").length || $(this).parents(".model").hasClass("pic-slide") || $(this).parents(".model").hasClass("timer-axis")) {
			ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index() - 1;
		} else {
			ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index();
		}
		jsonBox.model.tabs[ind].titleDisplay = $(this).children('input').val();
	}).on('click', '.content-display label', function () {
		// 内容是否显示
		if ($(this).children('input').val() == 'block') {
			if (!$(this).parents('.model').find('.time-right p').length) {
				var p = document.createElement('p')
				p.innerHTML = '<span>商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影商业摄影</span><b>...</b>'
				$(this).parents('.model').find('.time-right').removeClass('onlyTitle').append(p)
				setTimeWordEllipsis($(this).parents('.model'))
				$(this).parents('.content-config-box').find('.title-display').removeClass('disabled').siblings('.content-row').removeClass('disabled')
			}
		} else if ($(this).children('input').val() == 'none') {
			if ($(this).parents('.model').find('.time-right p').length) {
				$(this).parents('.model').find('.time-right').addClass('onlyTitle').find('p').remove()
				$(this).parents('.content-config-box').find('.title-display').addClass('disabled').siblings('.content-row').addClass('disabled')
			}
		}
		setTimeAxisWidth($(this).parents('.model'))
		changeJson($(this));
		jsonBox.model.tabs[0].contentDisplay = $(this).children('input').val();
	}).on("input propertychange", ".item-row input", function() {
		/*改变行数*/
		if($(this).val() != "") {
			var bool;
			/*if ($(this).parents(".model").hasClass("pictureText-crosswise")) {
				bool = limitCount(1, 3, $(this).val()) && limitCount(1, 6, $(this).parents(".content-config-box").find(".item-col input").val()) && limitCount(1, 6, $(this).parents(".content-config-box").find(".content-row input").val());
			} else if ($(this).parents(".model").hasClass("pictureText-vertical")) {
				bool = limitCount(1, 3, $(this).val()) && limitCount(1, 4, $(this).parents(".content-config-box").find(".item-col input").val()) && limitCount(1, 3, $(this).parents(".content-config-box").find(".content-row input").val());
			} else if ($(this).parents(".ui-draggable").find(".model").hasClass("nav-button")) {
				bool = limitCount(1, 3, $(this).val());
			} else if ($(this).parents(".ui-draggable").find(".model").hasClass("nav-text")) {
				bool = limitCount(1, 3, $(this).val());
			} else if ($(this).parents(".ui-draggable").find(".model").hasClass("nav-classicButton")) {
				bool = limitCount(1, 3, $(this).val());
			} else if ($(this).parents(".model").hasClass("text-titleCont")) {
				bool = limitCount(1, 5, $(this).val()) && limitCount(1, 3, $(this).parents(".content-config-box").find(".item-col input").val()) && limitCount(1, 3, $(this).parents(".content-config-box").find(".content-row input").val());
			} else if ($(this).parents(".ui-draggable").find(".model").hasClass("nav-footer")) {
				bool = limitCount(3, 6, $(this).val());
			} else if ($(this).parents(".model").hasClass("text-title")) {
				bool = limitCount(1, 20, $(this).val()) && limitCount(1, 4, $(this).parents(".content-config-box").find(".item-col input").val());
			} else if ($(this).parents(".model").hasClass("pictureText-surround")) {
				bool = limitCount(1, 10, $(this).val()) && limitCount(1, 4, $(this).parents(".content-config-box").find(".item-col input").val());
			} else if ($(this).parents(".model").hasClass("pic-pictures")) {
				bool = limitCount(1, 4, $(this).val()) && limitCount(1, 8, $(this).parents(".content-config-box").find(".item-col input").val()) && $(this).parents(".content-config-box").find(".pic-height input").val() != "" && !isNaN($(this).parents(".content-config-box").find(".pic-height input").val()) && $(this).parents(".content-config-box").find(".pic-height input").val() > 0;
			}*/
			if($(this).parents(".model").hasClass("pictureText-crosswise")) {
				bool = limitCount(1, 50, $(this).val()) && limitCount(1, 50, $(this).parents(".content-config-box").find(".item-col input").val()) && limitCount(1, 50, $(this).parents(".content-config-box").find(".content-row input").val());
			} else if($(this).parents(".model").hasClass("pictureText-vertical")) {
				bool = limitCount(1, 50, $(this).val()) && limitCount(1, 50, $(this).parents(".content-config-box").find(".item-col input").val()) && limitCount(1, 50, $(this).parents(".content-config-box").find(".content-row input").val());
			} else if($(this).parents(".col-draggable").find(".model").hasClass("nav-button")) {
				bool = limitCount(1, 50, $(this).val());
			} else if($(this).parents(".col-draggable").find(".model").hasClass("nav-text")) {
				bool = limitCount(1, 50, $(this).val());
			} else if($(this).parents(".col-draggable").find(".model").hasClass("nav-classicButton")) {
				bool = limitCount(1, 50, $(this).val());
			} else if($(this).parents(".model").hasClass("text-titleCont")) {
				bool = limitCount(1, 50, $(this).val()) && limitCount(1, 50, $(this).parents(".content-config-box").find(".item-col input").val()) && limitCount(1, 50, $(this).parents(".content-config-box").find(".content-row input").val());
			} else if($(this).parents(".col-draggable").find(".model").hasClass("nav-footer")) {
				bool = limitCount(3, 50, $(this).val());
			} else if($(this).parents(".model").hasClass("text-title") || $(this).parents(".model").hasClass("file-download") || $(this).parents(".model").hasClass("music")) {
				bool = limitCount(1, 50, $(this).val()) && limitCount(1, 50, $(this).parents(".content-config-box").find(".item-col input").val());
			} else if($(this).parents(".model").hasClass("pictureText-surround")) {
				bool = limitCount(1, 50, $(this).val()) && limitCount(1, 50, $(this).parents(".content-config-box").find(".item-col input").val());
			} else if($(this).parents(".model").hasClass("pic-pictures")) {
				bool = limitCount(1, 50, $(this).val()) && limitCount(1, 50, $(this).parents(".content-config-box").find(".item-col input").val()) && $(this).parents(".content-config-box").find(".pic-height input").val() != "" && !isNaN($(this).parents(".content-config-box").find(".pic-height input").val()) && $(this).parents(".content-config-box").find(".pic-height input").val() > 0;
			} else if ($(this).parents(".model").hasClass("timer-axis")) {
				bool = limitCount(1, 50, $(this).val()) && limitCount(1, 50, $(this).parents(".content-config-box").find(".content-row input").val()) 
			}
			if(bool) {
				if($(this).parents(".ui-draggable").eq(0).find(".tab-nav").length) {
					if($(this).parents(".ui-draggable").eq(0).find("ol.lists").length < $(this).val()) {
						var num = $(this).val() - $(this).parents(".ui-draggable").eq(0).find("ol.lists").length;
						for(var x = 0; x < num; x++) {
							var ol = document.createElement("ol");
							ol.className = 'lists clearfix';
							if($(this).parents(".ui-draggable").eq(0).find(".model").hasClass("nav-button") || $(this).parents(".ui-draggable").eq(0).find(".model").hasClass("nav-classicButton")) {
								ol.innerHTML = "<i class='handleLabel'></i> <li class='item''><a href='javascript:;'>添加页签名</a></li> <li class='item'><a href='javascript:;'>添加页签名</a></li> <li class='item'><a href='javascript:;'>添加页签名</a></li> <li class='item'><a href='javascript:;'>添加页签名</a></li> <li class='item'><a href='javascript:;'>添加页签名</a></li> <li class='item'><a href='javascript:;'>添加页签名</a></li> <li class='item'><a href='javascript:;'>添加页签名</a></li> <li class='item'><a href='javascript:;'>添加页签名</a></li>";
							} else if($(this).parents(".ui-draggable").eq(0).find(".model").hasClass("nav-text")) {
								ol.innerHTML = "<i class='handleLabel'></i><li class='item'><a href='javascript:;'>添加页签名</a></li> <li class='item'><a href='javascript:;'>添加页签名</a></li> <li class='item'><a href='javascript:;'>添加页签名</a></li>";
							} else if($(this).parents(".ui-draggable").eq(0).find(".model").hasClass("nav-footer")) {
								ol.innerHTML = "<i class='handleLabel'></i> <li class='item'><a href='javascript:;'>添加内容</a></li> <li class='item'><a href='javascript:;'>添加内容</a></li>";
							}
							$(this).parents(".ui-draggable").eq(0).find(".tab").append(ol);
							if($(this).parents(".ui-draggable").eq(0).find(".alignment .checked input").val() == "full") {
								for(var j = 0; j < $(this).parents(".ui-draggable").eq(0).find("ol.lists").length; j++) {
									var Inum = (100 / $(this).parents(".ui-draggable").eq(0).find("ol.lists").eq(j).find("li.item").length).toFixed(2);
									if($(this).parents(".ui-draggable").eq(0).find("ol.lists").eq(j).find("li.item").length == 6 || $(this).parents(".ui-draggable").eq(0).find("ol.lists").eq(j).find("li.item").length == 7) {
										Inum -= 0.01;
									}
									$(this).parents(".ui-draggable").eq(0).find("ol.lists").eq(j).find("li.item").css("width", (Inum + "%"));
								}
							}
						}
					} else {
						var length = $(this).parents(".ui-draggable").eq(0).find("ol.lists").length - $(this).val();
						for(var y = 0; y < length; y++) {
							$(this).parents(".ui-draggable").eq(0).find("ol.lists").eq($(this).parents(".ui-draggable").eq(0).find("ol.lists").length - 1).remove();
						}
					}
					changeJson($(this));
					var tabCol = [];
					for(var z = 0; z < $(this).parents(".ui-draggable").eq(0).find("ol.lists").length; z++) {
						tabCol.push($(this).parents(".ui-draggable").eq(0).find("ol.lists").eq(z).children("li.item").length);
					}
					jsonBox.model.tabCol = tabCol;
				} else {
					appendModel($(this));
					$(this).parents(".model").find(".tab.active .item").each(function() {
						widthCenter(this);
					});
					if($(this).parents('.model').hasClass('text-title') || $(this).parents('.model').hasClass('file-download') || $(this).parents('.model').hasClass('text-titleCont')) {
						adjustWidth($(this).parents(".model"))
					}
					var ind = 0;
					if($(this).parents(".ui-draggable").eq(0).find(".content-bar").length || $(this).parents('.model').hasClass('timer-axis')) {
						ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index() - 1;
					} else {
						ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index();
					}
					jsonBox.model.tabs[ind].itemRow = $(this).val();
				}
			} else {
				errorTip("请输入有效数值");
				$(this).blur();
			}
		}
	}).on("blur", ".item-row input", function() {
		/*改变行数*/
		if($(this).val() == "" || isNaN($(this).val()) || $(this).val() < 0) {
			errorTip("请输入有效行数");
			$(this).parents(".content-config-box").addClass("active").css("display", "block");
			$(".handle-mask").css("display", "block");
		}
	}).on("input propertychange", ".item-col input", function() {
		/*改变列数*/
		if($(this).val() != "") {
			var bool;
			/*if ($(this).parents(".model").hasClass("text-title")) {
				bool = limitCount(1, 4, $(this).val()) && limitCount(1, 20, $(this).parents(".content-config-box").find(".item-row input").val());
			} else if ($(this).parents(".model").hasClass("pictureText-surround")) {
				bool = limitCount(1, 4, $(this).val()) && limitCount(1, 10, $(this).parents(".content-config-box").find(".item-row input").val());
			} else if ($(this).parents(".model").hasClass("pictureText-vertical")) {
				bool = limitCount(1, 4, $(this).val()) && limitCount(1, 3, $(this).parents(".content-config-box").find(".item-row input").val()) && limitCount(1, 3, $(this).parents(".content-config-box").find(".content-row input").val());
			} else if ($(this).parents(".model").hasClass("text-titleCont")) {
				bool = limitCount(1, 3, $(this).val()) && limitCount(1, 5, $(this).parents(".content-config-box").find(".item-row input").val()) && limitCount(1, 3, $(this).parents(".content-config-box").find(".content-row input").val());
			} else if ($(this).parents(".model").hasClass("pictureText-crosswise")) {
				bool = limitCount(1, 6, $(this).val()) && limitCount(1, 3, $(this).parents(".content-config-box").find(".item-row input").val()) && limitCount(1, 6, $(this).parents(".content-config-box").find(".content-row input").val());
			} else if ($(this).parents(".model").hasClass("pic-slide")) {
				bool = limitCount(1, 10, $(this).val()) && $(this).parents(".content-config-box").find(".pic-height input").val() != "" && !isNaN($(this).parents(".content-config-box").find(".pic-height input").val()) && $(this).parents(".content-config-box").find(".pic-height input").val() > 0;
			} else if ($(this).parents(".model").hasClass("pic-pictures")) {
				bool = limitCount(1, 8, $(this).val()) && limitCount(1, 4, $(this).parents(".content-config-box").find(".item-row input").val()) && $(this).parents(".content-config-box").find(".pic-height input").val() != "" && !isNaN($(this).parents(".content-config-box").find(".pic-height input").val()) && $(this).parents(".content-config-box").find(".pic-height input").val() > 0;
			}*/
			if($(this).parents(".model").hasClass("text-title") || $(this).parents(".model").hasClass("file-download") || $(this).parents(".model").hasClass("music")) {
				bool = limitCount(1, 12, $(this).val()) && limitCount(1, 12, $(this).parents(".content-config-box").find(".item-row input").val());
			} else if($(this).parents(".model").hasClass("pictureText-surround")) {
				bool = limitCount(1, 12, $(this).val()) && limitCount(1, 12, $(this).parents(".content-config-box").find(".item-row input").val());
			} else if($(this).parents(".model").hasClass("pictureText-vertical")) {
				bool = limitCount(1, 12, $(this).val()) && limitCount(1, 12, $(this).parents(".content-config-box").find(".item-row input").val()) && limitCount(1, 12, $(this).parents(".content-config-box").find(".content-row input").val());
			} else if($(this).parents(".model").hasClass("text-titleCont")) {
				bool = limitCount(1, 12, $(this).val()) && limitCount(1, 12, $(this).parents(".content-config-box").find(".item-row input").val()) && limitCount(1, 12, $(this).parents(".content-config-box").find(".content-row input").val());
			} else if($(this).parents(".model").hasClass("pictureText-crosswise")) {
				bool = limitCount(1, 12, $(this).val()) && limitCount(1, 12, $(this).parents(".content-config-box").find(".item-row input").val()) && limitCount(1, 12, $(this).parents(".content-config-box").find(".content-row input").val());
			} else if($(this).parents(".model").hasClass("pic-slide")) {
				bool = limitCount(1, 12, $(this).val()) && $(this).parents(".content-config-box").find(".pic-height input").val() != "" && !isNaN($(this).parents(".content-config-box").find(".pic-height input").val()) && $(this).parents(".content-config-box").find(".pic-height input").val() > 0;
			} else if($(this).parents(".model").hasClass("pic-pictures")) {
				bool = limitCount(1, 12, $(this).val()) && limitCount(1, 12, $(this).parents(".content-config-box").find(".item-row input").val()) && $(this).parents(".content-config-box").find(".pic-height input").val() != "" && !isNaN($(this).parents(".content-config-box").find(".pic-height input").val()) && $(this).parents(".content-config-box").find(".pic-height input").val() > 0;
			}
			if(bool) {
				appendModel($(this));
				$(this).parents(".model").find(".tab.active .item").each(function() {
					widthCenter(this);
				});
				changeJson($(this));
				var ind = 0;
				if($(this).parents(".ui-draggable").eq(0).find(".content-bar").length || $(this).parents(".model").hasClass("pic-slide")) {
					ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index() - 1;
				} else {
					ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index();
				}
				var reservedDistance
				var item = $(this).parents(".model").find(".tab.active .item")
				if(item.find('i').length) {
					reservedDistance = 33 //23+10 图标占位及标题与日期间余留距离
				} else {
					reservedDistance = 10 //标题与日期间余留距离
				}
				dateWidth = item.width() - reservedDistance
				if(item.find(".title-date").length) {
					var noDate, dateWidth;
					noDate = (dateWidth - 75) / item.width() < 0.6;
					if(noDate) {
						item.find(".title-date").remove();
						$(this).parents(".model").find(".date-display .checked").removeClass("checked").siblings("label").addClass("checked");
						/*if ($(this).parents(".model").hasClass("text-title")) {
							$(this).parents(".model").find(".tab.active .item .title-text").removeAttr("style");
						} else if ($(this).parents(".model").hasClass("text-titleCont")) {
							$(this).parents(".model").find(".tab.active .item h3 .title-text").removeAttr("style");
						}*/
						jsonBox.model.tabs[ind].dateDisplay = "none";
						errorTip("当前模块大小不足以显示日期");
					} else {
						dateWidth -= 75
						$(this).parents(".content-config-box").find(".date-display .checked input").val((dateWidth / item.width()).toFixed(4) * 100 + "%");
						jsonBox.model.tabs[ind].dateDisplay = (dateWidth / item.width()).toFixed(4) * 100 + "%";
					}
				}
				item.find(".title-text").css("width", (dateWidth / item.width()).toFixed(4) * 100 + "%");
				jsonBox.model.tabs[ind].itemCol = $(this).val();
			} else {
				errorTip("请输入有效数值");
				$(this).blur();
			}
		}
	}).on("blur", ".item-col input", function() {
		/*改变列数*/
		if($(this).val() == "" || isNaN($(this).val()) || $(this).val() < 0) {
			errorTip("请输入有效列数");
			$(this).parents(".content-config-box").addClass("active").css("display", "block");
			$(".handle-mask").css("display", "block");
		}
	}).on("input propertychange", ".pic-height input", function() {
		/*改变图片高度*/
		if(!isNaN($(this).val()) && $(this).val() > 0) {
			$(this).parents(".model").find(".tab.active .picture").height($(this).val());
			$(this).parents(".model").find(".tab.active .item").each(function() {
				widthCenter(this);
			});
			if($(this).parents(".model").hasClass("pic-slide")) {
				$(this).parents(".model").find(".tab").height($(this).val());
			}
			changeJson($(this));
			var ind = 0;
			if($(this).parents(".ui-draggable").eq(0).find(".content-bar").length || $(this).parents(".model").hasClass("pic-slide")) {
				ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index() - 1;
			} else {
				ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index();
			}
			jsonBox.model.tabs[ind].height = $(this).val();
		}
	}).on("blur", ".pic-height input", function() {
		if($(this).val() == "" || isNaN($(this).val()) || $(this).val() < 0) {
			errorTip("请输入有效高度值");
		}
	}).on("input propertychange", ".content-row input", function() {
		/*改变内容行数*/
		if($(this).val() != "") {
			var bool;
			/*if ($(this).parents(".model").hasClass("text-titleCont")) {
				bool = limitCount(1, 3, $(this).val());
			} else if ($(this).parents(".model").hasClass("pictureText-vertical")) {
				bool = limitCount(1, 3, $(this).val());
			} else if ($(this).parents(".model").hasClass("pictureText-crosswise")) {
				bool = limitCount(1, 6, $(this).val());
			}*/
			bool = limitCount(1, 50, $(this).val());
			if(bool) {
				if ($(this).parents(".model").hasClass('timer-axis')) {
					$(this).parents(".model").find('.lists').attr('class', 'lists cont' + $(this).val())
					setTimeAxisWidth($(this).parents('.model'))
				} else {
					$(this).parents(".model").find("li.tab.active p.Row").attr("class", "Row Row" + $(this).val());
				}
				changeJson($(this));
				var ind = 0;
				if($(this).parents(".ui-draggable").eq(0).find(".content-bar").length || $(this).parents('.model').hasClass('timer-axis')) {
					ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index() - 1;
				} else {
					ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index();
				}
				jsonBox.model.tabs[ind].contentRow = $(this).val();
			} else {
				errorTip("请输入有效行数");
			}
		}
	}).on("blur", ".content-row input", function() {
		if($(this).val() == "" || isNaN($(this).val()) || $(this).val() < 0) {
			errorTip("请输入有效行数");
		}
	}).on("click", ".icon-style label", function() {
		/*改变轮播图下边滚动效果*/
		$(this).parents(".model").find(".rolling-style").attr("class", "rolling-style " + $(this).children('input').val());
		if($(this).children('input').val() == "thumbnailLists") {
			if(!$(this).parents(".model").find(".rolling-style li a").length) {
				for(var j = 0; j < $(this).parents(".model").find(".picture").length; j++) {
					var A = document.createElement("a");
					A.href = "javascript:;";
					var Img = document.createElement("img");
					Img.src = "images/air_03.jpg";
					A.appendChild(Img);
					$(this).parents(".model").find(".rolling-style li").eq(j).append(A);
				}
				var num = (100 / $(this).parents(".model").find(".picture").length).toFixed(2);
				if($(this).parents(".model").find(".picture").length == 6 || $(this).parents(".model").find(".picture").length == 7) {
					num -= 0.01;
				}
				$(this).parents(".model").find(".rolling-style li").removeAttr("style");
				$(this).parents(".model").find(".rolling-style li").css("width", num + "%");
				$(this).parents(".model").find(".pictureSlide").addClass("thumb-mod");
			}
		} else {
			if($(this).parents(".model").find(".rolling-style li a").length) {
				$(this).parents(".model").find(".rolling-style li a").remove();
				$(this).parents(".model").find(".tab").height($(this).parents(".model").find(".picture").height());
				$(this).parents(".model").find(".rolling-style li").removeAttr("style");
				$(this).parents(".model").find(".pictureSlide").removeClass("thumb-mod");
			}
		}
		changeJson($(this));
		jsonBox.model.tabs[0].iconStyle = $(this).children('input').val();
	}).on('click', '.time-direction label', function () {
		// 改变时间轴方向
		$(this).parents('.model').find('.tab.active').attr('class', 'tab active time-' + $(this).children('input').val())
		if ($(this).children('input').val() == 'horizontal' && !$(this).parents('.model').find('.time-right p').length) {
			$(this).parents('.model').find('.time-right').addClass('onlyTitle')
		} else if ($(this).children('input').val() == 'vertical') {
			$(this).parents('.model').find('.time-right').removeClass('onlyTitle')
		}
		setTimeAxisWidth($(this).parents('.model'))
		changeJson($(this));
		jsonBox.model.tabs[0].timeDirection = $(this).children('input').val();
	}).on('click', '.time-style label', function () {
		// 改变时间轴模块时间显示样式
		$(this).parents('.model').find('.lists').attr('data-timeStyle', $(this).children('input').val())
		$(this).parents('.model').find('.time-left .date').html(setTimeStyle($(this).children('input').val()))
		setTimeAxisWidth($(this).parents('.model'))
		changeJson($(this))
		jsonBox.model.tabs[0].timeStyle = $(this).children('input').val();
	}).on("click", ".alignment label", function() {
		/*调整文字列表对齐方式*/
		if($(this).parents(".col-draggable").find(".tab-nav").length) {
			$(this).parents(".col-draggable").find(".tab").attr("class", "tab tab-nav clearfix active " + $(this).children('input').val());
			if($(this).children('input').val() == "full") {
				for(var i = 0; i < $(this).parents(".col-draggable").find(".lists").length; i++) {
					var num = (100 / $(this).parents(".col-draggable").find(".lists").eq(i).find(".item").length).toFixed(2);
					if($(this).parents(".col-draggable").find(".lists").eq(i).find(".item").length == 6 || $(this).parents(".col-draggable").find(".lists").eq(i).find(".item").length == 7) {
						num -= 0.01;
					}
					$(this).parents(".col-draggable").find(".lists").eq(i).find(".item").css("width", num + "%");
				}

			} else {
				$(this).parents(".col-draggable").find(".item").removeAttr("style");
			}
			changeJson($(this));
			jsonBox.model.alignment = $(this).children('input').val();
		} else {
			if ($(this).parents('.col-draggable').find('.model').hasClass('offer-candle')) {
				var arr = $(this).parents('.col-draggable').find(".model .tab.active").attr("class").split(" "),
					ali = new RegExp("text-");
				for(var j = 0; j < arr.length; j++) {
					if(ali.test(arr[j])) {
						arr[j] = $(this).children('input').val();
					}
				}
				$(this).parents('.col-draggable').find(".model .tab.active").attr("class", arr.join(" "))
				changeJson($(this));
				jsonBox.model.alignment = $(this).children('input').val()
			} else {
				var arr = $(this).parents(".model").find(".tab.active .lists").attr("class").split(" "),
					ali = new RegExp("text-");
				for(var j = 0; j < arr.length; j++) {
					if(ali.test(arr[j])) {
						arr[j] = $(this).children('input').val();
					}
				}
				$(this).parents(".model").find(".tab.active .lists").attr("class", arr.join(" "));
				changeJson($(this));
				var ind = 0;
				if($(this).parents(".ui-draggable").eq(0).find(".content-bar").length) {
					ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index() - 1;
				} else {
					ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index();
				}
				jsonBox.model.tabs[ind].alignment = $(this).children('input').val();
			}
		}
	}).on("click", ".prefix-style label", function() {
		/*前缀样式切换*/
		var Li;
		if($(this).parents(".model").find("li.tab.active li.item li").length) {
			Li = "li.tab.active li.item li a";
		} else {
			Li = "li.tab.active li.item a";
		}
		var arr = $(this).parents(".model").find(".tab.active .lists").attr("class").split(" "),
			pre = new RegExp("prefix-");
		for(var j = 0; j < arr.length; j++) {
			if(pre.test(arr[j])) {
				arr[j] = $(this).children('input').val();
			}
		}
		$(this).parents(".model").find(".tab.active .lists").attr("class", arr.join(" "));
		if($(this).parents(".model").find("li.tab.active i").length) {
			if($(this).children('input').val() == "prefix-none" || $(this).children('input').val() == "prefix-number") {
				$(this).parents(".model").find("li.tab.active i").remove();
			} else if($(this).children('input').val() == "prefix-icon") {
				$(this).parents(".model").find("li.tab.active i").attr("class", "glyphicon glyphicon-record");
			} else if($(this).children('input').val() == "prefix-disc" || $(this).children('input').val() == "has") {
				$(this).parents(".model").find("li.tab.active i").removeAttr("class");
			}
		} else {
			if($(this).children('input').val() == "prefix-disc" || $(this).children('input').val() == "has") {
				$(this).parents(".model").find(Li).prepend("<i></i>");
			} else if($(this).children('input').val() == "prefix-icon") {
				$(this).parents(".model").find(Li).prepend("<i class='glyphicon glyphicon-record'></i>");
			}
		}
		if($(this).parents('.model').hasClass('text-title') || $(this).parents('.model').hasClass('file-download') || $(this).parents('.model').hasClass('text-titleCont')) {
			adjustWidth($(this).parents(".model"))
		}

		changeJson($(this));
		var ind = 0;
		if($(this).parents(".ui-draggable").eq(0).find(".content-bar").length) {
			ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index() - 1;
		} else {
			ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index();
		}
		jsonBox.model.tabs[ind].prefixStyle = $(this).children('input').val();
	}).on("click", ".date-display label", function() {
		/*是否显示日期*/
		var parent;
		var item = $(this).parents(".model").find(".tab.active .item")
		if($(this).parents(".model").hasClass("text-title") || $(this).parents(".model").hasClass("file-download")) {
			parent = item.children("a");
		} else if($(this).parents(".model").hasClass("text-titleCont")) {
			parent = item.find("h3>a");
		}
		changeJson($(this));
		var ind = 0;
		if($(this).parents(".ui-draggable").eq(0).find(".content-bar").length) {
			ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index() - 1;
		} else {
			ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index();
		}
		var reservedDistance
		if(item.find('i').length) {
			reservedDistance = 33 //23+10 图标占位及标题与日期间余留距离
		} else {
			reservedDistance = 10 //标题与日期间余留距离
		}
		var dateWidth = item.width() - reservedDistance;
		if($(this).children('input').val() == "none") {
			if(parent.eq(0).children(".title-date").length) {
				parent.children(".title-date").remove();
				jsonBox.model.tabs[ind].dateDisplay = $(this).children('input').val();
			}
		} else {
			var canCreate
			if((dateWidth - 75) / item.width() >= 0.6) {
				dateWidth -= 75
				canCreate = true
			}
			if(!parent.eq(0).children(".title-date").length) {
				if(canCreate) {
					var span = document.createElement("span");
					span.className = "title-date";
					span.innerHTML = "2017-6-26";
					parent.append(span);
					$(this).children('input').val((dateWidth / item.width()).toFixed(4) * 100 + "%");
					jsonBox.model.tabs[ind].dateDisplay = (dateWidth / item.width()).toFixed(4) * 100 + "%";
				} else {
					$(this).removeClass("checked").siblings("label").addClass("checked");
					/*item.find(".title-text").css("width", "100%");*/
					jsonBox.model.tabs[ind].dateDisplay = "none";
					errorTip("当前模块大小不足以显示日期");
				}
			}
		}
		item.find(".title-text").css("width", (dateWidth / item.width()).toFixed(4) * 100 + "%");
	}).on("click", ".fill-style label", function() {
		/*改变图片填充样式*/
		if($(this).children('input').val() == "full") {
			if($(this).parents(".model").find("li.tab.active").hasClass("adaptive")) {
				$(this).parents(".model").find("li.tab.active").removeClass("adaptive").addClass("full");
			}
		} else if($(this).children('input').val() == "adaptive") {
			if($(this).parents(".model").find("li.tab.active").hasClass("full")) {
				$(this).parents(".model").find("li.tab.active").removeClass("full").addClass("adaptive");
			}
		}
		$(this).parents(".model").find(".tab.active .item").each(function() {
			widthCenter(this);
		});
		changeJson($(this));
		var ind = 0;
		if($(this).parents(".ui-draggable").eq(0).find(".content-bar").length || $(this).parents(".model").hasClass("pic-slide")) {
			ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index() - 1;
		} else {
			ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index();
		}
		jsonBox.model.tabs[ind].fillStyle = $(this).children('input').val();
	}).on('click', '.mouse-move label', function() {
		/*鼠标移动行为切换*/
		if($(this).children('input').val() == 'no-action') {
			if($(this).parents('.model').find('li.tab.active').hasClass('scale')) {
				$(this).parents('.model').find('li.tab.active').removeClass('scale').addClass('no-action')
			}
		} else if($(this).children('input').val() == 'scale') {
			if($(this).parents('.model').find('li.tab.active').hasClass('no-action')) {
				$(this).parents('.model').find('li.tab.active').removeClass('no-action').addClass('scale')
			}
		}
		changeJson($(this));
		var ind = 0;
		if($(this).parents(".ui-draggable").eq(0).find(".content-bar").length || $(this).parents(".model").hasClass("pic-slide")) {
			ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index() - 1;
		} else {
			ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index();
		}
		jsonBox.model.tabs[ind].mouseMove = $(this).children('input').val()
	}).on('click', '.mouse-click label', function() {
		/*鼠标点击行为切换*/
		if($(this).children('input').val() == 'to-details') {
			if($(this).parents('.model').find('li.tab.active').hasClass('no-click-action')) {
				$(this).parents('.model').find('li.tab.active').removeClass('no-click-action').addClass('to-details')
			} else if($(this).parents('.model').find('li.tab.active').hasClass('to-link')) {
				$(this).parents('.model').find('li.tab.active').removeClass('to-link').addClass('to-details')
			}
		} else if($(this).children('input').val() == 'no-action') {
			if($(this).parents('.model').find('li.tab.active').hasClass('to-details')) {
				$(this).parents('.model').find('li.tab.active').removeClass('to-details').addClass('no-click-action')
			} else if($(this).parents('.model').find('li.tab.active').hasClass('to-link')) {
				$(this).parents('.model').find('li.tab.active').removeClass('to-link').addClass('no-click-action')
			}
		} else if($(this).children('input').val() == 'to-link') {
			if($(this).parents('.model').find('li.tab.active').hasClass('to-details')) {
				$(this).parents('.model').find('li.tab.active').removeClass('to-details').addClass('to-link')
			} else if($(this).parents('.model').find('li.tab.active').hasClass('no-click-action')) {
				$(this).parents('.model').find('li.tab.active').removeClass('no-click-action').addClass('to-link')
			}
		}
		changeJson($(this));
		var ind = 0;
		if($(this).parents(".ui-draggable").eq(0).find(".content-bar").length || $(this).parents(".model").hasClass("pic-slide")) {
			ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index() - 1;
		} else {
			ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index();
		}
		jsonBox.model.tabs[ind].mouseClick = $(this).children('input').val()
	}).on('click', '.link-way label', function() {
		/*链接跳转行为切换*/
		if($(this).children('input').val() == 'current-page') {
			if($(this).parents('.model').find('li.tab.active').hasClass('new-page')) {
				$(this).parents('.model').find('li.tab.active').removeClass('new-page').addClass('current-page')
			}
		} else if($(this).children('input').val() == 'new-page') {
			if($(this).parents('.model').find('li.tab.active').hasClass('current-page')) {
				$(this).parents('.model').find('li.tab.active').removeClass('current-page').addClass('new-page')
			}
		}
		changeJson($(this));
		var ind = 0;
		if($(this).parents(".ui-draggable").eq(0).find(".content-bar").length || $(this).parents(".model").hasClass("pic-slide")) {
			ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index() - 1;
		} else {
			ind = $(this).parents(".ui-draggable").eq(0).find("li.tab.active").index();
		}
		jsonBox.model.tabs[ind].linkWay = $(this).children('input').val()
	}).on("click", ".tabs-display label", function() {
		/*有无选项卡切换*/
		if($(this).children('input').val() == "block") {
			if(!$(this).parents(".template-handle").siblings(".view").find(".content-bar.title").length) {
				var contentBar = document.createElement("li");
				contentBar.className = "content-bar title";
				var tName = $(this).parents(".col-draggable").find("li.tab.active").attr("data-tabName");
				if(tName) {
					contentBar.innerHTML = "<ul class='clearfix pull-left'><li class='content-bar_click'><span>" + tName + "</span></li></ul><i class='handleLabel'></i><a href='javascript:;' style='float:right;'><i class='more-text'>更多&gt;</i></a>";
				} else {
					contentBar.innerHTML = "<ul class='clearfix pull-left'><li class='content-bar_click'><span>添加页签名</span></li></ul><i class='handleLabel'></i><a href='javascript:;' style='float:right;'><i class='more-text'>更多&gt;</i></a>";
				}
				$(this).parents(".template-handle").siblings(".view").children().prepend(contentBar);
				$(this).parent().siblings("form").removeClass("disabled").children().eq(1).addClass("checked").parent().next().children().eq(1).addClass("checked");
			}
		} else if($(this).children('input').val() == "none") {
			$(this).parents(".template-handle").siblings(".view").find(".content-bar.title").remove();
			$(this).parent().siblings("form").addClass("disabled").children(".checked").removeClass("checked");
		}
		changeJson($(this));
		jsonBox.model.tabsDisplay = $(this).children('input').val();
	}).on("click", ".tabs-style label", function() {
		/*选项卡样式切换*/
		if($(this).children('input').val() == "horizontal" && $(this).parents(".template-handle").siblings(".view").find(".content-bar .more").length) {
			var Ul = document.createElement("ul");
			$(Ul).append($(this).parents(".template-handle").siblings(".view").find(".content-bar").find(".menu>li"));
			$(this).parents(".template-handle").siblings(".view").find(".content-bar i.handleLabel").before(Ul);
			$(this).parents(".template-handle").siblings(".view").find(".content-bar .more").remove();
		} else if($(this).children('input').val() == "dropdown" && !$(this).parents(".template-handle").siblings(".view").find(".content-bar .more").length) {
			$(this).parents(".template-handle").siblings(".content-handle").css("margin-left", 0);
			var Div = document.createElement("div");
			Div.className = "more";
			var H3 = document.createElement("h3");
			H3.className = "left";
			var Strong = document.createElement("strong");
			Strong.innerHTML = $(this).parents(".template-handle").siblings(".view").find(".content-bar .content-bar_click>span").text();
			H3.appendChild(Strong);
			var I = document.createElement("i");
			H3.appendChild(I);
			Div.appendChild(H3);
			var Menu = $(this).parents(".template-handle").siblings(".view").find(".content-bar").find("ul")[0];
			if($(Menu).find(".content-handle").length) {
				$(Menu).find(".content-handle").remove();
			}
			Menu.className = "menu";
			Div.appendChild(Menu);
			$(this).parents(".template-handle").siblings(".view").find(".content-bar").find("i.handleLabel").before(Div);
		}
		changeJson($(this));
		jsonBox.model.tabsStyle = $(this).children('input').val();
	}).on('click', '.tabs-center label', function () {
		//选项卡是否居中
		if ($(this).children('input').val() == 'no') {
			$(this).parents('.col-draggable').find('.content-bar').removeClass('text-center')
		} else {
			$(this).parents('.col-draggable').find('.content-bar').addClass('text-center')
		}
		changeJson($(this));
		jsonBox.model.tabsCenter = $(this).children('input').val();
	}).on("click", ".more-style label", function() {
		/*"更多"样式设置*/
		var moreVal = $(this).children('input').val(), moreObj = $(this).parents(".template-handle").siblings(".view").find(".content-bar")
		if (moreVal == 'none' && moreObj.find('a').length) {
			moreObj.find('a').remove()
		} else if (moreVal != 'none') {
			if (!moreObj.find('a').length) {
				var a = document.createElement('a')
				a.href = 'javascript:;'
				a.innerHTML = '<i></i>'
				moreObj.append(a)
			}
			moreObj.find('a i').attr("class", moreVal);
			if(moreVal == "more-text") {
				moreObj.find('a i').html("更多&gt;");
			} else if(moreVal == "iconLeft") {
				moreObj.find('a i').html("");
			} else if(moreVal == "iconArrow") {
				moreObj.find('a i').html("");
			}
		}
		changeJson($(this));
		jsonBox.model.moreStyle = $(this).children('input').val();
	}).on("click", ".model i.handleLabel", function() {
		/*添加标签按钮*/
		if($(this).parents(".model").find(".tab-nav").length) {
			if($(this).parents(".model").hasClass("nav-classic") || $(this).parents(".model").hasClass("nav-footer")) {
				/*appendItem($(this), 4);*/
				appendItem($(this), 50);
			} else if($(this).parents(".model").hasClass("nav-button") || $(this).parents(".model").hasClass("nav-classicButton")) {
				/*appendItem($(this), 8);*/
				appendItem($(this), 50);
			} else if($(this).parents(".model").hasClass("nav-text")) {
				/*appendItem($(this), 7);*/
				appendItem($(this), 50);
			}

			function appendItem(that, num) {
				if(that.nextAll().length < num) {
					var Li = document.createElement("li");
					Li.className = "item";
					var A = document.createElement("a");
					A.href = "javascript:;";
					A.innerHTML = "添加页签名";
					Li.appendChild(A);
					that.parents(".lists").append(Li);
					if(that.parents(".model").find(".full").length) {
						var len = 100 / that.nextAll(".item").length.toFixed(2);
						if(that.nextAll(".item").length == 6 || that.nextAll(".item").length == 7) {
							len -= 0.01;
						}
						that.nextAll(".item").css("width", len.toFixed(2) + "%");
					}
				} else {
					errorTip("最多只能添加" + num + "个导航条");
				}
			}
		} else {
			$(this).parents(".view").siblings(".template-handle").find(".tabs-display").addClass("disabled").children(".checked").removeClass("checked");
			if($(this).siblings("ul").children("li").length < 50) {
				var Li = document.createElement("li");
				var span = document.createElement("span");
				span.innerHTML = "添加页签名";
				Li.appendChild(span);
				var li = document.createElement("li");
				if($(this).parents(".model").hasClass("pic-pictures") || $(this).parents(".model").hasClass("pic-slide")) {
					li.className = "li tab clearfix full no-action to-details current-page";
				} else if ($(this).parents(".model").hasClass("pictureText-surround") || $(this).parents(".model").hasClass("pictureText-crosswise") || $(this).parents(".model").hasClass("pictureText-vertical")) {
					li.className = "li tab clearfix full current-page";
				} else {
					li.className = "li tab clearfix";
				}
				if($(this).parents(".view").siblings(".template-handle").find(".tabs-style .checked input").val() == "horizontal") {
					$(this).prev("ul").append(Li);
				} else {
					$(this).siblings(".more").children(".menu").append(Li);
				}
				$(this).parents(".model")[0].appendChild(li);
			} else {
				errorTip("最多只能添加50个标签");
			}
		}
	});
});
/*限定某些数值范围*/
document.onselectstart = function(e) {
	e = e || window.event || arguments.callee.caller.arguments[0];
	if(e.target.tagName != "INPUT" && e.target.tagName != "SELECT") {
		return false
	}
};
document.onscroll = function() {
	var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft
	$(".modelBox")[0].style.left = -scrollX + "px";
};
document.onmousedown = function(e) {
	e = e || window.event || arguments.callee.caller.arguments[0];
	if($(e.target).parents().hasClass("modelBox")) {
		if($(e.target).hasClass("ui-draggable")) {
			dragElement = e.target;
		} else if($(e.target).parents().hasClass("ui-draggable")) {
			dragElement = $(e.target).parents(".ui-draggable")[0];
		}
	} else {
		/*判断拖动元素以及防止点击删除时触发事件*/
		if($(e.target).parents().hasClass("ui-draggable") && $(e.target).hasClass("drag")) {
			dragElement = $(e.target).parents(".ui-draggable")[0];
		}
		dragBox = $(e.target).parents(".ui-draggable").eq(0).parent()
		dragIndex = $(e.target).parents(".ui-draggable").eq(0).index()
	}
	if(dragElement) {
		mouseOffset = mouseOffsetElement(dragElement, e);
		dragStart(dragElement);
	}
	if(e.target.tagName != "INPUT" && e.target.tagName != "SELECT") {
		return false
	}
};
document.onmousemove = function(e) {
	e = e || window.event || arguments.callee.caller.arguments[0];
	if(dragElement) {
		/*判断拖动元素以及防止点击删除时触发事件*/
		if($(dragElement).parents().hasClass("demo")) {
			if($(dragElement).parent().hasClass("row-container") && !$(dragElement).siblings().length) {
				var Div = document.createElement("div");
				Div.className = "prompt-text";
				if($(dragElement).parent().parent().is("header")) {
					Div.innerHTML = "拖放布局添加到头部内容区域";
				} else if($(dragElement).parent().parent().is("section")) {
					Div.innerHTML = "拖放布局添加到主体内容区域";
				} else if($(dragElement).parent().parent().is("footer")) {
					Div.innerHTML = "拖放布局添加到底部内容区域";
				}
				$(dragElement).parent().append(Div);
			}
			changeJson($(dragElement));
			if($(dragElement).hasClass("row-draggable")) {
				if($(dragElement).parents(".row-draggable").length == 0) {
					removedJson = jsonBox[$(dragElement).index()];
					jsonBox.splice($(dragElement).index(), 1);
				} else if($(dragElement).parents(".row-draggable").length == 1) {
					if($(dragElement).siblings().length) {
						removedJson = jsonBox.layouts[$(dragElement).index()];
						jsonBox.layouts.splice($(dragElement).index(), 1);
					} else {
						removedJson = jsonBox.layouts[0];
						jsonBox.layouts = undefined;
					}
				}
				console.log(removedJson)
			} else {
				removedJson = jsonBox.model;
				jsonBox.model = undefined;
			}
			$(dragElement).remove();
		}
		var mousePosition = getMousePosition(e);
		drag(mousePosition);
		if(inDrop(e, $(".demo header")[0])) {
			/*外框为容器 可嵌套第一层*/
			removeDotted();
			dropBox = $(".demo header .container-box")[0];
		} else if(inDrop(e, $(".demo section")[0])) {
			removeDotted();
			dropBox = $(".demo section .container-box")[0];
		} else if(inDrop(e, $(".demo footer")[0])) {
			removeDotted();
			dropBox = $(".demo footer .container-box")[0];
		}
		for(var i = 0; i < $(dropBox).find(".column").length; i++) {
			if(inDrop(e, $(dropBox).find(".column")[i])) {
				removeDotted();
				/*第一层子元素做容器 可嵌套第二层*/
				dropBox = $(dropBox).find(".column")[i];
				for(var j = 0; j < $(dropBox).find(".column").length; j++) {
					if(inDrop(e, $(dropBox).find(".column")[j])) {
						removeDotted();
						/*第二层子元素做容器 可嵌套第三层*/
						dropBox = $(dropBox).find(".column")[j];
					}
				}
			}
		}
		if(dropBox) {
			if($(dropBox).parent().hasClass("demo")) {
				isIn = inDrop(e, dropBox)
			} else {
				isIn = inDrop(e, dropBox.parentNode.parentNode);
			}
			if(isIn) {
				/*虚线框*/
				dottedElement = document.createElement("div");
				dottedElement.className = "dotted";
				dottedElement.style.display = "block";
				dottedElement.style.border = "1.5px dashed #03a9f4";
				dottedElement.style.height = elementCopy.offsetHeight + "px";
				if(canAppend) {
					appendEle(e, dottedElement, dropBox);
					canAppend = false;
				}
			} else {
				removeDotted();
				dropBox = null;
			}
		}
	}
};
document.onmouseup = function(e) {
	e = e || window.event || arguments.callee.caller.arguments[0];
	if(dropBox) {
		if(($(dropBox).parents(".row").length == 0 && $(elementCopy).find(".row").length <= 2) || ($(dropBox).parents(".row").length < 2 && $(elementCopy).find(".row").length < 2) || $(elementCopy).children(".col-draggable").length) {
			/*如果布局嵌套层级小于二 或者嵌套层级为二时拖进的是内容模块*/
			dragCopy = $(elementCopy).children()[0].cloneNode(true);
			if($(dropBox).parents(".row").length == 0) {
				/*如果目标元素没有布局模块 只可拖进布局模块*/
				if($(dragCopy).hasClass("row-draggable")) {
					$(dragCopy).css('width', '1000px').find('.content-config').eq(0).css('display', 'inline-block').siblings('.row-config-box').find('.container-width input[value="adaptive"]').siblings('input').val('1000').removeAttr('readonly').parent().attr('class', 'checked').siblings('.checked').removeClass('checked').find('input[type="text"]').val('').attr('readonly', true)
					appendEle(e, dragCopy, dropBox);
					pickcolor(dragCopy)
					if($(dropBox).find(".prompt-text").length) {
						$(dropBox).find(".prompt-text").remove();
					}
					var size = [];
					for(var i = 0; i < $(dragCopy).find(".column").length; i++) {
						size.push($(dragCopy).find(".column")[i].className.slice(14))
					}
					if(dropBox.className == "container-box") {
						changeJson($(dragCopy));
						if($(dragCopy).find(".ui-draggable").length) {
							if(jsonBox == []) {
								jsonBox[0] = removedJson;
								removedJson = {};
							} else {
								// 减掉虚线框的占位
								jsonBox.splice($(dragCopy).index() - 1, 0, removedJson);
								removedJson = {};
							}
						} else {
							var widthCss = JSON.stringify({'width': '1000px'})
							if(jsonBox == []) {
								jsonBox.push({
									layout: [],
									style: {
										'css': widthCss
									}
								});
							} else {
								jsonBox.splice($(dragCopy).index() - 1, 0, {
									layout: [],
									style: {
										'css': widthCss
									}
								});
							}
							for(var j = 0; j < $(dragCopy).find(".row").eq(0).children(".column").length; j++) {
								jsonBox[$(dragCopy).index() - 1].layout.push({
									size: $(dragCopy).find(".row").eq(0).children(".column")[j].className.slice(14)
								});
							}
						}
					}
				} else {
					errorTip("请先插入容器模块");
					restoreDragPosition()
				}
			} else {
				if(($(dragCopy).hasClass("col-draggable") && !$(dropBox).children(".ui-draggable").length) || ($(dragCopy).hasClass("row-draggable") && !$(dropBox).children(".col-draggable").length)) {
					appendEle(e, dragCopy, dropBox);
					pickcolor(dragCopy)
					if($(dragCopy).find(".model").hasClass("pic-slide")) {
						$(dragCopy).find(".picture").width($(dragCopy).find(".tab").width());
						$(dragCopy).find(".pic-slide .pictureSlide").each(function() {
							widthCenter($(this).parent(".item"))
							pictureSlide(this);
						});
					}
					$(dragCopy).find(".tab.active .item").each(function() {
						widthCenter(this);
					});
					adjustWidth($(dragCopy).find('.text-title'))
					adjustWidth($(dragCopy).find('.text-titleCont'))
					if ($(dragCopy).find(".model").hasClass("timer-axis")) {
						setTimeAxisWidth($(dragCopy).find(".timer-axis"))
					}
					changeJson($(dragCopy));
					if($(dragCopy).hasClass("row-draggable")) {
						// 拖动的是布局模块
						$(dragCopy).css({'width': '','min-width': ''})/*.find('.row-config-box .container-width').hide()*/
						if($(dragCopy).find(".ui-draggable").length) {
							// 里边含有子模块
							/*if(removedJson.style) {
								removedJson.style = undefined
							}*/
							if(jsonBox.layouts) {
								jsonBox.layouts.splice($(dragCopy).index() - 1, 0, removedJson);
								removedJson = {};
							} else {
								jsonBox["layouts"] = []
								jsonBox["layouts"][0] = removedJson;
								removedJson = {};
							}
						} else {
							// 无子模块
							if (JSON.stringify(removedJson) == "{}" || !removedJson) {
								removedJson = {layout: [],style:{'css': ''}}
							} else {
								if ($('dropBox').parents('.row-draggable').eq(0).find('.container-width label.checked input[type="radio"]').val() == 'limit') {
									var json = JSON.parse(removedJson.style.css)
									json.width = undefined
									json['min-width'] = undefined
									removedJson.style.css = JSON.stringify(json)
								}
							}
							if(jsonBox.layouts) {
								jsonBox.layouts.splice($(dragCopy).index() - 1, 0, removedJson);
							} else {
								jsonBox["layouts"] = []
								jsonBox["layouts"][0] = removedJson;
							}
							if (!removedJson.layout.length) {
								for(var l = 0; l < $(dragCopy).find(".column").length; l++) {
									jsonBox.layouts[$(dragCopy).index() - 1].layout.push({
										size: $(dragCopy).find(".column")[l].className.slice(14)
									});
								}
							}
						}
					} else {
						// 拖动的是内容模块
						if(JSON.stringify(removedJson) == "{}" || !removedJson) {
							var name = $(dragCopy).find(".view").children().attr("class").slice(6),
								jsonStr;
							var marginCss = JSON.stringify({'margin': '5px'})
							if($(dragCopy).find(".tab-nav").length) {
								var alignment = $(dragCopy).find(".alignment .checked input").val(),
									tabCol = [];
								for(var x = 0; x < $(dragCopy).find("ol.lists").length; x++) {
									tabCol.push($(dragCopy).find("ol.lists").eq(x).find("li.item").length);
								}
								if($(dragCopy).find(".nav-searchBox").length || $(dragCopy).find(".nav-visitcount").length || $(dragCopy).find(".offer-candle").length) {
									tabCol = [1];
								}
								jsonStr = {
									name: name,
									tabCol: tabCol,
									tabs: [],
									alignment: alignment,
									style: {css: marginCss}
								};
							} else {
								var tabsDisplay = $(dragCopy).find(".tabs-display .checked input").val();
								var tabsStyle = $(dragCopy).find(".tabs-style .checked input").val();
								var moreStyle = $(dragCopy).find(".more-style .checked input").val();
								var tabsCenter = $(dragCopy).find(".tabs-center .checked input").val();
								jsonStr = {
									name: name,
									tabs: [],
									tabsDisplay: tabsDisplay,
									tabsStyle: tabsStyle,
									tabsCenter: tabsCenter,
									moreStyle: moreStyle,
									style: {css: marginCss}
								};
							}
							if ($(dragCopy).find('.offer-candle').length) {
								jsonStr['contentId'] = ''
							}
							jsonBox["model"] = jsonStr;
						} else {
							jsonBox["model"] = removedJson;
						}
					}
				} else {
					errorTip("容器内只可插入一个模块");
					restoreDragPosition()
				}
			}
		} else {
			errorTip("容器元素只可嵌套两层");
			restoreDragPosition()
		}
	}
	removeDotted();
	reset();
	if(e.target.tagName != "INPUT" && e.target.tagName != "SELECT") {
		return false
	}
};

//获取CMS配置类型sourceTypeObj
function getCMSSourceType() {
	var sourceTypeObj = $(".cms-config-box .navbar-cms li.active");
	return sourceTypeObj;
}

//获取CMS配置的sourceInfo信息
function getCMSSource(sourceType) {
	if(!sourceType || sourceType.length === 0) return null;
	var stname = sourceType.text();
	var index = sourceType.index();
	var sourceInfoObj = sourceType.parent().siblings('.resources-content').children().eq(index);
	if(stname == "分类") {
		var ns = getCatelogs();
		if(ns.length == 0) {
			flashAlert($("#flashalert"), "请选择一个分类标签名称");
			return null;
		}
		var tabName = sourceType.parent().siblings('.custom-tabName').find('input').val();
		/*if(!checkCMSLength(tabName, 0, 6)) return null;*/
		if (!$('.cms-config-box.active').parents('.model').hasClass('timer-axis')) {
			if(!checkCMSLength(tabName, 0)) return null;
		}
		return {
			sourceType: stname,
			sourceName: ns.join("/"),
			tabName: tabName
		};
	} else if(stname == "标签") {
		var ts = getTags();
		if(ts.length == 0) {
			flashAlert($("#flashalert"), "请至少选择一个标签名称");
			return null;
		} else if(ts.length > 5) {
			flashAlert($("#flashalert"), "请至多选择五个标签名称");
			return null;
		}
		var tabName = sourceType.parent().siblings('.custom-tabName').find('input').val();
		/*if(!checkCMSLength(tabName, 0, 6)) return null;*/
		if (!$('.cms-config-box.active').parents('.model').hasClass('timer-axis')) {
			if(!checkCMSLength(tabName, 0)) return null;
		}
		return {
			sourceType: stname,
			sourceName: ts.join("|"),
			tabName: tabName
		};
	} else if(stname == "网站页面") {
		var pageNameObj = sourceInfoObj.find('li.active');
		if(pageNameObj.length == 0) {
			flashAlert($("#flashalert"), "请选择一个网站页面名称");
			return null;
		}
		var tabName = sourceType.parent().siblings('.custom-tabName').find('input').val();
		var navLink = sourceType.parent().siblings('.resources-content').find('li.active').attr('data-link');
		/*if(!checkCMSLength(tabName, 0, 6)) return null;*/
		if(!checkCMSLength(tabName, 0)) return null;
		return {
			sourceType: stname,
			sourceName: pageNameObj.text(),
			tabName: tabName,
			link: navLink
		};
	} else if(stname == "链接") {
		var navName = sourceInfoObj.find('.custom-navName').val();
		var navLink = sourceInfoObj.find('.custom-navLink').val();
		/*if(!checkCMSLength(navName, 0, 6, '自定义链接名称')) return null;
		if(!checkCMSLength(navLink, 0, 500, '自定义链接')) return null;*/
		if(!checkCMSLength(navName, 0, '自定义链接名称')) return null;
		if(!checkCMSLength(navLink, 0, '自定义链接')) return null;
		return {
			sourceType: stname,
			tabName: navName,
			link: navLink
		};
	} else if(stname == '文本') {
		var tabName = sourceType.parent().siblings('.custom-tabName').find('input').val();
		/*if(!checkCMSLength(tabName, 0, 50, "文本")) return null;*/
		if(!checkCMSLength(tabName, 0, "文本")) return null;
		return {
			sourceType: stname,
			tabName: tabName
		};
	} else if(stname == '菜单') {
		var menuName = sourceInfoObj.find('.custom-menu-title').val();
		/*if(!checkCMSLength(menuName, 0, 6, "自定义菜单名称")) return null;*/
		if(!checkCMSLength(menuName, 0, "自定义菜单名称")) return null;
		var itemObj = sourceInfoObj.find('.custom-menu-item').children('input');
		var names = itemObj.filter('.custom-menu-itemName');
		if(names.length == 0) {
			flashAlert($("#flashalert"), "请至少添加一个菜单项");
			return null;
		}
		var links = itemObj.filter('.custom-menu-itemLink');
		var menu = [];
		for(var y = 0; y < names.length; y++) {
			var name = names.eq(y).val(),
				link = links.eq(y).val();
			for(var j = 0; j < menu.length; j++) {
				if(name == menu[j].name) {
					flashAlert($("#flashalert"), "菜单项的名称不能重复");
					return null;
				}
			}
			/*if(!checkCMSLength(name, 0, 6, "自定义菜单项名称")) return null;
			if(!checkCMSLength(link, 0, 500, '自定义链接')) return null;*/
			if(!checkCMSLength(name, 0, "自定义菜单项名称")) return null;
			if(!checkCMSLength(link, 0, '自定义链接')) return null;
			menu.push({
				name: name,
				link: link
			});
		}
		return {
			sourceType: stname,
			tabName: menuName,
			menu: menu
		};
	}
	console.log("未知的CMS源类型", stname);
	return null;
}

//判断CMS中自定义内容输入文字长度，并给出提示。
/*function checkCMSLength(name, minLen, maxLen, premsg) {
	if(!premsg) premsg = '自定义名称';
	if(!name) {
		flashAlert($("#flashalert"), premsg + '为空，请设置一个长度小于' + maxLen + '的文字');
		return false;
	} else if(name.length <= minLen) {
		flashAlert($("#flashalert"), premsg + '为空，请设置一个长度小于' + maxLen + '的文字');
		return false;
	} else if(getByteLen(name) > maxLen) {
		flashAlert($("#flashalert"), premsg + '长度不能超过' + maxLen);
		return false;
	}
	return true;
}*/
function checkCMSLength(name, minLen, premsg) {
	if(!premsg) premsg = '自定义名称';
	if(!name) {
		flashAlert($("#flashalert"), premsg + '为空，请设置' + premsg);
		return false;
	} else if(name.length <= minLen) {
		flashAlert($("#flashalert"), premsg + '为空，请设置' + premsg);
		return false;
	}
	return true;
}

//在指定位置alertObj显示错误提示message,显示duration毫秒后消失
function flashAlert(alertObj, message, duration) {
	if(!alertObj) {
		alert(message);
		return;
	}
	if(!duration) duration = 5000;
	alertObj.html(message);
	alertObj.show(300);
	alertObj.delay(duration).fadeOut(1000);
}

//生成导航栏上每个按钮的html
function makeNavItem(obj, index, o) {
	if(!obj) return "";
	var tab = obj.tabs[index];
	var HTML = "<li class='item";
	if(tab) {
		if(tab.menu || (tab.sourceType == "分类" && tab.sourceName.split("/").length <= 2)) {
			HTML += " character";
		}
	}
	HTML += "'";
	if(obj.name == "nav-button" || obj.name == "nav-classicButton" || obj.name == "nav-text") {
		if(obj.alignment == "full" || !obj.alignment) {
			var num = (100 / obj.tabCol[o]).toFixed(2);
			if(obj.tabCol[o] == 6 || obj.tabCol[o] == 7) {
				num -= 0.01;
			}
			HTML += " style='width:" + num + "%'";
		}
	}
	if(tab) {
		HTML += " data-sourceType='" + tab.sourceType;
		HTML += "' data-tabName='" + tab.tabName;
		if(tab.sourceName)
			HTML += "' data-sourceName='" + tab.sourceName;
		if(tab.link)
			HTML += "' data-link='" + tab.link;
		HTML += "'><a href='";
		if(tab.menu || (tab.sourceType == "分类" && tab.sourceName.split("/").length == 1)) {
			HTML += "javascript:;";
		} else {
			if(tab.link) {
				HTML += tab.link;
			} else {
				HTML += "javascript:;";
			}
		}
		if(tab.tabName) {
			HTML += "'>" + tab.tabName + "</a>";
		} else {
			HTML += "'>添加页签名</a>";
		}
		if(tab.menu) {
			HTML += "<span class='bot'></span><ul class='nav-show";
			if(tab.menu.length > 4) {
				HTML += " hover_nav";
			} else {
				HTML += " vertical-nav";
			}
			HTML += "'>";
			for(var q = 0; q < tab.menu.length; q++) {
				HTML += "<li><a href='" + tab.menu[q].link + "'>" + tab.menu[q].name + "</a></li>";
			}
			HTML += "</ul>";
		}
		//TODO 将分类展开为菜单
		if(tab.sourceType == "分类" && tab.sourceName.split("/").length <= 2) {
			console.log("TODO 将分类展开为菜单");
		}

	} else {
		HTML += "><a href='javascript:;'>添加页签名</a>";
	}
	HTML += "</li>";
	return HTML;
}

$(function() {
	var manageId; //存储管理员Id
	var systemId; //配置文件
	//导航栏点击事件
	function navClick() {
		$('#nav-ul li .header').off('click').on('click', function() {
			var id = $(this).parent().attr('data-id');
			switch(id) {
				case 'tag':
					window.location = 'assort-tag.html'
					break;
				case 'contentInput':
					if($(this).parent().find('.content').css('display') == 'none') {
						$(this).parent().parent().find('.content').slideUp();
						$(this).parent().parent().find('.header>span').removeClass('click-arrow-icon').addClass('arrow-icon');
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
						$(this).parent().parent().find('.header>span').removeClass('click-arrow-icon').addClass('arrow-icon');
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
						$(this).parent().parent().find('.header>span').removeClass('click-arrow-icon').addClass('arrow-icon');
						$(this).parent().find('.content').slideDown();
						$(this).find('span').addClass('click-arrow-icon').removeClass('arrow-icon');
					} else {
						$(this).parent().find('.content').slideUp();
						$(this).find('span').removeClass('click-arrow-icon').addClass('arrow-icon');
					}
					break
				case 'web':
					if(location.pathname == '/login' || location.pathname == '/aibws.html') {
						if($(this).parent().find('.content').css('display') == 'none') {
							$(this).parent().parent().find('.content').slideUp();
							$(this).parent().parent().find('.header>span').removeClass('click-arrow-icon').addClass('arrow-icon');
							$(this).parent().find('.content').slideDown();
							$(this).find('span').addClass('click-arrow-icon').removeClass('arrow-icon');
						} else {
							$(this).parent().find('.content').slideUp();
							$(this).find('span').removeClass('click-arrow-icon').addClass('arrow-icon');
						}
					} else {
						window.location = 'aibws.html';
					}
					break
			}
			return false;
		})
		//内容录入处理函数
		$('#article').on('click', function() {
			window.location = 'content-article.html'
			return false; //阻止冒泡
		})
		$('#gallery').on('click', function() {
			window.location = 'content-gallery.html'
			return false; //阻止冒泡
		})
		$('#vedio').on('click', function() {
			window.location = 'content-video.html'
			return false; //阻止冒泡
		})
		$('#music').on('click', function() {
			window.location = 'content-music.html'
			return false; //阻止冒泡
		})
		$('#topic').on('click', function() {
			window.location = 'content-subject.html'
			return false; //阻止冒泡
		})
		$('#bookessay').on('click', function() {
			window.location = 'content-book.html'
			return false; //阻止冒泡
		})
		$('#playreport').on('click', function() {
			window.location = 'content-live.html'
			return false; //阻止冒泡
		})
		//媒资中心处理函数
		$('#media-pic').on('click', function() {
			window.location = 'media-pic.html';
			return false; //阻止冒泡
		})
		$('#media-video').on('click', function() {
			window.location = 'media-video.html';
			return false; //阻止冒泡
		})
		$('#media-music').on('click', function() {
			window.location = 'media-music.html';
			return false; //阻止冒泡
		})
		$('#media-file').on('click', function() {
			window.location = 'media-file.html';
			return false; //阻止冒泡
		})
		//管理中心处理函数
		$('#manage-user').on('click', function() {
			window.location = 'management-register.html';
			return false; //阻止冒泡
		})
		$('#manage-comment').on('click', function() {
			window.location = 'management-comment.html';
			return false; //阻止冒泡
		})
		$('#manage-manager').on('click', function() {
			window.location = 'management-manage.html';
			return false; //阻止冒泡
		})
		$('#manage-system').on('click', function() {
			window.location = 'management-system.html';
			return false; //阻止冒泡
		})
	}
	navClick(); //加在公共部分之后 才能绑定点击事件
	$('#main > .right').width($(window).width() - $('#nav-ul').width() - 34);
	$(window).resize(function() {
		$('#main > .right').width($(window).width() - $('#nav-ul').width() - 20);
	})
	/*顶部右侧头像start*/
	$(document).on('click', '#backLogin', function() {
		window.location.href = '/logout';
	})
	$(document).on('click', '#admin', function() {
		$(this).find('.list').toggle();
		return false;
	})
	//点击修改密码
	$(document).on('click', '#modefiyPassword', function() {
		$('#modifiy-psw').show();
		$('#mark').show();
		return false;
	})
	//点击文档对象
	$(document).on('click', function() {
		$('#admin .list').hide();
	})
	$(document).on('click', '#modifiy-psw', function() {
		return false;
	})
	/*顶部右侧头像end*/
	//获取公司名称
	function setCommpanyName() {
		$.ajax({
			type: "get",
			async: false,
			url: baseUrl + 'config/fullname',
			headers: {
				"Authorization": "Basic " + auth
			},
			success: function(data) {
				systemId = data._id; //设置系统id
				if(data != null && data.fullname != null) {
					//设置公司全称
					if(data.fullname != null) {
						$('#companyFullName').text(data.fullname);
					}
				} else {
					$('#company').show();
					$('#mark').show();
				}
			}
		});
	}
	setCommpanyName();
	//完善公司信息,点击保存
	$('#company .save').click(function() {
		var companyFull = $('#companyFull').val().trim();
		var companyShort = $('#companyShort').val().trim();
		if(companyFull == '') {
			errorTip('请输入公司全称')
			return;
		}
		if(companyShort == '') {
			errorTip('请输入公司简称')
			return
		}
		var obj = {};
		obj.fullname = companyFull;
		obj.shortname = companyShort;
		$.ajax({
			type: "patch",
			async: false,
			url: baseUrl + 'config/' + systemId,
			dataType: 'json', //返回值类型 一般设置为json
			contentType: "application/json;charset=UTF-8",
			data: JSON.stringify(obj),
			headers: {
				"Authorization": "Basic " + auth
			},
			success: function(data) {
				if(data._status == 'OK') {
					errorTip('保存成功');
					$('#company').hide();
					setCommpanyName(); //设置公司名称					
				}
			}
		});
	})
	//获取管理员Id
	function getManageId() {
		$.ajax({
			type: "get",
			async: false,
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
			async: false,
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
					$('#modifiy-psw').hide();
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
})
