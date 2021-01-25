<template>
  <div class="addbanke-wrap">
    <div class="main">
      <mt-header :title="$mt('加入班课')">
        <mt-button icon="back" slot="left" @click="$back">{{$mt('返回')}}</mt-button>
      </mt-header>
      <mt-field :placeholder="$mt('请输入班课号')" type="number" v-model="bankeNumber"></mt-field>
      <div class="button-worp">
        <mt-button class="button-auto-87" @click="joinsearch">{{$mt('下一步')}}</mt-button>
      </div>
    </div>
    <mt-popup
      v-model="popupSubmitJoin"
      position="right"
      class="popup-right"
      :modal="false"
      style="background:#f0f0f0"
    >
      <mt-header style="background:#0089FF!important;">
        <mt-button
          style="color:#fff!important;"
          icon="back"
          slot="left"
          @click="goback"
        >{{$mt('返回')}}</mt-button>
      </mt-header>
      <Submitjoin :bankeItem="bankeItem" />
    </mt-popup>
  </div>
</template>

<script>
import { Indicator, Toast, MessageBox } from "mint-ui";
import Submitjoin from "./submitjoin";
import nativecode from "@/nativecode";
import { parseURL } from "@/util";
export default {
  name: "Join",
  props: {
    bankeid: {
      default() {
        return 0;
      }
    }
  },
  data() {
    return {
      bankeNumber: "",
      popupSubmitJoin: false,
      bankeItem: {},
      ebankeid:0
    };
  },
  computed: {},
  created() {
    // const UrlParams = parseURL(window.location.href);
    // if(UrlParams.bankeid){
    //   this.ebankeid=UrlParams.bankeid;
    // }
    console.log("join vue , bankeid:" + this.bankeid);
    if (this.bankeid != 0) {
      // nativecode.initfirst();  //! wx等平台，初始化session
      this.bankeNumber = this.bankeid;
      Indicator.open(this.$mt("加载中") + "...");
      this.$http
        .post("/api/banke/searchinbanke", {
          id: this.bankeid
        })
        .then(res => {
          Indicator.close();
          if (res.data.code == "0") {
            let rdata = res.data.data;
            if (rdata.isin) {
              let tourl = "/bankehome/" + rdata.banke.id;
              this.$store.commit("setRouterForward", true);
              this.$router.replace(tourl);
            } else {
              this.bankeItem = rdata.banke;
              this.popupSubmitJoin = true;
            }
          } else {
            let tips = this.$mt("错误") + ":" + this.data.msg;
            Toast(tips);
            let tourl = "/";
            this.$store.commit("setRouterForward", true);
            this.$router.replace(tourl);
          }
        })
        .catch(err => {
          Indicator.close();
          Toast(this.$mt("异常"));
          let tourl = "/";
          this.$store.commit("setRouterForward", true);
          this.$router.replace(tourl);
        });
    }
  },
  mounted() {},
  watch: {},
  methods: {
    joinsearch() {
      if (!this.bankeNumber) {
        Toast(this.$mt("请输入班课号"));
        return;
      }
      this.$http
        .post("/api/banke/search", {
          id: this.bankeNumber
        })
        .then(res => {
          if (res.data.code == "0" && res.data.data.length > 0) {
            this.bankeItem = res.data.data[0];
            if (this.bankeItem.funcdesc == "{}" || !this.bankeItem.funcdesc) {
              this.popupSubmitJoin = true;
            } else {
              if (this.bankeItem.funcdesc.includes("disablejoin")) {
                Toast(this.$mt("禁止加入班课"));
              } else {
                this.popupSubmitJoin = true;
              }
            }
          } else {
            this.$alert({
              msg: "未找到班课"
            });
          }
        })
        .catch(err => {
          Toast(this.$mt("服务异常"));
        });
    },
    goback() {
      if (this.popupSubmitJoin) {
        this.popupSubmitJoin = false;
      }
    }
  },
  components: {
    Submitjoin
  }
};
</script>

<style scoped lang="less">
.addbanke-wrap {
  .main {
    .mint-field {
      margin: 10px 0;
      padding: 0 10px;
    }
  }
  .button-worp {
    margin-top: 50px;
  }
}
</style>
