// 云函数入口文件
const qiniu= require('qiniu')
const dateFormat = require('dateformat');

// 云函数入口函数
exports.main = async (event, context) => {
  console.log({event:event, context: context});
  switch (event.act){
    case 'token':
      return getToken(event);
      break;
    case 'test':
      //fotoo:prefixPath/md477040.jpeg.lim.jpg
      //ZgBvAHQAbwBvADoAcAByAGUAZgBpAHgAUABhAHQAaAAvAG0AZAA0ADcANwAwADQAMAAuAGoAcABlAGcALgBsAGkAbQAuAGoAcABnAA==
      var base64 = qiniu.util.urlsafeBase64Encode('fotoo:prefixPath/md477040.jpeg.lim.jpg');
      return base64 //Zm90b286cHJlZml4UGF0aC9tZDQ3NzA0MC5qcGVnLmxpbS5qcGc=
      break;
  }
}

//获取上传token
function getToken(params){
  let response={code:300,msg:'参数为空'}
  if(params.accessKey && params.secretKey && params.bucket) {
    let returnBody
    if (params.fileType == 'image') {
      returnBody = '{"key":"$(key)","bucket":"$(bucket)","mimeType":"$(mimeType)","fsize":"$(fsize)","exif":$(exif),"imageInfo":$(imageInfo),"imageAve":$(imageAve)}'
    }else if(params.fileType=='video'){//avinfo
      returnBody='{"key":"$(key)","bucket":"$(bucket)","mimeType":"$(mimeType)","fsize":"$(fsize)","avinfo":$(avinfo)}'
    }else{
      returnBody='{"key":"$(key)","bucket":"$(bucket)","mimeType":"$(mimeType)","fsize":"$(fsize)"}'
    }
    var mac = new qiniu.auth.digest.Mac(params.accessKey, params.secretKey);
    console.log("\r\ndeadline",parseInt(new Date()/1000+86400),"\r\n")
    var options = {
      scope: params.bucket,
      deadline: parseInt(new Date()/1000+86400),
      saveKey:'$(x:userpath)'+'$(x:filename)',
      forceSaveKey:true,
      returnBody: returnBody
    }
    if(params.fileType=='image') {
      //图片瘦身另存为lim
      options.persistentOps = 'imageslim|saveas/$(x:limkey)'
    }else if(params.fileType=='video'){
      //截图另存为lim
      //options.persistentOps = 'vframe/jpg/offset/7/w/960|saveas/$(x:limkey);avthumb/mp4/vcodec/libx264/avsmart/1/enhance/0|saveas/$(x:limmp4)'
      options.persistentOps = 'vframe/jpg/offset/7/w/960|saveas/$(x:limkey)'
    }
    var putPolicy = new qiniu.rs.PutPolicy(options);
    let token=putPolicy.uploadToken(mac);
    if(token){
      response={code:200,data:{token:token}}
    }else{
      response={code:500,msg:'获取token失败'}
    }
  }
  return response;
}