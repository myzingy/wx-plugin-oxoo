Component({
  data: {
    user:null,
  },
  attached: async function(){
    // 可以在这里发起网络请求获取插件的数据
    //wx.cloud.init();
    // let res=await wx.cloud.callFunction({
    //   name: 'login',
    //   data: {},
    // })
    // console.log('wx.cloud.login',res.result)
    // this.setData({
    //   user: res.result
    // })
  },
})