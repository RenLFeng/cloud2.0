<template >
  <div class="exam-wrap">
    <mt-header :title="$mt('考试结果')" class="mint-header-f">
      <mt-button icon="back" slot="left" @click="back">{{$mt('返回')}}</mt-button>
    </mt-header>
    <div class="main mian-f">
      <ZupaperResult
        v-if="zupaper"
        @clickshuoc="clickshuoc"
        :curzystate="curzystate"
        :Shuoc="Shuoc"
        :zuoyeid="zuoyeid"
        :zuoyeitem="zuoyeitem"
        :members="members"
        :epitem="epitem"
        :paperkey="paperkey"
      />
      <Epaperresult
        v-else
        @epuserclick="onclick"
        @clickshuoc="clickshuoc"
        :members="members"
        :zuoyeitem="zuoyeitem"
        :curzystate="curzystate"
        :Shuoc="Shuoc"
        :ismaster="ismaster"
      />
    </div>
  </div>
</template>

<script>
import { ispcBroswer, CollectionFn } from "@/util";
import { Indicator, Toast, MessageBox } from "mint-ui";
import BottomLoadmore from "@/common/bottom-loadmore";
const Epaperresult = () => import("@/views/banKeZuoye/epaperResult");
const ZupaperResult = () => import("@/views/banKeZuoye/zupaperResult");
export default {
  props: {
    zuoyeid: {
      default: 0
    },
    zuoyeType: {
      default: null
    },
    Shuoc: {
      default: false
    },
    zupaper: {
      default: false
    }
  },
  data() {
    return {
      pagemode: "result",
      members: [],
      zuoyeitem: {},
      zdetail: {},
      page: 0,
      pagesize: 10,
      allLoaded: false,
      loading: false,
      listLoadend: false,
      myinfos: [],
      epitem:{},
      paperkey: "",
      ismaster:false
    };
  },
  computed: {
    paperid() {
      if (this.zdetail.files.length) {
        return this.zdetail.files[0].paperid;
      }
      return "";
    },
    curzystate() {
      switch (this.zuoyeitem.state) {
        case 100:
          return "进行中";
        case 99:
          return "阅卷中";
        case 98:
          return "考试已结束";
        case 10:
          return "考试已结束";
      }
    },
    user() {
      return this.$store.getters.curuser;
    },
    isteacher() {
      if (this.$store.getters.isteacher) {
        return true;
      }
      return false;
    },
    showLoadtips() {
      if (
        (!this.allLoaded && this.loading) ||
        (this.allLoaded && this.listLoadend)
      ) {
        return true;
      }
      return false;
    },
    Loadtipsobj() {
      let obj = {};
      obj = {
        showType: "",
        loadtext: "已经加载全部了"
      };
      if (!this.allLoaded && this.loading) {
        obj = {
          showType: "loading",
          loadtext: "加载中"
        };
      }
      return obj;
    }
  },
  created() {},
  mounted() {
    this.zuoyeresultquery();
  },
  watch: {
    ismaster:function(newv,oldv){
      this.ismaster=newv;
    },
  },
  methods: {
    onclick(item) {
      console.log("index", this.isteacher);
      if (!item.examinfo) {
        Toast(this.$mt("未参加考试"));
        return;
      }
      let state = this.zuoyeitem.state;
      if (
        (state == 98 && item.examinfo.states == 10) ||
        (state == 10 && item.examinfo.states == 10)
      ) {
        this.doreview(item.examinfo, true);
        return;
      }
      if (state == 100) {
        if (this.isteacher) {
          if (
            item.examinfo.states == 5 ||
            item.examinfo.states == 6 ||
            item.examinfo.states == 10
          ) {
            this.doreview(item.examinfo);
            return;
          }
          Toast(this.$mt(this.Toasttips(item.examinfo.states)));
        } else {
          if (item.examinfo.states >= 1 && item.examinfo.states < 5) {
            this.doexammobile(item.examinfo);
            return;
          }
          Toast(this.$mt(this.Toasttips(item.examinfo.states)));
        }
      }
      if (state == 99) {
        if (this.isteacher) {
          this.doreview(item.examinfo);
        } else {
          Toast(this.$mt("老师正在阅卷") + "...");
        }
      }
    },
    zuoyeresultquery() {
      var url = "/api/api/zuoyeresultquery?zuoyeid=" + this.zuoyeid;
      Indicator.open(this.$mt("加载中"));
      this.$http
        .post(url)
        .then(res => {
          if (res.data.code == 0) {
            if(res.data.data.ismaster){
              this.ismaster=res.data.data.ismaster;
            }
            this.zuoyeitem = res.data.data.zuoye;
            this.zdetail = res.data.data.zdetail;
            let members = res.data.data.results;
            let userids = [];
            this.paperkey = this.zuoyeitem.answerdesc;
            if (this.paperkey) {
              this.zupaperQuery();
            }
            if (res.data.data.mymember) {
              this.pagemode = "submit";
            }
            for (let v of members) {
              userids.push(v.userid);
            }
            if (this.pagemode == "result") {
              this.queryexaminfo(members, userids);
            } else if (this.pagemode == "submit") {
              if (!members.length) {
                this.onsubmit(members);
              } else {
                this.queryexammyinfo(members);
              }
            }
          } else {
            Toast(res.data.msg);
          }
          Indicator.close();
        })
        .catch(() => {
          Indicator.close();
          Toast(this.$mt("服务开小差了"));
        });
    },
    zupaperQuery() {
      this.$http
        .post("/api/zupaper/paperquery", {
          paperkey: this.paperkey
        })
        .then(res => {
          if (res.data.code == 0) {
            if(res.data.data.length){
              let epinfo=res.data.data[0];
              epinfo.content=JSON.parse(epinfo.content);
              this.epitem=epinfo;
            }
          } else {
            Toast(this.$mt("查找失败"));
          }
          Indicator.close();
        })
        .catch(err => {
          Indicator.close();
          Toast(this.$mt("服务走丢了"));
        });
    },
    loadMore() {
      this.loading = true;
      this.queryexaminfo();
    },
    queryexaminfo(members, ids) {
      this.$http
        .post("/api/exam/info", {
          where: {
            aboutid: this.zuoyeid,
            abouttype: 0,
            userid: ids
          }
          //   page: {
          //     page: this.page,
          //     pagesize: this.pagesize
          //   }
        })
        .then(res => {
          if (res.data.code == "0") {
            for (let v of members) {
              for (let item of res.data.data) {
                if (v.userid == item.userid) {
                  v.examinfo = item;
                }
              }
            }
          }
          this.members = members;
          console.log("members", this.members);
        })
        .catch(err => {
          Toast(this.$mt("服务开小差了"));
        });
    },
    queryexammyinfo(members) {
      this.$http
        .post("/api/exam/myinfo", {
          aboutid: this.zuoyeid,
          abouttype: 0
        })
        .then(res => {
          if (res.data.code == "0") {
            for (let v of members) {
              for (let item of res.data.data) {
                if (v.userid == item.userid) {
                  v.examinfo = item;
                }
              }
            }
            console.log("fdsfs", this.members);
          }
          this.members = members;
          console.log("members", this.members);
        })
        .catch(err => {
          Toast(this.$mt("服务开小差了"));
        });
    },
    onsubmit() {
      var url = "/api/api/zuoyesubmit?zuoyeid=" + this.zuoyeid;
      this.$http
        .post(url, {
          zdetail: {
            ztext: "",
            files: []
          }
        })
        .then(res => {
          let temp = [];
          let userids = [];
          let members = [res.data.data];
          this.queryexammyinfo(members);
        })
        .catch(err => {});
    },
    clickshuoc() {
      if (this.Shuoc) {
        Toast(this.$mt("你已经收藏过了"));
        return;
      }
      this.Collection();
    },
    //收藏
    Collection() {
      let imgIcon = "zuoye";
      CollectionFn(
        this.zuoyeitem,
        3,
        imgIcon,
        this.zuoyeitem.id,
        this.zuoyeitem.ownerid,
        this
      ).then(() => {
        this.Shuoc = true;
      });
    },
    back() {
      if (this.zuoyeCfrom == "coursehome") {
        this.$store.commit("SET_ZYNEW_BACK_STATE", 3);
      }
      this.$back();
    },
    doreview(examinfo, readonly = false) {
      if (!ispcBroswer()) {
        Toast(this.$mt("请在PC浏览器中打开"));
        return;
      }
      let url = `http://192.168.1.104:8082/doreview.html?paperid=${this.paperid}&answerid=${examinfo.answerid}&reviewid=${examinfo.reviewid}`;
      if (process.env.NODE_ENV !== "development") {
        url = document.location.origin;
        url += `/doepaper/doreview.html?paperid=${this.paperid}&answerid=${examinfo.answerid}&reviewid=${examinfo.reviewid}`;
      }
      if (readonly) {
        url += `&readonly=${readonly}`;
      }
      window.open(url);
    },
    doexammobile(examinfo) {
      let url = `http://192.168.1.104:8082/doexammobile.html?paperid=${this.paperid}&answerid=${examinfo.answerid}`;
      if (process.env.NODE_ENV !== "development") {
        url = document.location.origin;
        url += `/doepaper/doexammobile.html?paperid=${this.paperid}&answerid=${examinfo.answerid}`;
      }
      window.open(url);
    },
    membercurstate(state) {
      let text = "";
      switch (state) {
        case 0:
          text = "未参加";
          break;
        case 1:
          text = "考试中";
          break;
        case 2:
          text = "考试暂停中";
          break;
        case 5:
          text = "已交卷";
          break;
        case 6:
          text = "已统一交卷";
          break;
        case 10:
          text = "已阅卷";
          if ((this.zuoyeitem.state = 10)) {
            text = "考试已结束";
          }
          break;
        default:
          text = "未参加";
      }
      return this.$mt(text);
    },
    Toasttips(state) {
      let text = "";
      switch (state) {
        case 1:
          text = "考试中";
          break;
        case 2:
          text = "考试暂停中";
          break;
        case 5:
          text = "已交卷";
          if (!this.isteacher) {
            text = "已交卷,等待阅卷";
          }
          break;
        case 6:
          text = "已统一交卷";
          if (!this.isteacher) {
            text = "已统一交卷,等待阅卷";
          }
          break;
        case 10:
          text = "已阅卷";
          if (!this.isteacher) {
            text = "已阅卷,请稍后查看结果";
          }
          break;
      }
      return text;
    }
  },
  components: {
    BottomLoadmore,
    Epaperresult,
    ZupaperResult
  }
};
</script>

<style scoped lang="less">
</style>
