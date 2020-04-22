# vktool
使用小程序云函数，为开发者提供更多便捷能力；  
代码地址 https://github.com/myzingy/wx-plugin-oxoo.git    
一些交互逻辑 https://www.processon.com/view/link/5d131b73e4b043f329a550a2  
你也可以将此插件部署在你的小程序插件里，为大家提供便捷

# 优点
    1. 预处理图片，支持20m以上的大图片文件  
        七牛实时图片处理接口，只支持20m内的文件，大于20m会引起图片无法加载的情况；
        这里的上传策略对每张图都做了imageslim（图片瘦身）另存预处理，上传到七牛后是2张图；
        第一张原图，如  http://qn.you.com/original.jpg
        第二张为瘦身图 ，为 http://qn.you.com/original.jpg.lim.jpg 其中 .lim.jpg 为固定格式
        通常使用可以使用lim.jpg,加速访问、降低流量；下载原图时再用原图地址   
        
    2. 支持视频上传
        支持视频上传，并自动截取视频图，通过视频地址增加 lim.jpg 访问
        如，视频返回地址为 http://qn.you.com/original.mp4
        则，视频缩略图地址为 http://qn.you.com/original.mp4.lim.jpg
        
    3. 内容安全检查(尚未实现)
        对于图片和视频的检查，本插件都是基于 lim.jpg 进行处理，
        开启后上传完成后进行自动检查并通过上传通知事件通知页面
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
# 组件  
组件 | 描述  
---------------- | --------------  
qnupload | 直接配置七牛AK、SK，即可实现上传；也支持你自行生成token   
previewImage | 官方 wx.previewImage 不能加任何文字，这个什么都可以加

   
  

### 七牛上传组件  qnupload
    建议参考 github miniprogram 中的示例，更加完善  
+ Page json文件
````
"usingComponents": {
    "qnupload": "plugin://vktool/qnupload"
}
```` 
+ Page wxml文件
````angular2html
<!-- 上传图片 -->
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
<!-- 上传视频 -->
<block wx:for="{{files2}}" wx:key="fileskey">
    <qnupload qnConf="{{qnConf2}}" upConf="{{upConf2}}"
              file="{{item}}" files="{{files2}}"
              bindevent="qnevent2" class="qnupload video">
        <video class="upload"
               show-fullscreen-btn="{{false}}"
               show-play-btn="{{false}}"
               show-center-play-btn="{{false}}"
               enable-progress-gesture="{{false}}"
               object-fit="fill"
               src="{{item.tempFilePath}}"></video>
    </qnupload>
</block>
<qnupload wx:if="{{hasAddFile2}}"
          qnConf="{{qnConf2}}" upConf="{{upConf2}}"
          file="{{item}}" files="{{files2}}"
          bindevent="qnevent2" class="qnupload video">
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
      token:'不放心ak,sk,也可以传递七牛 token',
      bucket:'fotoo',//存储空间
      fileType:'image',//image|video|audio|file def:file
      region:'华东',//存储区域
      domain:'http://xxx.xxxx.com',//你绑定的域名,非必填项
    },
    upConf:{
      prefixPath:'mkblk', //上传到七牛后有一个路径前缀，可为空
      loading:'leaf',// none|leaf|circle|ring, def leaf 上传的loading效果; none为无，可自行在page wxml中添加
      group:'def', //一个页面上多个组件的区分标识
      security:false, // 开启非法检测，默认 false
      
      //上传图片
      count:3, //最多可以选择的图片张数
      sizeType:['original'],  //['original', 'compressed'] 所选的图片的尺寸,超大图片 compressed 会引起开卡顿
      sourceType:['album'], //['album', 'camera'] 选择图片的来源      
      
      //上传视频
      compressed:true,  // 是否压缩，默认 true,
      maxDuration:60, // 视频最大时长（秒）默认 60,
      camera:'back',  // 开启摄像头 back|front 默认back
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
+ qnevent 通知事件
```html
可通过绑定event进行捕获，所有上传消息都通过事件送达
<qnupload bindevent="qnevent"></qnupload>
捕获的 e.detail 结构如下
{
    act:String
    data:[ //所有文件集合
        ...,
        file,
        ...
    ]
}   
```
e.detail.act 返回值

返回值 | 说明 | 对data 中 file 的影响
---------------- | --------------  | --------------  
chooseImage |  文件选择完成 |  初始化file
uploadStart |  开始上传  |  上传进度 file.progress 20以内 
uploadCompleted |  上传成功  |  上传进度 file.progress 100,增加 file.remote  
uploadFail |  上传失败  |  file.hasFail 为 true 

### 图片预览组件 previewImage
    与 wx.previewImage 功能相同，可以放大、滑动切换；最主要功能是可以写个 view 放在图片上，想放啥都行
    建议参考 github miniprogram 中的示例，这里不再复述
````html
<previewImage urls="{{urls}}" current="{{current}}" scaleMax="10"
                  hasHidden="{{hasHidden}}" bindevent="previewEvent">
                  ...
                  </previewImage>
````    


# 插件helper函数
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