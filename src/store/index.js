import Vue from 'vue'

import Vuex from 'vuex'

import test from './modules/test'
import exam from './modules/exam'
import banke from './modules/banke'


import cookie from 'js-cookie'


import nativecode from '../nativecode'





Vue.use(Vuex)



const debug = process.env.NODE_ENV !== 'production'


const state = {
    version: 'v1.0.1',
    routerforward: false,

    homeselected: '', //! 主页的当前选择tab
    bhomeselected: '', //! 班级页的当前选择

    bankecachedata: {},

    webcmd: {}, //! cjy： websock的cmd

    audiofileinfo: {},
    loginuser: {
        role: 0
    }, //! 当前登录用户
    curbanke: {}, //! cjy： 当前使用的班课
    usercookiereaded: false,
    arrZhiyuan: [],
    lang: sessionStorage.getItem('lang') || 'zh',
    Preview: {
        isPreview: true, //是否开启了预览
        previewLoadFile: [], //预览文件
        images: [], //预览图片
        show: false, //是否显示预览组件
        index: 0, //预览图片当前的索引
    },

    footerBarState: true,
    CliudBar: false,
    isCreate: 1,
    bankeSearchHistory: [], //班课搜索历史记录
    bindschool: false,
    detail_go_school: false,

    viewAudio: {
        info: {
            src: '',
            filename: '',
        },
        isShow: false
    },
    Settedinfo: false,
    schoolname: {},

    curcourse: {},
    zuoyeNewBackState: 0,
    zuoyeCfrom: '',
    zuoyeShowState: 100,
    myRenwuZuoye: false,
    fabuRenwuClick: false,
    curZuoyeType: 0,
    online:false
}

const getters = {
    getBankeData: (state) => (modulename, bankeid) => {
        var bdata = state.bankecachedata;
        if (bdata[modulename] && bdata[modulename][bankeid]) {
            return bdata[modulename][bankeid];
        }
        return null;
    },
    curuser: (state, getters) => {
        var lm = state.loginuser;

        return lm;
    },
    hasloginuser: (state, getters) => {
        let lm = getters.curuser;
        if (lm && lm.id) {
            return true;
        }
        return false;
    },
    islogin: (state, getters) => {
        var lm = getters.curuser;
        if (!lm || !lm.id) {

            let szcookie = cookie.get('EXSOFTSSID');
            if (szcookie && szcookie.length > 10) {
                return true;
            }

            return false;
        }
        return true;
    },
    isteacher: (state, getters) => {
        if (state.loginuser.role && state.loginuser.role >= 10) {
            return true;
        }
        return false;
    },
    haseditbankerole: (state, getters) => { //! 当前用户是否有编辑班课的权限
        // if (!getters.isteacher) {  //! cjy: 因为新绑定功能，教师可变为学员，这里不再check
        //     return false;
        // }
        if (!state.loginuser.role) {
            return false //! 账户已被禁用
        }
        if (!state.curbanke.id) {
            return false;
        }
        if (state.curbanke.userid == state.loginuser.id) {
            return true;
        }
        return false;
    },
    caneditbanke: (state, getters) => {
        if (nativecode.platform == 'exsoftdaping') {
            return false;
        }
        if (!state.curbanke.id) {
            return false;
        }
        if (state.curbanke.states < 1) { //! 班课已结束
            return false;
        }
        if (!getters.haseditbankerole) {
            return false;
        }
        return true;
    },
    getonline:(state,getters)=>{
        return state.online;
    }
}

const mutations = {
    setBankeData(state, bobj) {
        //  console.log(bobj);
        var modulename = bobj.modulename;
        var bankeid = bobj.bankeid;
        var fn = bobj.fn;
        //console.log(modulename);
        //console.log(bankeid);
        //console.log(fn);
        var bd = getters.getBankeData(state)(modulename, bankeid);
        //  console.log(bd);
        if (!bd) {
            var bdata = state.bankecachedata;
            if (!bdata[modulename]) {
                bdata[modulename] = {};
            }
            if (!bdata[modulename][bankeid]) {
                bdata[modulename][bankeid] = {};
            }
            bd = getters.getBankeData(state)(modulename, bankeid);
        }
        if (bd) {
            fn(bd);
        }
        //console.log(state.bankecachedata);
    },
    setRouterForward(state, bforward) {
        state.routerforward = bforward;
    }

    ,
    setCurBanke(state, banke) {
        state.curbanke = banke;
    },
    setWebCmd(state, cmdobj) {
        state.webcmd = cmdobj
    },
    setAudioFileInfo(state, info) {
        state.audiofileinfo = info;
    },
    setLoginUser(state, user) {
        state.loginuser = user;
        state.usercookiereaded = true;
        //！ cjy: ios 的localcookie 如果不设置 expires，则wkwebview的cookie不会被持久化(sessiononly 为true)
        //!  cjy: 不再使用cookie保存user信息; cookie 会随请求一并提交 ---- 保存简短信息
        // cookie.set('user', {
        //     id: user.id,
        //     account: user.account,
        //     name: user.name,
        //     role: user.role
        // }, {
        //     expires: 360
        // });
    },
    setUserAvatar(state, avatar) {
        if (state.loginuser) {
            state.loginuser.avatar = avatar;
            // cookie.set('user', state.loginuser, {expires:360});
        }
    }


    ,
    setHomeSelected(state, strsel) {
        state.homeselected = strsel;
    },
    setBHomeSelected(state, strsel) {
        state.bhomeselected = strsel;
    },
    SET_ZHIYUANS(state, obj) {
        let item = obj.item;
        let objitem = item[0];
        if (obj.type == 1) {
            state.arrZhiyuan = [...item, ...state.arrZhiyuan];
        } else if (obj.type == 2) {
            state.arrZhiyuan = [...state.arrZhiyuan, ...item];
        } else if (obj.type == 3) {
            state.arrZhiyuan = item;
        } else if (obj.type == 4) {
            for (let v of state.arrZhiyuan) {
                if (v.id == objitem.id) {
                    v.finttype = objitem.finttype
                    v.info = objitem.info;
                }
            }
        }
    },
    DEL_ZHIYUAN_ITEM(state, id) {
        for (let i = 0; i < state.arrZhiyuan.length; i++) {
            if (state.arrZhiyuan[i].id == id) {
                state.arrZhiyuan.splice(i, 1);
            }
        }
    },
    SET_LANG(state, lang) {
        state.lang = lang;
    },

    SET_FOOTER_BAR_STATE(state, v) {
        state.footerBarState = v
    },
    SET_CLOUD_BAR(state, v) {
        state.CliudBar = v
    },
    SET_BANKESEARCH_HISTORY(state, v) {
        state.bankeSearchHistory.push(v);
    },
    SET_PREVIEW(state, v, setval) {
        if (setval) {
            state.Preview[setval] = setval;
        } else {
            state.Preview = v;
        }

    },
    SET_BIND_SCHOLL(state, v) {
        state.bindschool = v;
    },
    SET_GO_SCHOOL(state, v) {
        state.detail_go_school = v;
    },
    SET_VIEW_AUDIO(v, t) {
        state.viewAudio.info = v;
        state.viewAudio.isShow = t;
    },
    SET_ISCREATE(state, v) {
        state.isCreate = v;
    },
    SET_SCHOOL_NAME(state, v) {
        state.schoolname = v;
    },
    SET_TEDINFO(state, v) {
        state.Settedinfo = v;
    },
    SET_ZYNEW_BACK_STATE(state, v) {
        state.zuoyeNewBackState = v;
    },
    SET_ZUOYE_CFROM(state, v) {
        state.zuoyeCfrom = v;
    },
    SET_ZUOYE_SHOW_STATE(state, v) {
        state.zuoyeShowState = v;
    },
    SET_MYRENWUZUOYE_CLICK(state, v) {
        state.myRenwuZuoye = v;
    },
    SET_FABURENWU_CLICK(state, v) {
        state.fabuRenwuClick = v;
    },
    SET_CURZUOYE_TYPE(state, v) {
        state.curZuoyeType = v;
    },
    SET_online(state, v) {
        state.online = v;
    },
}


export default new Vuex.Store({

    modules: {
        test,
        exam,
        banke,
    },

    strict: debug,

    plugins: debug ? [] : [],

    state,
    getters,
    mutations

})