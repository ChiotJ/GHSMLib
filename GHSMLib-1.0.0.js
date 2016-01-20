/**
 * version:1.0.0.201601201229
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
    window.GHSMLib.utils = utils;
    window.GHSMLib.keyCon = new KeyControl();
    window.GHSMLib.AudioPlayer = AudioPlayer;
}(window, document);