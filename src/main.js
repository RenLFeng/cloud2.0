import Vue from 'vue'
import store from './store'
import Home from './App.vue'
import router from './router'
import nativecode from '@/nativecode';
import {
    Cell,
    Button,
    Field,
    Popup,
    Header,
    Loadmore,
    InfiniteScroll,
    MessageBox,
    Toast,
} from 'mint-ui';
Vue.component(Cell.name, Cell);
Vue.component(Button.name, Button);
Vue.component(Popup.name, Popup);
Vue.component(Header.name, Header);
Vue.component(Loadmore.name, Loadmore);
Vue.use(InfiniteScroll);
Vue.component(Field.name, Field);

// import './plugins/element.js'
import axios from 'axios'
import 'amfe-flexible';
import './assets/iconfont/iconfont.css'
import {
    defaultImg,
    setInputScroll
} from "@/util";
Vue.prototype.$defaultImg = defaultImg;
Vue.prototype.$setInputScroll = setInputScroll;
Vue.prototype.$back = function () {
    if (window.history.length >= 2) {
        Vm.$router.back();
    } else {
        Vm.$router.push('/');
    }
}
Vue.prototype.$http = axios;
Vue.prototype.$initantbar = (vthis) => {
    vthis.$nextTick(() => {
        let curel = vthis.$refs.tbLi[0];
        let targetwidth = curel.offsetWidth;
        let moveBar = (52 - targetwidth) / 2;
        vthis.moveBar = curel.offsetLeft - moveBar;
    });
};
import {
    i18nFy
} from '@/i18nfy';
/**
 * 
 * opt  配置项
 * @param {Object} opt 
 * fanyimsg  是否翻译
 * @param {boolean} fanyimsg 
 */
Vue.prototype.$alert = (opt, fanyimsg = true) => {
    opt.title = opt.title ? opt.title : '提示';
    opt.ok = opt.ok ? opt.ok : '确定';
    MessageBox({
        title: Vue.prototype.$mt(opt.title),
        message: fanyimsg ? Vue.prototype.$mt(opt.msg) : opt.msg,
        confirmButtonText: Vue.prototype.$mt(opt.ok),
    }).then(() => {
        if (opt.cb) {
            opt.cb();
        }
    });
}
Vue.prototype.$confirm = (opt, fanyimsg = true) => {
    opt.title = opt.title ? opt.title : '提示';
    opt.ok = opt.ok ? opt.ok : '确定';
    opt.cance = opt.cance ? opt.cance : '取消';
    MessageBox.confirm("", {
            title: Vue.prototype.$mt(opt.title),
            message: fanyimsg ? Vue.prototype.$mt(opt.msg) : opt.msg,
            confirmButtonText: Vue.prototype.$mt(opt.ok),
            cancelButtonText: Vue.prototype.$mt(opt.cance),
            showCancelButton: true
        })
        .then(() => {
            opt.docb();
        })
        .catch(err => {
            if (opt.cancecb) {
                opt.cancecb();
            }
        })
}
Vue.prototype.$prompt = (opt, fanyimsg = true) => {
    opt.title = opt.title ? opt.title : '提示';
    opt.ok = opt.ok ? opt.ok : '确定';
    opt.cance = opt.cance ? opt.cance : '取消';
    MessageBox.prompt('', {
        title: Vue.prototype.$mt(opt.title),
        message: fanyimsg ? Vue.prototype.$mt(opt.msg) : opt.msg,
        confirmButtonText: Vue.prototype.$mt(opt.ok),
        cancelButtonText: Vue.prototype.$mt(opt.cance),
        showCancelButton: true
    }).then(({
        value,
        action
    }) => {
        if (!value) {
            Toast(Vue.prototype.$mt("不能为空"));
            return;
        }
        opt.docb(value);
    }).catch(err => {
        if (opt.cancecb) {
            opt.cancecb();
        }
    })
}
import Vconsole from 'vconsole'
const vConsole = new Vconsole()
Vue.use(vConsole)

window.addEventListener("resize", function () {
    let clientWidth = window.innerWidth;
    if (!clientWidth) return;
    if (clientWidth >= 540) {
        document.documentElement.style.fontSize = '40px';
    }
});
Vue.config.productionTip = false;
let Vm = {};
const createVUE = (state, texts = []) => {
    let i18n = i18nFy(state, texts);
    console.log('跟对方付大哥', i18n);
    Vm = new Vue({
        router,
        store,
        i18n,
        render: h => h(Home)
    }).$mount('#app');
}
const alltextsurl = nativecode.getDomainUrl(`/alltexts.json`);
if (process.env.NODE_ENV == "development") {
    axios.get(alltextsurl).then(res => {
        createVUE(0, res.data.texts);
    }).catch(err => {
        createVUE(-1);
    });
} else {
    createVUE(-1);
}

// document.documentElement.addEventListener('touchstart',function(e){
//   if(e.touches.length>1){
//     e.preventDefault();
//   }
// },{passive:false})