<template>
  <div class="zuoye-result-wrap">
    <mt-header title class="mint-header-f" v-if="frompage=='renwu'">
      <mt-button icon="back" slot="left" @click="back()">{{$mt('返回')}}</mt-button>
    </mt-header>
    <div class="main main-f">
      <div v-if="isload" class="content-wrap">
        <div class="item-wrap" v-if="showpage">
          <ZuoyeDetail
            :zuoyeid="zuoyeid"
            v-if="zuoyeType==0"
            :frompage="frompage"
            :cfrompage="cfrompage"
          />
          <Discuss
            v-if="zuoyeType==1"
            :zuoyeitem="zuoye"
            :itemInfo="zuoye"
            @plMessage="onplMessage"
            :showheader="true"
            :frompage="frompage"
            :zdetail="zdetail"
            :cfrompagepath="cfrompage"
          />
          <ZuoyeXunlian
            v-if="zuoyeType>9 && zuoyeType<13"
            :zuoyeType="zuoyeType"
            :zuoyeitem="zuoye"
            :zuoyeid="zuoyeid"
            :tongyixl="tongyixl"
          />
          <ZuoyeExam
            v-if="zuoyeType==2"
            :zuoyeType="zuoyeType"
            :zuoyeid="zuoyeid"
            :Shuoc="Shuoc"
            :zupaper="zupaper"
          />
          <!-- <ZuoyeZupaper v-if="zuoyeType==2 " :zuoyeid="zuoyeid" :Shuoc="Shuoc" /> -->
        </div>
        <Empty v-else :text="['出错了，试试刷新吧']" :isreload="true" @reload="onreload" />
      </div>
    </div>
  </div>
</template>

<script>
import { Indicator, Toast, MessageBox, Actionsheet } from "mint-ui";
const ZuoyeDetail = () => import("@/views/banKeZuoye/zuoyedetail");
const Discuss = () => import("@/views/components/discuss");
const ZuoyeXunlian = () => import("@/views/banKeZuoye/zouyexunlian");
const ZuoyeZupaper = () => import("@/views/banKeZuoye/zupaperResult");
const ZuoyeExam = () => import("@/views/banKeZuoye/exam");
const Empty = () => import("@/common/empty");
import nativecode from "@/nativecode";
import maintools from "@/views/maintools";
import { parseURL } from "@/util";
export default {
  name: "",
  props: {
    zuoyeid: {
      default: 0
    },
    frompage: {
      default: ""
    }
  },
  data() {
    return {
      isload: false,
      zuoyeType: null,
      zuoye: {},
      Shuoc: false,
      cfromPath: {},
      cfrompage: "",
      zdetail: {},
      tongyixl: "",
      zupaper: false
    };
  },
  computed: {
    showpage() {
      if (this.isload && this.zuoyeType != null) {
        return true;
      }
      return false;
    }
  },
  created() {
    const UrlParams = parseURL(window.location.href);
    if (UrlParams.tongyixl) {
      this.tongyixl = UrlParams.tongyixl;
    }
    this.queryzuoyeType();
    this.queryuserfav();
  },
  mounted() {},
  watch: {},
  methods: {
    queryzuoyeType() {
      var url = "/api/api/zuoyeresultquery?zuoyeid=" + this.zuoyeid;
      Indicator.open(this.$mt("加载中") + "...");
      this.$http
        .post(url)
        .then(res => {
          if (res.data.code == 0) {
            this.zuoye = res.data.data.zuoye;
            this.zdetail = res.data.data.zdetail;
            if (this.zuoye.ztype == 2) {
              if (this.zuoye.answerdesc) {
                this.zupaper = true;
              }
            }
            this.zuoyeType = res.data.data.zuoye.ztype;
            if (this.zuoyeType == 1) {
              this.zdetail.localfiles = maintools.localfilesFromFilelist(
                this.zdetail.files
              );
            }
          } else {
            Toast(res.data.msg);
          }
          this.isload = true;
          Indicator.close();
        })
        .catch(() => {
          this.isload = true;
          Indicator.close();
          Toast(this.$mt("异常"));
        });
    },
    //是否收藏
    queryuserfav() {
      this.$http
        .post("/api/userfav/query", {
          eventtype: 3,
          eventids: [this.zuoyeid]
        })
        .then(res => {
          if (res.data.code == "0") {
            if (res.data.data.length) {
              this.Shuoc = true;
            }
          }
        })
        .catch(err => {});
    },
    onplMessage() {},
    onreload() {
      this.queryzuoyeType();
    },
    back() {
      this.$emit("calce", true);
    }
  },
  beforeRouteEnter(to, from, next) {
    console.log("作业结果 to path", to);
    console.log("作业结果 from path", from);
    next(vm => {
      vm.cfromPath = from;
      vm.cfrompage = from.path;
    });
  },
  components: {
    ZuoyeDetail,
    Discuss,
    Empty,
    ZuoyeXunlian,
    ZuoyeExam,
    [Actionsheet.name]: Actionsheet,
    ZuoyeZupaper
  }
};
</script>

<style scoped lang="less">
.zuoye-result-wrap {
  width: 100%;
  height: 100%;
  background: #fff;
  .main {
    height: 100%;
    .content-wrap {
      height: 100%;
      .item-wrap {
        height: 100%;
      }
    }
  }
}
</style>
