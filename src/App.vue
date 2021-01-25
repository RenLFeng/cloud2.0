<template>
  <div id="app">
    <div class="bannertop" v-if="showloginfail" @click="uservalidate">{{$mt('连接失败,点击重连')}}</div>
    <!-- <div class="bannertop" v-if="showtest">{{testtext}}</div> -->
    <transition :name="transitionName">
      <router-view
        v-if="loadshow"
        class="Router"
        :class="{'exsoftios':exsoftios,'miniprogram':miniprogram}"
      ></router-view>
    </transition>
    <preview
      :pshow="show"
      :Pimages="images"
      :PtempLocalfiles="tempLocalfiles"
      :pindex="index"
      @toggleClick="onToggleClick"
    ></preview>
    <mt-popup v-model="popupAudio" position="right" class="popup-right info-popup" :modal="false">
      <Audio :AudioInfo="audiofileinfo" @Backs="popupAudio=false" v-if="popupAudio" />
    </mt-popup>
    <!--
      <div class="dp-hd-wrap"  v-if="haswifiroom && isCloudmain" @click="hudongFn">多屏互动</div>
    -->
    <float-icons padding="10 10 60 10" class="icons-warp" v-if="showfloaticons">
      <div class="float-icon-item" @click="gotowifiroom()">
        <span class="ellipse tc">
          {{$mt('多屏')}}
          <br />
          {{$mt('互动')}}
        </span>
      </div>
    </float-icons>
  </div>
</template>

<script>
import nativecode from "./nativecode";
import preview from "./common/preview";
import commontools from "@/commontools";
import "./styles/common.less";
import "./styles/style.css";
import Audio from "@/common/audio";
import FloatIcons from "@/components/s-icons";
import { parseURL, ispcBroswer ,isMobile } from "@/util";
import nativebridge from "@/nativebridge";
import { lagelists } from "@/langs/index";
import { Toast, MessageBox, Indicator } from "mint-ui";
export default {
  name: "Home",
  props: {},
  components: {
    preview,
    Audio,
    "float-icons": FloatIcons
  },
  computed: {
    showloginfail() {
      let curpath = this.$route.path;
      if (curpath == "/login") {
        return false;
      }
      if (this.websockstate == "reject") {
        return true;
      }
      return false;
    },
    showfloaticons() {
      if (this.haswifiroom && this.isCloudmain && nativebridge.apiversion < 2) {
        return true;
      }
      return false;
    },
    haswifiroom() {
      if (!this.$store.getters.hasloginuser) {
        return false;
      }
      return nativecode.haswifiroom();
    },
    show: {
      get: function() {
        return this.$store.state.Preview.show;
      },
      set: function(newValue) {
        console.log(newValue);
        this.$store.commit("SET_PREVIEW", {}, newValue);
      }
    },

    images: {
      get: function() {
        return this.$store.state.Preview.images;
      },
      set: function(newValue) {
        console.log(newValue);
        this.$store.commit("SET_PREVIEW", {}, newValue);
      }
    },
    tempLocalfiles: {
      get: function() {
        return this.$store.state.Preview.previewLoadFile;
      },
      set: function(newValue) {
        console.log(newValue);
        this.$store.commit("SET_PREVIEW", {}, newValue);
      }
    },
    index: {
      get: function() {
        return this.$store.state.Preview.index;
      },
      set: function(newValue) {
        console.log(newValue);
        this.$store.commit("SET_PREVIEW", {}, newValue);
      }
    },
    username() {
      // 我们很快就会看到 `params` 是什么
      return this.$route.params.username;
    },
    localuser() {
      return this.$store.state.loginuser;
    },
    audiofileinfo() {
      return this.$store.state.audiofileinfo;
    },
    exsoftios() {
      if (nativecode.platform == "exsoftios") {
        return true;
      }
      return false;
    },
    miniprogram() {
      if (nativecode.platform == "miniprogram") {
        return true;
      }
      return false;
    }
  },

  data() {
    return {
      hudong: true,
      transitionName: "slide-forward",
      testtext: "showua:" + navigator.userAgent,
      showtest: true,
      map: {},
      popupAudio: false,
      myaudioinfo: {},

      //! cjy: websocket 相关
      websock: null,
      websockstate: "", //! 登陆状态：  connecting logining  logined  reject
      websockcount: 0, //! 计数
      websockinterval: null,

      isCloudmain: true,
      customserver: false,
      fromscan: false,
      loadshow: false
    };
  },
  destroyed: function() {
    clearInterval(this.websockinterval);
    this.websockinterval = null;
  },
  created: function() {
  },
  mounted() {
    console.log("app.vue, url:" + window.location.href);
    Indicator.open(this.$mt("加载中"));
    this.downloadAPP();
  },
  watch: {
    audiofileinfo(lnew, lold) {
      //  if (lnew.filepath != lold.filepath)
      //  console.log(lnew);
      // console.log(lold);
      {
        this.myaudioinfo = lnew;
        if (!lnew.filepath) {
          this.popupAudio = false;
        } else {
          this.popupAudio = true;
        }
      }
    },
    localuser(lnew, old) {
      console.log("localuser watch!!");
      if (lnew.id != old.id) {
        console.log("user changed!!!");
        this.wssetstate("");
        if (lnew.id && lnew.cookie) {
          this.wsinit();
        }
      }
    },
    $route(to, from) {
      //console.log('route');
      //console.log(from);
      if (
        //to.meta && to.meta.newtab
        this.$store.state.routerforward
      ) {
        this.transitionName = "slide-forward";
        this.$store.commit("setRouterForward", false);
      } else {
        this.transitionName = "slide-back";
      }
      if (to.name == "cloudmain") {
        this.isCloudmain = true;
      } else {
        this.isCloudmain = false;
      }
    }
  },
  methods: {
    initfn() {
      let canview = sessionStorage.getItem("canview") || "";
      if (!canview) {
        sessionStorage.setItem("canview", "true");
      }
      this.$nextTick(() => {
        Indicator.close();
      });
      this.loadshow = true;
      commontools.initResultcb("login", this.loginTips);
      this.getplatformlang();

      if (process.env.NODE_ENV === "production") {
        this.websockinterval = setInterval(() => {
          this.wsontimeout();
        }, 5000);
      }
      nativecode.initfirst();

      let clientWidth = window.innerWidth;
      if (!clientWidth) return;
      if (clientWidth >= 540) {
        document.documentElement.style.fontSize = "40px";
      }
      // console.log("routerview page created, cur path:"+this.$router.path);
      //! 请求登录信息
      if (window.location.href.indexOf("/login") > -1) return;
      if (window.location.href.indexOf("/WechatLogin") > -1) return;
      this.serverconfig();
    },
    loginTips(obj) {
      console.log("登录推送提示", obj);
      this.$confirm({
        title: "登录提示",
        msg: "请先登录,获取更多体验权限",
        ok: "是",
        cance: "否",
        docb: () => {
          this.$router.push("/login");
        }
      });
    },
    getplatformlang() {
      let onchangelang = obj => {
        if (obj.cmd) {
          console.log("lang 推送 End", obj);
        }
        let hasdefaultlang = false;
        let res = obj.data;
        let lang = res.lang;
        for (let v of lagelists) {
          if (v.code == lang) {
            lang = v.type;
            hasdefaultlang = true;
          }
        }
        if (!hasdefaultlang) {
          lang = "en";
        }
        const langurl = nativecode.getDomainUrl(`/lang_${lang}.json`);
        commontools.loadlang(this.$http, langurl, this.$i18n, lang);
      };
      nativecode.Resultdp("lang", { resultcb: onchangelang });
      let testkey = new Date().getTime();
      let cb = obj => {
        // console.log("cb 系统lang End", obj);
        if (obj.code == 0) {
          onchangelang(obj);
        }
      };
      let json = {
        data: {},
        cb: cb,
        // callbacktimeout:0,
        finnalcb: () => {}
      };
      let monicbdata = {
        data: {
          code: 0,
          data: { lang: 1042 },
          msg: ""
        },
        key: 123
      };
      if (process.env.NODE_ENV == "development") {
        // json.key = testkey;
        // monicbdata.data = JSON.stringify(monicbdata.data);
        // setTimeout(() => {
        //   nativebridge.nativecalled2("callcallback", monicbdata);
        // }, 3000);
        // setTimeout(() => {
        //   nativebridge.nativecalldp(
        //     JSON.stringify({
        //       cmd: "lang",
        //       data: { lang: 1036 }
        //     }),
        //     true
        //   );
        // }, 5000);
      }
      nativecode.jsFn("lang", json);
    },
    serverconfig() {
      console.log("serverconfig", window.location.href);
      // if (sessionStorage.getItem("customserver")) {
      //   this.customserver = JSON.parse(sessionStorage.getItem("customserver"));
      //   this.uservalidate();
      //   let obj = {
      //     data: { customserver: this.customserver }
      //   };
      //   nativecode.jsFn("serverconfig", obj);
      //   return;
      // }
      this.$http
        .post("/api/api/serverconfig", {})
        .then(res => {
          if (res.data.code == 0) {
            this.customserver = res.data.data.customserver;
            sessionStorage.setItem(
              "customserver",
              JSON.stringify(this.customserver)
            );
            let obj = {
              data: res.data.data
            };
            nativecode.jsFn("serverconfig", obj);
          }
          this.uservalidate();
        })
        .catch(err => {
          this.uservalidate();
        });
    },
    hudongFn() {
      console.log("开始互动");
    },
    gotowifiroom() {
      let argobj = {
        page: "wifiroom"
      };
      nativecode.ncall("toNativePage", argobj);
    },
    onToggleClick(data) {
      if (!data) {
        this.tempLocalfiles = [];
        let obj = {
          isPreview: true,
          images: [],
          show: data,
          index: 0
        };
        this.$store.commit("SET_PREVIEW", obj, "");
      }
    },
    uservalidate() {
      var url = "/api/api/uservalidate";
      console.log("user validate ret, cur path:", this.$route.path);
      //! cjy: 考虑到微信可能在不同界面单独加载， 这里检测仅指定path才去query， 减少频率
      if (this.$route.path != "/login") {
        //! cjy: 服务器实现缓存
        this.$http
          .post(url)
          .then(res => {
            //  console.log(document.cookie);
            console.log("user validate ret");
            if (res.data.code == 0) {
              this.$store.commit("setLoginUser", res.data.data);
              // cjy: 大屏端，如果已登录， 应当自动跳转主页
              if (this.$route.path == "/login") {
                this.$store.commit("setRouterForward", true);
                this.$router.push("/");
              }
              if (this.websockstate == "reject") {
                this.wsinit(); //! 重新连接
              }
              nativecode.jsLogin(1, res.data.data);
            } else {
              //!  未登录， 强制跳转登录
              if (this.$route.path != "/login") {
                this.$store.commit("setLoginUser", {});
                this.$store.commit("setRouterForward", true);
                if (nativebridge.apiversion < 3) {
                  this.$router.push("/login");
                }
              }
              // document.cookie = "EXSOFTSSID=" + "";
              console.log("set invalid cookie1!");
              nativecode.setcookie(""); //!cjy: 清空本地cookie； 用于修正bug： app端保存了无效的cookie； 微信登录的正常cookie不能被设置
              nativecode.jsLogin(0, {});
            }
          })
          .catch(() => {
            //! 其他异常
          });
      }
    },
    downloadTips() {
      this.$confirm({
        title: "提示",
        msg: "如果未下载APP请先下载,以便获取更多体验权限",
        ok: "下载",
        cance: "直接进入",
        docb: () => {
          window.location.href = document.location.origin + "/download.html";
          sessionStorage.setItem("hasurl", window.location.href);
        },
        cancecb: () => {
          this.initfn();
        }
      });
    },
    downloadAPP() {
      const curpath = window.location.href;
      const UrlParams = parseURL(curpath);
      if (process.env.NODE_ENV == "development") {
          this.initfn();
        return;
      }
      if (!nativecode.appSupPlatform() && isMobile()) {
        let canview = sessionStorage.getItem("canview") || "";
        if (!canview) {
          this.$nextTick(() => {
            Indicator.close();
          });
          this.downloadTips();
          return;
        }
      }
      this.initfn();
      console.log("downloadAPP", curpath);
      return;
      let sancodepage = false;
      let filterURL = ["/upsigngps", "/sign", "/BigLogin"];
      for (let v of filterURL) {
        if (curpath.indexOf(v) > -1) {
          switch (v) {
            case "/upsigngps":
              if (UrlParams.bankeid && UrlParams.ecode) {
                sancodepage = true;
                break;
              }
            case "/sign":
              if (UrlParams.sid || UrlParams.roomid) {
                sancodepage = true;
                break;
              }
            case "/BigLogin":
              if (UrlParams.ecode) {
                sancodepage = true;
                break;
              }
          }
        }
      }
      if (this.customserver && sancodepage) {
        if (
          nativecode.platform != "exsoftandroid" &&
          nativecode.platform != "exsoftios"
        ) {
          if (process.env.NODE_ENV == "development") {
            return;
          }
          this.fromscan = true;
          window.location.href = document.location.origin + "/download.html";
        }
      }
    },
    goBack() {
      this.$back();
    },

    wsgeturl() {
      let proto = "wss";
      // console.log(location.protocol);
      let port = Number(location.port);
      if (port == 0) {
        port = 443;
      }
      if (location.protocol == "http:") {
        proto = "ws";
        if (port == 0) {
          port = 80;
        }
      }
      let hostname = location.hostname;
      if (process.env.NODE_ENV !== "production") {
        hostname = "www2.exsoft.com.cn";
        port = 9982;
        proto = "wss";
      }

      let serverpath = proto + "://" + hostname + ":" + (port + 1) + "/ws";
      return serverpath;
    },
    wsinit() {
      //console.log('wsinit');
      this.lisenxnlian();
      this.wssetstate("");

      //! 某些平台，不使用wss连接
      if (
        // nativecode.platform == '' ||
        nativecode.platform == "exsoftdaping"
      ) {
        if (this.websockcount == 0) {
          console.log("not wsinit, return");
        }
        this.websockcount++;
        return;
      }

      try {
        let url = this.wsgeturl();
        console.log("wsinit:" + url);
        this.websock = new WebSocket(url);
        this.websock.onopen = this.wsonopen;
        this.websock.onerror = this.wsonerror;
        this.websock.onmessage = this.wsonmessage;
        this.websock.onclose = this.wsonclose;
        this.wssetstate("connecting");
      } catch (e) {}
    },
    startxunlian() {},
    wsonerror() {
      if (this.websockstate != "reject") {
        this.wssetstate("");
      }
    },
    wsonclose() {
      if (this.websockstate != "reject") {
        this.wssetstate("");
      }
    },
    wssetstate(strstate) {
      console.log("wssetstate:" + strstate);
      this.websockstate = strstate;
      this.websockcount = 0;
      if (strstate == "reject" || strstate == "") {
        let olss = this.websock;
        if (olss) {
          olss.onopen = null;
          olss.onerror = null;
          olss.onmessage = null;
          olss.onclose = null;

          let cmdobj = {};
          cmdobj.cmd = "offline"; //! 推送一个离线的cmd
          this.$store.commit("setWebCmd", cmdobj);

          olss.close();
        }
        this.websock = null;
      }
    },
    wsontimeout() {
      if (this.websockstate == "") {
        if (this.localuser.cookie) {
          this.wsinit();
        }
      } else {
        this.websockcount++;
        if (this.websockcount >= 2) {
          if (
            this.websockstate == "connecting" ||
            this.websockstate == "logining"
          ) {
            this.wssetstate(""); //! 超时， 主动断开
          }
        }
      }
    },
    cmdpingcestart(cmdobj) {
      //! 随意使用一个时间参数，用户
      let uri = "/urlpingce/" + cmdobj.bankeid + "/" + new Date().getTime();
      // uri += '&time=' + new Date().getTime();
      //  this.$store.commit("setRouterForward", true);
      // this.$router.push(uri);
      // return ;
      let curpath = this.$route.path;
      console.log(curpath);
      let navigate = () => {
        this.$store.commit("setRouterForward", true);
        this.$router.push({
          name: "PingCeing",
          params: {
            bankeid: cmdobj.bankeid,
            dataobj: cmdobj.data
          }
        });
      };
      if (curpath == "/PingCeing") {
        this.$back();
        setTimeout(() => {
          navigate();
        }, 300);
      } else {
        navigate();
      }
    },
    wsonmessage(e) {
      try {
        let cmdobj = JSON.parse(e.data);
        console.log("wsonmessage:接收消息" + e.data);
        let cmddealed = true;
        if (cmdobj.cmd == "loginresult") {
          if (cmdobj.code == 0) {
            this.wssetstate("logined");
          } else {
            this.wssetstate("reject");
          }
        } else if (cmdobj.cmd == "kickout") {
          this.wssetstate("reject");
        } else if (cmdobj.cmd == "pingcestart") {
          this.cmdpingcestart(cmdobj);
        } else if (cmdobj.cmd == "tongyistart") {
          this.toxunlianpage(cmdobj);
        } else if (cmdobj.cmd == "tongyistop") {
          this.tongyistop(cmdobj);
        } else {
          cmddealed = false;
        }
        if (!cmddealed) {
          this.$store.commit("setWebCmd", cmdobj);
        }
      } catch (e) {}
    },
    wsonopen() {
      this.wssetstate("logining");
      let role = "";
      if (nativecode.platform == "miniprogram") {
        //! 小程序支持与其他端同时打开
        role = "weixin";
      } else if (
        nativecode.platform == "" ||
        nativecode.platform == "exsoftwindows"
      ) {
        role = "pc";
      }
      let logindata = {
        cmd: "login",
        data: {
          cookie: this.localuser.cookie,
          role: role
        }
      };
      console.log("wsonopen logining send", this.websock);
      this.websock.send(JSON.stringify(logindata));
    },
    toxunlianpage(cmdobj) {
      let url = `/zuoyeresult/${cmdobj.data.xunlianid}?tongyixl=true&bankeid=${cmdobj.bankeid}`;
      let curpathname = this.$route.name;
      sessionStorage.setItem("tyxlid", cmdobj.data.xunlianid);
      let toxl = () => {
        this.$store.commit("setRouterForward", true);
        this.$router.push(url);
      };
      if (curpathname == "ZuoyeResult") {
        this.$back();
        setTimeout(() => {
          toxl();
        }, 300);
      } else {
        toxl();
      }
    },
    tongyistop(cmdobj) {
      Toast(this.$mt("统一训练结束"));
      let curpathname = this.$route.name;
      sessionStorage.removeItem("tyxlid");
      this.$store.commit("setRouterForward", true);
      this.$router.push("/");
    },
    xunlianchange(cmdobj) {
      if (process.env.NODE_ENV == "development") {
        console.log("统一训练cmdobj", cmdobj);
        if (cmdobj.cmd == "tongyistart") {
          this.toxunlianpage(cmdobj);
        } else if (cmdobj.cmd == "tongyistop") {
          this.tongyistop();
        }
        return;
      }
      console.log("统一训练websock send cmdobj", cmdobj);
      if (this.websock) {
        console.log("send xunlian cmd", this.websock);
        if (cmdobj.cmd == "tongyistart") {
          sessionStorage.setItem("tyxlid", cmdobj.data.xunlianid);
        } else if (cmdobj.cmd == "tongyistop") {
          sessionStorage.removeItem("tyxlid");
        }
        this.websock.send(JSON.stringify(cmdobj));
      }
    },
    lisenxnlian() {
      nativecode.Resultdp("tongyistart", { resultcb: this.xunlianchange });
      nativecode.Resultdp("tongyistop", { resultcb: this.xunlianchange });
    }
  }
};
</script>

<style >
@import "./assets/iconfont/iconfont.css";
@import "styles/style.css";
.Router {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f0f0f0;
  font-size: 14px;
  overflow: hidden;
}
.Router.miniprogram {
  height: 100vh;
  min-height: 100vh;
}
.Router.exsoftios {
  /* height: 97vh;
  min-height: 97vh; */
}
.bannertop {
  z-index: 9999;
  position: absolute;
  background-color: orange;
  width: 100%;
  height: 30px;
  font-size: 14px;
  top: 50px;
  text-align: center;
}
.slide-forward-enter {
  transform: translate(100%);
}
.slide-forward-enter-active {
  transition: all 0.2s ease-in-out;
}
.slide-forward-leave-active {
  transform: translate(-100%);
  transition: all 0.2s ease-in-out;
}

.slide-back-enter {
  transform: translate(-100%);
}
.slide-back-enter-active {
  transition: all 0.2s ease-in-out;
}
.slide-back-leave-active {
  transform: translate(100%);
  transition: all 0.2s ease-in-out;
}
.iconfont-big {
  display: block;
  padding-bottom: 7px;
  font-size: 48px !important;
}
</style>
<style lang="less" scoped>
.dp-hd-wrap {
  position: fixed;
  bottom: 100px;
  right: 10px;
  z-index: 99999999999;
  width: 100px;
  height: 100px;
  background: rgba(0, 137, 255, 0.5);
  color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  text-align: center;
  line-height: 100px;
  font-size: 20px;
}

.icons-warp {
  border-radius: 25px;
  .float-icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 50px;
    height: 50px;
    img {
      width: 25px;
      height: 25px;
      margin-bottom: 3px;
    }
    span {
      font-size: 16px;
      color: #666666;
      font-weight: bold;
    }
  }
}
</style>