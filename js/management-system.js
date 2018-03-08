init(); //初始化页面值
var editData;
var systemId;

function setStorage() {
	$.ajax({
		type: "get",
		url: 'get_datasize/all',
		dataType: 'json',
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
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

function getSystemList() {
	$.ajax({
		type: "get",
		url: baseUrl + 'config?projection={"默认固定页":0}',
		headers: {
			"Authorization": "Basic " + auth
		},
		beforeSend: function() {
			$("body").append('<div id="loading" class="loader-inner ball-clip-rotate" style="position:fixed;top:0;left:0;bottom:0;right:0;background-color: #000;opacity: .6;z-index: 10002;"><div style="position:fixed;left:50%;top:50%;"></div></div>')
		},
		success: function(data) {
			if(data._items != null && data._items.length != 0) {
				editData = data._items[0];
				var e = data._items[0];
				systemId = e._id; //设置系统id
				//设置公司全称
				$('#companyName').val(e.fullname);
				$('#companyFullName').text(e.fullname); //设置logo标题
				//设置公司简称
				$('#easycompanyName').val(e.shortname);
				//设置客服电话
				if(e['客服电话']) {
					$('#serviceTel').val(e['客服电话']);
				}
				$('#serviceTel')
				//设置logo
				if(e.logo) {
					$('#previewImg').attr('src', e.logo);
				} else {
					$('#previewImg').attr('src', 'img/add.png');
				}
				//设置默认语言
				var selectLang = e['默认语言'];
				var langStr;
				if(e['语言'] != null && e['语言'].length) {
					$.each(e['语言'], function(i, e) {
						langStr = '<tr><td><input type="radio" name="radio"/></td><td class="name" dataId="' + e.shortname + '">' + e.name + '</td><td><input type="text" value="' + e.taglength + '" class="taglen"/><span class="del"></span></td></tr>';
						$('#langSetBody').append(langStr);
						if(e.name === selectLang) {
							$('#langSetBody').find('tr').eq(i).find('input[type=radio]').prop('checked', true);
						}
						if(e.name == '简体中文' || e.name == '繁体中文') {
							$('#langSetBody').find('tr').eq(i).find('.del').hide();
						}
					});
				}
				//设置二维码	
				if(e.qrcodeurl) {
					$('#codepreviewImg').attr('src', e.qrcodeurl);
					$('#updowncode').parent().attr('href', e.qrcodeurl + '?filename=qrcode.png'); //设置下载二维码地址
				} else {
					$('#codepreviewImg').attr('src', 'img/add.png');
				}
				//设置用户注册规则
				if(e.active_after_registed == true) {
					$('#checkEndRule').prop('checked', true)
					$('#registerEndRule').prop('checked', false)
				} else {
					$('#checkEndRule').prop('checked', false)
					$('#registerEndRule').prop('checked', true)
				}
				//设置内容编辑规则
				if(e.publish_after_post == true) {
					$('#commentEndRule').prop('checked', true)
					$('#commentCheckEndRule').prop('checked', false)
				} else {
					$('#commentEndRule').prop('checked', false)
					$('#commentCheckEndRule').prop('checked', true)
				}
				//设置频道
				if(e['直播配置'] != null && e['直播配置'].length != 0) {
					$.each(e['直播配置'], function(i, e) {
						var str = '<div class="item">' +
							'<span class="need1">' + e['频道名称'] + '</span>:&nbsp;&nbsp;' +
							'<span>注入地址</span>:&nbsp;&nbsp;' +
							'<span class="need2">' + e['注入地址'] + '</span>&nbsp;&nbsp;' +
							'<span>播放地址</span>:&nbsp;&nbsp;' +
							'<span class="need3">' + e['播放地址'] + '</span>&nbsp;&nbsp;' +
							'<span class="del"></span>' +
							'</div>'
						$('#show-detail').append(str);
					})
				}
				//设置频道
				var levelData;
				if(e['会员级别设置'] != null && e['会员级别设置'].length != 0) {
					levelData = e['会员级别设置'][0]['设置'];
					$.each($('#levelSetTable input[type=checkbox]'), function(i, e) {
						if(levelData[i]['选择'] == true) {
							$(this).prop('checked', true);
						} else {
							$(this).prop('checked', false);
						}
						$(this).parent().parent().find('input[type=text]').val(levelData[i]['名称']);
						$(this).parent().parent().find('td').eq(1).text(levelData[i]['级别']);

					})
				}
				//设置本系统回调地址
				if(e['第三方登录设置'] != null && e['第三方登录设置'].length) {
					$.each(e['第三方登录设置'], function(i, e) {
						if(e.name == 'qq') {
							$('#qqCallbackUrl').text(e.callback_url); //设置回调地址
							$('#qqAppKey').val(e.app_key); //设置appkey
							$('#qqAppsecret').val(e.app_secret); //设置app_secret
							$('#qqStart').prop('checked', e.enable); //设置是否启用
						} else if(e.name == '微博') {
							$('#weboCallbackUrl').text(e.callback_url);
							$('#weboAppKey').val(e.app_key);
							$('#weboAppsecret').val(e.app_secret);
							$('#weboStart').prop('checked', e.enable); //设置是否启用
						} else if(e.name == '微信') {
							$('#wechatCallbackUrl').text(e.callback_url);
							$('#wechatAppKey').val(e.app_key);
							$('#wechatAppsecret').val(e.app_secret);
							$('#wechatStart').prop('checked', e.enable); //设置是否启用
						}
					});
				}
			}
		},
		complete: function() {
			$('#loading').remove();
		},
		error: function() {

		}
	});
}
getSystemList(); //初始化系统设置
//更新系统设置
function patchOrPostSystem() {
	var companyName = $('#companyName').val().trim();
	var easycompanyName = $('#easycompanyName').val().trim();
	var serviceTel = $('#serviceTel').val().trim();
	var lang = $('#lang').val();
	var imgid;
	var qrcodeurl;
	var selfList = [];
	var flag = true;
	var obj = {};
	//公司全称
	if(companyName != '') {
		if(companyName != editData.fullname) {
			obj.fullname = companyName;
		}
	} else {
		errorTip('请输入单位名称全称');
		return
	}
	//公司简称
	if(easycompanyName != '') {
		if(easycompanyName != editData.shortname) {
			obj.shortname = easycompanyName;
		}
	} else {
		errorTip('请输入单位名称简称');
		return
	}
	//客户电话
	if(serviceTel != '') {
		var reg = /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/;
		if(!reg.test(serviceTel)) {
			errorTip('不符合电话号码规则');
			return;
		} else {
			if(serviceTel != editData['客服电话']) {
				obj['客服电话'] = serviceTel;
			}
		}
	} else {
		if(serviceTel != editData['客服电话']) {
			obj['客服电话'] = serviceTel;
		}
	}
	//logo
	if($('#previewImg').attr('src') != 'img/add.png') {
		if($('#previewImg').attr('src') != editData.logo) {
			obj.logo = $('#previewImg').attr('src');
		}
	}
	//二维码
	if($('#codepreviewImg').attr('src') != 'img/add.png') {
		//生成二维码
		if($('#codepreviewImg').attr('src').substr(0, 4) == 'http') {
			if($('#codepreviewImg').attr('src') != editData.qrcodeurl) {
				obj.qrcodeurl = $('#codepreviewImg').attr('src');
			}
		}
	}
	//设置默认语言 设置语言
	if($('#langSetBody tr').length === 0) {
		errorTip('请您添加自定义语言');
		return
	}
	//设置默认语言
	var count = 0;
	$.each($('#langSetBody input[type=radio]'), function(i, e) {
		if($(this).prop('checked') == true) {
			if($(this).parent().parent().find('.name').text() != editData['默认语言']) {
				obj['默认语言'] = $(this).parent().parent().find('.name').text();
			}
			count++;
		}
	})
	if(count == 0) {
		errorTip('请您选择默认语言');
		return
	}
	var taglenflag = true;
	$.each($('#langSetBody .taglen'), function(i, e) {
		if(!($(this).val().trim() != '')) {
			errorTip('第' + (i + 1) + '行标签长度不能为空');
			taglenflag = false;
			return false;
		}
		if(!/^[1-9]\d*$/.test($(this).val().trim())) {
			errorTip('第' + (i + 1) + '行标签长度输入的字符不符合正整数规则');
			taglenflag = false;
			return false;
		}
		selfList.push({
			name: $(this).parent().parent().find('.name').text(),
			shortname: $(this).parent().parent().find('.name').attr('dataId'),
			taglength: parseInt($(this).val().trim())
		})
	});
	if(!taglenflag) {
		return
	} else {
		obj['语言'] = selfList;
	}
	if(userRegister != editData.active_after_registed) {
		obj.active_after_registed = userRegister;
	}
	if(userEdit != editData.publish_after_post) {
		obj.publish_after_post = userEdit;
	}
	//设置频道
	if($('#show-detail').find('.item').length != 0) {
		obj['直播配置'] = [];
		$.each($('#show-detail').find('.item'), function(i, e) {
			obj['直播配置'].push({
				'频道名称': $(this).find('.need1').text(),
				'注入地址': $(this).find('.need2').text(),
				'播放地址': $(this).find('.need3').text()
			})
		});
	}
	//设置会员级别设置
	var levelFlag = false;
	obj['会员级别设置'] = [{
		'语言': '中文简体',
		'设置': []
	}];
	$.each($('#levelSetTable input[type=checkbox]'), function(i, e) {
		obj['会员级别设置'][0]['设置'][i] = {};
		//设置级别		
		//当前级别选中的时候            判断当前 级别名称不能为空  为空的时候进行提示
		//判断当前级别是否为空
		if($(this).prop('checked') == true && $(this).parent().parent().find('input[type=text]').val().trim() == '') {
			errorTip('级别为' + $(this).parent().parent().find('td').eq(1).text() + '的名称为空，请您输入级别名称');
			levelFlag = true;
			return false;
		}
		obj['会员级别设置'][0]['设置'][i]['级别'] = $(this).parent().parent().find('td').eq(1).text();
		obj['会员级别设置'][0]['设置'][i]['名称'] = $(this).parent().parent().find('input[type=text]').val();
		//判断是否选中
		if($(this).prop('checked') == true) {
			obj['会员级别设置'][0]['设置'][i]['选择'] = true;
		} else {
			obj['会员级别设置'][0]['设置'][i]['选择'] = false;
		}
	})
	if(levelFlag == true) {
		return;
	}
	//启用第三方登录
	obj['第三方登录设置'] = editData['第三方登录设置'];
	$.each(obj['第三方登录设置'], function(i, e) {
		if(e.name == 'qq') {
			e.app_key = $('#qqAppKey').val();
			e.app_secret = $('#qqAppsecret').val();
			e.enable = $('#qqStart').prop('checked');
		} else if(e.name == '微博') {
			e.app_key = $('#weboAppKey').val();
			e.app_secret = $('#weboAppsecret').val();
			e.enable = $('#weboStart').prop('checked');
		} else if(e.name == '微信') {
			e.app_key = $('#wechatAppKey').val();
			e.app_secret = $('#wechatAppsecret').val();
			e.enable = $('#wechatStart').prop('checked');
		}
	})
	$.ajax({
		type: 'patch',
		url: baseUrl + 'config/' + systemId,
		dataType: 'json', //返回值类型 一般设置为json
		contentType: "application/json;charset=UTF-8",
		data: JSON.stringify(obj),
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data._status == 'OK') {
				for(var key in obj) {
					editData[key] = obj[key];
				}
				errorTip('保存设置成功');
				setCommpanyName(); //重新设置公司名称					
			}
		}
	});
}
//添加自定义语言  
$('#addLang').click(function() {
	var shortLang = $('#shortLang').val();
	var selfLang = $('#selfLang').val().trim();
	var setTagLenth = $('#setTagLenth').val().trim();
	var flag = true;
	if(shortLang == null) {
		errorTip('添加自定义语言之前请选择语言');
		return;
	}
	if(selfLang != '') {
		if($('#langSetBody .name').length) {
			$.each($('#langSetBody .name'), function(i, e) {
				if($(this).text() == selfLang || $(this).attr('dataId') == $('#shortLang').find('option:selected').attr('dataId')) {
					flag = false;
					return false;
				}
			});
		}
	}
	if(!flag) {
		errorTip('添加的语言已存在，不要重复添加')
		return;
	}
	if(setTagLenth == '') {
		errorTip('自定义语言标签长度不能为空');
		return
	}
	if(!/^[1-9]\d*$/.test(setTagLenth)) {
		errorTip('自定义语言标签不符合数字规则');
		return
	}
	if(setTagLenth != '' && /^[1-9]\d*$/.test(setTagLenth)) {
		var langStr = '<tr><td><input type="radio" name="radio"/></td><td class="name" dataId="' + $('#shortLang').find('option:selected').attr('dataId') + '">' + selfLang + '</td><td><input type="text" value="' + setTagLenth + '" class="taglen"/><span class="del"></span></td></tr>';
		$('#langSetBody').append(langStr);
	}
})
//删除语言
$('#langSetBody').on('click', '.del', function() {
	$(this).parent().parent().remove();
})
$('#saveset').click(function() {
	patchOrPostSystem(); //发送请求
})
var userRegister = true; //用户注册规则
var userEdit = true; //内容编辑规则
$('#checkEndRule').click(function() {
	if($(this).prop('checked') == true) {
		userRegister = true;
		$('#registerEndRule').prop('checked', false)
	} else {
		userRegister = false;
		$('#registerEndRule').prop('checked', true)
	}
})
$('#registerEndRule').click(function() {
	if($(this).prop('checked') == true) {
		userRegister = false;
		$('#checkEndRule').prop('checked', false);
	} else {
		userRegister = true;
		$('#checkEndRule').prop('checked', true)
	}
})
$('#commentEndRule').click(function() {
	if($(this).prop('checked') == true) {
		userEdit = true;
		$('#commentCheckEndRule').prop('checked', false)
	} else {
		userEdit = false;
		$('#commentCheckEndRule').prop('checked', true)
	}
})
$('#commentCheckEndRule').click(function() {
	if($(this).prop('checked') == true) {
		userEdit = false;
		$('#commentEndRule').prop('checked', false)
	} else {
		userEdit = true;
		$('#commentEndRule').prop('checked', true)
	}
})
//生成二维码
$('#codeBtn').click(function() {
	$.ajax({
		type: 'post',
		url: '/qrcode/create_qrcode',
		dataType: 'json', //返回值类型 一般设置为json
		contentType: "application/json;charset=UTF-8",
		data: JSON.stringify({
			'url': window.location.origin
		}),
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data.success == 'OK') {
				$('#codepreviewImg').attr('src', data.qrcode_url)
				$('#updowncode').parent().attr('href', data.qrcode_url + '?filename=qrcode.png')
			}
		}
	});
})

//增加频道
$('#add-report').click(function() {
	$('#tipbox').show();
	$('#tipbox .report-name input').val('');
	$('#tipbox .url1 input').val('');
	$('#tipbox .url2 input').val('');
})
$('#tipbox .sure').click(function() {
	var name = $('#tipbox .report-name input').val();
	var url1 = $('#tipbox .url1 input').val();
	var url2 = $('#tipbox .url2 input').val();
	var str;
	if(name.trim() == '') {
		name = '频道' + ($('#show-detail .item').length + 1);
	}
	if(url1.trim() == '') {
		errorTip('请输入注入地址');
		return;
	}
	if(url2.trim() == '') {
		errorTip('请输入播放地址');
		return;
	}
	str = '<div class="item">' +
		'<span class="need1">' + name + '</span>:&nbsp;&nbsp;' +
		'<span>注入地址</span>:&nbsp;&nbsp;' +
		'<span class="need2">' + url1 + '</span>&nbsp;&nbsp;' +
		'<span>播放地址</span>:&nbsp;&nbsp;' +
		'<span class="need3">' + url2 + '</span>&nbsp;&nbsp;' +
		'<span class="del"></span>' +
		'</div>'
	$('#show-detail').append(str);
	$('#tipbox').hide();
})
$('#tipbox .cancel').click(function() {
	$('#tipbox').hide();
})
//删除频道
$('#show-detail').on('click', '.del', function() {
	$(this).parent().remove();
})
/*注册会员级别设置*/
$('#add-level').click(function() {
	var str = '<tr><td><input type="checkbox"/></td><td></td><td><input type="text" /><span class="del"></span></td></tr>';
	$('#levelSetTable tfoot').append(str);
	$.each($('#levelSetTable tfoot tr'), function(i, e) {
		$(this).find('td').eq(1).text(i + 1 + 9);
	})
})
//删除手动设置的级别
$('#levelSetTable').on('click', '.del', function() {
	$(this).parent().parent().remove();
	if($('#levelSetTable tfoot tr').length) {
		$.each($('#levelSetTable tfoot tr'), function(i, e) {
			$(this).find('td').eq(1).text(i + 1 + 9);
		})
	}
})
//获取简称
function getShortLang() {
	$.ajax({
		type: "get",
		url: baseUrl + 'language',
		dataType: 'json',
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			console.log(data)
			if(data != null && data._items != null && data._items.length) {
				$.each(data._items, function(i, e) {
					$('#shortLang').append('<option dataId="' + e['简称'] + '">' + e['名称'] + '</option');
				});
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log("ERROR" + textStatus);
		}
	});
}
getShortLang();
//选择语言事件
$('#shortLang').change(function() {
	$('#selfLang').val($(this).val());
})
//点击微博验证按钮
$('#qqVerifiyBtn').click(function() {
	if($('#qqAppKey').val().trim() != '' && $('#qqAppsecret').val().trim() != '') {
		//saveThirdLogin('qq')
	}else if($('#qqAppKey').val().trim() == ''){
		errorTip('QQ下的AppID不能为空')
	}else if($('#qqAppsecret').val().trim() == ''){
		errorTip('QQ下的Appsecret不能为空')
	}
})
$('#wechatVerifiyBtn').click(function() {
	if($('#wechatAppKey').val().trim() != '' && $('#wechatAppsecret').val().trim() != '') {
		//saveThirdLogin('wechat')
	}else if($('#wechatAppKey').val().trim() == ''){
		errorTip('wechat下的AppID不能为空')
	}else if($('#wechatAppsecret').val().trim() == ''){
		errorTip('wechat下的Appsecret不能为空')
	}
})
$('#weboVerifiyBtn').click(function() {
	if($('#weboAppKey').val().trim() != '' && $('#weboAppsecret').val().trim() != '') {
		saveThirdLogin('webo')
	}else if($('#weboAppKey').val().trim() == ''){
		errorTip('webo下的AppID不能为空')
	}else if($('#weboAppsecret').val().trim() == ''){
		errorTip('webo下的Appsecret不能为空')
	}
})

function saveThirdLogin(thirdtype) {
	var obj = {};
	//启用第三方登录
	obj['第三方登录设置'] = editData['第三方登录设置'];
	$.each(obj['第三方登录设置'], function(i, e) {
		if(e.name == 'qq') {
			e.app_key = $('#qqAppKey').val();
			e.app_secret = $('#qqAppsecret').val();
			e.enable = $('#qqStart').prop('checked');
		} else if(e.name == '微博') {
			e.app_key = $('#weboAppKey').val();
			e.app_secret = $('#weboAppsecret').val();
			e.enable = $('#weboStart').prop('checked');
		} else if(e.name == '微信') {
			e.app_key = $('#wechatAppKey').val();
			e.app_secret = $('#wechatAppsecret').val();
			e.enable = $('#wechatStart').prop('checked');
		}
	})
	$.ajax({
		type: 'patch',
		url: baseUrl + 'config/' + systemId,
		dataType: 'json', //返回值类型 一般设置为json
		contentType: "application/json;charset=UTF-8",
		data: JSON.stringify(obj),
		headers: {
			"Authorization": "Basic " + auth
		},
		success: function(data) {
			if(data._status == 'OK') {
				if(thirdtype == 'webo') {
					window.location.href = '/third_account/weibo_login?next=/third_accont/weibo_test';
				} else if(thirdtype == 'qq') {
					
				} else if(thirdtype == 'wechat') {

				}
			}
		}
	});
}