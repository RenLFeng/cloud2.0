<template>
  <div class="zyxunlian-wrap">
    <mt-header :title="$mt(xunliantitle)" class="mint-header-f">
      <mt-button icon="back" slot="left" @click="back">{{$mt('返回')}}</mt-button>
      <mt-button slot="right" @click="tongyistop" v-if="showxlstopbtn">{{$mt('结束统一训练')}}</mt-button>
    </mt-header>
    <div class="main mian-f">
      <div class="titinfo-wrap">
        <div class="info-wrap">
          <P class="name">
            {{zuoyeitem.name}}
            <i
              class="iconfont iconcollect eicotrigger position-r"
              :class="isShuoc?'colory':'color9'"
              @click="shuoc"
            ></i>
          </P>
          <P class="score">{{$mt('分值')}}:{{zuoyeitem.score}}{{$mt('分')}}</P>
          <P class="color9">{{$mt(curzystate)}}</P>
        </div>
        <!-- <p class="seevd">
          观看视频
          <span class="iconfont iconjiantou colora font18 position-r"></span>
        </p>-->
        <Vanbr :tabBar="labels" width="30" @selectClick="onselectClick" v-if="pagemode=='result'" />
        <!-- <div class="van-navbr-wrap" v-if="pagemode=='result'" :class="$i18n.locale!='zh'?'nozh':''">
          <ul class="overflow-scroll">
            <li
              class="ellipse"
              v-for="(v,i) in labels"
              :key="i"
              :class="v.isActive?'active':''"
              ref="tbLi"
            >
              <span class="lable font18" @click="selectClick($event,v,i)">{{$mt(v.label)}}</span>
              <span class="num fontxs">{{v.num}}</span>
            </li>
            <span class="move-bar" ref="movebar" :style="`left:${moveBar}px`"></span>
          </ul>
        </div>-->
      </div>
      <div class="scorll-content-wrap overflow-scroll">
        <mt-loadmore
          :top-method="loadTop"
          :top-distance="80"
          ref="loadmore"
          :auto-fill="autofill"
          :topPullText="$mt('下拉刷新')"
          :topDropText="$mt('释放更新')"
          :topLoadingText="$mt('加载中')"
          class="myloadmore"
        >
          <div class="scorll-content itemlists">
            <div v-if="pagemode=='submit'" class="submit-wrap">
              <p class="title">{{$mt('我的')}}</p>
              <div v-for="(v,i) in my(this.user.id)" :key="i">
                <XunLianlistitem
                  :curitem="v"
                  :pagemode="pagemode"
                  :xunliantype="zuoyeType"
                  @score="onScore"
                  @diss="onDiss"
                  @goxunlian="ongoxunlian"
                />
              </div>
              <!-- <p class="title">其他同学的</p>
          <div v-for="(item,i) in other(this.user.id)" :key="i">
            <XunLianlistitem
              :curitem="item"
              :pagemode="pagemode"
              :xunliantype="zuoyeType"
              @score="onScore"
              @diss="onDiss"
              @goxunlian="ongoxunlian"
            />
              </div>-->
            </div>
            <div v-else>
              <XunLianlistitem
                v-for="(v,i) in xunliantj"
                :key="i"
                :curitem="v"
                :pagemode="pagemode"
                :xunliantype="zuoyeType"
                @score="onScore"
                @diss="onDiss"
                @goxunlian="ongoxunlian"
              />
            </div>
            <p
              v-if="!xunliantj.length && pagemode!='submit'"
              class="position-c colora"
            >{{$mt('无学员加入')}}...</p>
          </div>
        </mt-loadmore>
      </div>
    </div>
    <!-- 评论 -->
    <mt-popup
      v-model="popupZuoyePL"
      position="right"
      class="mint-popup-3"
      :modal="false"
      style="background: #fff;"
    >
      <mt-header :title="$mt('评论区')">
        <mt-button slot="left" icon="back" @click="popupZuoyePL=false">{{$mt('返回')}}</mt-button>
      </mt-header>
      <Discuss
        v-if="popupZuoyePL"
        :itemInfo="cureditItem"
        :zuoyeitem="zuoyeitem"
        @plMessage="onplMessage"
      ></Discuss>
    </mt-popup>
    <!-- 评分 -->
    <mt-popup v-model="popupZuoyePF" position="bottom" class="pf-container-popup">
      <div class="pf-container" v-if="popupZuoyePF">
        <p class="tit border-bottom-e5 tc">
          <span class="close-mode fl" @click="popupZuoyePF=false">{{$mt('取消')}}</span>
          {{$mt('给')}}&nbsp;{{cureditItem.name}} {{$mt('评分')}}
          <span
            class="close-mode fr"
            @click="submiMark"
          >{{$mt('评分')}}</span>
        </p>
        <p class="mark-input border-bottom-e5">
          <input class="tc" type="number" v-model.lazy="mark" v-on:change="changeMark()" />
          {{$mt('总体评分')}}({{zuoyeitem.score}})
        </p>
        <ul class="clearfix">
          <li class="fl tc" v-for="i in markArr" :key="i" @click="seleMarkFn(i)">{{i>9?$mt('满分'):i}}</li>
        </ul>
      </div>
    </mt-popup>
    <!--  -->
    <mt-popup
      v-model="popupXunlian"
      position="right"
      class="mint-popup-3"
      :modal="false"
      style="background: #fff;"
    >
      <iframe :src="iframesrc" v-if="popupXunlian" ref="iframe" id="iframe" frameborder="0"></iframe>
    </mt-popup>
  </div>
</template>

<script>
import { Indicator, Toast, MessageBox, Actionsheet } from "mint-ui";
const XunLianlistitem = () => import("@/views/banKeZuoye/xunlianlist");
const Discuss = () => import("@/views/components/discuss");
import nativecode from "@/nativecode";
import { parseURL } from "@/util";
import nativebridge from "@/nativebridge";
import Vanbr from "@/common/van-navbr";
export default {
  props: {
    zuoyeid: {
      default: 0
    },
    zuoyeType: {
      default: null
    },
    tongyixl: {
      default: ""
    }
  },
  data() {
    return {
      iframesrc: "",
      autofill: false,
      members: [],
      pagemode: "result",
      queryzuoyeresult: {},
      zuoyeitem: {},
      zdetail: {},
      zanswer: {},
      isShuoc: false,

      labels: [
        {
          id: 100,
          label: "全部",
          num: 0,
          isActive: true
        },
        {
          id: 1,
          label: "已完成",
          num: 0,
          isActive: false
        },
        {
          id: 2,
          label: "未完成",
          num: 0,
          isActive: false
        }
      ],
      markArr: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      moveBar: 18,
      xunliantj: [],
      srtlines: null,
      cureditItem: {},
      popupZuoyePF: false,
      popupZuoyePL: false,
      mark: "",
      userids: [],
      bankeid: 0,
      popupXunlian: false,
      ismaster: false,
      refresh: false,
      // readonly: false
      stoptyxl: false
    };
  },
  computed: {
    showxlstopbtn() {
      let tyxlid = sessionStorage.getItem("tyxlid") || "";
      if (this.ismaster) {
        if (this.zuoyeid == tyxlid && !this.stoptyxl) {
          return true;
        }
      }
      return false;
    },
    caneditzuoye() {
      let isteacher = this.$store.getters.haseditbankerole;
      if (!isteacher) {
        return false;
      }
      return true;
    },
    readonly() {
      if (this.pagemode == "result") {
        return true;
      }
      if (this.pagemode == "submit") {
        if (this.cureditItem.userid != this.user.id) {
          return true;
        }
      }
      return false;
    },
    user() {
      return this.$store.getters.curuser;
    },
    xunliantitle() {
      if (this.zuoyeType == "10") {
        return "发音训练";
      } else if (this.zuoyeType == "11") {
        return "听写训练";
      } else if (this.zuoyeType == "12") {
        return "配音训练";
      }
      return "训练";
    },
    zuoyeCfrom() {
      return this.$store.state.zuoyeCfrom;
    },
    curzystate() {
      switch (this.zuoyeitem.state) {
        case 100:
          return "进行中";
        case 10:
          return "已结束";
      }
    },
    showti() {
      if (this.pagemode == "submit") {
        return;
      }
    },
    curbanke() {
      let curbanke = this.$store.state.curbanke;
      if (curbanke) {
        return curbanke;
      }
      return null;
    },
    curSeTableid() {
      for (let v of this.labels) {
        if (v.isActive) {
          return v.id;
        }
      }
      return 100;
    }
  },
  created() {
    const UrlParams = parseURL(window.location.href);
    let curbanke = sessionStorage.getItem("curbanke") || "";
    if (curbanke) {
      curbanke = JSON.parse(curbanke);
      this.bankeid = curbanke.id;
    }
    if (UrlParams.bankeid) {
      this.bankeid = UrlParams.bankeid;
    }

    this.zuoyeresultquery();
  },
  mounted() {
    nativecode.Resultdp("xlback", {
      resultcb: obj => {
        this.popupXunlian = false;
        this.iframesrc = "";
      }
    });
  },
  watch: {},
  methods: {
    loadTop() {
      this.refresh = true;
      for (let v of this.labels) {
        v.num = 0;
      }
      this.zuoyeresultquery();
    },
    loadxunlianresult(userids) {
      this.$http
        .post("/api/xunlian/info", {
          where: {
            aboutid: this.zuoyeid,
            abouttype: 0,
            userid: userids,
            xunliantype: this.zuoyeType
          }
          // detail: true
        })
        .then(res => {
          if (res.data.code == 0) {
            let xunliantj = res.data.data.tongji;
            for (let v of xunliantj) {
              if (v.finishnum == v.totalnum) {
                this.labels[1].num++;
              }
            }
            this.labels[2].num = this.members.length - this.labels[1].num;
            let totalnum = 0;
            for (let i = 0; i < this.members.length; i++) {
              let v = this.members[i];
              let hassubmit = false;
              for (let j = 0; j < xunliantj.length; j++) {
                let item = xunliantj[j];
                if (v.userid == item.userid) {
                  v = Object.assign(v, item);
                  totalnum = item.totalnum;
                  hassubmit = true;
                  continue;
                }
              }
              if (!hassubmit) {
                v.aboutid = this.zuoyeid;
                v.abouttype = 0;
                v.finishnum = 0;
                v.score = 0;
                v.totalnum = totalnum;
                v.xunliantype = this.zuoyeType;
              }
            }

            this.xunliantj = this.members;
            this.fitertempData = this.xunliantj;
            // console.log("，领导；", this.xunliantj);
            if (this.tongyixl && !this.ismaster && !this.refresh) {
              if (this.xunliantj.length) {
                this.ongoxunlian(this.xunliantj[0]);
              }
            }
          }
          this.refresh = false;
          this.labels[0].num = this.members.length;
          this.filterfinishmb(this.curSeTableid);
          this.$refs.loadmore.onTopLoaded();
        });
    },
    zuoyeresultquery() {
      var url = "/api/api/zuoyeresultquery?zuoyeid=" + this.zuoyeid;
      Indicator.open(this.$mt("加载中") + "...");
      this.$http
        .post(url)
        .then(res => {
          if (res.data.code == 0) {
            this.queryzuoyeresult = res.data.data;
            if (this.queryzuoyeresult.ismaster) {
              this.ismaster = true;
            }
            this.zuoyeitem = res.data.data.zuoye;
            this.zdetail = res.data.data.zdetail;
            this.zanswer = res.data.data.zanswer;
            let results = res.data.data.results;
            this.userids = [];
            if (res.data.data.mymember) {
              this.pagemode = "submit";
            }
            if (this.pagemode == "submit" && !results.length) {
              this.onsubmit();
            } else {
              for (let v of results) {
                v.disccscore = v.score;
                this.userids.push(v.userid);
              }
              this.members = results;
              this.loadxunlianresult(this.userids);
            }
          } else {
            this.refresh = false;
            Toast(res.data.msg);
          }
          Indicator.close();
        })
        .catch(() => {
          this.refresh = false;
          Indicator.close();
          Toast(this.$mt("异常"));
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
          this.userids = [];
          let members = [res.data.data];
          for (let v of members) {
            v.disccscore = v.score;
            temp.push({
              userid: v.userid,
              username: v.username,
              useravatar: v.useravatar
              // classid: v.classid
            });
            this.userids.push(v.userid);
          }
          this.members = temp;
          this.loadxunlianresult(this.userids);
        })
        .catch(err => {
          this.refresh = false;
        });
    },
    selectClick(e, v, i) {
      if (v.isActive || !v.num) return;
      this.courseid = v.courseid;
      let curel = this.$refs.tbLi[i];
      let targetwidth = e.target.offsetWidth;
      let moveBar = (52 - targetwidth) / 2;
      this.moveBar = e.target.offsetLeft - moveBar;
      for (let v of this.labels) {
        v.isActive = false;
      }
      this.labels[i].isActive = true;
      this.filterfinishmb(v.id);
    },
    onselectClick(id) {
      // this.courseid = id;
      this.filterfinishmb(id);
    },
    filterfinishmb(type) {
      switch (type) {
        case 100:
          this.xunliantj = this.fitertempData;
          break;
        case 1:
          this.xunliantj = this.fitertempData.filter(v => {
            return v.finishnum == v.totalnum;
          });
          break;
        case 2:
          this.xunliantj = this.fitertempData.filter(v => {
            return v.finishnum < v.totalnum || v.totalnum == 0;
          });
          break;
      }
      console.log(this.xunliantj);
    },
    onScore(obj) {
      if (this.zuoyeitem.state != 100) {
        Toast(this.$mt("任务已结束"));
        return;
      }
      this.cureditItem = obj.item;
      this.popupZuoyePF = true;
    },
    onDiss(obj) {
      this.cureditItem = obj.item;
      this.popupZuoyePL = true;
    },
    onplMessage(v) {
      // this.mimiMessage(v);
    },
    seleMarkFn(val) {
      this.mark = val;
    },
    submiMark() {
      console.log(this.cureditItem);
      if (this.mark == "") return;
      this.$http
        .post("/api/Azuoye/setScore", {
          submitid: this.cureditItem.submitid,
          score: this.mark,
          zuoyeid: this.zuoyeid
        })
        .then(res => {
          this.popupZuoyePF = false;
          if (res.data.code == 0) {
            this.cureditItem.disccscore = res.data.data.score;
            this.zuoyeresultquery();
          } else {
          }
          this.mark = "";
        })
        .catch(() => {
          this.popupZuoyePF = false;
          this.mark = "";
          console.log("评分失败");
        });
    },
    ongoxunlian(item) {
      this.cureditItem = item;
      this.toxunlianpage();
    },
    toxunlianpage() {
      if (this.tongyixl) {
        // Indicator.open(this.$mt("开启中"));
      }
      // console.log(this.zuoyeitem);
      //  console.log(this.cureditItem);
      let topage = this.topage(this.zuoyeitem.ztype);
      let cookie = this.$store.state.loginuser.cookie;
      // let cookie = nativecode.getcookie();
      let srturl = "";
      let videourl = "";
      let aboutid = this.cureditItem.aboutid;
      let abouttype = this.cureditItem.abouttype;
      let userid = this.cureditItem.userid;
      let recsave = "recsave";
      let headername = this.cureditItem.username;
      let lang = this.zdetail.files[0].srtlang
        ? this.zdetail.files[0].srtlang
        : "en_us";
      let flang = this.$i18n.locale ? this.$i18n.locale : "zh";
      if (this.zuoyeitem.ztype == 10) {
        srturl = this.zdetail.files[0].filepath;
      } else {
        if (this.zdetail.files.length == 1) {
          srturl = this.zdetail.files[0].srtpath;
          videourl = this.zdetail.files[0].filepath;
        } else {
          srturl = this.zdetail.files[0].filepath;
          videourl = this.zdetail.files[1].filepath;
        }
      }
      srturl = encodeURIComponent(srturl);
      videourl = encodeURIComponent(videourl);
      headername = encodeURIComponent(headername);
      let URLdata =
        "do" +
        topage +
        ".html?videourl=" +
        videourl +
        "&cookie=" +
        cookie +
        "&srturl=" +
        srturl +
        "&aboutid=" +
        aboutid +
        "&abouttype=" +
        abouttype +
        "&userid=" +
        userid +
        "&recsave=" +
        recsave +
        "&readonly=" +
        this.readonly +
        "&headername=" +
        headername +
        "&lang=" +
        lang +
        "&flang=" +
        flang +
        "&backaction=history";
      let url = `http://192.168.1.104:8080/${URLdata}`;
      if (process.env.NODE_ENV !== "development") {
        url = document.location.origin;
        url += `/xunlian/${URLdata}`;
      }
      // console.log(parseURL(url));
      //  console.log(url);
      // return;

      // this.iframesrc = url;
      // this.popupXunlian = true;
      // this.$nextTick(() => {
      //   // this.iframeloadcb();
      // });
      // return;
      if (this.tongyixl) {
        this.popupXunlian = true;
        this.iframesrc = url;
        // this.iframeloadcb();
        return;
      }
      window.location.href = url;
    },
    topage(type) {
      switch (type) {
        case 11:
          return "tingxie";
        case 2:
          return "kouyu";
        case 12:
          return "peiying";
        case 10:
          return "faying";
      }
    },
    shuoc() {
      if (this.isShuoc) {
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
        //！
        this.isShuoc = true;
      });
    },
    my(id) {
      return this.xunliantj.filter(function(item) {
        return item.userid == id;
      });
    },
    other(id) {
      return this.xunliantj.filter(function(item) {
        return item.userid != id;
      });
    },
    //是否收藏
    queryuserfav() {
      this.$http
        .post("/api/userfav/query", {
          eventtype: 3,
          eventids: [this.zuoyeitem.id]
        })
        .then(res => {
          if (res.data.code == "0") {
            if (res.data.data.length) {
              this.isShuoc = true;
            }
          }
        })
        .catch(err => {});
    },
    initmembertj(item) {
      for (let v of this.members) {
        if (item.userid == v.id) {
          v = Object.assign(v, item);
          continue;
        } else {
          v.aboutid = this.zuoyeid;
          v.abouttype = 0;
          v.finishnum = 0;
          v.score = 0;
          v.totalnum = 0;
          v.xunliantype = this.zuoyeType;
        }
      }
    },
    back() {
      if (this.tongyixl) {
        this.$router.push("/");
        return;
      }
      if (this.zuoyeCfrom == "coursehome") {
        this.$store.commit("SET_ZYNEW_BACK_STATE", 3);
      }
      this.$back();
    },
    stopzy(id) {
      Indicator.open(this.$mt("结束作业中"));
      this.$http
        .post("/api/api/bankezuoyesetstate", {
          zuoyeid: id,
          state: 10
        })
        .then(res => {
          if (res.data.code == 0) {
            Toast(this.$mt("已结束"));
          } else {
            Toast(this.$mt("结束作业失败,请在作业列表中选择结束"));
          }
          this.$back();
          Indicator.close();
        })
        .catch(err => {
          this.$back();
          Toast(this.$mt("服务跑丢了,请稍后在作业列表中选择结束"));
          Indicator.close();
        });
    },
    tongyistop() {
      // let frame = document.getElementById("iframe");
      // console.log("frame 节点 对象 云班课", frame);
      // let framewindow = frame.contentWindow;
      // console.log("framewindow对象 云班课", framewindow);
      this.$confirm({
        msg: "您确定要结束统一训练吗",
        docb: () => {
          let cmdobj = {
            cmd: "tongyistop",
            activitytype: 10,
            bankeid: this.bankeid,
            data: {}
          };
          this.stoptyxl = true;
          nativebridge.nativecalldp(cmdobj, true);
          this.stopzy(this.zuoyeid);
        }
      });
    },
    iframeloadcb() {
      let iframe = this.$refs.iframe;
      iframe.onload = () => {
        Indicator.close();
      };
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      console.log("iOS from", from);
    });
  },
  components: { XunLianlistitem, Discuss, Vanbr }
};
</script>

<style scoped lang="less">
.zyxunlian-wrap {
  background: #f0f0f0;
  .main {
    .titinfo-wrap {
      .info-wrap {
        background: #e7e7e7;
        padding: 10px;
        p {
          margin: 5px 0;
        }
        .name {
          position: relative;
          font-size: 20px;
          color: black;
        }
        .score {
          color: #ff8800;
        }
      }
      .seevd {
        padding: 10px;
        position: relative;
        font-size: 16px;
        background: #fff;
      }
      .van-navbr-wrap {
        position: relative;
        // left: 0;
        // top: 0;
        // z-index: 1000;
        // width: 100vw;
        // height: 55px;
        // overflow-x: scroll;
        // background: #fff;
        // border-bottom: 1px solid #f0f0f0;
        margin-top: 15px;
        > ul {
          // position: absolute;
          // left: 0;
          // top: 0;
          // display: flex;
          // li {
          //   display: flex;
          //   width: 90px;
          //   height: 54px;
          //   flex-direction: column;
          //   align-items: center;
          //   justify-content: center;
          //   span {
          //     width: 100%;
          //     text-align: center;
          //     overflow-x: auto;
          //     color: #5d5d5d;
          //   }
          //   .lable {
          //   }
          //   .num {
          //   }
          //   &.active {
          //     span {
          //       color: #0089ff;
          //     }
          //   }
          // }
          // .move-bar {
          //   position: absolute;
          //   left: 0;
          //   bottom: 1px;
          //   width: 52px;
          //   height: 3px;
          //   background: #0089ff;
          //   transition: all 0.2s;
          // }
        }
      }
    }
  }
  .scorll-content-wrap {
    height: calc(100vh - 210px);
    min-height: calc(100vh - 210px);
    .itemlists {
      min-height: calc(100vh - 210px);
      .submit-wrap {
        .title {
          padding: 10px;
          font-size: 18px;
          color: #000;
        }
      }
    }
  }
}
.pf-container-popup {
  width: 100%;
  height: auto;
  .pf-container {
    p {
      padding: 20px;
      color: #000;
    }
    .close-mode {
      color: #0089ff;
    }
    .mark-input {
      height: 75px;
      input {
        width: 20%;
        border: 1px solid #0089ff;
        border-radius: 5px;
        margin-right: 15px;
        height: 100%;
      }
    }
    ul {
      padding: 20px;
      li {
        background: #e5e5e5;
        border-radius: 15%;
        padding: 8px 0px;
        width: 16%;
        margin-bottom: 15px;
        margin-left: 2%;
        margin-right: 2%;
      }
    }
  }
}
</style>
