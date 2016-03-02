/**
 * version:1.0.0
 * Created by jianyingshuo on 2015/12/08.
 */
!function (window, document) {
    'use strict';
    var $ = window.GHSMLib.JQuery, selfURL = window.GHSMLib.baseURL, APIUrl = window.GHSMLib.APIUrl;

    var utils = (function () {
        var me = {};
        me.getTime = Date.now || new Date().getTime();
        me.extend = function (target, obj) {
            for (var i in obj) {
                if (obj.hasOwnProperty(i))
                    target[i] = obj[i];
            }
        };
        me.loadScript = function (sScriptSrc, callbackfunction) {
            var oHead = document.getElementsByTagName('head')[0];
            if (oHead) {
                var oScript = document.createElement('script');
                oScript.setAttribute('src', sScriptSrc);
                oScript.setAttribute('type', 'text/javascript');
                oScript.onload = callbackfunction;
                oHead.appendChild(oScript);
            }
        };
        me.qrCode = function (text, size) {
            return APIUrl[1].replace("$text", text).replace("$size", size);
        };
        me.getQueryString = function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return (r[2]);
            return null;
        };
        me.getHashString = function (name) {
            var reg = new RegExp("(^|&|#)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.hash.substr(1).match(reg);
            if (r != null) return (r[2]);
            return null;
        };
        return me;
    })();


    function UserBehavior(cardId) {
        var self = this, hostname = window.location.hostname, pathname = window.location.pathname, appName;

        $.ajax({
            url: selfURL + '/json/userBehavior/pvSetting.json',
            async: false,
            success: function (data) {
                var list = data[hostname];
                if (list && list.length > 0) {
                    for (var key in list) {
                        var regular = list[key].regular;
                        var name = list[key].name;
                        for (var r in regular) {
                            if (pathname.indexOf(regular[r]) == 0) {
                                appName = name;
                            }
                        }

                    }
                }
            }
        });

        if (appName && cardId) {
            this.appName = appName;
            this.cardId = cardId;
            this.pv();
        }
    }

    UserBehavior.prototype.pv = function () {
        var timestamp = new Date().getTime();
        $.getJSON('http://172.16.188.26/web/userBehavior/pv.json?appName=' + this.appName + '&cardId=' + this.cardId + "&timestamp=" + timestamp);
    };

    function UserInfo(cardId) {
        var initStatus = false, ui = {
            cardId: cardId
        }, fun = [], street, err;

        var init = function () {
            $.ajax({
                url: APIUrl[2] + 'box/getBoxByCardId',
                data: {"cardId": ui.cardId},
                type: "GET",
                dataType: 'json',
                success: function (data) {
                    if (data.success) {
                        ui.name = data.result.name;
                        ui.phone = data.result.phone;
                        ui.address = data.result.address;
                        ui.location = {};
                        ui.location.lat = data.result.latitude;
                        ui.location.lng = data.result.longitude;
                        if (typeof data.result.department === "object") {
                            ui.departmentId = data.result.department.id;
                        }
                        getPolygon();
                    } else {
                        err = "服务器错误";
                        runFun();
                    }
                },
                error: function (data) {
                    err = "服务器错误";
                    runFun();
                }
            });
        };


        var isInWhere = function () {
            var point = {
                lat: ui.location.lat,
                lng: ui.location.lng
            };

            var communitys = street.communitys;

            for (var key in communitys) {
                var community = communitys[key];
                var poly = community.poly;
                var flag = isInsidePolygon(point, poly);
                if (flag) {
                    var departmentId = ui.departmentId;
                    ui.departmentId = community.id1;
                    ui.street = street.id;
                    ui.community = {};
                    ui.community.name = community.name;
                    ui.community.id1 = community.id1;
                    ui.community.id2 = community.id2;
                    if (typeof departmentId === "undefined" || departmentId != ui.departmentId) {
                        save();
                    }
                    break;
                }
            }

            if (typeof ui.community == "undefined") {
                ui.community = "此地址不属于任何社区";
            }
            runFun();
        };

        var runFun = function () {
            initStatus = true;
            if (fun.length > 0) {
                for (var i in fun) {
                    fun[i](ui, err);
                }
            }
        };

        var save = function () {
            $.ajax({
                url: APIUrl[2] + "box/save",
                type: "POST",
                async: false,
                data: ({
                    cardId: ui.cardId,
                    address: ui.address,
                    name: ui.name,
                    phone: ui.phone,
                    latitude: ui.location.lat,
                    longitude: ui.location.lng,
                    departmentId: ui.community.id1
                }),
                success: function (data) {
                }
            });
        };

        var getPolygon = function () {
            $.getJSON(APIUrl[0] + APIUrl[4].replace("$street", "11e6801f-9a5d-4a6b-be6c-e6bc7820cc57"), function (data) {
                street = data;
                isInWhere();
            });
        };

        /**
         * 计算一个点是否在多边形里
         * @param {Object} pt 标注点
         * @param {Object} poly 多边形数组
         */
        var isInsidePolygon = function (pt, poly) {
            for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
                ((poly[i].lat <= pt.lat && pt.lat < poly[j].lat) || (poly[j].lat <= pt.lat && pt.lat < poly[i].lat)) &&
                (pt.lng < (poly[j].lng - poly[i].lng) * (pt.lat - poly[i].lat) / (poly[j].lat - poly[i].lat) + poly[i].lng) &&
                (c = !c);
            return c;
        };

        init();

        return {
            getUserInfo: function (_fun) {
                if (typeof _fun === "function") {
                    if (initStatus) {
                        _fun(ui, err);
                    } else {
                        fun.push(_fun);
                    }
                } else {
                    console.error("参数错误");
                }
            }
        }
    }

    function AudioPlayer(l, t) {
        var mList, type, len, currentIndex, audio;
        if (typeof l === "object") {
            mList = l
        } else {
            return;
        }
        //type 0:单曲循环 1：顺序播放（默认） 2：随机播放
        if (typeof t !== "number" || t < 0 || t > 2) {
            type = 1;
        } else {
            type = t;
        }
        len = mList.length;
        currentIndex = -1;
        audio = null;

        var init = function () {
            var body = document.getElementsByTagName('body')[0];
            audio = document.createElement("audio");
            audio.style.display = "none";
            body.appendChild(audio);
            play();
            audio.onended = function () {
                next();
            };
        };

        var play = function () {
            if (currentIndex == -1) {
                next();
            } else {
                audio.play();
            }
        };

        var pause = function () {
            audio.pause();
        };

        var pre = function () {

        };

        var next = function () {
            var i = currentIndex;
            if (type == 0) {
                if (i == -1) {
                    i = 0;
                }
            } else if (type == 1) {
                if (i == -1) {
                    i = 0;
                } else if (i == (len - 1)) {
                    i = 0;
                } else {
                    i++;
                }
            } else if (type == 2) {
                i = parseInt(len * Math.random());
                if ((len > 1 && i == currentIndex) || i > (len - 1) || i < 0) {
                    next();
                    return;
                }
            }
            playByIdx(i);
        };

        var playByIdx = function (i) {
            audio.src = mList[i];
            audio.play();
            currentIndex = i;
        };

        var addMusic = function (m) {
            mList.push(m);
            len = mList.length;
        };
        var setMusic = function (m) {
            mList = m;
            len = mList.length;
        };
        var setType = function (t) {
            //type 0:单曲循环 1：顺序播放（默认） 2：随机播放
            if (typeof t === "number" && t >= 0 && t < 3) {
                type = t;
                //console.log(type);
            }
        };


        init();
        return {
            next: next,
            pre: pre,
            pause: pause,
            playByIdx: playByIdx,
            addMusic: addMusic,
            setMusic: setMusic,
            setType: setType
        }
    }

    function KeyControl() {
        var index = {}, size = {};

        var executeFun = function (fun, item) {
            var order = ["before", "center", "after"];
            var flag = true;
            if (typeof fun === "function") {
                flag = fun(item);
                if (typeof flag === "undefined")
                    flag = true;
            } else if (typeof fun === "object") {
                for (var key in order) {
                    if (typeof fun[order[key]] === "function" && flag) {
                        flag = fun[order[key]](item);
                        if (typeof flag === "undefined")
                            flag = true;
                    }
                }
            }
            return flag
        };

        return {
            /*普通按键监听*/
            keyListener: function (options) {
                var id = options.id, $id = $('#' + id), $item = $id;
                document.getElementById(id).onkeydown = function (e) {
                    var item = e.target;
                    switch (e && e.keyCode) {
                        case 8: //backspace
                            return executeFun(options.back, item);
                            break;
                        case 13: //enter 键
                            return executeFun(options.enter, item);
                            break;
                        case 27: //Esc
                            return executeFun(options.esc, item);
                            break;
                        case 33: //pageUp
                            return executeFun(options.pageUp, item);
                            break;
                        case 34: //pageDown
                            return executeFun(options.pageDown, item);
                            break;
                        case 37: //左键
                            return executeFun(options.left, item);
                            break;
                        case 38: //上键
                            return executeFun(options.up, item);
                            break;
                        case 39: //右键
                            return executeFun(options.right, item);
                            break;
                        case 40: //下键
                            return executeFun(options.down, item);
                            break;
                        case 48: //0
                            return executeFun(options.n0, item);
                            break;
                        case 49: //1
                            return executeFun(options.n1, item);
                            break;
                        case 50: //2
                            return executeFun(options.n2, item);
                            break;
                        case 51: //3
                            return executeFun(options.n3, item);
                            break;
                        case 52: //4
                            return executeFun(options.n4, item);
                            break;
                        case 53: //5
                            return executeFun(options.n5, item);
                            break;
                        case 54: //6
                            return executeFun(options.n6, item);
                            break;
                        case 55: //7
                            return executeFun(options.n7, item);
                            break;
                        case 56: //8
                            return executeFun(options.n8, item);
                            break;
                        case 57: //9
                            return executeFun(options.n9, item);
                            break;
                        default:
                            break;
                    }
                };

                if (options.label) {
                    $item = $id.find(options.label)
                }

                $item.focus(function () {
                    if (typeof options.focus === "function") {
                        options.focus(this);
                    }
                });

                $item.blur(function () {
                    if (typeof options.blur === "function") {
                        options.blur(this);
                    }
                });

                $item.click(function () {
                    var flag = true;
                    if (typeof options.click === "function") {
                        flag = options.click(this);
                        if (typeof flag === "undefined")
                            flag = true;
                    }
                    if (typeof options.enter === "function" && flag) {
                        $(this).attr("tabindex", "-1").focus();
                        options.enter(this);
                    }
                });
            },
            /*列表按键监听*/
            listKeyListener: function (options) {
                var self = this, id = options.id, $idLi = $('#' + id).find(options.label), length = $idLi.length;
                index[id] = 0;
                size[id] = length;

                if (typeof options.left !== "function") {
                    if (typeof options.left !== "object") {
                        options.left = function (item) {
                            var idx = $(item).index();
                            $($idLi[--idx]).attr('tabindex', -1).focus();
                        }
                    } else {
                        if (typeof options.left.center !== "function") {
                            options.left.center = function (item) {
                                var idx = $(item).index();
                                $($idLi[--idx]).attr('tabindex', -1).focus();
                            }
                        }
                    }
                }

                if (typeof options.up !== "function") {
                    if (typeof options.up !== "object") {
                        options.up = function (item) {
                            var idx = $(item).index();
                            if (idx > options.columnNum - 1) {
                                idx -= options.columnNum;
                                $($idLi[idx]).attr('tabindex', -1).focus();
                            }
                        }
                    } else {
                        if (typeof options.up.center !== "function") {
                            options.up.center = function (item) {
                                var idx = $(item).index();
                                if (idx > options.columnNum - 1) {
                                    idx -= options.columnNum;
                                    $($idLi[idx]).attr('tabindex', -1).focus();
                                }
                            }
                        }
                    }
                }


                if (typeof options.right !== "function") {
                    if (typeof options.right !== "object") {
                        options.right = function (item) {
                            var idx = $(item).index();
                            if (idx < length - 1) {
                                $($idLi[++idx]).attr('tabindex', -1).focus();
                            }
                        }
                    } else {
                        if (typeof options.right.center !== "function") {
                            options.right.center = function (item) {
                                var idx = $(item).index();
                                if (idx < length - 1) {
                                    $($idLi[++idx]).attr('tabindex', -1).focus();
                                }
                            }
                        }
                    }
                }


                if (typeof options.down !== "function") {
                    if (typeof options.down !== "object") {
                        options.down = function (item) {
                            var idx = $(item).index();
                            if (idx < length - options.columnNum) {
                                idx += options.columnNum;
                                $($idLi[idx]).attr('tabindex', -1).focus();
                            }
                        }
                    } else {
                        if (typeof options.down.center !== "function") {
                            options.down.center = function (item) {
                                var idx = $(item).index();
                                if (idx < length - options.columnNum) {
                                    idx += options.columnNum;
                                    $($idLi[idx]).attr('tabindex', -1).focus();
                                }
                            }
                        }
                    }
                }

                if (typeof options.focus === "function") {
                    var a = options.focus;
                    options.focus = function (item) {
                        index[id] = $(item).index();
                        a(item);
                    }
                } else {
                    options.focus = function (item) {
                        index[id] = $(item).index();
                    }
                }

                this.keyListener(options);
            }
        }
    }


    function GHWebSocket(cardId) {
        var wsUrl = "", _subscribe, actions = {}, client = null;
        var init = function () {
            var key = $("#GHSMLib").attr("key");
            if (key) {
                $.getJSON(APIUrl[0] + APIUrl[3].replace("$key", key), function (data) {
                    wsUrl = data.ws[0].url;
                    _subscribe = data.ws[0].subscribe;
                    if (wsUrl != "") {
                        connect();
                    } else {
                        console.error("错误的ws")
                    }
                });
            }
        };

        var connect = function () {
            var sock = new SockJS(wsUrl + cardId);
            client = Stomp.over(sock);
            client.debug = function (msg) {
                //console.debug(msg)
            };
            client.connect({}, function () {
                subscribe();
            }, onClose());

            window.onbeforeunload = function () {
                disconnect();
            };
        };
        var disconnect = function () {
            client.disconnect();
            client = null;
        };
        var subscribe = function () {
            for (var k in _subscribe) {
                client.subscribe(_subscribe[k], function (data) {
                    //console.log('进入调用:', data);
                    var body = JSON.parse(data.body);
                    var _action = body.action;
                    var _props = body.props;
                    if (actions[_action] && typeof actions[_action] === "function") {
                        actions[_action](_props, body.openId);
                    }
                });
            }
        };

        var onClose = function () {
            //console.debug('WebSocket已退出');
            return function () {
                setTimeout(function () {
                    connect();
                }, 1000);
            };
        };

        init();

        return {
            addActions: function (_actions) {
                if (typeof _actions === "object") {
                    utils.extend(actions, _actions);
                    return true;
                } else {
                    return false;
                }
            }
        }
    }

    function GeHuaShuMeiLib() {
        if (!$) {
            $ = jQuery.noConflict(true);
        }
        var version = '1.0.1.201603021740', cardId = typeof CyberCloud != "undefined" ? CyberCloud.GetParam("CardID").ParamValue ? CyberCloud.GetParam("CardID").ParamValue : CyberCloud.GetParam("UserCode").ParamValue ? CyberCloud.GetParam("UserCode").ParamValue.replace("CA", "") : "" : "";
        //WebSocket
        var WS = new GHWebSocket(cardId);

        //键盘控制
        var keyCon = new KeyControl();
        //音乐播放
        var AP = AudioPlayer;
        //用户信息获取
        var ui = new UserInfo(cardId);
        var getUserInfo = function (fun) {
            ui.getUserInfo(fun);
        };
        //用户行为记录
        var ub = new UserBehavior(cardId);

        return {
            version: version,
            cardId: cardId,
            addActions: WS.addActions,
            keyCon: keyCon,
            AudioPlayer: AP,
            getUserInfo: getUserInfo,
            utils: utils
        }
    }

    window.GHSMLib = new GeHuaShuMeiLib();
}(window, document);