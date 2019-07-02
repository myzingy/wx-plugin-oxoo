/**
 * 时间戳转为时间
 * @param ns
 * @param format
 * @returns {string|*}
 */
function date_format(ns,format) {
    var result;
    var time = new Date(ns*1000);
    //result=format || 'YYYY年MM月DD日 HH时II分SS秒 WW';
    result=format || 'YYYY年MM月DD日';
    //console.log(format);
    result=result.toUpperCase();
    result=result.replace('YYYY',time.getFullYear());
    var m=time.getMonth()+1;
    result=result.replace('MM',m>9?m:"0"+m);
    var d=time.getDate();
    result=result.replace('DD',d>9?d:'0'+d);
    var hh=time.getHours();
    result=result.replace('HH',hh>9?hh:'0'+hh);
    var ii=time.getMinutes();
    result=result.replace('II',ii>9?ii:'0'+ii);
    var ss=time.getSeconds();
    result=result.replace('SS',ss>9?ss:'0'+ss);
    var week;
    switch (time.getDay()) {
        case 0:week="日";break
        case 1:week="一";break
        case 2:week="二";break
        case 3:week="三";break
        case 4:week="四";break
        case 5:week="五";break
        case 6:week="六";break
    }
    result=result.replace('WW',week);
    if(format.indexOf('DAY')>-1){
        // 获取当天 0 点的时间戳
        var timeStamp = new Date(new Date().setHours(0, 0, 0, 0)) / 1000;

        var day1 = timeStamp+86400//今天结束
        var day2 = day1+86400//明天结束

        //console.log('ns<day.getTime()',timeStamp,ns,day1,day2)

        if(ns>=timeStamp && ns<day1){
            result=result.replace('DAY','今天');
        }else{
            if(ns>=day1 && ns<day2){
                result=result.replace('DAY','明天');
            }else{
                result=result.replace('DAY','');
            }
        }
    }
    if(format.indexOf('`')>-1){
        result=result.replace(/`(.*)\|\|(.*)`/ig,function($0,$1,$2){
            return $1||$2;
        });
    }
    return result;
}


/**
 * 时间串转为时间戳
 * @param datestr 1970/01/01 01:01:01
 * @returns int(10)
 */
function strtotime(datestr)
{
    datestr=datestr.replace(/-/g,'/');
    return parseInt(new Date(datestr)/1000);
}


module.exports = {
    date_format: date_format,
    strtotime:strtotime,
    time(hhiiss=''){
        if(hhiiss==''){
            return parseInt(new Date()/1000);
        }
    },

    toast:function(title,icon='none'){
        wx.showToast({
            title:title,
            mask:true,
            icon:icon
        })
    },

    /**
     * 读取或设置 异步缓存
     * @param key
     * @param value
     * @param timeout (s)
     * @returns {*}
     */
    cache:async function(key,value,timeout=-1){
        if(typeof value!='undefind' && value!=null){
            if(timeout!=-1){
                timeout=this.time()+timeout
            }
            return this.promise('wx.setStorage',{
                key:key,
                data:{
                    data:value,
                    timeout:timeout
                }
            })
        }else{
          try{
            let cache=await this.promise('wx.getStorage',{
              key:key,
            })
            //console.log('cache',cache.data,cache.data.timeout>this.time())
            if(cache.data.data){
              if(cache.data.timeout==-1 || cache.data.timeout>this.time()){
                return cache.data.data;
              }
            }
            return "";
          }catch (e){
            return "";
          }

        }
    },
    /**
     * 请将此函数放在 app.js onHide 中，自动清理过期缓存，防止垃圾缓存造成系统负担
     * 目前wx组件接口不支持getStorageInfo，无法正常工作
     */
    cache_clear(){
        console.log('obHide');
        let time=new Date()/1000;
        this.promise('wx.getStorageInfo').then(res=>{
            console.log(res.keys);
            if(res.keys.length>0){
                res.keys.forEach(key=>{
                    this.promise('wx.getStorage',{key:key}).then(ca=>{
                        if(ca.data.timeout && ca.data.timeout<time && ca.data.timeout!=-1){
                            wx.removeStorage({key:key})
                        }
                    })
                })
            }
        })
    },

    val:function(e){
        return e.detail.value;
    },

    attr:function(e,key=""){
        if(!key){
            return e.currentTarget.dataset;
        }
        return e.currentTarget.dataset[key];
    },

    http_build_query(obj,url=''){
        let ps=[]
        for(let i in obj){
            if(typeof obj[i]=='undefined' || obj[i]==null) continue;
            ps.push(i+'='+obj[i].toString())
        }
        ps=ps.join('&');
        if(!url){
            return ps;
        }
        url+=(url.indexOf('?')>-1?'&':'?')+ps;
        return url;
    },

    promise(wxapi,param={}){
        return new Promise(function(success,fail){
            param.success=function(res){
                //console.log(wxapi+'.success',param,res)
                success(res)
            }
            param.complete=function(res){
                //console.log(wxapi+'.complete',param,res)
            }
            param.fail=function(res){
                console.log(wxapi+'.fail',param,res)
                fail(res)
            }
            let apikey=wxapi.replace('wx.','');
            if(wx[apikey]){
                wx[apikey](param)
            }else{
                fail({errMsg:wxapi+' is undefined'})
            }
        })
    },
  /**
   * 刷新当前页面
    * @param flag
   */
  refresh(flag=false){
      let pages=getCurrentPages();
      let p=pages[pages.length-1];
      let param=[];
      if(p.options){
        for(let key in p.options){
          param.push(key+'='+(p.options[key]
              .replace(/=/,'%3D').replace(/&/,'%26')))
        }
      }
      let url='/'+p.route+'?'+param.join('&')
      console.log('reLaunch',url)
      if(flag){
        wx.reLaunch({
          url: url
        })
      }else{
          wx.redirectTo({
            url:url
          })
      }

  },
  /**
   * @param str
   * @returns {string}
   */
  mdx(str){
    if(typeof str!='string'){
      str=JSON.stringify(str);
    }
    let num=0;
    let len=str.length;
    for(let i=0;i<len;i++){
      num+=(i+1)*str.charCodeAt(i);
    }
    return 'md'+num;
  }
}







