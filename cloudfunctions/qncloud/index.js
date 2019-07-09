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
  if(params.accessKey && params.secretKey && params.bucket){
    let returnBody
    if(params.fileType=='image'){
      returnBody='{"key":"$(key)","bucket":"$(bucket)","mimeType":"$(mimeType)","fsize":"$(fsize)","exif":$(exif),"imageInfo":$(imageInfo),"imageAve":$(imageAve)}'
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
    //图片瘦身
    var base64 = qiniu.util.urlsafeBase64Encode(params.bucket+':'+'lim.jpg');
    //options.persistentOps='imageslim|saveas/'+base64
    options.persistentOps='imageslim|saveas/$(x:limkey)'
    //options.persistentOps='imageslim|saveas/'+base64

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