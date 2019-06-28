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

  methods:{
    async uploadFile(file){
      let token=await cloud.getTokenQiniu(this.data.qnConf)
      let filename=file.split('.');
      if(filename[filename.length-1].length<5){
        filename=util.str2key(file)+'.'+filename[filename.length-1]
      }else{
        filename=util.str2key(file)
      }
      console.log('wx.uploadFile.file',file,filename);
      util.promise('wx.uploadFile',{
        url:cloud.getUploadPath(this.data.qnConf.region),
        filePath:file,
        name: 'file',
        header: {
          //"Content-Type": "multipart/form-data"
        },
        formData:{
          token:token,
          'x:userpath':'userpath/',
          'x:filename':filename,
        }
      }).then(res=>{
        console.log('wx.uploadFile',res);
      })
    },
    changeFile(e){
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