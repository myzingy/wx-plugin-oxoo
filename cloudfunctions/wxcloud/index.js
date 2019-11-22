// 云函数入口函数
var got = require('got');
const cloud = require('wx-server-sdk')
const FormData = require('form-data');
cloud.init()
exports.main = async (event, context) => {
  console.log({event:event});
  switch (event.act){
    case 'token':
      return await getToken(event);
      break;
    case 'qrcode':
      return await getQrcode(event);
    case 'security':
      return await security(event);
  }
}
//获取token
async function getToken(params){
  let response={code:300,msg:'参数为空'}
  if(params.appid && params.secret){
    const db = cloud.database()
    const _ = db.command
    let res=await db.collection('wxtoken').where({
      appid: params.appid
    }).get()
    let now=parseInt(new Date()/1000)
    console.log('dbres',res)
    if(res.data.length>0){
      let wxtoken=res.data[0]
      if(wxtoken.expires_in>now){
        return {
          code:200,
          access_token:wxtoken.access_token
        }
      }
      await db.collection('wxtoken').where({
        appid: params.appid
      }).remove()
    }
    let tokenUrl='https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+params.appid+'&secret='+params.secret
    let tokenResponse=await got(tokenUrl)
    console.log('tokenResponse',tokenResponse.body)
    response=JSON.parse(tokenResponse.body)
    response.code=200
    await db.collection('wxtoken').add({
      data:{
        appid: params.appid,
        access_token:response.access_token,
        expires_in:parseInt(response.expires_in)+now,
      }
    })
  }
  return response;
}
async function getQrcode(params){
  let response={code:300,msg:'参数为空'}
  let qnres
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
    qnres=res
  }
  let tokenres=await getToken(params);

  const form = new FormData();

  form.append('access_token', tokenres.access_token);
  form.append('path', params.path);
  if(params.width) form.append('width', params.width);
  if(params.line_color) form.append('line_color', params.line_color);
  if(params.is_hyaline) form.append('is_hyaline', params.is_hyaline);

  console.log("\n\r",{
    form:form,
    access_token:tokenres.access_token,
  })
  let qrres=await got.post('https://api.weixin.qq.com/wxa/getwxacode?access_token='+tokenres.access_token,{
    headers:{
      //accept:'application/json',
      //'Content-Type':'application/x-www-form-urlencoded',
    },
    body:form,
  })
  console.log("\n\r",{
    qrres:qrres,
  })
  if(qnres){//上传到七牛

  }
  return qrres
}
//security 内容安全检测
async function security(params){
  let response={code:300,msg:'非法内容'}
  let securityRes,res
  console.log('params',params)
  if(params.url){
    try{
      res=await got.get(params.url,{
        encoding:null,
      })
      console.log('res.body',Buffer.isBuffer(res.body))
    }catch (e){
      return await security(params)
    }

    let media={
      'contentType':res.headers['content-type'],
      'value':res.body,
    };
    //console.log('media',media)
    try{
      securityRes=await cloud.openapi.security.imgSecCheck({
        media: media
      })
    }catch (e){
      securityRes={
        errCode:0,
        msg:'无法检查',
      }
    }

  }else{
    securityRes=await cloud.openapi.security.msgSecCheck({
      content:params.txt
    })
  }
  console.log(params.url||params.txt,securityRes)
  if(securityRes.errCode==0){
    return {code:200,msg:''}
  }

  return response;
}