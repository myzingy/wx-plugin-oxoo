// plugin/components/image/proview.js
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
  },
  lifetimes:{
    attached:function(){
      let current=0;
      this.data.urls.forEach((url,cu)=>{
        if(url==this.data.current){
          current=cu;
          return true;
        }
      })
      let sys=wx.getSystemInfoSync()
      this.setData({
        width:sys.windowWidth,
        height:sys.windowHeight,
        swiperCurrent:current,
        hasDots:this.data.urls.length>1,
      })
    },
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
    }
  }
})
