import cloud from '../../api/cloud'
Component({
  properties:{
    qnConf:{
      type:Object,
      value:null
    }
  },
  data: {

  },
  attached: async function(){
    console.log('this.data.qnConf',this.data.qnConf)
    cloud.getTokenQiniu(this.data.qnConf)
  },
  methods:{
    changeFile:(e)=>{
      wx.chooseImage({
        count:9,
        sizeType:['compressed'],
        sourceType:['album'],
        success:res=>{
          console.log('wx.chooseImage',res);
        }
      })
    },
  },

})