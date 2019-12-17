import cloud from '../../api/cloud'
import util from '../../api/util'
const chunkSize = 1024*1024*4 //4m
function str2ab(str) {
  var buf = new ArrayBuffer(str.length);
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
const base64ToUrlSafe = function(v) {
  return v.replace(/\//g, '_').replace(/\+/g, '-');
};

const urlsafeBase64Encode = function(jsonFlags) {
  console.log('urlsafeBase64Encode',jsonFlags);
  //var encoded = new Buffer(jsonFlags).toString('base64');
  const base64 = wx.arrayBufferToBase64(str2ab(jsonFlags))
  return base64ToUrlSafe(base64);
};
Component({
  properties:{
    /**
     * qnConf.accessKey
     * qnConf.secretKey
     * qnConf.token
     * qnConf.bucket
     * qnConf.fileType image|video|audio|file def:file
     * qnConf.region 华东
     * qnConf.domain 域名
     */
    qnConf:{
      type:Object,
      value:null
    },
    /**
     * upConf.prefixPath 前置路径
     * upConf.count  最多可以选择的图片张数
     * upConf.loading none|leaf|circle|ring, def leaf
     * upConf.group 一个页面上多个组件的区分标识
     * upConf.sizeType ['original', 'compressed'] 所选的图片的尺寸
     * upConf.sourceType ['album', 'camera'] 选择图片的来源
     * upConf.compressed 是否压缩，默认 true,
     * upConf.maxDuration 视频最大时长（秒）默认 60,
     * upConf.camera 开启摄像头 back|front 默认back
     * upConf.security 开启非法检测，默认 false
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
    },
    /**
     * wx.getFileSystemManager
     */
    fsm:{
      type:Object,
      value:null,
    }

  },
  data: {

  },
  attached: async function(){
    this.upConfGroup='def'
    console.log('this.data.qnConf',this.data.qnConf)
    cloud.getTokenQiniu(this.data.qnConf)
    this.files={};
    this.files[this.upConfGroup]=[];
    if(this.data.files.length>0){
      this.files[this.upConfGroup]=this.data.files;
    }
  },
  observers: {
    'files': function(files) {
      //console.log(this.files,this.upConfGroup,this.data.files)
      if(!this.files) return;
      this.files[this.upConfGroup]=this.data.files;
    },
    'qnConf':function(qnConf){
      cloud.getTokenQiniu(qnConf)
    },
  },
  methods:{
    async uploadFile(file,fileIndex=0){
      console.log('uploadFile',this.files[this.upConfGroup][fileIndex])
      if(this.files[this.upConfGroup][fileIndex] && this.files[this.upConfGroup][fileIndex].path.indexOf('://tmp')<0) return;//已上传
      if(this.files[this.upConfGroup][fileIndex] && this.files[this.upConfGroup][fileIndex].progress==100) return;//已上传
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
      this.files[this.upConfGroup][fileIndex].progress=parseInt(Math.random()*20+10);
      console.log('wx.uploadFile.file',this.files[this.upConfGroup][fileIndex],filename);
      console.log('urlsafeBase64Encode',urlsafeBase64Encode(this.data.qnConf.bucket+':'+prefixPath+filename+'.lim.jpg'));
      this.triggerEvent('event',{act:'uploadStart',data:this.files[this.upConfGroup],fileCurrent:fileIndex})


      util.promise('wx.uploadFile',{
        url:cloud.getUploadPath(this.data.qnConf.region),
        filePath:file,
        name: 'file',
        header: {
          //"Content-Type": "multipart/form-data"
          //"Content-Type":"application/x-www-form-urlencoded",
        },
        formData:{
          token:token,
          'x:userpath':prefixPath,
          'x:filename':filename,
          'x:filesize':this.files[this.upConfGroup][fileIndex].size,
          'x:limkey':urlsafeBase64Encode(this.data.qnConf.bucket+':'+prefixPath+filename+'.lim.jpg'),
          //'x:limmp4':urlsafeBase64Encode(this.data.qnConf.bucket+':'+prefixPath+filename+'.lim.mp4'),
        }
      }).then(async res=>{
        console.log('wx.uploadFile.success',res);
        let remote=JSON.parse(res.data);
        if(remote.error){
          this.files[this.upConfGroup][fileIndex].hasFail=true;
          this.triggerEvent('event',{act:'uploadFail',data:this.files[this.upConfGroup],fileCurrent:fileIndex})
          return;
        }
        remote.url=this.files[this.upConfGroup][fileIndex].conf.domain+'/'+remote.key
        let securityFlag=true
        if(this.data.upConf.security){
          console.log('cloud.security',remote.url+'.lim.jpg');
          securityFlag=await cloud.security(remote.url+'.lim.jpg')
        }
        if(securityFlag){
          this.files[this.upConfGroup][fileIndex].remote=remote
          this.files[this.upConfGroup][fileIndex].progress=100;
          this.triggerEvent('event',{act:'uploadCompleted',data:this.files[this.upConfGroup],fileCurrent:fileIndex})
        }else{
          this.files[this.upConfGroup][fileIndex].hasFail=true;
          this.triggerEvent('event',{act:'uploadFail',data:this.files[this.upConfGroup],fileCurrent:fileIndex})
        }
      }).catch(res=>{
        console.log('wx.uploadFile.fail',res);
        this.files[this.upConfGroup][fileIndex].hasFail=true;
        this.triggerEvent('event',{act:'uploadFail',data:this.files[this.upConfGroup],fileCurrent:fileIndex})
      })
    },
    changeFile(e){
      //return console.log(urlsafeBase64Encode('fotoo:prefixPath/md477040.jpeg.lim.jpg'))
      let count=this.data.upConf.count||1;
      let nowCount=this.files[this.upConfGroup].length;
      let fileCurrent=0
      if(this.data.file){
        fileCurrent=this.data.file.current
      }else{
        fileCurrent=this.files[this.upConfGroup].length;
      }
      let hasEdit=false;
      if(fileCurrent==0 && nowCount==0){//首次选择
        hasEdit=false;
      }else{//
        if(this.files[this.upConfGroup][fileCurrent] && this.files[this.upConfGroup][fileCurrent]!=null){//新增
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
        hasEdit:hasEdit,
        qnConf:this.data.qnConf
      })
      if(!hasEdit && count-nowCount<1){
        return util.toast('最多只能上传'+count+'个文件','none');
      }
      if('video'==this.data.qnConf.fileType){
        wx.chooseVideo({
          sourceType:this.data.upConf.sourceType?this.data.upConf.sourceType:['album', 'camera'],
          compressed:this.data.upConf.compressed===false?false:true,
          maxDuration:this.data.upConf.maxDuration?this.data.upConf.maxDuration:60,
          camera:this.data.upConf.camera?this.data.upConf.camera:'back',//back,
          // front
          success:res=>{
            console.log('wx.chooseVideo',res);
            let hasUploadBlock=(this.data.fsm?true:false) && res.tempFiles[0].size > chunkSize ;
            res.current=nowCount
            res.progress=0
            res.path=res.tempFilePath
            if(hasEdit){
              this.files[this.upConfGroup][fileCurrent]=res
              this.files[this.upConfGroup][fileCurrent].current=fileCurrent;
              this.files[this.upConfGroup][fileCurrent].progress=0
              if(hasUploadBlock){
                this.uploadFileBlock(res,fileCurrent)
              }else{
                this.uploadFile(res.path,fileCurrent)
              }
            }else{
              this.files[this.upConfGroup].push(res)
              this.files[this.upConfGroup].forEach((f,fi)=>{
                if(hasUploadBlock && f.size > chunkSize){
                  this.uploadFileBlock(f,fi)
                }else {
                  this.uploadFile(f.path, fi)
                }
              })
            }
            this.triggerEvent('event',{act:'chooseImage',data:this.files[this.upConfGroup]})
          }
        })
      }else{
        wx.chooseImage({
          count:hasEdit?1:(count-nowCount),
          sizeType:this.data.upConf.sizeType?this.data.upConf.sizeType:['original', 'compressed'],
          sourceType:this.data.upConf.sourceType?this.data.upConf.sourceType:['album', 'camera'],
          success:res=>{
            console.log('wx.chooseImage',res);
            let hasUploadBlock=(this.data.fsm?true:false) && res.tempFiles[0].size > chunkSize ;
            if(hasEdit){
              this.files[this.upConfGroup][fileCurrent]=res.tempFiles[0]
              this.files[this.upConfGroup][fileCurrent].current=fileCurrent;
              this.files[this.upConfGroup][fileCurrent].progress=0
              this.files[this.upConfGroup][fileCurrent].conf={
                group:this.upConfGroup,
                domain:this.data.qnConf.domain,
                fileType:this.data.qnConf.fileType,
              }
              if(hasUploadBlock){
                this.uploadFileBlock(res.tempFiles[0],fileCurrent)
              }else{
                this.uploadFile(res.tempFiles[0].path,fileCurrent)
              }
            }else{
              res.tempFiles.forEach((f,fi)=>{
                f.current=nowCount+fi;
                f.progress=0;
                f.conf={
                  group:this.upConfGroup,
                  domain:this.data.qnConf.domain,
                  fileType:this.data.qnConf.fileType,
                }
                this.files[this.upConfGroup].push(f)
              })
              this.files[this.upConfGroup].forEach((f,fi)=>{
                if(hasUploadBlock && f.size > chunkSize){
                  this.uploadFileBlock(f,fi)
                }else {
                  this.uploadFile(f.path, fi)
                }
              })
            }
            this.triggerEvent('event',{act:'chooseImage',data:this.files[this.upConfGroup]})
          }
        })
      }
    },
    /***
     * 分块上传
     * @param file
     * @param fileIndex
     * @returns {Promise.<void>}
     */
    async uploadFileBlock(file,fileIndex=0){
      console.log('FileSystemManager',this.data.fsm)
      if(this.files[this.upConfGroup][fileIndex] && this.files[this.upConfGroup][fileIndex].path.indexOf('://tmp')<0) return;//已上传
      if(this.files[this.upConfGroup][fileIndex] && this.files[this.upConfGroup][fileIndex].progress==100) return;//已上传
      this.triggerEvent('event',{act:'uploadStart',data:this.files[this.upConfGroup],fileCurrent:fileIndex})

      let fsm=this.data.fsm
      let ab_val=fsm.readFileSync(file.path);
      let ab_val_length=ab_val.byteLength
      let chunks = Math.ceil(file.size / chunkSize)
      let token=await cloud.getTokenQiniu(this.data.qnConf)
      console.log('chunks',chunks,ab_val_length)
      let ctx=[];
      for(let x=0;x<chunks;x++){
        let posend=x*chunkSize+chunkSize
        let tmp_ab=ab_val.slice(x*chunkSize,x>=chunks-1?ab_val_length:posend);
        /* res
        checksum: "o_hfT-1tmqMjv75bKPAhE1iXJJ4="
        crc32: 2498270954
        ctx: "gNb9-Mlry_LxyElhL6dM5wFPErTo6p2vFV2g3GpCvY2BaoRb_gFyJxwTLH4nAACFywQFcZJ9f6_yr0KddSZw1cO1ueeXdm0OYz1HocDHNeeajHcQTNKv3SeD0685r1bXMurhMnjjH-elea6jJAIAAADCWyAAAAAAAMJbIADCWyAAMjVRQUFIVDVJMTNDaEJZQQ=="
        expired_at: 1563159627
        host: "http://upload.qiniup.com"
        offset: 2120642
        */
        try{
          let res=await this.mkblk(token,tmp_ab);
          ctx.push(res.data.ctx)
          console.log('this.mkblk.res'+x,res);
          this.files[this.upConfGroup][fileIndex].progress=parseInt(100*(x/chunks));
          this.triggerEvent('event',{act:'uploadProgress',data:this.files[this.upConfGroup],fileCurrent:fileIndex})
        }catch (e){
          x--;
        }

      }
      let filename=file.path.split('.');
      if(filename[filename.length-1].length<5){
        filename=util.mdx(file.path)+'.'+filename[filename.length-1]
      }else{
        filename=util.mdx(file.path)
      }
      let prefixPath=this.data.upConf.prefixPath?this.data.upConf.prefixPath:'';
      if(prefixPath && prefixPath[prefixPath.length-1]!='/'){
        prefixPath+='/';
      }

      let path='/mkfile/'+ab_val_length
        +'/x:userpath/'+urlsafeBase64Encode(prefixPath)
        +'/x:filename/'+urlsafeBase64Encode(filename)
        +'/x:filesize/'+urlsafeBase64Encode(ab_val_length+"")
        +'/x:limkey/'+urlsafeBase64Encode(urlsafeBase64Encode(this.data.qnConf.bucket+':'+prefixPath+filename+'.lim.jpg'))
      console.log(path);
      this.mkfile(path,token,ctx).then(res=>{
        console.log('this.mkblk.res',res.data);
        this.files[this.upConfGroup][fileIndex].progress=100;
        let remote=res.data;
        remote.url=(this.data.qnConf.domain||'配置qnConf.domain')+'/'+remote.key
        this.files[this.upConfGroup][fileIndex].remote=remote
        this.triggerEvent('event',{act:'uploadCompleted',data:this.files[this.upConfGroup],fileCurrent:fileIndex})
      })
    },

    mkblk(token,ab_val){
      return new Promise((success,fail)=>{
        wx.request({
          url:cloud.getUploadPath(this.data.qnConf.region)+'/mkblk/'+ab_val.byteLength,
          header: {
            "Content-Type":"application/octet-stream",
            //"Content-Length": ab_val.byteLength,
            Authorization:"UpToken "+token,
          },
          method:'POST',
          data:ab_val,
          success:(res)=>{
            success(res)
          },
          fail:(res)=>{
            fail(res)
          },
        })
      });
    },
    mkfile(path='mkfile',token,ctx){
      return new Promise((success,fail)=>{
        wx.request({
          url:cloud.getUploadPath(this.data.qnConf.region)+path,
          header: {
            "Content-Type":"text/plain",
            //"Content-Length": ctx.length,
            Authorization:"UpToken "+token,
          },
          data:ctx.join(","),
          method:'POST',
          success:(res)=>{
            success(res)
          },
          fail:(res)=>{
            fail(res)
          },
        })
      });
    },
  }
})