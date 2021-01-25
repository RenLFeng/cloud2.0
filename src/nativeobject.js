/*
*  cjy: 实现一些常用功能， 例如： 录音， 上传本地文件
 */

import nativebridge from './nativebridge'


var nativeobject = {}


//! 是否是服务器路径
nativeobject.isServerPath = (spath)=>{
    if (spath.indexOf('/') == 0
    || spath.indexOf('https://') == 0
        || spath.indexOf('http://') == 0
    ){
        return true;
    }
    return false
}

nativeobject.newplay = function(argobj)
{
    let playobj = {};
    playobj.path = argobj.path;
    playobj.starttime = 0;
    if (argobj.onplaystart){
        playobj.onplaystart = argobj.onplaystart
    }
    playobj.isserver = nativeobject.isServerPath(argobj.path)
    playobj.play = ()=>{
        if (playobj.isserver){
            playobj.audio = new Audio()
            playobj.audio.src = argobj.path
            playobj.audio.onplay = ()=>{
                if (playobj.onplaystart){
                    playobj.onplaystart()
                }
            }
            playobj.audio.play()
        }
        else{
            let callbackobj = null
            if (playobj.onplaystart){
                callbackobj = {}
                callbackobj.callbackkey = nativebridge.genid()
                callbackobj.resultcb = playobj.onplaystart
                callbackobj.callbacktimeout = 3 * 1000
            }
            nativebridge.ncall('elcplay', {
                path:playobj.path
            }, callbackobj)
        }

        playobj.starttime = new Date().getTime()
    }
    playobj.pause = ()=>{
        if (playobj.audio){
            playobj.audio.pause()
            return
        }
        nativebridge.ncall('elcpause', {
            path:playobj.path
        })
    }
    playobj.stop = ()=>{
        if (playobj.audio){
            playobj.audio.pause()
            playobj.audio = null
            return;
        }
        nativebridge.ncall('elcstop', {
            path:playobj.path
        })
    }
    playobj.getPlayTimeMs = ()=>{
        let curtime = new Date().getTime();
        return curtime - playobj.starttime;
    }
    return playobj
}

nativeobject.newrecord = function(argobj)
{
    let recobj = {};
    recobj.path =  argobj.path
    recobj.starttime = 0;
    recobj.recordtime = 0
    if (argobj.onrecordstart){
        //! 用于录音延迟敏感的场景，如电影配音
        recobj.onrecordstart = argobj.onrecordstart;
    }
    recobj.isrecord = ()=>{
        if (recobj.starttime){
            return true;
        }
        return false;
    }
    recobj.start = ()=>{
        if (recobj.isrecord()){  //! in record, ignore it
            return ;
        }
        recobj.starttime = new Date().getTime()
        recobj.recordtime = 0
        let callbackobj = null
        if (recobj.onrecordstart){
            callbackobj = {}
            callbackobj.callbackkey = nativebridge.genid()
            callbackobj.resultcb = recobj.onrecordstart
            callbackobj.callbacktimeout = 3 * 1000
        }
        nativebridge.ncall('recordstart', {
            path:recobj.path,
            index:0
        }, callbackobj)
    }
    recobj.stop = ()=>{
        if (recobj.starttime){
            recobj.recordtime = (new Date().getTime()) - recobj.starttime
            recobj.starttime = 0;
        }
        nativebridge.ncall('recordstop',{
            path:recobj.path
        })
    }
    recobj.getRecordTimeMs = ()=>{
        if (recobj.recordtime){
            return recobj.recordtime;
        }
        if (!recobj.starttime){
            return 0;
        }
        return (new Date().getTime()) - recobj.starttime;
    }
    return recobj;
}


nativeobject.httppost = function(argobj)
{
    let uargs = {};
    uargs.url = argobj.url
    uargs.post = argobj.post
    uargs.postprop = argobj.postprop  //1 文件形式定义的key； 已md5方式提交
    let callbackobj = null;
    if (argobj.resultcb){
        callbackobj = {}
        callbackobj.callbackkey = nativebridge.genid()
        callbackobj.resultcb = argobj.resultcb
        callbackobj.callbacktimeout = 0
    }
    nativebridge.ncall('httppost', uargs, callbackobj)
    return null;
}

nativeobject.newupload = function(argobj)
{
    let uparg = {};
    uparg.url = argobj.url
    uparg.path = argobj.path
    let callbackobj = null;
    if (argobj.resultcb){
        callbackobj = {}
        callbackobj.callbackkey = nativebridge.genid()
        callbackobj.resultcb = argobj.resultcb
        callbackobj.callbacktimeout = 0
    }
    nativebridge.ncall('fileupload', uparg, callbackobj
        )
    if (callbackobj){
        //! 为了防止native的实现异常， 定时拉取？
        let fntimeout = ()=>{

        }
    }
    return null;
}




export default nativeobject;


