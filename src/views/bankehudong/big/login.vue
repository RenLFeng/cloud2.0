<template>
  <div class="big-main-login">
    <div class="container bg-d">
      <div class="top tc">
        <div v-if="!hascode" class="code-wrap">
          <p class="icon">
            <i class="iconfont icondapingmu eicotrigger"></i>
          </p>
          <p>{{$mt('请输入大屏上的连接码进行登录')}}</p>
          <p class="code clearfix position-b">
            <span :class="v.isact?'act':''" v-for="(v,index) in codes" :key="index">{{v.i}}</span>
          </p>
        </div>
        <div v-else>
          <div class="info">
            <img :src="bankeItem.avatar" alt :onerror="$defaultImg('banke')" />
            <p class="colorf">{{bankeItem.name}}</p>
          </div>
        </div>
        <p class="icon-wrap" @click="autoSign" v-show="!mergebankeids.length">
          <i class="iconfont iconok- position-l" :class="isAuto?'act':''"></i>
          {{$mt('连接大屏后自动开始签到')}}
        </p>
      </div>
      <div class="buttonkey" v-if="hascode">
        <div class="button-worp">
          <mt-button class="button-auto-87" @click="submitLogin">{{$mt('大屏登录')}}</mt-button>
        </div>
      </div>
      <div class="key" v-else>
        <van-number-keyboard
          v-model="inv"
          :show="show"
          :hide-on-click-outside="false"
          extra-key="."
          @blur="show = false"
          @delete="onDelete"
          @input.self="onInput"
        />
      </div>
    </div>
  </div>
</template>
<script>
import { Indicator, Toast, MessageBox } from "mint-ui";
import Vue from "vue";
import NumberKeyboard from "vant/lib/number-keyboard";
import "vant/lib/number-keyboard/style";
import nativebridge from "@/nativebridge";
import nativecode from "@/nativecode";
import { parseURL } from "@/util";
Vue.use(NumberKeyboard);
export default {
  name: "daplogin",
  props: {
    bankeid: {
      default: 0
    },
    bankeItem: {
      default() {
        return {
          name: "test"
        };
      }
    },
    ecode: {
      default: 0
    },
    mergebankeids: {
      default: []
    }
  },
  components: {},
  data() {
    return {
      inv: "",
      show: true,
      hascode: false,
      codes: [
        {
          i: "",
          isact: false
        },
        {
          i: "",
          isact: false
        },
        {
          i: "",
          isact: false
        },
        {
          i: "",
          isact: false
        }
      ],
      tempCode: [],
      count: 0,
      code: "",
      isAuto: true
    };
  },
  watch: {},
  computed: {},
  mounted() {
    if (this.bankeItem.id) {
      this.hascode = true;
    }
  },
  methods: {
    onInput(value) {
      if (this.count > 3) return;
      this.codes.splice(this.count, 1, {
        i: value,
        isact: true
      });
      this.tempCode.push(value);
      // console.log("tempCode", this.tempCode);
      this.count++;

      if (this.count > 3) {
        this.code = "";
        for (let v of this.tempCode) {
          this.code += v;
        }
        this.code = parseInt(this.code);
        // console.log("parseInt", this.code);
        this.dapinglogin();
      }
    },
    onDelete() {
      if (this.count == 0) return;
      this.count--;
      this.codes.splice(this.count, 1, {
        i: "",
        isact: false
      });
      this.tempCode.splice(this.tempCode.length - 1, 1);
      //   console.log(this.tempCode);
    },
    submitLogin() {
      this.code = this.ecode;
      this.dapinglogin(this.bankeItem.id);
    },
    dapinglogin(v) {
      //! cjy: 检测当前bankeid的有效性
      let bid = v;
      if (!v) {
        bid = this.bankeid;
      }
      if (bid == 0) {
        Toast(this.$mt("当前班课无效,请返回重试"));
        return;
      }
      let postData = {
        code: this.code,
        bankeid: bid,
        logininfo: {
          sign: this.isAuto
        }
      };
      if (this.mergebankeids.length) {
        postData.mergebankeids = this.mergebankeids;
      }
      this.$http
        .post("/api/banke/dapinglogin", postData)
        .then(res => {
          if (res.data.code == "0") {
            this.$emit("login", res.data.data.daping);
            Toast(this.$mt("登录成功"));
            // console.log("dapinglogin", res);
            // if (this.isAuto) {
            // this.postdapingmsg();
            //  }
            const UrlParams = parseURL(window.location.href);
            // if (UrlParams.ecode) {
            if (nativebridge.apiversion >= 3 && nativecode.hasduoping()) {
              this.$router.push({
                path: "/",
                query: { selected: "hudong" }
              });
            }
            // }
          } else {
            Toast(this.$mt("登录错误") + "：" + res.data.msg);
          }
        })
        .catch(err => {
          Toast(this.$mt("异常") + err);
        });
    },
    //! cjy: 因为大屏登录流程限制，这里立即发送的dapingmsg可能来不及处理
    // postdapingmsg() {
    //   this.$http
    //     .post("/api/banke/postdapingmsg", {
    //       bankeid: this.bankeid,
    //       ecode: this.code,
    //       data: "",
    //       cmd: "sign"
    //     })
    //     .then(res => {
    //       if (res.data.code == "0") {
    //       } else {
    //       }
    //     })
    //     .catch(err => {});
    // },
    autoSign() {
      this.isAuto = !this.isAuto;
    }
  }
};
</script>

<style lang='less' scoped>
.submit-join-wrap {
  position: relative;
  height: 100vh;
  min-height: 100vh;
  width: 100%;
  .main {
    background: #fff;
    .info {
      background: #0089ff;
      text-align: center;
      padding: 20px;
      img {
        width: 100px;
        height: 100px;
      }
      p {
        padding: 15px 0;
      }
    }
    .name {
      padding: 10px;
    }
  }
}

.big-main-login {
  max-height: 100vh;
  overflow: hidden;
  .top {
    height: 55vh;
    position: relative;
    .code-wrap {
      position: relative;
      height: 43vh;
    }
    .info {
      text-align: center;
      padding: 10vh;
      img {
        width: 20vh;
        height: 20vh;
        border-radius: 10px;
      }
      p {
        padding: 5vh 0;
        font-size: 30px;
        color: #000000;
      }
    }
    .name {
      padding: 10px;
    }
    .icon {
      height: 165px;
      line-height: 165px;
      i {
        width: 100%;
        font-size: 80px;
        color: #aaa;
      }
    }
    .code {
      width: 75%;
      left: 50%;
      transform: translate(-50%, 0);
      span {
        width: 15%;
        height: 100%;
        display: inline-block;
        margin: 0 5%;
        background: #666;
        height: 5px;
        font-weight: bold;
        font-size: 30px;
        margin-bottom: 6px;
        &.act {
          height: 0;
        }
      }
    }
  }
  .key {
    background: #f0f0f0;
  }
  .buttonkey {
    height: 38vh;
  }
  .button-worp {
    width: 100%;
    position: absolute;
    button {
      background: #0089ff;
      color: #fff;
    }
  }
  .icon-wrap {
    position: absolute;
    width: 60%;
    left: 50%;
    bottom: 30px;
    transform: translate(-50%, 0);
    text-align: left;
    padding-left: 40px;
    color: #000000;
    .iconfont {
      color: transparent;
      border: 1px solid #ccc;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      font-size: 26px;
      &.act {
        color: #ff8900;
        border: none;
      }
    }
  }
  .van-number-keyboard {
    height: 38vh;
  }
}
</style>
<style >
.key .van-number-keyboard .van-key {
  height: 48px;
}
</style>