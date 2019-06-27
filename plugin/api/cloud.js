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
    CK.qntoken=CK.qntoken+util.str2key(params.accessKey+params.secretKey+params.bucket+params.fileType);
    try{
      let token=await util.cache(CK.qntoken);
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
      util.cache(CK.qntoken,res.result.data.token,-1)
      return res.result.data.token;
    }
    return "";
  },
}