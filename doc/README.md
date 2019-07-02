# vktool
使用小程序云函数，为开发者提供更多便捷能力；  
代码地址 https://github.com/myzingy/wx-plugin-oxoo.git    
一些交互逻辑 https://www.processon.com/view/link/5d131b73e4b043f329a550a2  
你也可以将此插件部署在你的小程序插件里，为大家提供便捷
##使用
```
1，小程序后台添加插件
2，app.json 中引入插件
"plugins": {
    "vktool": {
      "version": "最新版本号",
      "provider": "wxd3dc4206c76f14fc"
    }
  },
```
插件市场（最新版本号）  
https://mp.weixin.qq.com/wxopen/pluginbasicprofile?action=intro&appid=wxd3dc4206c76f14fc  
## 组件  
组件 | 描述  
---------------- | --------------  
qnupload | 直接配置七牛AK、SK，即可实现上传  

   
  

##### 七牛上传组件 
##### 建议参考 github miniprogram 中的示例，更加完善  
+ Page json文件
````
"usingComponents": {
    "qnupload": "plugin://vktool/qnupload"
}
```` 
+ Page wxml文件
````angular2html
<block wx:for="{{files}}" wx:key="files.key">
    <qnupload qnConf="{{qnConf}}" upConf="{{upConf}}"
              file="{{item}}" files="{{files}}"
              bindevent="qnevent" class="qnupload">
        <view class="upload {{item?'':'add'}}" style="background-image: url('{{item.path}}')"></view>
    </qnupload>
</block>
<qnupload wx:if="{{hasAddFile}}"
        qnConf="{{qnConf}}" upConf="{{upConf}}"
          file="{{item}}" files="{{files}}"
          bindevent="qnevent" class="qnupload">
    <view class="upload add"></view>
</qnupload>
````
+ Page wxss文件
````css
.qnupload{
    display: inline-block;
    width: 200rpx;
    height: 200rpx;
    padding: 20rpx;
}
.upload{
    background-color: antiquewhite;
    position: relative;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50% 50%;
}
.upload.add:before{
    content: '';
    left:calc(50% - 50rpx);
    top:calc(50% - 10rpx);
    width: 100rpx;
    height: 20rpx;
    background-color: #FAC7B6;
    position: absolute;
}
.upload.add:after{
    content: '';
    left:calc(50% - 10rpx);
    top:calc(50% - 50rpx);
    width: 20rpx;
    height: 100rpx;
    background-color: #FAC7B6;
    position: absolute;
}
````
+ Page js 文件
````javascript
    *** data 变量中加入以下配置信息
    qnConf:{
      accessKey:'七牛的accessKey',
      secretKey:'七牛的secretKey',
      bucket:'fotoo',//存储空间
      fileType:'image',//image|video|audio|file def:file
      region:'华东',//存储区域
      domain:'http://xxx.xxxx.com',//你绑定的域名,非必填项
    },
    upConf:{
      prefixPath:'prefixPath',//上传到七牛后有一个路径前缀，可为空；（还会自动强制带一个日期前缀）
      count:3,//文件数量
      loading:'leaf',// none|leaf|circle|ring, def leaf 上传的loading效果，none为无，可自行在page wxml中添加
      group:'def', 一个页面上多个组件的区分标识
      
    },
    files:[], //组件数据放入这里展示到页面上
    hasAddFile:true,//出现上传加号
    
    *** 组件事件监听，组件所有事件都通过event返回，用act可区分具体事件
    qnevent(e){
        console.log('qnevent',e.detail);
        this.setData({
          files:e.detail.data,
          hasAddFile:e.detail.data.length<this.data.upConf.count
        })
      },
````

## 插件helper函数
插件提供一些常用函数，方便开发使用，在任意 js 引入即可调用
````javascript
var vktool = requirePlugin("vktool")
````
接口 | 描述   
---------------- | --------------  
getOpenid | 获得用户标识，依赖云函数  
getTokenQiniu | 获得七牛token，之后可以操作你的七牛云  
date_format | 将时间戳（整型10位）格式化为format中定义的格式    
strtotime | 时间串转为时间戳  
time | 时间串转为时间戳  
toast | wx.showToast 的封装   
cache | 带有过期时间的异步存储  
val | 获取 input/textarea 值，e必须是bind事件传入的event   
attr | 获取 dom 上自定义的data-key="value" 的值  
http_build_query | 将 param 键值对拼接成 url 参数，如 key1=val1&key2=val2  
promise | 微信 api 简单 promise化，可以使用 then 或 await 进行处理  
cache_clear | 清理过期缓存  
mdx | 类似MD5函数，将目标转为一个比较段的字串   