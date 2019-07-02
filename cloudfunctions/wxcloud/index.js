// 云函数入口函数
var got = require('got');
const cloud = require('wx-server-sdk')
cloud.init()
exports.main = async (event, context) => {
  console.log({event:event});
  switch (event.act){
    case 'token':
      return await getToken(event);
      break;
  }
}
//获取token
async function getToken(params){
  let response={code:300,msg:'参数为空'}
  if(params.qnConf){
    let res=await cloud.callFunction({
      // 要调用的云函数名称
      name: 'qncloud',
      // 传递给云函数的event参数
      data: {
        act: 'token',
        ...params.qnConf
      }
    })
    console.log('qncloud.res',res)
  }
  if(params.appid && params.secret){
    let tokenUrl='https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+params.appid+'&secret='+params.secret
    let tokenResponse=await got(tokenUrl)
    console.log('tokenResponse',tokenResponse.body)
  }
  return response;
}