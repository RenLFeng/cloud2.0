  //  console.log("main.js i18n url:" + window.location.href);
  console.log('navigator.language 浏览器默认lang', navigator.language);
  console.log('navigator.languages 浏览器lang', navigator.languages);
  import Vue from 'vue'
  import VueI18n from 'vue-i18n';
  import nativecode from '@/nativecode';
  import commontools from '@/commontools';
  import nativebridge from "@/nativebridge";
  import axios from 'axios'
  import {
      lagelists,
      FanyiLangs,
  } from '@/langs/index';
  import {
      rtrim,
      parseURL
  } from '@/util';
  const sprintf = require('sprintf-js').sprintf;
  Vue.use(VueI18n);
  export const i18nFy = (loadstate = 0, langs = []) => {
      let state = loadstate;
      let alllangs = langs;
      let hasdefaultlang = false;
      let navigatorlang = navigator.language;

      for (let v of lagelists) {
          if (v.type == navigatorlang) {
              hasdefaultlang = true;
          }
      }
      if (navigatorlang == 'zh-CN') {
          navigatorlang = 'zh';
          hasdefaultlang = true;
      }
      if (!hasdefaultlang) {
          if (nativebridge.apiversion >= 3) {
              navigatorlang = "en";
          } else {
              navigatorlang = "zh";
          }
      }
      const setlocalLang = (langkey) => {
          let localtmplangs = JSON.parse(localStorage.getItem('newtmplangs')) || [];
          for (let v of localtmplangs) {
              if (v == langkey) {
                  return;
              }
          }
          localtmplangs.push(langkey);
          localStorage.setItem('newtmplangs', JSON.stringify(localtmplangs))
      }
      const checklang = (langkey) => {
          for (let v of alllangs) {
              if (v == langkey) {
                  return;
              }
          }
          setlocalLang(langkey);
      }
      let localmessages = sessionStorage.getItem('cloudloadfanyimessages') || '';
      let DefaultLangs = FanyiLangs();
      let initData = {};
      let UrlParams = parseURL(window.location.href);
      if (UrlParams.lang) {
          initData.Urlhaslang = UrlParams.lang;
      }
      initData.tempMessages = {};
      for (let v of DefaultLangs) {
          initData.tempMessages[v] = {};
      }
      if (localmessages) {
          localmessages = JSON.parse(localmessages);
          initData.tempMessages = {
              ...initData.tempMessages,
              ...localmessages
          }
      }
      const i18n = new VueI18n({
          locale: initData.Urlhaslang || navigatorlang || sessionStorage.getItem('lang'),
          messages: initData.tempMessages,
          silentTranslationWarn: true
      })
      const $t = (key) => {
          let values = [],
              len = arguments.length - 1;
          while (len-- > 0) values[len] = arguments[len + 1];
          return i18n._t.apply(i18n, [key, i18n.locale, i18n._getMessages(), this].concat(values))
      }
      /**
       * @ str 语言 key
       * @param {String} str
       * @ sprintfobj 语言 存在变量时
       * @param {Array or Object} sprintfobj 
       * @ groupindex 语言  存在下标时
       * @param {Number} groupindex 
       */
      Vue.prototype.$mt = (str, sprintfobj = null, groupindex = -1) => {
          let langkey = rtrim(str);
          if (i18n.locale == 'zh') {
              if (process.env.NODE_ENV == "development" && state == 0) {
                  checklang(langkey);
              }
              if (sprintfobj) {
                  let arrval = Object.values(sprintfobj);
                  return sprintf(langkey, ...arrval);
              }
              return langkey;
          }
          let langobj = $t(`${langkey}`);
          // console.log('mt() key langobj',langobj);
          if (groupindex >= 0 && Array.isArray(langobj)) {
              if (sprintfobj) {
                  let arrval = Object.values(sprintfobj);
                  return sprintf(langobj[groupindex], ...arrval);
              }
              return langobj[groupindex];
          } else {
              if (sprintfobj) {
                  let arrval = Object.values(sprintfobj);
                  return sprintf(langobj, ...arrval);
              }
              return langobj;
          }
          //   return i18n._t.apply(i18n, [langkey, i18n.locale, i18n._getMessages(), this].concat({
          //       ...sprintfobj
          //   }))
      };

      const langurl = nativecode.getDomainUrl(`/lang_${i18n.locale}.json`);
      commontools.loadlang(axios, langurl, i18n);
      return i18n;
  }

  //   export default i18n;