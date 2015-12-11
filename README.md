#歌华数媒电视应用库
	version:1.0.0

##业务目录

[电视网络图书馆](#电视网络图书馆)

##电视网络图书馆

###联动参数
- 跳转到相应业务(全局)
       
    	阅读图书：
		{"actions":"goTo","props":{"service":"readBook","bookId":"","pageNo":"","isZoom":"","zoomRate":"","center":""}}

		观看视频：
		{"actions":"goTo","props":{"service":"playVideo","videoId":"","timeTo":""}}
    
- 图书操作(阅读图书图书)

		上一页：
		{"actions":"bookCon","props":{"service":"pageUp","bookId":"","pageNoTo":""}}

	    下一页：
		{"actions":"bookCon","props":{"service":"pageDown","bookId":"","pageNoTo":""}}

	    放大缩小：
		{"actions":"bookCon","props":{"service":"zoom","bookId":"","pageNo":"","zoomRate":"","center":""}}

	    跳转到某一页：
		{"actions":"bookCon","props":{"service":"pageTo","bookId":"","pageNoTo":""}}
    
- 视频操作（观看视频）

		播放：
		{"actions":"videoCon","props":{"service":"play","videoId":""}}

	    暂停：
		{"actions":"videoCon","props":{"service":"pause","videoId":""}}
