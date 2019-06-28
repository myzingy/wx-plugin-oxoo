var plugin = requirePlugin("myPlugin")
Page({
  data:{
    qnConf:{
      accessKey:'uva-aaonM8dukeR6phc9yuPBrOXk9brrNW_PxLD7',
      secretKey:'oZMMVN6phk49lG0J1xwmi1Ju0ETT15EnAEWcU9Cs',
      bucket:'colorcun-attr',
      fileType:'image',
      region:'华东'
    },
    upConf:{
      prefixPath:'prefixPath',
    }
  },
  onLoad: function() {
    plugin.getOpenid().then(res=>{
      console.log(res);
    })
    plugin.getTokenQiniu({
      accessKey:'uva-aaonM8dukeR6phc9yuPBrOXk9brrNW_PxLD7',
      secretKey:'oZMMVN6phk49lG0J1xwmi1Ju0ETT15EnAEWcU9Cs',
      bucket:'colorcun-attr',
      fileType:'image',
    }).then(res=>{
      console.log(res);
    })
  }
})