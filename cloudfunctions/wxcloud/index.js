// 云函数入口函数
var request = require('request');
const cloud = require('wx-server-sdk')
exports.main = async (event, context) => {
  console.log({event:event, context: context});
  switch (event.act){
    case 'token':
      return getToken(event);
      break;
  }
}
//获取token
function getToken(params){
  let response={code:300,msg:'参数为空'}
  if(params.qnConf){
    cloud.callFunction({
      // 要调用的云函数名称
      name: 'qncloud',
      // 传递给云函数的event参数
      data: {
        act: 'token',
        ...params.qnConf
      }
    }).then(res => {
      console.log('qncloud',res)
    }).catch(err => {
      console.log('qncloud',err)
    })
  }
  if(params.appid && params.secret){
    request('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+params.appid+'&secret='+params.secret
      , function(error, response, body) {
      if (!error && response.statusCode == 200) {
        response=JSON.parse(body)
        console.log(response)
      }
    })
  }
  return response;
}