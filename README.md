#歌华数媒电视应用库#
	version:1.0.0

##方法目录##
- [联动参数调用方法](#联动参数调用方法)
- [公共方法](#公共方法)

##业务目录##

- [电视网络图书馆](#电视网络图书馆)

##联动参数调用方法

- 设置联动方法

        GHSMLib.addActions({
            goTo: function (props) {
                //TODO 
            }，
            bookCon：function (props) {
                //TODO
            },
            ...
        });
        
    `goTo`动作
     
    `props`具体操作

##公共方法
- 加载script

        GHSMLib.utils.loadScript(sScriptSrc, callbackfunction);
        
    `sScriptSrc`script地址
     
    `callbackfunction`加载完成回调函数  
    
- 获取时间

        GHSMLib.utils.getTime();
    
- 加载二维码

        GHSMLib.utils.qrCode(text, size);
        
    `text`二维码扫出内容
          
    `callbackfunction`二维码大小




##电视网络图书馆##

###联动参数###
- 跳转到相应业务(全局)
       
    	阅读图书：
		{"actions":"goTo","props":{"service":"readBook","bookId":"","pageNo":"","isZoom":"","zoomRate":"","center":{"x":"","y":""}}}

		观看视频：
		{"actions":"goTo","props":{"service":"playVideo","videoId":"","time":""}}
    
- 图书操作(阅读图书)

		上一页：
		{"actions":"bookCon","props":{"service":"pageUp","bookId":"","pageNo":""}}

	    下一页：
		{"actions":"bookCon","props":{"service":"pageDown","bookId":"","pageNo":""}}

	    放大缩小：
		{"actions":"bookCon","props":{"service":"zoom","bookId":"","pageNo":"","zoomRate":"","center":{"x":"","y":""}}}

	    跳转到某一页：
		{"actions":"bookCon","props":{"service":"pageTo","bookId":"","pageNo":""}}
    
- 视频操作（观看视频）

		播放：
		{"actions":"videoCon","props":{"service":"play","videoId":""}}

	    暂停：
		{"actions":"videoCon","props":{"service":"pause","videoId":""}}



