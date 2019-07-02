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
     * upConf.loading none|leaf|circle|ring, def leaf
     */
    upConf:{
      type:Object,
      value:null
    },
    /**
     * this file
     */
    file:{
      type:Object,
      value:{},
    },
    /**
     * this files
     */
    files:{
      type:Array,
      value:[],
    }

  },
  data: {

  },
  attached: async function(){
    console.log('this.data.qnConf',this.data.qnConf)
    cloud.getTokenQiniu(this.data.qnConf)
    this.files=[];
    if(this.data.files.length>0){
      this.files=this.data.files;
    }
  },
  observers: {
    'files': function(files) {
      this.files=this.data.files;
    }
  },
  methods:{
    async uploadFile(file,fileIndex=0){
      if(this.files[fileIndex] && this.files[fileIndex].path.indexOf('http://tmp')<0) return;//已上传
      if(this.files[fileIndex] && this.files[fileIndex].progress==100) return;//已上传
      let token=await cloud.getTokenQiniu(this.data.qnConf)
      let filename=file.split('.');
      if(filename[filename.length-1].length<5){
        filename=util.mdx(file)+'.'+filename[filename.length-1]
      }else{
        filename=util.mdx(file)
      }
      let prefixPath=this.data.upConf.prefixPath?this.data.upConf.prefixPath:'';
      if(prefixPath && prefixPath[prefixPath.length-1]!='/'){
        prefixPath+='/';
      }
      this.files[fileIndex].progress=Math.random()*20+10;
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
      let fileCurrent=0
      if(this.data.file){
        fileCurrent=this.data.file.current
      }else{
        fileCurrent=this.files.length;
      }
      let hasEdit=false;
      if(fileCurrent==0 && nowCount==0){//首次选择
        hasEdit=false;
      }else{//
        if(this.files[fileCurrent] && this.files[fileCurrent]!=null){//新增
          hasEdit=true;
        }else{
          hasEdit=false;
        }
      }
      console.log({
        'this.data.file':this.data.file,
        count:count,
        nowCount:nowCount,
        fileCurrent:fileCurrent,
        hasEdit:hasEdit
      })
      if(!hasEdit && count-nowCount<1){
        return util.toast('最多只能上传'+count+'个文件','none');
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
            this.files[fileCurrent].current=fileCurrent;
            this.uploadFile(res.tempFiles[0].path,fileCurrent)
          }else{
            res.tempFiles.forEach((f,fi)=>{
              f.current=nowCount+fi;
              this.files.push(f)
            })
            this.files.forEach((f,fi)=>{
              this.uploadFile(f.path,fi)
            })
          }
        }
      })
    },
  },

})