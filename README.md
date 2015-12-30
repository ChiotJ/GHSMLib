#歌华数媒电视应用库#
	version:1.0.0

##方法目录##
- [联动参数调用方法](#联动参数调用方法)
- [公共方法](#公共方法)

##业务目录##

- [电视网络图书馆](#电视网络图书馆)

##引用

```html
<script id="GHSMLib" src="GHSMLib-1.0.0.min.js" key="" type="application/javascript"></script>
```

##联动参数调用方法

- 设置联动方法
    ```js
    GHSMLib.addActions({
        goTo: function (props,user) {
            //TODO 
        }，
        bookCon：function (props,user) {
            //TODO
        },
        ...
    });
    ```    
    `goTo`动作
     
    `props`具体操作
    
    `user`用户信息

##公共方法
- 加载script
    ```js
    GHSMLib.utils.loadScript(sScriptSrc, callbackfunction);
    ```
    `sScriptSrc`script地址
     
    `callbackfunction`加载完成回调函数  
    
- 获取时间
    ```js
    GHSMLib.utils.getTime();
    ```
- 获取二维码图像地址
    ```js
    GHSMLib.utils.qrCode(text, size);
    ```    
    `text`二维码扫出内容
        
    `callbackfunction`二维码大小
    
    返回值为二维码图像地址




##电视网络图书馆(f704916f62ea87b11c11ad0bfeadb25f)##

###联动参数###
- 跳转到相应业务(全局)
       
    阅读图书：
    ```json
    {"openId" : "","tv" : "","action":"goTo","props":{"service":"readBook","ssid":"","dxid":"","bookName":"","size":"","pageNum":""}}
    ```
    观看视频：
    ```json
    {"openId" : "","tv" : "","action":"goTo","props":{"service":"playVideo","vodId":"","bookName":"","playNum":""}}
    ```
    ```json
    参数注释：{"playNum":"播放第几个视频，从1开始计数"}
    ```
    图书中心：
    ```json
    {"openId" : "","tv" : "","action":"goTo","props":{"service":"bookCenter","clazzFlag":"","type":"","onelevelId":""}}
    ```
    ```json
    参数注释：{"clazzFlag":"分类名称","type" : {"0":"图书","1":"视频"},"onelevelId":"视频分类填写此值，例：10000"}
    ```
    借阅中心：
    ```json
    {"openId" : "","tv" : "","action":"goTo","props":{"service":"borrow"}}
    ```
    排行中心：
    ```json
    {"openId" : "","tv" : "","action":"goTo","props":{"service":"ranking","type":""}}
    ```
    ```json
    参数注释：{"type" : {"0":"图书","1":"视频"}}
    ```
    我的书架：
    ```json
    {"openId" : "","tv" : "","action":"goTo","props":{"service":"bookcase","type":"","tvCode":""}}
    ```
    ```json
    参数注释：{"type" : {"0":"图书","1":"视频"},"tvCode":"机顶盒号"}
    ```
    搜索中心：
    ```json
    {"openId" : "","tv" : "","action":"goTo","props":{"service":"search","search":"","type":""}}
    ```
    ```json
    参数注释：{"search":"搜索内容","type" : {"1":"图书","2":"知识","3":"视频"}}
    ```
    返回：
    ```json
    {"openId" : "","tv" : "","action":"goTo","props":{"service":"backSpace"}}
    ```
    退出：
    ```json
    {"openId" : "","tv" : "","action":"goTo","props":{"service":"exit"}}
    ```
- 图书操作(阅读图书)

    上一页：
    ```json
    {"openId" : "","tv" : "","action":"bookCon","props":{"service":"pageUp"}}
    ```
    下一页：
    ```json
    {"openId" : "","tv" : "","action":"bookCon","props":{"service":"pageDown"}}
    ```		
    放大缩小：
    ```json
    {"openId" : "","tv" : "","action":"bookCon","props":{"service":"zoom","zoomRate":"","center":{"x":"","y":""}}}
    ```
    ```json
    参数注释：{"zoomRate":"放大缩小比例，例：1.5","center" : {"x":"横向偏移量","y":"纵向偏移量"}}
    ```		
    跳转到某一页：
	```json
    {"openId" : "","tv" : "","action":"bookCon","props":{"service":"pageTo","pageNum":""}}
    ```	
- 视频操作（观看视频）

    播放：
    ```json
    {"openId" : "","tv" : "","action":"videoCon","props":{"service":"play","time":""}}
    ```
    ```json
    参数注释：{"time":"播放时间，如果为-1或不填则继续播放，如果填写则跳到对应时间，单位为秒"}
    ```
    暂停：
    ```json
    {"openId" : "","tv" : "","action":"videoCon","props":{"service":"pause"}}
    ```


