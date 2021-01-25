<template>
  <div class="tc loginbg">
    <div class="lans-wrap" v-show="selectlang">
      <van-collapse v-model="collapseAct">
        <van-collapse-item
          title="Lang"
          name="1"
          title-class="iconfont iconcellyoucejiantou vancollapse"
        >
          <p
            class="lang-item"
            :class="$i18n.locale==item.type?'act':''"
            v-for="(item,index) in lagelists"
            :key="index"
            @click="selectLange(item)"
          >{{item.name}}</p>
        </van-collapse-item>
      </van-collapse>
    </div>
    <div class="fontmaintitle maintitle">
      <div class="bg-pic-wrap">
        <img src="/assets/login_b.png" alt class="login-bg" />
        <img src="/assets/login_logo.png" alt class="login-icon position-c" />
      </div>
      <div class="fontlarge loginpart scrollingtouch">
        <div class="tit-wrap">
          <div class="tit">
            <span class :class="state?'act':''" @click="selectFn(1)">{{$mt('密码登录')}}</span>
            <span class :class="!state?'act':''" @click="selectFn(0)">{{$mt('用户注册')}}</span>
          </div>
          <p class="role-wrap" v-if="!state && customserver">
            <span v-for="(v,i) in role" :key="i" :class="v.isact?'act':''" @click="selerole(v)">
              <i class></i>
              {{$mt(v.name)}}
            </span>
          </p>
        </div>
        <div class="login-box">
          <div class="loginline">
            <img src="/assets/phone_icon.svg" alt class="position-l" />
            <input
              v-model="account"
              :placeholder="state?$mt('输入账户名'):$mt('请设置账户名')"
              autocomplete="off"
              class="logininput fontnormal"
              @keyup.enter="dologin"
              @blur="$setInputScroll"
            />
          </div>
          <div class="loginline">
            <img src="/assets/pwd_icon.svg" alt class="position-l" />
            <input
              v-model="password"
              :placeholder="state?$mt('输入密码'):$mt('请设置密码')"
              type="password"
              autocomplete="off"
              class="logininput fontnormal"
              @keyup.enter="dologin"
              @blur="$setInputScroll"
            />
          </div>
        </div>
        <button
          class="loginbtn fontnormal"
          :class="isSbmit?'colord':'colora'"
          @click="dologin"
        >{{state?$mt('登录'):$mt('注册并登录')}}</button>
        <button
          class="loginbtn weixinLogin fontnormal"
          @click="qrcodeLogin"
          v-show="showqrcodeLogin"
        >{{$mt('二维码登录')}}</button>
        <button
          v-if="hasnativewxlogin && !customserver"
          class="loginbtn weixinLogin fontnormal"
          @click="weixinNativeLogin"
        >{{$mt('微信登录')}}</button>
        <button
          v-if="wechatScancode && !customserver"
          class="loginbtn weixinLogin fontnormal"
          @click="weixinLogin"
        >{{$mt('微信扫码登录')}}</button>
        <p class v-if="showzjg">
          <span class="zjg" @click="zjgo">{{$mt('直接进入')}}</span>
        </p>
      </div>
    </div>
    <mt-popup
      v-model="popupWeiXxinLogin"
      position="right"
      class="mint-popup-3 wechat-wrap"
      :modal="false"
      style
    >
      <mt-header title class>
        <mt-button slot="left" @click="Backs">{{$mt('取消')}}</mt-button>
      </mt-header>
      <!-- <div id="weixinLogin"></div> -->
      <wxlogin
        v-if="popupWeiXxinLogin"
        :appid="wxlogin.appid"
        :scope="wxlogin.scope"
        :redirect_uri="encodeURIComponent(wxlogin.redirect_uri)"
        :href="wxlogin.href"
      ></wxlogin>
      <p style="font-size:18px;color:#fff">{{$mt('请使用微信扫一扫完成登录')}}</p>
    </mt-popup>
    <mt-popup
      v-model="popupQrcodeLogin"
      position="right"
      class="mint-popup-3 wechat-wrap"
      :modal="false"
      style
    >
      <mt-header title class>
        <mt-button slot="left" @click="Backs">{{$mt('取消')}}</mt-button>
      </mt-header>
      <div class="qrcode-w position-c">
        <canvas id="canvas" ref="canvas"></canvas>
        <p style="font-size:18px;color:#fff;margin-top:10px">{{$mt('请使用APP扫一扫完成登录')}}</p>
        <p @click="getlogincode" class="colord">{{$mt('刷新')}}</p>
      </div>
    </mt-popup>
  </div>
</template>
<script>
import Vue from "vue";
import { Indicator, Toast, MessageBox } from "mint-ui";
import { lagelists } from "@/langs/index";
// import { setServers } from 'dns';
// import { setInterval } from 'timers';
import QRcode from "qrcode";
import nativebridge from "@/nativebridge";
import nativecode from "@/nativecode";
import wxlogin from "vue-wxlogin";
import commontools from "@/commontools";
import Collapse from "vant/lib/collapse";
import CollapseItem from "vant/lib/collapse-item";
import "vant/lib/collapse/style";
import "vant/lib/collapse-item/style";
Vue.use(Collapse);
Vue.use(CollapseItem);
export default {
  name: "Login",
  data() {
    return {
      lagelists,
      collapseAct: ["0"],
      role: [
        {
          id: 5,
          name: "学生账号",
          isact: true
        },
        {
          id: 10,
          name: "教师账号",
          isact: false
        }
      ],
      // isSbmit:false,
      password: "",
      account: "",
      phone: "",
      phoneCode: "",
      state: 1,
      codeTime: 0,
      Times: null,
      showwxlogin: true,
      popupWeiXxinLogin: false,
      popupQrcodeLogin: false,
      wxlogin: {
        appid: "wx40632058fe27bbb6",
        scope: "snsapi_login",
        redirect_uri: "https://www2.exsoft.com.cn/#/WechatLogin/callback.do",
        href:
          "data:text/css;base64,LmltcG93ZXJCb3ggLnRpdGxlIHtkaXNwbGF5OiBub25lO30KLmltcG93ZXJCb3ggLmluZm8ge2Rpc3BsYXk6IG5vbmU7fQouc3RhdHVzX2ljb24ge2Rpc3BsYXk6IG5vbmV9Ci5pbXBvd2VyQm94IC5zdGF0dXMge3RleHQtYWxpZ246IGNlbnRlcjt9Ci5pbXBvd2VyQm94IC5xcmNvZGV7cG9zaXRpb246IGZpeGVkO2xlZnQ6IDUwJTt0b3A6IDUwJTt0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTt9"
      },
      tips: "",
      customserver: false,
      qrcodeSuccess: false,
      querytimes: null
    };
  },
  computed: {
    selectlang() {
      if (nativebridge.apiversion >= 3) {
        return false;
      }
      return true;
    },
    showzjg() {
      if (nativebridge.apiversion >= 3) {
        return true;
      }
      return false;
    },
    roleid() {
      for (let v of this.role) {
        if (v.isact) {
          return v.id;
        }
      }
      return null;
    },
    isSbmit() {
      if (this.account && this.password) {
        return true;
      }

      if (!this.account) {
        if (this.state) {
          this.tips = "请填写账号";
        } else {
          this.tips = "请设置账号";
        }
        return false;
      }
      if (!this.password) {
        if (this.state) {
          if (this.customserver) {
            return true;
          }
          this.tips = "请填写密码";
        } else {
          if (this.customserver) {
            return true;
          }
          this.tips = "请设置密码";
        }
      }
      return false;
    },
    hasnativewxlogin() {
      if (
        nativecode.platform == "exsoftandroid" ||
        nativecode.platform == "exsoftios"
      ) {
        return this.showwxlogin;
      }
      return false;
    },
    showqrcodeLogin() {
      if (
        nativecode.platform == "exsoftwindows" ||
        (nativecode.platform == "exsoftandroid" && nativecode.windowsnodp())
      ) {
        return true;
      }
      return false;
    },
    wechatScancode() {
      if (
        nativecode.platform != "exsoftandroid" &&
        nativecode.platform != "exsoftios"
      ) {
        return true;
      }
      return false;
    }
  },
  mounted() {
    this.showwxlogin = nativecode.supportwx();
    // if (sessionStorage.getItem("customserver")) {
    //   this.customserver = JSON.parse(sessionStorage.getItem("customserver"));
    // return;
    // }
    this.serverconfig();
  },
  methods: {
    selectLange(item) {
      if (item.type == this.$i18n.locale) return;
      const langurl = nativecode.getDomainUrl(`/lang_${item.type}.json`);
      commontools.loadlang(this.$http, langurl, this.$i18n, item.type);
      // nativecode.jsFn("changeLang", {
      //   data: { lang: item.code }
      // });
    },
    serverconfig() {
      this.$http
        .post("/api/api/serverconfig", {})
        .then(res => {
          if (res.data.code == 0) {
            this.customserver = res.data.data.customserver;
            let obj = {
              data: res.data.data
            };
            nativecode.jsFn("serverconfig", obj);
          }
        })
        .catch(err => {});
    },
    qrcodeLogin() {
      this.popupQrcodeLogin = true;
      this.getlogincode();
    },
    getlogincode() {
      clearInterval(this.querytimes);
      this.$http
        .get("/api/logincode/newcode", {})
        .then(res => {
          if (res.data.code == 0) {
            let code = res.data.data.code;
            this.webqrcode(code);
          }
        })
        .catch(err => {});
    },
    webqrcode(code) {
      let that = this;
      let location = document.location.origin;
      let url = `/qrcodelogin?code=${code}`;
      let pagepath = `${location}/#${url}`;
      console.log(pagepath);
      this.$nextTick(() => {
        let qcanvas = this.$refs.canvas;
        QRcode.toDataURL(
          qcanvas,
          pagepath,
          {
            width: 200
          },
          function(error, codestr) {
            if (error) console.log("QRcode error", error);
            console.log("QRcode url", codestr);
            that.querylogincode(code);
          }
        );
      });
    },
    querylogincode(code) {
      let fn = () => {
        this.$http
          .post("/api/logincode/query", {
            code: code
          })
          .then(res => {
            if (res.data.code == 0) {
              this.qrcodeSuccess = true;
              Toast(this.$mt("登录成功"));
              clearInterval(this.querytimes);
              this.$store.commit("setLoginUser", res.data.data);
              this.$store.commit("setRouterForward", true);
              this.$router.push("/");
              nativecode.jsLogin(1, res.data.data);
            } else {
            }
          })
          .catch(err => {});
      };
      this.querytimes = setInterval(fn, 1000);
    },
    weixinLogin() {
      this.popupWeiXxinLogin = true;
    },
    weixinNativeLogin() {
      //! 微信原生登录
      nativecode.ncall("reqWeixinLogin", {});
    },
    selectFn(state) {
      this.state = state;
      if (!state) {
        this.account = "";
        this.password = "";
      }
    },
    dologin: function() {
      this.login();
    },
    selerole(v) {
      for (let v of this.role) {
        v.isact = false;
      }
      v.isact = !v.isact;
    },
    login() {
      if (!this.isSbmit) {
        Toast(this.$mt(this.tips));
        return;
      }
      let tips = "登录中";
      var url = "/api/api/login";
      if (!this.state) {
        url = "/api/api/newaccount";
        tips = "正全力注册";
      }
      Indicator.open(this.$mt(tips));
      let postdata = {
        account: this.account,
        password: this.password
      };
      if (this.roleid) {
        postdata.role = this.roleid;
      }
      var othis = this;
      this.$http
        .post(url, postdata)
        .then(res => {
          Indicator.close();
          if (res.data.code == 0) {
            if (this.state) {
              this.$store.commit("setLoginUser", res.data.data);
              this.$store.commit("setRouterForward", true);
              sessionStorage.removeItem("hudongdata");
              this.$router.push("/");
              nativecode.jsLogin(1, res.data.data);
            } else {
              this.state = 1;
              this.login();
            }
          } else {
            if (!this.state) {
              Toast(this.$mt("注册失败") + ":" + res.data.msg);
              return;
            }
            Toast(this.$mt("账户和密码不正确") + ":" + res.data.msg);
          }
        })
        .catch(res => {
          // console.log(res);
          Indicator.close();
          Toast(this.$mt("服务出错了"));
        });
    },
    regFn() {},
    getCodeFn() {},
    getCodeTimeEnd() {
      if (this.codeTime > 0) return;
      this.codeTime = 60;
      this.Times = setInterval(() => {
        this.codeTime = this.codeTime - 1;

        if (this.codeTime <= 0) {
          clearInterval(this.Times);
        }
      }, 1000);
    },
    Backs() {
      if (this.popupQrcodeLogin) {
        this.popupQrcodeLogin = false;
        clearInterval(this.querytimes);
      }
      if (this.popupWeiXxinLogin) {
        this.popupWeiXxinLogin = false;
      }
    },
    zjgo() {
      this.$store.commit("setRouterForward", true);
      this.$router.push("/");
    }
  },
  components: {
    wxlogin
  }
};
</script>
<style  scoped>
.loginbg {
}
.maintitle {
  color: white;
  left: 0;
}
.loginpart {
  position: absolute;
  height: calc(100vh - 238px);
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: white;
  border-top-left-radius: 0.53333rem;
  border-top-right-radius: 0.53333rem;
  overflow: auto;
}
.logininput {
  border: none;
  border-bottom: 1px solid #d3d3d3;
  width: 100%;
  padding: 5px;
  margin: 20px auto;
  padding-left: 30px;
  color: #000;
}

input::-webkit-input-placeholder,
textarea::-webkit-input-placeholder {
  color: #939393;
  font-size: 16px;
}
.phone-code {
  width: 62%;
}
.loginline {
  /* line-height: 50px; */
  position: relative;
}
.loginline img {
  left: 0;
}
.loginbtn {
  background: none;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 15px 0;
  width: 100%;
  margin: 10px auto;
}
.loginbtn.weixinLogin {
  background: #2ea34c;
  color: #fff;
}
.get-code {
  background: none;
  border: 1px solid #0089ff;
  border-radius: 20px;
  color: #0089ff;
  display: inline-block;
  width: 38%;
  font-size: 14px;
}
.mint-button--small {
  padding: 0;
}
.bg-pic-wrap {
  position: relative;
  height: 286px;
  min-height: 286px;
}
.login-bg {
  height: 100%;
  width: 100%;
  /* max-width: 750px; */
}
.login-icon {
  width: 213px;
  height: 63px;
  transform: translate(-50%, -78%);
}
.qrcode-w {
  width: 100%;
}
</style>
<style>
.lans-wrap .van-cell__title,
.van-cell__value {
  color: #fff !important;
}
.lans-wrap .van-cell {
  background: none !important;
  color: #fff;
}
.lans-wrap .van-cell .van-cell__title::before {
  display: none;
}
.lans-wrap .van-cell .van-cell__right-icon {
  display: none;
}
[class*="van-hairline"]::after {
  border: none;
}
.lans-wrap .van-collapse-item__content {
  background-color: rgba(0, 0, 0, 0.5);
  color: #c5c7ca !important;
  padding: 15px !important;
}
.lans-wrap .van-collapse-item__content > .lang-item {
  padding: 4px 0 !important;
  color: #c5c7ca !important;
}
.lans-wrap .van-collapse-item__content > .lang-item.act {
  color: #0089ff !important;
}
</style>
<style lang="less">
.zjg {
  color: #93cdff;
  font-weight: bold;
  font-size: 16px;
}
.loginbg {
  .lans-wrap {
    position: fixed;
    top: 0;
    right: 0;
    width: 100%;
    text-align: right;
    z-index: 100;
  }
  .maintitle {
    width: 100%;
    height: 100%;
    background-size: 5rem;
    position: relative;
  }
  .loginpart {
    padding: 20px;
    .login-tit {
      text-align: left;
      span {
        color: #939393;
        display: inline-block;
        width: 33%;
      }
      span.act {
        color: #0089ff;
      }
    }
  }
}
.tit-wrap {
  .tit {
    display: flex;
    color: #999;
    font-size: 16px;
    span {
      width: 100px;
      text-align: left;
      &.act {
        color: #0089ff;
        font-size: 18px;
      }
    }
  }
  .role-wrap {
    color: #666;
    font-size: 16px;
    margin: 25px 0;
    span {
      position: relative;
      margin: 0 47px;
      i {
        position: absolute;
        width: 20px;
        height: 20px;
        border: 1px solid #999;
        border-radius: 50%;
        left: -24px;
        &::after {
          display: block;
          content: "";
          position: absolute;
          width: 12px;
          height: 12px;
          background: #fff;
          border-radius: 50%;
          left: 50%;
          top: 50%;
          margin-left: -6px;
          margin-top: -6px;
          // transform: translate(-50%, -50%);
        }
      }
      &.act {
        color: #0089ff;
        i {
          border-color: #0089ff;
          &::after {
            background: #0089ff;
          }
        }
      }
    }
  }
}
</style>