<template>
  <div class="submit-join-wrap">
    <div class="main">
      <div class="info">
        <img :src="bankeItem.avatar" alt :onerror="$defaultImg('banke')" />
        <p class="colorf">{{bankeItem.name}}</p>
      </div>
      <p class="name">{{$mt('教师')}}:&nbsp;{{bankeItem.username}}</p>
    </div>
    <div class="button-worp">
      <mt-button class="button-auto-87" @click="submitJoin">{{$mt('加入')}}</mt-button>
    </div>
  </div>
</template>

<script>
import { Indicator, Toast, MessageBox } from "mint-ui";

export default {
  props: {
    bankeItem: {
      default() {
        return {};
      }
    }
  },
  data() {
    return {};
  },
  computed: {},
  created() {},
  mounted() {},
  watch: {},
  methods: {
    submitJoin() {
      Indicator.open(this.$mt("处理中") + "...");
      this.$http
        .post("/api/banke/reqmemberadd", {
          bankeid: this.bankeItem.id
        })
        .then(res => {
          Indicator.close();
          if (res.data.code == "0") {
            this.bankeItem = res.data.data.bankes[0];
            this.popupSubmitJoin = true;
            let tourl = "/bankehome/" + this.bankeItem.id;
            this.$store.commit("setRouterForward", true);
            this.$router.replace(tourl);
            // this.$store.commit("banke/setBankes", []);
          } else {
            let tipmsgs = res.data.msg;
            let prefix = this.$mt("加入失败");
            if (tipmsgs == "over num limit") {
              tipmsgs = this.$mt("班课人数已达上限");
            } else if (tipmsgs == "finished") {
              tipmsgs = this.$mt("班课已结束");
            } else if (tipmsgs == "is owner") {
              tipmsgs = this.$mt("不能加入自己的班课");
            } else if (tipmsgs == "already in") {
              tipmsgs = this.$mt("已在班课中");
              prefix = "";
            }
            this.$alert(
              {
                msg: prefix + tipmsgs
              },
              false
            );
          }
        })
        .catch(err => {
          Indicator.close();
          Toast(this.$mt("服务异常"));
        });
    }
  },
  components: {}
};
</script>

<style scoped lang="less">
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
  .button-worp {
    width: 100%;
    position: absolute;
    bottom: 80px;
    button {
      background: #0089ff;
      color: #fff;
    }
  }
}
</style>
