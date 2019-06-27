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
  }
}

//获取上传token
function getToken(params){
  let response={code:300,msg:'参数为空'}
  if(params.accessKey && params.secretKey && params.bucket){
    let returnBody
    if(params.fileType=='image'){
      returnBody='{"key":"$(key)","bucket":"$(bucket)","mimeType":"$(mimeType)","exif":$(exif),"imageInfo":$(imageInfo),"imageAve":"$(imageAve)"}'
    }else{
      returnBody='{"key":"$(key)","bucket":"$(bucket)","mimeType":"$(mimeType)","fsize":"$(fsize)"}'
    }
    var mac = new qiniu.auth.digest.Mac(params.accessKey, params.secretKey);
    var options = {
      scope: params.bucket,
      saveKey:+'$(x:path)'+dateFormat(new Date(),"isoDate")+'/$(fname)',
      returnBody: returnBody
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