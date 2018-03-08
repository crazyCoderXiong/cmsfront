function setPost(commentid, data, $that,path) {
    $.ajax({
        type: "post",
        async: false,
        url: '/user/comment_vote/' + commentid,
        data: JSON.stringify(data),
        contentType: "application/json;charset=UTF-8",
        dataType: 'json',
        success: function (data) {
            console.log(data);
            if (data.success == 'OK') {
            	console.log(path)
                $that.parent().find('s').text(parseInt($that.parent().find('s').text()) + 1);
                $that.attr('src', 'img/'+path).parent().parent().find('img').addClass('disabled');
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {

        }
    });
}

function replace_em(str) {

    str = str.replace(/\</g, '&lt;');

    str = str.replace(/\>/g, '&gt;');

    str = str.replace(/\n/g, '<br/>');

    str = str.replace(/\[em_([0-9]*)\]/g, '<img src="img/arclist/$1.gif" border="0" />');

    return str;

}

function setHtml(data) {
    var str;
    $('#commentBody').html('');
    $.each(data._items, function (i, e) {
        str = '<div class="item" dataId=' + e._id + '>' +
            '<div class="l pic"><img src="img/Oval.png" alt="" /></div>' +
            '<div class="r content">' +
            '<div class="t">' +
            '<div class="l"><div class="name">' + e['用户名'] + '(IP: ' + e['用户IP'] + ')' + '</div><div class="time">' + e._created + '</div></div>' +
            '<div class="r"><span class="like"><s>' + e['赞同数'] + '</s><img src="img/like.png"/></span><span class="notalk"><s>' + e['不予评论数'] + '</s><img src="img/notalk.png"/></span><span class="unlike"><s>' + e['不赞同数'] + '</s><img src="img/unlike.png"/></span></div>' +
            '</div>' +
            '<div class="b">' + replace_em(e['评论内容']) + '</div>' +
            '</div>' +
            '</div>'
        $('#commentBody').append(str);
        if (e['用户头像'] != "") {
            $('#commentBody').find('.item').eq(i).find('.pic img').attr('src', e['用户头像'])
        }
    })
}

function getCommentList(url1, url2) {
    //全局变量
    var totalNum = null; //多少条数据
    $.ajax({
        type: "get",
        url: url1,
        success: function (data) {
            if (data != null && data._items != null && data._items.length) {
                totalNum = data._meta.total;
                $('#commentPage').remove(); //移除page容器
                $('#commentPageParent').append('<div id="commentPage"></div>'); //追加page容器
                pageUtil.initPage('commentPage', {
                    totalCount: totalNum, //总页数，一般从回调函数中获取。如果没有数据则默认为1页
                    curPage: 1, //初始化时的默认选中页，默认第一页。如果所填范围溢出或者非数字或者数字字符串，则默认第一页
                    showCount: 5, //分页栏显示的数量
                    pageSizeList: [5, 10, 15, 20], //自定义分页数，默认[5,10,15,20,50]
                    defaultPageSize: pagesize, //默认选中的分页数,默认选中第一个。如果未匹配到数组或者默认数组中，则也为第一个
                    isJump: true, //是否包含跳转功能，默认false
                    isPageNum: true, //是否显示分页下拉选择，默认false
                    isPN: true, //是否显示上一页和下一面，默认true
                    isFL: true, //是否显示首页和末页，默认true
                    jump: function (curPage, pageSize) { //跳转功能回调，传递回来2个参数，当前页和每页大小。如果没有设置分页下拉，则第二个参数永远为0。这里的this被指定为一个空对象，如果回调中需用到this请自行使用bind方法
                        $.ajax({
                            type: 'get',
                            url: encodeURI(url2 + '&max_results=' + pageSize + '&page=' + curPage + '&sort=[("_created",-1)]'),
                            dataType: 'json',
                            success: function (data) {
                                $('#show_label em').text(data._meta.total);
                                setHtml(data);
                            },
                            error: function (e) {
                                console.log(e);
                            }
                        })
                    },
                });
                setHtml(data);
            } else {
                $('#commentBody').html('<tr><td style="color:gray;font-size: 20px;text-align:center" colspan="6">暂无评论</td></tr>');
                $('#commentPage').remove(); //移除page容器
            }
        },
        error: function (data) {

        }
    });
}

// QQ表情插件
(function ($) {
    $.fn.qqFace = function (options) {
        var defaults = {
            id: 'facebox',
            path: 'face/',
            assign: 'content',
            tip: 'em_'
        };
        var option = $.extend(defaults, options);
        var assign = $('#' + option.assign);
        var id = option.id;
        var path = option.path;
        var tip = option.tip;

        if (assign.length <= 0) {
            alert('缺少表情赋值对象。');
            return false;
        }

        $(this).click(function (e) {
            var strFace, labFace;
            if ($('#' + id).length <= 0) {
                strFace = '<div id="' + id + '" style="position:absolute;display:none;z-index:1000;" class="qqFace">' +
                    '<table border="0" cellspacing="0" cellpadding="0"><tr>';
                for (var i = 1; i <= 75; i++) {
                    labFace = '[' + tip + i + ']';
                    strFace += '<td><img src="' + path + i + '.gif" onclick="$(\'#' + option.assign + '\').setCaret();$(\'#' + option.assign + '\').insertAtCaret(\'' + labFace + '\');" /></td>';
                    if (i % 15 == 0) strFace += '</tr><tr>';
                }
                strFace += '</tr></table></div>';
            }
            $(this).parent().append(strFace);
            var offset = $(this).position();
            var top = offset.top + $(this).outerHeight();
            $('#' + id).css('top', top);
            $('#' + id).css('left', offset.left);
            $('#' + id).show();
            e.stopPropagation();
        });

        $(document).click(function () {
            $('#' + id).hide();
            $('#' + id).remove();
        });
    };

})(jQuery);

jQuery.extend({
    unselectContents: function () {
        if (window.getSelection)
            window.getSelection().removeAllRanges();
        else if (document.selection)
            document.selection.empty();
    }
});
jQuery.fn.extend({
    selectContents: function () {
        $(this).each(function (i) {
            var node = this;
            var selection, range, doc, win;
            if ((doc = node.ownerDocument) && (win = doc.defaultView) && typeof win.getSelection != 'undefined' && typeof doc.createRange != 'undefined' && (selection = window.getSelection()) && typeof selection.removeAllRanges != 'undefined') {
                range = doc.createRange();
                range.selectNode(node);
                if (i == 0) {
                    selection.removeAllRanges();
                }
                selection.addRange(range);
            } else if (document.body && typeof document.body.createTextRange != 'undefined' && (range = document.body.createTextRange())) {
                range.moveToElementText(node);
                range.select();
            }
        });
    },

    setCaret: function () {
        if (!$.browser.msie) return;
        var initSetCaret = function () {
            var textObj = $(this).get(0);
            textObj.caretPos = document.selection.createRange().duplicate();
        };
        $(this).click(initSetCaret).select(initSetCaret).keyup(initSetCaret);
    },

    insertAtCaret: function (textFeildValue) {
        var textObj = $(this).get(0);
        if (document.all && textObj.createTextRange && textObj.caretPos) {
            var caretPos = textObj.caretPos;
            caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == '' ?
                textFeildValue + '' : textFeildValue;
        } else if (textObj.setSelectionRange) {
            var rangeStart = textObj.selectionStart;
            var rangeEnd = textObj.selectionEnd;
            var tempStr1 = textObj.value.substring(0, rangeStart);
            var tempStr2 = textObj.value.substring(rangeEnd);
            textObj.value = tempStr1 + textFeildValue + tempStr2;
            textObj.focus();
            var len = textFeildValue.length;
            textObj.setSelectionRange(rangeStart + len, rangeStart + len);
            textObj.blur();
        } else {
            textObj.value += textFeildValue;
        }
    }
});