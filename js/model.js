function DrawImage(hotimg, fill) {
    var width = '100%';
    var height = '100%';
    if(fill == 'full' || fill == '')
        fill = 'cover';
    else if(fill == 'adaptive')
        fill = 'contain';
    else {
        height = fill + 'px';
        fill = 'cover';
    }
    $(hotimg).jqthumb({
        classname: 'jqthumb',
        width: width,
        height: height,
        fill: fill
    });
}
/*遍历页面上可能有日期的模块调整宽度*/
function adjustWidth(obj) {
    obj.each(function () {
        var reservedDistance
        var item = $(this).find(".tab.active .item")
        var that = this
        item.each(function () {
            if ($(this).find('i').length) {
                reservedDistance = 33 //23+10 图标占位及标题与日期间余留距离
            } else {
                reservedDistance = 10 //标题与日期间余留距离
            }
            if ($(this).find('.title-date').length) {
                reservedDistance += 75
            }
            if ($(that).hasClass("text-title")) {
                $(this).find(".title-text").css("width", (($(this).width() - reservedDistance) / $(this).width()).toFixed(4) * 100 + "%");
            } else if ($(that).hasClass("text-titleCont")) {
                $(this).find("h3 .title-text").css("width", (($(this).width() - reservedDistance) / $(this).width()).toFixed(4) * 100 + "%");
            }
        })
    })
}
window.onload = function() {
    //公共函数选项卡切换
    adjustWidth($('.text-title'))
    adjustWidth($('.text-titleCont'))
    function tab1() {
        $(".title").find("li").on("mouseover", function() {
            var n = $(this).index();
            var parentModel = $(this).parents(".model");
            $(this).addClass("content-bar_click")
                .siblings().removeClass("content-bar_click");
            parentModel.find(".tab").removeClass('active');
            parentModel.find(".tab").eq(n).addClass("active");
            var dataUrl = $(this).attr("data-url");
            $(this).parents(".title").find("a").attr("href", dataUrl);
            if ($(this).parents('.model').hasClass('text-title') || $(this).parents('.model').hasClass('text-titleCont')) {
                adjustWidth($(this).parents(".model"))
            }
        });
    }

    tab1();
    $(".pictureSlide").each(function() {
        pictureSlide(this);
    });
    $(window).resize(function() {
        var w = $(window).width();
        /*$("header").css({
         "min-width": w + "px"
         });
         $("section").css({
         "min-width": w + "px"
         });
         $("footer").css({
         "min-width": w + "px"
         });*/
        $(".pictureSlide").each(function() {
            pictureSlide(this);
        });
        logInheight();
        adjustWidth($('.text-title'))
        adjustWidth($('.text-titleCont'))
        $('.timer-axis').each(function () {
            setTimeWorEllipsis(this)
        })
    });
    var w = $(window).width();
    /*$("header").css({
     "min-width": w + "px"
     });
     $("section").css({
     "min-width": w + "px"
     });
     $("footer").css({
     "min-width": w + "px"
     });*/
    //--------------------------纯文本模块开始-------------------------------
    $("body").on("mouseover", ".content-bar .more", function() {
        //显示下拉框
        $(this).find(".menu").css({
            "display": "block"
        });
    }).on("mouseout", ".content-bar .more", function() {
        //隐藏下拉框
        $(this).find(".menu").css({
            "display": "none"
        });
    }).on("mouseover", ".more .menu>li", function(e) {
        //鼠标经过下拉框的时候背景变化
        $(this).parent(".menu").css({
            "display": "block"
        });
        var cont = $(this).find("span").text();
        $(this).parents(".more").find(".left strong").text(cont);
        if ($(this).parents('.model').hasClass('text-title') || $(this).parents('.model').hasClass('text-titleCont')) {
            adjustWidth($(this).parents(".model"))
        }
        e.stopPropagation();
    }).on("mouseover", ".pictures .pictures-bottom li", function() {
        $(this).css({
                "border-color": "#dc0000"
            })
            .siblings().css({
            "border-color": "transparent"
        });
        n = $(this).index();
        nextActiveShow(n);
    }).on("mouseout", ".pictures .pictures-bottom li", function() {
        n = $(this).index();
    });

    //--------------------------------纯文本模块结束--------------------------------

    //-------------------------导航模快开始-----------------------------------
    function  changeTrigle(classname,span){
        if (classname == "bot") {
            span.removeClass();
            span.addClass("top");
        } else {
            span.removeClass();
            span.addClass("bot");
        }
    }
    $(".character").hover(function() {
        $(this).find(".nav-show").stop().fadeToggle();
        var classname = $(this).children("span").prop("className");
        var span = $(this).children("span")
        changeTrigle(classname,span)
    });
    
    var maxlength = 5; //最大长度
    $(".nav-show").each(function() {
        $(this).find("li").each(function() {
            if($(this).find("a").text().length > maxlength) {
                var content = $(this).find("a").text();
                var showlength = content.substr(0, 5);
                $(this).find("a").text(showlength);
            }
        });

    });

    //-------------------------导航模块结束-----------------------------------

    //--------------------------切换主题-------------------------------------

    var url = ["black", "red", "blue", "green"];
    $("button").on("click", function() {
        var n = $(this).index();
        $("#blue").attr("href", "css/" + url[n] + ".css");
    });

    //----------------------图片固定页面----------------------

    //点击切换大图
    var n = 0;
    var m = 0
    var aLi = $(".pictures-bottom ul").children("li");
    var count = $(".big-pictures").children("li").length;
    //视频详情页默认显示5张
    aLi.each(function(i) {
        if(i <= 4) {
            aLi.eq(i).css({
                "display": "block"
            })
        }
    });
    $(".big-right-arrow").on("click", function() {
        n++;
        m++;
        if(m >= aLi.length || n >= aLi.length) {
            m = aLi.length;
            n = aLi.length - 1;
        }
        nextActiveShow(n);
        if(m > aLi.length - 5) {
            return;
        } else {
            aLi.each(function(i) {
                if((m - 1) < i && i < (m + 5)) {
                    aLi.eq(i).css({
                        "display": "block"
                    })
                } else {
                    aLi.eq(i).css({
                        "display": "none"
                    })
                }
            });
        }
    });
    $(".big-left-arrow").on("click", function() {
        n--;
        m--;
        if(m <= 0) {
            m = 0;
        } else if(m >= aLi.length - 5) {
            m = aLi.length - 6
        }
        if(n <= 0) {
            n = 0;
        }
        nextActiveShow(n);
        if(m < 0) {
            return
        } else {
            aLi.each(function(i) {
                if((m - 1) < i && i < (m + 5)) {
                    aLi.eq(i).css({
                        "display": "block"
                    })
                } else {
                    aLi.eq(i).css({
                        "display": "none"
                    })
                }
            });
        }
    });
    //小图部分点击左右箭头改变图片位移
    $(".small-right-arrow").on("click", function() {
        n++;
        m++;
        if(m >= aLi.length || n >= aLi.length) {
            m = aLi.length;
            n = aLi.length - 1;
        }
        if($(this).parents(".pictures").hasClass("video")) {
            if(m > aLi.length - 5) {
                return;
            } else {
                aLi.each(function(i) {
                    if((m - 1) < i && i < (m + 5)) {
                        aLi.eq(i).css({
                            "display": "block"
                        })
                    } else {
                        aLi.eq(i).css({
                            "display": "none"
                        })
                    }
                });
            }
        } else {
            nextActiveShow(n);
            if(m > aLi.length - 5) {
                return;
            } else {
                aLi.each(function(i) {
                    if((m - 1) < i && i < (m + 5)) {
                        aLi.eq(i).css({
                            "display": "block"
                        })
                    } else {
                        aLi.eq(i).css({
                            "display": "none"
                        })
                    }
                });
            }
        }
    });
    $(".small-left-arrow").on("click", function() {
        n--;
        m--;
        if(m <= 0) {
            m = 0;
        } else if(m >= aLi.length - 5) {
            m = aLi.length - 6
        }
        if(n <= 0) {
            n = 0
        }
        if($(this).parents(".pictures").hasClass("video")) {
            aLi.each(function(i) {
                if((m - 1) < i && i < (m + 5)) {
                    aLi.eq(i).css({
                        "display": "block"
                    })
                } else {
                    aLi.eq(i).css({
                        "display": "none"
                    })
                }
            });
        } else {
            nextActiveShow(n);
            aLi.each(function(i) {
                if((m - 1) < i && i < (m + 5)) {
                    aLi.eq(i).css({
                        "display": "block"
                    })
                } else {
                    aLi.eq(i).css({
                        "display": "none"
                    })
                }
            });

        }
    });

    function nextActiveShow(number) {
        $(".big-pictures").find("li").eq(number).addClass("active");
        $(".big-pictures").find("li").eq(number).siblings().removeClass("active");
        $(".pictures-bottom ul").find("li").eq(number).css({
                "border-color": "#dc0000"
            })
            .siblings().css({
            "border-color": "transparent"
        });
        showAllPicture(".pictures");
    };

    //-----------------轮播开始--------------------
    function pictureSlide(obj) {
        if($(obj).data('timer')) {
            clearInterval($(obj).data('timer'));
        }

        //设置ul.pictureSlide的总宽度
        var pictureSlideWidth = $(obj).parents('.tab').width();
        $(obj).css({
            "width": pictureSlideWidth + "px"
        });

        //轮播
        var pictureSlideLeft = $(obj).parents('.tab').width();
        var i = 0;
        var timer;
        var totalPicture = $(obj).find(".picture").length;
        //轮播中小圆点，小横杠，小图片集合
        var rollingIcons = $(obj).siblings(".rolling-style").find("li");
        //封装计时器函数，计时器函数里面是切换图片和小圆点
        function slide() {
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
                iconListsChange(i);
            }, 4000);
            $(obj).data('timer', timer);
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

        $("body").on("click", ".left-arrow", function() {
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

        }).on("click", ".right-arrow", function() {
            if(totalPicture == 1) {
                clearInterval(timer);
                $(obj).css({
                    "left": 0
                });
            } else {
                //右箭头点击的时候切换图片
                pictureSlideChange();
                //右箭头点击的时候切换圆点
                i++;
                if(i >= rollingIcons.length) {
                    i = 0
                }
                //小圆点，小横杠还是缩略图切换
                iconListsChange(i);
            }
        });

        //鼠标悬停在圆点，横杠，缩略图的时候大图片的轮播停止
        var rolling = $(obj).siblings(".rolling-style");
        rolling.hover(function() {
            clearInterval(timer);
        }, function() {
            slide();
        });

        $(obj).find(".jqthumb").hover(function() {
            clearInterval(timer)
        }, function() {
            slide();
        });

        //鼠标点击圆点，横杠，缩略图的时候大图片轮播
        rolling.find("li").hover(function() {
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

        //轮播图中大图片的切换动画
        function pictureSlideChange(number) {
            if(!number && number !== 0) {
                //如果number不存在且number不等于0；
                number = 1;
            };
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

        //轮播图中小圆点、小横杠,缩略图的切换动画
        function iconListsChange(number) {
            var theme = $(".theme").attr("href").split("/")[1].split(".")[0];
            if(totalPicture == 1) {
                clearInterval(timer);
                $(obj).css({
                    "left": 0
                });
            } else {
                if(rolling.prop("className") == "rolling-style thumbnailLists") {
                    if(theme == "blue") {
                        rollingIcons.eq(number).find(".jqthumb").css({
                            "border-color": "#03a9f4"
                        });
                    } else if(theme == "black") {
                        rollingIcons.eq(number).find(".jqthumb").css({
                            "border-color": "#01c185"
                        });
                    } else if(theme == "red") {
                        rollingIcons.eq(number).find(".jqthumb").css({
                            "border-color": "#dc0101"
                        });
                    } else if(theme == "green") {
                        rollingIcons.eq(number).find(".jqthumb").css({
                            "border-color": "#02c185"
                        });
                    }
                    rollingIcons.eq(number).siblings().find(".jqthumb").css({
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

    //-----------------轮播结束--------------------
    //固定页面图片等你比例完全显示开始-------------------
    $(".picCont-detail").each(function() {
        showAllPicture(this);
    });
    showAllPicture(".pictures");

    function showAllPicture(obj) {
        //获取固定页面图片父元素的宽高，并计算比例
        var picContDetailPicWidth = $(obj).children("div").eq(0).width();
        var picContDetailPicHeight = $(obj).children("div").eq(0).height();
        var picContDetailPicRatio = picContDetailPicWidth / picContDetailPicHeight;
        //console.log(picContDetailPicRatio)
        //获取固定页面图片本身的宽高，并计算比例
        var picContDetailImgWidth;
        var picContDetailImgHeight;
        var picContDetailImgRatio;
        var imgHeight;
        var minusWidth;
        var imgWidth;
        var minusHeight;
        if($(obj).children("div").eq(0).find("img").length > 1) {
            $(obj).children("div").eq(0).find("img").each(function(i) {
                if($(this).parents("li").css("display") == "block") {
                    picContDetailImgWidth = $(this).width();
                    picContDetailImgHeight = $(this).height();
                    picContDetailImgRatio = picContDetailImgWidth / picContDetailImgHeight;
                }
            })

        } else {
            picContDetailImgWidth = $(obj).children("div").eq(0).find("img").width();
            picContDetailImgHeight = $(obj).children("div").eq(0).find("img").height();
            picContDetailImgRatio = picContDetailImgWidth / picContDetailImgHeight;
        }
        if(picContDetailPicRatio >= picContDetailImgRatio) {
            //如果图片父元素宽高比例大于等于图片本身宽高比例，
            // 设置图片本身高等于父元素的高并计算图片本身的宽度
            if($(obj).children("div").eq(0).find("img").length > 1) {
                $(obj).children("div").eq(0).find("img").each(function() {
                    if($(this).parents("li").css("display") == "block") {
                        $(this).css({
                            "height": picContDetailPicHeight + "px"
                        });
                        imgHeight = $(this).height();
                        $(this).css({
                            "width": (imgHeight * picContDetailImgRatio) + "px"
                        });
                        minusWidth = picContDetailPicWidth - $(this).width();
                        $(this).css({
                            "margin-left": (minusWidth / 2) + "px"
                        })
                    }
                })
            } else {
                $(obj).children("div").eq(0).find("img").css({
                    "height": picContDetailPicHeight + "px"
                });
                imgHeight = $(obj).children("div").eq(0).find("img").height();
                $(obj).children("div").eq(0).find("img").css({
                    "width": (imgHeight * picContDetailImgRatio) + "px"
                });
                minusWidth = picContDetailPicWidth - $(obj).children("div").eq(0).find("img").width();
                $(obj).children("div").eq(0).find("img").css({
                    "margin-left": (minusWidth / 2) + "px"
                })
            }

        } else if(picContDetailPicRatio < picContDetailImgRatio) {
            //如果图片父元素宽高比例小于图片本身宽高比例，
            // 设置图片本身宽度等于父元素的宽度并计算图片本身高度
            if($(obj).children("div").eq(0).find("img").length > 1) {
                if($(this).parents("li").css("display") == "block") {
                    $(this).css({
                        "width": picContDetailPicWidth + "px"
                    });
                    imgWidth = $(this).width();
                    $(this).css({
                        "height": (imgWidth / picContDetailImgRatio) + "px"
                    });
                    minusHeight = picContDetailPicHeight - $(this).height();
                    $(this).css({
                        "margin-left": (minusHeight / 2) + "px"
                    })
                }
            } else {
                $(obj).children("div").eq(0).find("img").css({
                    "width": picContDetailPicWidth + "px"
                });
                imgWidth = $(obj).children("div").eq(0).find("img").width();
                $(obj).children("div").eq(0).find("img").css({
                    "height": (imgWidth / picContDetailImgRatio) + "px"
                });
                minusHeight = picContDetailPicHeight - $(obj).children("div").eq(0).find("img").height();
                $(obj).children("div").eq(0).find("img").css({
                    "margin-top": (minusHeight / 2) + "px"
                })
            }

        }
    }

    //固定页面图片等你比例完全显示结束-------------------
    //登录页面
    //登陆页面的宽高设置
    function logInheight() {
        var loginWidth = $(window).width();
        $(".login").css({
            "width": loginWidth + "px"
        });
        var loginHeight = $(window).height();
        var loginBodyHeight = loginHeight - $(".login-header").height();
        $(".login-body").css({
            "height": loginBodyHeight + "px"
        });
    };
    logInheight();
    //判断登陆页面输入的用户名、密码是否为空
    var users;
    var secret;
    $(".login-users input").blur(function(e) {
        users = $(this).val();
        //如果提供了事件对象，则这是一个非IE浏览器
        if(e && e.preventDefault) {
            //阻止默认浏览器动作(W3C)
            window.event || e.preventDefault();
            usersReminder(users);
        } else {
            //IE中阻止函数器默认动作的方式
            window.event.returnValue = false;
            usersReminder(users);
        }
        //console.log(users);
        function usersReminder(obj) {
            if(!obj) {
                $(".users-reminder").text("请输入有效用户名");
                $(".login-users input").focus();
            } else {
                $(".users-reminder").text("");
            }
        }

    });
    $(".login-secret input").blur(function(e) {
        secret = $(this).val();
        //如果提供了事件对象，则这是一个非IE浏览器
        if(e && e.preventDefault) {
            //阻止默认浏览器动作(W3C)
            window.event || e.preventDefault();
            secretReminder(secret)
        } else {
            //IE中阻止函数器默认动作的方式
            window.event.returnValue = false;
            secretReminder(secret)
        };
        //console.log(secret);
        function secretReminder(obj) {
            if(!obj) {
                $(".secret-reminder").text("请输入有效密码");
                $(".login-secret input").focus(function() {
                    //alert("aa")
                });
            } else {
                $(".secret-reminder").text("");
            }
        }

    });

    //固定页面视频
    var marginLeft = ($(".pictures-top").width() - $(".pictures-top div").eq(0).width()) / 2;
    $(".pictures-top div").eq(0).css({
        "margin-left": marginLeft + "px"
    });

    //固定页面分页
    $(".pagination").find("li").each(function(i) {
        if($(this).find("a").prop("className") == "current") {
            $(this).find("a").css({
                "background-color": "#dc0000",
                "color": "#fff"
            })
        }
    })

    //	搜索框导航栏回车事件
    $(".nav-searchBox .lists input,.nav-classic .lists input").on("keypress", function(e) {
        if(e.keyCode == 13 || e.which == 13) {
            window.open("listsearch.html?key=" + $(this).val());
        }
    });
    $(".nav-searchBox .lists .search,.nav-classic .lists .search").on("click", function() {
        window.open("listsearch.html?key=" + $(this).siblings("input").val());
    });
    //视频详情页面点击小视频片段切换
    //	var fragmentIntroduce;
    $(".pictures-bottom li").on("click", function() {
        var currentUrl = $(this).find(".url").text();
        var currentSrc = $(this).find("img").attr("src");
        $(".pictures-top>div").find("video").attr("src", currentUrl);
        $(".pictures-top>div").find("video").attr("poster", currentSrc);
    });

    //全局变量
    var baseUrl = '/api/'; //url前缀
    var auth = 'YWRtaW46MTIz'; //认证
    var code;
    //点击忘记密码
    $('#forget-psw').click(function() {
        $('#mark').show();
        $('#search-psw').show();
        return false;
    })
    //点击找回密码弹框
    $('#search-psw').click(function() {
        return false;
    })
    //点击获取验证码
    $('#getCode').click(function() {
        //发送请求前判断手机号是否输入，是否为12位
        var phone = $('#phone-num').val().trim();
        if(phone == '') {
            alert('请输入手机号');
            return
        }
        if(phone.length != 11) {
            alert('手机号位数不对');
            return
        }
        invokeSettime('#getCode');
        $.ajax({
            type: "post",
            url: baseUrl + 'admin_sms/post_sms_code',
            data: JSON.stringify({
                '手机号': phone
            }),
            contentType: "application/json;charset=UTF-8",
            dataType: 'json',
            headers: {
                "Authorization": "Basic " + auth
            },
            success: function(data) {
                if(data.success == 'OK') {
                    $('#new-psw').attr('disabled', false);
                    $('#code').val(data['验证码']);
                    code = data['验证码'];
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest.responseJSON.reason);
                console.log(XMLHttpRequest, textStatus, errorThrown);
            }
        });
    });
    //点击提交
    $('#findPswSubmit').click(function() {
        var phone = $('#phone-num').val().trim();
        var newpsw = $('#new-psw').val().trim();
        var codenum = $('#code').val().trim();
        if(phone == '') {
            alert('请输入手机号');
            return
        }
        if(phone.length != 11) {
            alert('手机号位数不对');
            return
        }
        if(codenum == '') {
            alert('请输入验证码');
            return
        }
        if(newpsw == '') {
            alert('请输入新密码');
            return
        }
        $.ajax({
            type: "post",
            url: baseUrl + 'admin_sms/retrieve_password',
            data: JSON.stringify({
                "手机号": phone,
                "验证码": code,
                "新密码": newpsw
            }),
            contentType: "application/json;charset=UTF-8",
            dataType: 'json',
            headers: {
                "Authorization": "Basic " + auth
            },
            success: function(data) {
                if(data.success == 'OK') {
                    alert('修改密码成功');
                    $('#search-psw').hide();//隐藏找回密码弹框
                    $('#mark').hide();//隐藏遮罩
                    $('#phone-num').val('');//清空文本域
                    $('#new-psw').val('');//清空文本域
                    $('#code').val('');//清空文本域
                    //$('#getCode').attr("disabled", false);
                    //$('#getCode').val("获取验证码");

                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {}
        });
    })
    $('#findPswCancel').click(function(){
        $('#search-psw,#mark').hide();//隐藏找回密码弹框
    })
    function invokeSettime(obj) {
        var countdown = 60;
        settime(obj);

        function settime(obj) {
            if(countdown == 0) {
                $(obj).attr("disabled", false);
                $(obj).val("获取验证码");
                countdown = 60;
                return;
            } else {
                $(obj).attr("disabled", true);
                $(obj).val(countdown + "s 后重新发送");
                countdown--;
            }
            setTimeout(function() {
                settime(obj)
            }, 1000)
        }
    }
    // 时间轴模块设置省略号显隐
    function setTimeWorEllipsis (obj) {
        //    竖向时间轴模块事件的宽度
        if ($(obj).find('.tab.active').hasClass('time-vertical')) {
            $(obj).find('.time-point').each(function(){
                var totalWidth=parseInt($(this).css('width'));
                var leftWidth=Math.ceil(parseInt($(this).find('.time-left').outerWidth(true)))+5;
                $(this).find('.time-right').css({'width':totalWidth-leftWidth+'px'});
                $(this).find('.vertical-line').width('')
            })
        } else {
            $(obj).find('.vertical-line').each(function(){
                var itemNum=$(this).parents('.lists').find('.item').length-1;
                var dateWidth=parseInt($(this).parents('.lists').find('.item:last .time-left').css('width'));
                var totalWidth=parseInt($(this).parents('.lists').css('width'));
                var circleWidth=parseInt($(this).siblings('.circle').css('width'));
                var lineWidth=parseInt((totalWidth-dateWidth-circleWidth*itemNum)/itemNum);
                $(this).css({'width':lineWidth+'px'});
                $(this).parents('.time-point').find('.time-right').width('')
            });
        }
        /*$('.time-vertical .time-point').each(function(){
            var totalWidth=parseInt($(this).css('width'));
            var leftWidth=Math.ceil(parseInt($(this).find('.time-left').outerWidth(true)))+5;
            $(this).find('.time-right').css({'width':totalWidth-leftWidth+'px'});
        })*/
        //时间轴模块文字的省略号
        $(obj).find('.time-right').each(function(){
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
        /*$('.model .time-right').each(function(){
            if (!$(this).find('.visibility').length) {
                var cloneElement=$(this).find('p').clone(true);
                $(this).append(cloneElement);
                $(this).find('p:last').addClass('visibility');
            }
            if(!$(this).parents('.time-point').hasClass('marginLeft')){
                var actWidth=parseInt($(this).find('.visibility').css('width'));
                if(2*parseInt($(this).find('p:first span').css('width'))<actWidth){
                    $(this).find('p:first b').css({'visibility':'visible'});
                }
            }else{
                var actWidth=parseInt($(this).find('.visibility span').css('height'));
                if(2*parseInt($(this).find('p:first span').css('height'))<actWidth){
                    $(this).find('p:first b').css({'visibility':'visible'});
                }
            }

        });
        //横向时间轴模块轴的宽度
        $('.time-horizontal .vertical-line').each(function(){
            var itemNum=$(this).parents('.lists').find('.item').length-1;
            var dateWidth=parseInt($(this).parents('.time-left').css('width'));
            var totalWidth=parseInt($(this).parents('.lists').css('width'));
            var circleWidth=parseInt($(this).siblings('.circle').css('width'));
            var lineWidth=parseInt((totalWidth-dateWidth-circleWidth*itemNum)/itemNum);
            $(this).css({'width':lineWidth+'px'});
        });*/
    }
    $('.timer-axis').each(function () {
        setTimeWorEllipsis(this)
    })
    //自定义导航条下拉框
    $('.newNav .hasSecondNav').hover(function() {
        $(this).find(".second-nav").stop().fadeToggle();
        var classname = $(this).children("span").prop("className");
        var span = $(this).children("span")
        changeTrigle(classname,span)
    });
    //自定义导航的分割线项分割线的高度设置
    function partingLint(parting){
        var listsHeight=parseInt(parting.parent().css('height'));
        var marginNum=parting.css('margin-top');
        var marginNum_=marginNum.slice(0,marginNum.length-2);
        var partingMargin=2*Math.ceil(marginNum_);
        parting.css('height',listsHeight-partingMargin+'px');
    };
    $('.parting-line').each(function(){
        partingLint($(this))
    })
};