import Vue from 'vue'
import store from './store'
// import './plugins/element.js'
import axios from 'axios'
import Daping from './daping.vue'
import './assets/iconfont/iconfont.css'
import nativecode from '@/nativecode';
Vue.prototype.$http = axios;
import {
  i18nFy
} from '@/i18nfy';
import {
  defaultImg,
} from "@/util";
Vue.prototype.$defaultImg = defaultImg;
Vue.config.productionTip = false;
import Vconsole from 'vconsole'
const vConsole = new Vconsole()
Vue.use(vConsole)

const alltextsurl = nativecode.getDomainUrl(`/alltexts.json`);
const createVUE = (state, texts=[]) => {
  let i18n = i18nFy(state, texts);
  new Vue({
    store,
    i18n,
    render: h => h(Daping),
  }).$mount('#group')
}
if (process.env.NODE_ENV == "development") {
  axios.get(alltextsurl).then(res => {
    createVUE(0, res.data.texts);
  }).catch(err => {
    createVUE(-1);
  });
} else {
  createVUE(-1);
}