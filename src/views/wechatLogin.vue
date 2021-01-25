<template>
  <div class="wechat-wrap">
    <div class="mian">
      <div class="position-c">
        <h1>{{desc}}</h1>
      </div>
    </div>
  </div>
</template>

<script>
import { parseURL } from "@/util";
import { Indicator, Toast, MessageBox } from "mint-ui";

import nativecode from "@/nativecode";

export default {
  name: "WechatLogin",
  props: {},
  data() {
    return {
        desc:this.$mt('登录中'),
      code: ''
    };
  },
  computed: {},
  created() {
    // http://192.168.1.104:8081/#/WechatLogin/callback.do?code=78900&state=
    const UrlParams = parseURL(window.location.href);
    console.log('UrlParams 微信扫码 window.location.href',window.location.href);
    console.log('UrlParams 微信扫码',UrlParams);
    if (UrlParams.code) {
      this.code = UrlParams.code;
    }
    this.wechatLogin();
  },
  mounted() {},
  watch: {},
  methods: {
    wechatLogin() {
      Indicator.open(this.$mt('登录中')+"...");
      this.$http
        .post("/api/weixin/webupdateuser", {
          code:this.code
        })
        .then(res => {
            Indicator.close();
          if (res.data.code == 0) {
              console.log('扫码登陆成功',res.data.data);
             //this.$router.push("/");
              this.$store.commit("setLoginUser", res.data.data);
              this.$store.commit("setRouterForward", true);
              this.$router.push("/");
              nativecode.jsLogin(1, res.data.data);
          } else {
            console.log('扫码登陆失败',res.data.msg);
            Toast(this.$mt('登陆失败'));
            this.$router.push("/login");
          }

        })
        .catch(res => {
          Toast(this.$mt('登陆失败')+ this.$mt('服务异常'));
          this.$router.push("/login");
          Indicator.close();
        });
    }
  },
  components: {}
};
</script>

<style scoped lang="less">
.wechat-wrap {
  width: 100%;
  height: 100vh;
  background: #fff;
  .main {
    position: relative;
  }
}
</style>
