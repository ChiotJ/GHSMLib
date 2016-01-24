/**
 * version:1.0.0.201601241742
 * Created by jianyingshuo on 2015/12/08.
 */
'use strict';
!function (window, document) {
    var $ = null, selfURL = "http://172.16.188.26/web/GHSMLib";
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
            return "http://172.16.188.13/api/common/Image/qrCode.png?text=" + text + "&size=" + size;
        };
        me.getQueryString = function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return (r[2]);
            return null;
        };
        return me;
    })();


    function UserInfo() {
        var self = this;
        this.initStatus = false;
        this.ui = {};
        this.fun = [];
        var street;

        var init = function () {
            if (typeof CyberCloud != "undefined") {
                self.ui.cardId = CyberCloud.GetParam("CardID").ParamValue;
            } else {
                self.ui.cardId = "card1";
            }

            $.ajax({
                url: "http://wx.digital-media.com.cn/wx/box/getBoxByCardId",
                data: {"cardId": self.ui.cardId},
                type: "POST",
                dataType: 'json',
                success: function (data) {
                    if (data.success) {
                        self.ui.name = data.result.name;
                        self.ui.phone = data.result.phone;
                        self.ui.address = data.result.address;
                        self.ui.location = {};
                        self.ui.location.lat = data.result.latitude;
                        self.ui.location.lng = data.result.longitude;
                        if (typeof data.result.department === "object") {
                            self.ui.departmentId = data.result.department.id;
                        }
                        getPolygon();
                    } else {
                        self.err = "服务器错误";
                        runFun();
                    }
                },
                error: function (data) {
                    self.err = "服务器错误";
                    runFun();
                }
            });
        };


        var isInWhere = function () {
            var point = {
                lat: self.ui.location.lat,
                lng: self.ui.location.lng
            };

            var communitys = street.communitys;

            for (var key in communitys) {
                var community = communitys[key];
                var poly = community.poly;
                var flag = isInsidePolygon(point, poly);
                if (flag) {
                    var departmentId = self.ui.departmentId;
                    self.ui.departmentId = community.id1;
                    self.ui.community = {};
                    self.ui.community.name = community.name;
                    self.ui.community.id1 = community.id1;
                    self.ui.community.id2 = community.id2;
                    if (typeof departmentId === "undefined" || departmentId != self.ui.departmentId) {
                        save();
                    }
                    break;
                }
            }

            if (typeof self.ui.community == "undefined") {
                self.ui.community = "此地址不属于任何社区";
            }
            runFun();
        };

        var runFun = function () {
            self.initStatus = true;
            if (self.fun.length > 0) {
                for (var i in self.fun) {
                    self.fun[i](self.ui, self.err);
                }
            }
        };

        var save = function () {
            $.ajax({
                url: "http://wx.digital-media.com.cn/wx/box/save",
                type: "POST",
                async: false,
                data: ({
                    cardId: self.ui.cardId,
                    address: self.ui.address,
                    name: self.ui.name,
                    phone: self.ui.phone,
                    latitude: self.ui.location.lat,
                    longitude: self.ui.location.lng,
                    departmentId: self.ui.community.id1
                }),
                success: function (data) {
                }
            });
        };

        var getPolygon = function () {
            $.getJSON(selfURL + '/json/map/polygon/4d8fa1451b6ad04ed39639d864b3105c.json', function (data) {
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
    }

    UserInfo.prototype = {
        getUserInfo: function (fun) {
            if (typeof fun === "function") {
                if (this.initStatus) {
                    fun(this.ui, this.err);
                } else {
                    this.fun.push(fun);
                }
            } else {
                console.error("参数错误");
            }
        }
    };


    function AudioPlayer(l, t) {
        if (typeof l === "object") {
            this.mList = l
        } else {
            return;
        }
        //type 0:单曲循环 1：顺序播放（默认） 2：随机播放
        if (typeof t !== "number" || t < 0 || t > 2) {
            this.type = 1;
        } else {
            this.type = t;
        }
        this.len = this.mList.length;
        this.currentIndex = -1;
        this.audio = null;
        this.init();
        return this;
    }

    AudioPlayer.prototype = {
        init: function () {
            var self = this, audio = document.createElement("audio"), body = document.getElementsByTagName('body')[0];
            audio.style.display = "none";
            body.appendChild(audio);
            this.audio = audio;
            self.play();
            audio.onended = function () {
                self.next();
            };
        },
        next: function () {
            var type = this.type, i = this.currentIndex;
            if (type == 0) {
                if (i == -1) {
                    i = 0;
                }
            } else if (type == 1) {
                if (i == -1) {
                    i = 0;
                } else if (i == (this.len - 1)) {
                    i = 0;
                } else {
                    i++;
                }
            } else if (type == 2) {
                i = parseInt(this.len * Math.random());
                if ((this.len > 1 && i == this.currentIndex) || i > (this.len - 1) || i < 0) {
                    this.next();
                    return;
                }
            }
            this.playByIdx(i);
        },
        pre: function () {
        },
        pause: function () {
            this.audio.pause();
        },
        play: function () {
            if (this.currentIndex == -1) {
                this.next();
            } else {
                this.audio.play();
            }
        },
        playByIdx: function (i) {
            this.audio.src = this.mList[i];
            this.audio.play();
            this.currentIndex = i;
        },
        addMusic: function (m) {
            this.mList.push(m);
            this.len = this.mList.length;
        },
        setMusic: function (m) {
            this.mList = m;
            this.len = this.mList.length;
        },
        setType: function (t) {
            //type 0:单曲循环 1：顺序播放（默认） 2：随机播放
            if (typeof t === "number" && t >= 0 && t < 3) {
                this.type = t;
                console.log(this.type);
            }
        }

    };

    function KeyControl() {
        this.index = {};
        this.size = {};
    }


    KeyControl.prototype = {
        _executeFun: function (fun, item) {
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
        },
        /*普通按键监听*/
        keyListener: function (options) {
            var self = this, id = options.id, $id = $('#' + id), $item = $id;
            document.getElementById(id).onkeydown = function (e) {
                var item = e.target;
                switch (e && e.keyCode) {
                    case 8: //backspace
                        return self._executeFun(options.back, item);
                        break;
                    case 13: //enter 键
                        return self._executeFun(options.enter, item);
                        break;
                    case 27: //Esc
                        return self._executeFun(options.esc, item);
                        break;
                    case 33: //pageUp
                        return self._executeFun(options.pageUp, item);
                        break;
                    case 34: //pageDown
                        return self._executeFun(options.pageDown, item);
                        break;
                    case 37: //左键
                        return self._executeFun(options.left, item);
                        break;
                    case 38: //上键
                        return self._executeFun(options.up, item);
                        break;
                    case 39: //右键
                        return self._executeFun(options.right, item);
                        break;
                    case 40: //下键
                        return self._executeFun(options.down, item);
                        break;
                    case 48: //0
                        return self._executeFun(options.n0, item);
                        break;
                    case 49: //1
                        return self._executeFun(options.n1, item);
                        break;
                    case 50: //2
                        return self._executeFun(options.n2, item);
                        break;
                    case 51: //3
                        return self._executeFun(options.n3, item);
                        break;
                    case 52: //4
                        return self._executeFun(options.n4, item);
                        break;
                    case 53: //5
                        return self._executeFun(options.n5, item);
                        break;
                    case 54: //6
                        return self._executeFun(options.n6, item);
                        break;
                    case 55: //7
                        return self._executeFun(options.n7, item);
                        break;
                    case 56: //8
                        return self._executeFun(options.n8, item);
                        break;
                    case 57: //9
                        return self._executeFun(options.n9, item);
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
            self.index[id] = 0;
            self.size[id] = length;

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
                    self.index[id] = $(item).index();
                    a(item);
                }
            } else {
                options.focus = function (item) {
                    self.index[id] = $(item).index();
                }
            }

            self.keyListener(options);
        }
    };

    function GHWebSocket() {
        this.wsUrl = "";
        this.subscribe = "";
        this.actions = {};
        this.client = null;
    }

    GHWebSocket.prototype = {
        _init: function (_tvCode) {
            this.tvCode = _tvCode;
            this._verifyWS();
        },
        connect: function () {
            var self = this, sock = new SockJS(this.wsUrl + this.tvCode);
            this.client = Stomp.over(sock);
            this.client.debug = function (msg) {
                //console.debug(msg)
            };
            this.client.connect({}, function () {
                self._subscribe();
            }, this.onClose(self));

            window.onbeforeunload = function () {
                self.disconnect();
            };
        },
        disconnect: function () {
            this.client.disconnect();
            this.client = null;
        },
        _verifyWS: function () {
            var self = this, key = $("#GHSMLib").attr("key");
            if (key) {
                $.getJSON(selfURL + '/json/' + key + '.json', function (data) {
                    self.wsUrl = data.ws;
                    self.subscribe = data.subscribe;
                    if (this.wsUrl != "") {
                        self.connect();
                    } else {
                        console.error("错误的ws")
                    }
                });
            }
        },
        _subscribe: function () {
            var self = this;
            this.client.subscribe(self.subscribe, function (data) {
                //console.log('进入调用:', data);
                var body = JSON.parse(data.body);
                var _action = body.action;
                var _props = body.props;
                if (self.actions[_action] && typeof self.actions[_action] === "function") {
                    self.actions[_action](_props, body.openId);
                }
            });
        },
        onClose: function (self) {
            //console.debug('WebSocket已退出');
            return function () {
                setTimeout(function () {
                    self.connect();
                }, 1000);
            };
        },
        addActions: function (_actions) {
            if (typeof _actions === "object") {
                utils.extend(this.actions, _actions);
                return true;
            } else {
                return false;
            }
        }
    };
    function GeHuaShuMeiLib() {
        this._WS = new GHWebSocket();
        this._initScript();

        this.utils = utils;
        this.keyCon = new KeyControl();
        this.AudioPlayer = AudioPlayer;
        var ui = new UserInfo();
        this.getUserInfo = function (fun) {
            ui.getUserInfo(fun);
        };
    }

    GeHuaShuMeiLib.prototype = {
        version: '1.0.0',
        tvCode: '',
        _init: function () {
            if (typeof CyberCloud != "undefined") {
                this.tvCode = CyberCloud.GetParam("CardID").ParamValue;
                this._WS._init(this.tvCode);
            }
        },
        _initScript: function () {
            var loadJsNum = 0, jsTotal = 2, loadTimeOut = 5000, libURL = selfURL + "/lib/";
            var self = this;
            var loadJs = function () {
                loadJsNum++;
                if (loadJsNum == jsTotal) {
                    self._init();
                }
            };
            if (!window.jQuery || (window.jQuery && window.jQuery().jquery.substring(0, 3) < 1.9)) {
                jsTotal++;
                utils.loadScript(libURL + "jquery-2.1.3.min.js", function () {
                    $ = jQuery.noConflict(true);
                    loadJs();
                });
            } else {
                $ = window.jQuery;
            }
            utils.loadScript(libURL + "sockjs-1.0.0.min.js", loadJs);
            utils.loadScript(libURL + "stomp.min.js", loadJs);
            setTimeout(function () {
                if (loadJsNum != jsTotal) {
                    console.error("js文件加载超时")
                }
            }, loadTimeOut);
        },
        addActions: function (actions) {
            var r = false;
            if (typeof actions === "object") {
                if (this._WS) {
                    r = this._WS.addActions(actions);
                }
            }
            return r;
        }
    };

    window.GHSMLib = new GeHuaShuMeiLib();
}(window, document);