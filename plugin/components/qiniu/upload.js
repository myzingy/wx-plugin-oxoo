import cloud from '../../api/cloud'
import util from '../../api/util'
Component({
  properties:{
    /**
     * qnConf.accessKey
     * qnConf.secretKey
     * qnConf.bucket
     * qnConf.fileType image|video|audio|file def:file
     * qnConf.region 华东
     */
    qnConf:{
      type:Object,
      value:null
    },
    /**
     * upConf.prefixPath 前置路径
     * upConf.count  几个文件
     */
    upConf:{
      type:Object,
      value:null
    }
  },
  data: {

  },
  attached: async function(){
    console.log('this.data.qnConf',this.data.qnConf)
    cloud.getTokenQiniu(this.data.qnConf)
    this.files=[];
  },

  methods:{
    async uploadFile(file,fileIndex=0){
      if(this.files[fileIndex] && this.files[fileIndex].progress==100) return;//已上传
      let token=await cloud.getTokenQiniu(this.data.qnConf)
      let filename=file.split('.');
      if(filename[filename.length-1].length<5){
        filename=util.str2key(file)+'.'+filename[filename.length-1]
      }else{
        filename=util.str2key(file)
      }
      let prefixPath=this.data.upConf.prefixPath?this.data.upConf.prefixPath:'';
      if(prefixPath && prefixPath[prefixPath.length-1]!='/'){
        prefixPath+='/';
      }
      this.files[fileIndex].progress=0;
      console.log('wx.uploadFile.file',file,filename);
      this.triggerEvent('event',{act:'uploadStart',data:this.files,fileCurrent:fileIndex})
      util.promise('wx.uploadFile',{
        url:cloud.getUploadPath(this.data.qnConf.region),
        filePath:file,
        name: 'file',
        header: {
          //"Content-Type": "multipart/form-data"
        },
        formData:{
          token:token,
          'x:userpath':prefixPath,
          'x:filename':filename,
        }
      }).then(res=>{
        console.log('wx.uploadFile.success',res);
        this.files[fileIndex].progress=100;
        this.files[fileIndex].remote=JSON.parse(res.data);
        this.triggerEvent('event',{act:'uploadCompleted',data:this.files,fileCurrent:fileIndex})
      }).catch(res=>{
        console.log('wx.uploadFile.fail',res);
        this.files[fileIndex].hasFail=true;
        this.triggerEvent('event',{act:'uploadFail',data:this.files,fileCurrent:fileIndex})
      })
    },
    changeFile(e){
      let count=this.data.upConf.count||1;
      let nowCount=this.files.length;
      let fileCurrent=util.attr(e,'current')||0;
      let hasEdit=false;
      if(fileCurrent==0 && nowCount==0){//首次选择
        hasEdit=false;
      }else{//
        if(this.files[nowCount]==null){//新增
          hasEdit=false;
        }else{
          hasEdit=true;
        }

      }
      wx.chooseImage({
        count:hasEdit?1:(count-nowCount),
        sizeType:['compressed'],
        sourceType:['album'],
        success:res=>{
          console.log('wx.chooseImage',res);
          this.triggerEvent('event',{act:'chooseImage',data:this.files})
          if(hasEdit){
            this.files[fileCurrent]=res.tempFiles[0]
            this.uploadFile(res.tempFiles[0].path,fileCurrent)
          }else{
            this.files=this.files.concat(res.tempFiles);
            this.files.forEach((f,fi)=>{
              this.uploadFile(f.path,fi)
            })
          }
        }
      })
    },
  },

})