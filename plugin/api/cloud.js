import util from './util'
wx.cloud.init();
const CK={
  openid:'openid',
  qntoken:'qiniuToken',
}
module.exports = {
  async getOpenid(){
    try{
      let openid=await util.cache(CK.openid);
      if(openid) return openid;
    }catch (e){}
    let res=await wx.cloud.callFunction({
      name: 'login',
      data: {},
    })
    if(res.result.openid){
      util.cache(CK.openid,res.result.openid,-1)
    }
    return res.result.openid;
  },
  /**
   *
   * @param accessKey
   * @param secretKey
   * @param bucket
   * @param fileType
   * @returns {Promise.<*>}
   */
  async getTokenQiniu(params){
    let qntoken=CK.qntoken+util.mdx(params.accessKey+params.secretKey+params.bucket+params.fileType);
    try{
      let token=await util.cache(qntoken);
      if(token) return token;
    }catch (e){}
    let res=await wx.cloud.callFunction({
      name: 'qncloud',
      data: {
        act:'token',
        accessKey:params.accessKey,
        secretKey:params.secretKey,
        bucket:params.bucket,
        fileType:params.fileType||'',
      },
    })
    if(res.result.code==200){
      util.cache(qntoken,res.result.data.token,1800)
      return res.result.data.token;
    }
    return "";
  },
  getUploadPath(regionName){
    /**
     *
     华东	z0	服务器端上传：http(s)://up.qiniup.com
     客户端上传： http(s)://upload.qiniup.com
     华北	z1	服务器端上传：http(s)://up-z1.qiniup.com
     客户端上传：http(s)://upload-z1.qiniup.com
     华南	z2	服务器端上传：http(s)://up-z2.qiniup.com
     客户端上传：http(s)://upload-z2.qiniup.com
     北美	na0	服务器端上传：http(s)://up-na0.qiniup.com
     客户端上传：http(s)://upload-na0.qiniup.com
     东南亚	as0	服务器端上传：http(s)://up-as0.qiniup.com
     客户端上传：http(s)://upload-as0.qiniup.com
     */
    let sup='https://up{region}.qiniup.com';
    let cup='https://upload{region}.qiniup.com';
    const regions={
      华东:'',//z0 def,
      华北:'z1',
      华南:'z2',
      北美:'na0',
      东南亚:'as0',
    }
    regionName=regions[regionName]
    regionName=regionName||''
    return cup.replace('{region}',regionName);
  },
}