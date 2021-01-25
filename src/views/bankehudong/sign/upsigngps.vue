<template>
  <div class="upsigngps-wrap">
    <mt-header :title="$mt('位置更新')" class="mint-header-f">
      <mt-button icon="back" slot="left" @click="back">{{$mt('取消')}}</mt-button>
    </mt-header>
    <div class="main main-50">
      <div class="dotry position-c" v-if="showtry" @click="dotry">{{$mt('再试试')}}</div>
    </div>
  </div>
</template>
<script>
import { Indicator, Toast, MessageBox } from "mint-ui";
import { parseURL } from "@/util";
import nativecode from "@/nativecode";
import nativebridge from "@/nativebridge";
export default {
  name: "",
  props: {},
  data() {
    return {
      GPS: null,
      UrlParams: {
        bankeid: 0,
        ecode: 0
      },
      getgpslongtime: false,
      testkey: null,
      showtry: false,
      customserver: false,
      showpage: true
    };
  },
  computed: {
    canupgps() {
      if (process.env.NODE_ENV == "development") {
        return true;
      }
      if (
        nativecode.platform == "exsoftandroid" ||
        nativecode.platform == "exsoftios"
      ) {
        if (this.customserver) {
          return true;
        }
        return false;
      }
      return false;
    }
  },
  watch: {},
  created() {
    Indicator.open(this.$mt("加载中"));
    if (sessionStorage.getItem("customserver")) {
      this.customserver = JSON.parse(sessionStorage.getItem("customserver"));
    }

    // if (!this.canupgps) {
    //   this.showpage = false;
    //   this.downloadapp();
    //   this.$nextTick(() => {
    //     Indicator.close();
    //   });
    //   return;
    // }
    this.$nextTick(() => {
      Indicator.close();
    });
    console.log("upsigngps URL", window.location.href);
    //   http://192.168.1.104:8081/#/upsigngps?bankeid=1019&ecode=12345
    const UrlParams = parseURL(window.location.href);
    if (UrlParams.bankeid) {
      this.UrlParams.bankeid = UrlParams.bankeid;
    }
    if (UrlParams.ecode) {
      this.UrlParams.ecode = UrlParams.ecode;
    }
    this.updata();
  },
  mounted() {},
  methods: {
    updata() {
      this.testkey = new Date().getTime();
      if (!this.UrlParams.bankeid || !this.UrlParams.ecode) {
        Toast(this.$mt("解析失败,请重新扫码"));
        return;
      }
      this.showtry = false;
      Indicator.open(this.$mt("位置更新中"));
      let cb = obj => {
        Indicator.close();
        if (obj.code == 0) {
          let res = obj.data;
          if (typeof res == "string") {
            if (res.substr(0, 1) == "{") {
              console.log("json str 解析");
              res = JSON.parse(res);
            }
          }
          this.GPS = res;
          let gpsinfo = {};
          gpsinfo.latitude = res.latitude;
          gpsinfo.longitude = res.longitude;
          gpsinfo.address = "";
          gpsinfo.name = "";
          this.postdapingmsg(gpsinfo);
        } else {
          this.showtry = true;
          Toast(this.$mt("定位失败"));
        }
      };
      this.nativegetgps(cb);
      if (process.env.NODE_ENV == "development") {
        this.moni();
      }
    },
    postdapingmsg(gpsinfo) {
      let postData = {
        bankeid: this.UrlParams.bankeid,
        ecode: this.UrlParams.ecode,
        data: gpsinfo,
        cmd: "location"
      };
      postData.data = JSON.stringify(postData.data);
      console.log("扫码设置位置", postData);
      this.$http
        .post("/api/banke/postdapingmsg", postData)
        .then(res => {
          if (res.data.code == 0) {
            this.$alert({
              msg: "更新位置成功",
              cb: () => {
                this.$router.push("/");
              }
            });
          } else {
            this.showtry = true;
            Toast(this.$mt("异常,请检测权限"));
          }
        })
        .catch(err => {
          this.showtry = true;
          Toast(this.$mt("服务开小差了"));
        });
    },
    dotry() {
      this.updata();
    },
    nativegetgps(cb) {
      let json = {
        data: {},
        cb: cb,
        finnalcb: this.finnalcb
      };
      if (process.env.NODE_ENV == "development") {
        json.key = this.testkey;
      }
      nativecode.GPS("needgps", json);
    },
    moni() {
      let tempobj = {
        data: {
          code: 0,
          data: {
            latitude: 102.123,
            longitude: 55.123
          },
          msg: ""
        },
        key: this.testkey
      };
      tempobj.data = JSON.stringify(tempobj.data);
      setTimeout(() => {
        nativebridge.nativecalled2("callcallback", tempobj);
      }, 2000);
    },
    finnalcb() {
      Toast(this.$mt("获取定位超时"));
      Indicator.close();
      this.getgpslongtime = true;
      this.showtry = true;
    },
    back() {
      this.$router.push("/");
    },
    downloadapp() {
      window.location.href = document.location.origin + "/download.html";
    }
  },
  components: {},
  destroyed() {}
};
</script>
<style lang='less' scoped>
.upsigngps-wrap {
  .main {
    position: relative;
    .dotry {
      width: 230px;
      height: 230px;
      text-align: center;
      line-height: 230px;
      background: rgba(0, 137, 255, 0.6);
      border-radius: 50%;
      color: #fff;
      font-size: 30px;
    }
  }
}
</style>