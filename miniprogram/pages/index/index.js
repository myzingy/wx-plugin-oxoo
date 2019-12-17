var plugin = requirePlugin("myPlugin")
Page({
  data:{
    qnConf:{
      accessKey:'p7WjLuVs1GTpFRH_7mnZ0KidZfWXNh5_nW_2X_eJ',
      secretKey:'1mWb6EV70xL2opJU1uwWk9Z7MyAUjPF8cLVwvd9x6',
      bucket:'fotoo',
      fileType:'image',
      region:'华东',
      domain:'http://qn001.pfotoo.com',
    },
    upConf:{
      prefixPath:'mkblk', //上传到七牛后有一个路径前缀，可为空
      count:3, //最多可以选择的图片张数
      sizeType:['original'],  //['original', 'compressed'] 所选的图片的尺寸
      sourceType:['album'], //['album', 'camera'] 选择图片的来源
      //security:true,
    },
    files:[],
    hasAddFile:true,//出现上传加号
    token:'',//七牛token

    qnConf2:{
      accessKey:'p7WjLuVs1GTpFRH_7mnZ0KidZfWXNh5_nW_2X_eJ',
      secretKey:'mWb6EV70xL2opJU1uwWk9Z7MyAUjPF8cLVwvd9x6',
      //token:'p7WjLuVs1GTpFRH_7mnZ0KidZfWXNh5_nW_2X_eJ:4NUt3l_-rUltAw0f0XGYfFEq32k=:eyJyZXR1cm5Cb2R5Ijoie1wia2V5XCI6XCIkKGtleSlcIixcImJ1Y2tldFwiOlwiJChidWNrZXQpXCIsXCJtaW1lVHlwZVwiOlwiJChtaW1lVHlwZSlcIixcImZzaXplXCI6XCIkKGZzaXplKVwifSIsInNhdmVLZXkiOiIkKHg6dXNlcnBhdGgpJCh4OmZpbGVuYW1lKSIsInNjb3BlIjoiZm90b28iLCJkZWFkbGluZSI6MTU2MjgzMjM4MH0=',
      bucket:'fotoo',
      fileType:'video',
      region:'华东',
      domain:'http://qn001.pfotoo.com',
    },
    upConf2:{
      prefixPath:'ustoken',
      count:3,
      group:'222',
      loading:'ring',
      compressed:false,
    },
    files2:[],
    hasAddFile2:true,//出现上传加号

    hasHidden:true,//图片预览
    currentIndex:0,

    fsm:wx.getFileSystemManager(),//分块上传依赖
    hasIphone:false,
  },
  onLoad: function() {
    console.log(plugin)
    plugin.getOpenid().then(res=>{
      console.log(res);
    })
    plugin.getTokenQiniu({
      accessKey:'p7WjLuVs1GTpFRH_7mnZ0KidZfWXNh5_nW_2X_eJ',
      secretKey:'mWb6EV70xL2opJU1uwWk9Z7MyAUjPF8cLVwvd9x6',
      bucket:'fotoo',
      fileType:'file',
    }).then(res=>{
      console.log(res);
      this.setData({
        token:res,
      })
    })
    //this.previewImage()
    let sys=wx.getSystemInfoSync();
    this.setData({
      hasIphone:sys.system.toLowerCase().indexOf('ios')>-1,
    })
  },
  qnevent(e){
    console.log('qnevent',e.detail);
    let fdata=e.detail.data
    if(e.detail.act=='uploadFail'){
      plugin.toast('上传失败','none');
    }
    this.setData({
      files:fdata,
      hasAddFile:fdata.length<this.data.upConf.count
    })
  },
  qnevent2(e){
    console.log('qnevent2',e.detail);
    this.setData({
      files2:e.detail.data,
      hasAddFile2:e.detail.data.length<this.data.upConf2.count
    })
  },
  previewImage(){
    let p1='http://qn001.pfotoo.com/oxcc/md147418.jpg.lim.jpg?x='
    this.setData({
      urls:[
        p1,
        'http://qn001.pfotoo.com/mkblk/md441234.jpg.lim.jpg?x=',
      ],
      current:p1,
      hasHidden:false,
    })
  },
  previewEvent(e){
    console.log('previewEvent(e)',e)
    this.setData({
      currentIndex:e.detail.data.current
    })
  },
  previewHide(){
    this.setData({
      currentIndex:0,
      hasHidden:true,
    })
  },
})