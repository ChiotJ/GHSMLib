/**
 * Created by jian_ on 2016/2/17.
 */
(function () {
    function getScript(src) {
        document.write('<' + 'script src="' + src + '"' + ' type="text/javascript"><' + '/script>');
    }

    var $GHSMLib = document.getElementById("GHSMLib");

    if (!$GHSMLib) {
        console.error("Error Script Id");
        return;
    }

    function getAttribute(name) {
        return $GHSMLib ? $GHSMLib.attributes[name] ? $GHSMLib.attributes[name].nodeValue : "" : "";
    }

    var baseURL = $GHSMLib.src.replace("GHSMLib.js", "");
    window.GHSMLib.baseURL = baseURL;

    if (!window.jQuery || (window.jQuery && window.jQuery().jquery.substring(0, 3) < 1.9)) {
        getScript(baseURL + "lib/jquery-2.1.3.min.js");
    } else {
        window.GHSMLib.JQuery = window.jQuery;
    }

    var getWebSocket = false;
    window.GHSMLib.getJQuery = false;

    var $lib = getAttribute("lib").trim().toLowerCase();
    if ($lib) {
        if ($lib.substr($lib.length - 1, 1) !== ",") {
            $lib += ",";
        }
        var libs = $lib.split(",");
        for (var l in libs) {
            switch (libs[l]) {
                case "jquery":
                    window.GHSMLib.getJQuery = true;
                    break;
                case "websocket":
                    getWebSocket = true;
                    break;
                case "txmap":
                    getScript(baseURL + "lib/TXmap/api.js");
                    getScript(baseURL + "lib/TXmap/main_2.3.14.js");
                    break;
            }
        }
    }

    var key = getAttribute("key");

    if (key || getWebSocket) {
        getScript(baseURL + "lib/sockjs-1.0.0.min.js");
        getScript(baseURL + "lib/stomp.min.js");
    }

    window.GHSMLib.APIUrl = [
        baseURL + '/json/',
        'http://172.16.188.13/api/common/Image/qrCode.png?text=$text&size=$size',
        'http://172.16.188.26/chaowai/',
        'application/$key.json',
        'map/polygon/$street.json'
    ];

    if (!window.GHSMLibOnLoad) {
        window.GHSMLibOnLoad = function () {
            console.log("GHSMLib  is loaded successfully")
        };
    }


    getScript(baseURL + "apifiles/1/0/2/GHSMLib.min.js");
})();