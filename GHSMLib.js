/**
 * Created by jian_ on 2016/2/17.
 */
(function () {
    function getScript(src) {
        document.write('<' + 'script src="' + src + '"' + ' type="text/javascript"><' + '/script>');
    }

    var baseURL = document.getElementById("GHSMLib").src.replace("GHSMLib.js", "");
    window.GHSMLib.baseURL = baseURL;

    if (!window.jQuery || (window.jQuery && window.jQuery().jquery.substring(0, 3) < 1.9)) {
        getScript(baseURL + "lib/jquery-2.1.3.min.js", "jQuery");
    } else {
        window.GHSMLib.JQuery = window.jQuery;
    }

    var tools = document.getElementById("GHSMLib").attributes.getNamedItem("tools").nodeValue.split(",");

    console.log(tools);
    getScript(baseURL + "lib/sockjs-1.0.0.min.js");
    getScript(baseURL + "lib/stomp.min.js");
    getScript(baseURL + "apifiles/1/0/1/GHSMLib.js");
})();