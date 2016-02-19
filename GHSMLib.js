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
        return $GHSMLib ? $GHSMLib.attributes[name] ? $GHSMLib.attributes[name].nodeValue : null : null;
    }

    var baseURL = $GHSMLib.src.replace("GHSMLib.js", "");
    window.GHSMLib.baseURL = baseURL;

    if (!window.jQuery || (window.jQuery && window.jQuery().jquery.substring(0, 3) < 1.9)) {
        getScript(baseURL + "lib/jquery-2.1.3.min.js", "jQuery");
    } else {
        window.GHSMLib.JQuery = window.jQuery;
    }

    var key = getAttribute("key");

    if (key) {
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

    getScript(baseURL + "apifiles/1/0/1/GHSMLib.min.js");
})();