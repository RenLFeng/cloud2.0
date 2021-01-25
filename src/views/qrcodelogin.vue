<template>
  <div class="wechat-wrap">
    <mt-header :title="$mt('扫码确认登录')" class="mint-header-f"></mt-header>
    <div class="main">
      <div class="position-c w">
        <h1 class="h1" @click="login">{{$mt('确认登录')}}</h1>
        <h1 class="h1" @click="cancle">{{$mt('取消')}}</h1>
      </div>
    </div>
  </div>
</template>

<script>
import { parseURL } from "@/util";
import { Indicator, Toast, MessageBox } from "mint-ui";
export default {
  name: "Qrcodelogin",
  props: {},
  data() {
    return {
      desc: this.$mt("登录中"),
      code: ""
    };
  },
  computed: {},
  created() {
    // http://192.168.1.104:8081/#/WechatLogin/callback.do?code=78900&state=
    const UrlParams = parseURL(window.location.href);
    console.log("UrlParams 扫码 window.location.href", window.location.href);
    console.log("UrlParams 扫码", UrlParams);
    if (UrlParams.code) {
      this.code = UrlParams.code;
    }
  },
  mounted() {},
  watch: {},
  methods: {
    login() {
      if (!this.code) return;
      Indicator.open(this.$mt("登录中") + "...");
      this.$http
        .post("/api/logincode/setlogin", {
          code: this.code
        })
        .then(res => {
          Indicator.close();
          if (res.data.code == 0) {
            Toast(this.$mt("成功"));
            this.$router.push("/");
          } else {
            Toast(this.$mt("失败") + res.data.msg);
          }
        })
        .catch(res => {
          Toast(this.$mt("服务开小差了"));
          Indicator.close();
        });
    },
    cancle() {
      this.$router.push("/");
    }
  },
  components: {}
};
</script>

<style scoped lang="less">
.wechat-wrap {
  width: 100%;
  height: 100vh;
  .main {
    width: 100%;
    height: 100%;
    position: relative;
    .w {
      width: 100%;
      .h1 {
        width: 50%;
        height: 50px;
        background: #0089ff;
        color: #fff;
        text-align: center;
        line-height: 50px;
        margin: 10px auto;
        border-radius: 6px;
        font-size: 20px;
      }
    }
  }
}
</style>
