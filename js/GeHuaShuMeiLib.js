/**
 * Created by jian_ on 2015/12/8.
 */
(function (window, document, Math) {
    var $ = null;

    var utils = (function () {
        var me = {};

        me.getTime = Date.now || function getTime() {
                return new Date().getTime();
            };

        me.extend = function (target, obj) {
            for (var i in obj) {
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
        return me;
    })();


    function GHWebSocket() {
        this.wsUrl = "";
        this.client = null;
        this._init();
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
                console.debug(msg)
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
            this.wsUrl = "http://10.191.255.121:18080/tvapi?token=1372322871";
            this.wsUrl = "http://10.0.194.15:8080/tvapi?token=1372322871";
            this.connect();
        },
        _subscribe: function () {
            this.client.subscribe('/user/topic/enter', function (data) {
                console.log('进入调用:', data);
            });
        },
        onClose: function () {
            console.debug('WebSocket已退出');
        }

    };


    function _GeHuaShuMeiLib() {
        this.options = {};
        this._initScript();
    }

    _GeHuaShuMeiLib.prototype = {
        version: '1.0.0',
        bus_name: '电视图书馆',
        bus_id: '',
        _init: function () {
            this.WS = new GHWebSocket()
        },
        _initScript: function () {
            var loadJsNum = 0, jsTotal = 2, loadTimeOut = 5000, libURL = "http://localhost:63342/library/js/";
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
        loadOptions: function (options) {
            for (var i in options) {
                this.options[i] = options[i];
            }
        }
    };

    var GeHuaShuMeiLib = new _GeHuaShuMeiLib();
    GeHuaShuMeiLib.utils = utils;

    window.GHSMLib = GeHuaShuMeiLib;

})(window, document, Math);