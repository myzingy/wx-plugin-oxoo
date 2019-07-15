// plugin/components/image/proview.js
import util from '../../api/util'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    urls:{
      type:Array,
      value:[],
    },
    current:{
      type:String,
      value:''
    },
    hasHidden:{
      type:Boolean,
      value:true,
    },
    scaleMax:{
      type:Number,
      value:10,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    width:0,
    height:0,
    swiperCurrent:0,
    hasDots:false,
    urlsLoaded:[],
  },
  lifetimes:{
    attached:function(){
      let sys=wx.getSystemInfoSync()
      this.setData({
        width:sys.windowWidth,
        height:sys.windowHeight,
      })
    },
  },
  observers: {
    'urls': function(urls) {
      console.log('observers.urls',urls)
      let current=0;
      let urlsLoaded=[]
      this.data.urls.forEach((url,cu)=>{
        urlsLoaded[cu]=false
        if(url==this.data.current){
          current=cu;
          return true;
        }
      })
      this.setData({
        swiperCurrent:current,
        hasDots:this.data.urls.length>1,
        urlsLoaded:urlsLoaded,
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    swiperChange(e){
      console.log(e)
      this.triggerEvent('event',{
        act:'current',
        data:{...e.detail}
      })
    },
    imageLoaded(e){
      console.log('imageLoaded(e)',e)
      let urlsLoaded=this.data.urlsLoaded;
      urlsLoaded[util.attr(e,'index')]=true;
      this.setData({
        urlsLoaded:urlsLoaded,
      })
    }
  }
})
