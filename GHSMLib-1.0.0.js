/**
 * Created by jian_ on 2015/12/8.
 */
(function (window, document, Math) {
    var $ = null;

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
        return me;
    })();


    function GHWebSocket() {
        this.wsUrl = "";
        this.actions = {};
        this.client = null;
    }

    GHWebSocket.prototype = {
        _init: function () {
            this._verifyWS();
        },
        connect: function () {
            var self = this;
            var sock = new SockJS(this.wsUrl);
            this.client = Stomp.over(sock);

            this.client.debug = function (msg) {
                //console.debug(msg)
            };

            this.client.connect({}, function () {
                self._subscribe();
            }, this.onClose);

            window.onbeforeunload = function () {
                self.disconnect();
            };
        },
        disconnect: function () {
            this.client.disconnect();
            this.client = null;
        },
        _verifyWS: function () {
            var key = $("#GHSMLib").attr("key");
            var tvCode = "1372322871";
            if (key === "f704916f62ea87b11c11ad0bfeadb25f") {
                this.wsUrl = "http://10.191.255.121:7180/tvlibrary/tv/api/ws?tvCode=" + tvCode;
            }

            if (this.wsUrl != "") {
                this.connect();
            } else {
                console.error("错误的key")
            }


        },
        _subscribe: function () {
            var self = this;
            this.client.subscribe('/user/actions', function (data) {
                console.log('进入调用:', data);
                var body = eval("[" + data.body + "]")[0];
                var _action = body.action;
                var _props = body.props;
                if (self.actions[_action] && typeof self.actions[_action] === "function") {
                    self.actions[_action](_props, body.openId);
                }
            });
        },
        onClose: function () {
            //console.debug('WebSocket已退出');
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


    function _GeHuaShuMeiLib() {
        this._WS = new GHWebSocket();
        this._initScript();
    }

    _GeHuaShuMeiLib.prototype = {
        version: '1.0.0',
        _init: function () {
            this._WS._init();
        },
        _initScript: function () {
            var loadJsNum = 0, jsTotal = 2, loadTimeOut = 5000, libURL = "http://localhost/ws/GHSMLib/lib/";
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

    var GeHuaShuMeiLib = new _GeHuaShuMeiLib();
    GeHuaShuMeiLib.utils = utils;

    window.GHSMLib = GeHuaShuMeiLib;

})(window, document, Math);