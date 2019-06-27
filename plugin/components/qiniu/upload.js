import cloud from '../../api/cloud'
import util from '../../api/util'
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
  uploadFile(file){
    util.promise('wx.uploadFile',{
      url:cloud.getUploadPath(this.data.qnConf.region),
      filePath:file,
      formData:{
        token:cloud.getTokenQiniu(this.data.qnConf),
      }
    }).then(res=>{
      console.log('wx.uploadFile',res);
    })
  },
  methods:{
    changeFile:(e)=>{
      wx.chooseImage({
        count:9,
        sizeType:['compressed'],
        sourceType:['album'],
        success:res=>{
          console.log('wx.chooseImage',res);
          res.tempFiles.forEach(f=>{
            this.uploadFile(f.path)
          })
        }
      })
    },
  },

})