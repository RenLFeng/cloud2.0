<template>
  <div class="zouye-results-wrap">
    <mt-header :title="$mt(titledesc)" class="mint-header-f">
      <mt-button icon="back" slot="left" @click="goback">{{$mt('返回')}}</mt-button>
      <!-- <mt-button
        slot="right"
        v-if="pagemode=='submit'"
        @click="popupSubmit=true"
      >{{$mt('提交作业')}}</mt-button>-->
      <mt-button
        slot="right"
        v-if="pagemode=='submit'"
        @click="onbtnsubmit"
        :disabled="submitdisabled || prohibit"
      >{{$mt('提交')}}</mt-button>

      <mt-button
        slot="right"
        v-else-if="showstopbtn && zuoyeitem.state>10"
        @click="showmzuoyemenu=true"
      >{{$mt('操作')}}</mt-button>
    </mt-header>

    <div class="noheaderscroll main scrollingtouch" id="main" ref="abc">
      <mt-loadmore
        :top-method="pagemode!='submit'?loadTop:false"
        @top-status-change="handleTopChange"
        :top-distance="80"
        ref="loadmore"
        class="zyloadmore"
        :auto-fill="autofill"
        :topPullText="$mt('下拉刷新')"
        :topDropText="$mt('释放更新')"
        :topLoadingText="$mt('加载中')"
      >
        <div class="titlecontainer">
          <div class="zuoyetitle">
            {{zuoyeitem.name}}
            <i
              v-if="pagemode=='submit' && results.length"
              class="iconfont iconpinglun eicotrigger color9"
              @click="sbmitSeepl"
            ></i>
            <i
              class="iconfont iconcollect eicotrigger fr"
              :class="isShuoc?'colory':'color9'"
              @click="shuoc"
            ></i>
          </div>
          <div class="zuoyesubtitle">
            <span class="zuoyescore">{{$mt('作业分值')}} {{zuoyeitem.score}}{{$mt('分')}}</span>&nbsp;|&nbsp;
            <span>{{$mt(statedesc)}}</span>
          </div>
          <div class="zuoyesubtitle">{{zuoyetimedesc}}</div>
        </div>
        <!-- <div>
          <mt-cell
            :title="$mt('作业详细')"
            is-link
            @click.native="popupZDetail=true"
          >{{zuoyeitem.detaildesc}}</mt-cell>
        </div>-->
        <div>
          <!-- 作业详细 -->
          <mt-cell
            :title="$mt('作业详细')"
            @click.native="showZdetail=!showZdetail"
            class="showZdetail-tit"
            :class="showZdetail?'act':''"
          ></mt-cell>
          <div v-if="showZdetail" class="showZdetail-main" :class="showZdetail?'act':''">
            <zuoyedetailedit :zdetail="zdetail" :readonly="zreadonly" :showZdetail="true"></zuoyedetailedit>
          </div>
        </div>

        <div @click="studentsMarkfn">
          <mt-cell :title="$mt('本次作业所有人得分')" is-link v-if="pagemode=='result'"></mt-cell>
        </div>
        <div @click="showZYinfo">
          <mt-cell :title="$mt('信息')" is-link v-if="pagemode=='result'">{{submitnumdesc}}</mt-cell>
        </div>
        <!-- 作业答案 -->
        <mt-cell
          :title="$mt('答案')"
          is-link
          v-if="pagemode=='result'"
          @click.native="AnswerFn"
        >{{answerdesc}}</mt-cell>

        <div class="zashowbtnpart" :class="pagemode=='submit'?'submit':'result'">
          <!-- <div v-if="pagemode=='submit'">
            <div class="zashowbtn zashowbtnactive">{{$mt('我的提交')}}</div>
          </div>-->
          <div v-if="pagemode=='result'">
            <div
              class="nowrap"
              @click="selectPF(1,submitnum)"
              :class="zashowbtnactive?'zashowbtnactive zashowbtn':'zashowbtn' "
            >
              {{$mt('全部')}}({{submitnum}})
              <!-- {{$mt('全部')}}({{results.length}}) -->
            </div>
            <div
              class="nowrap"
              @click="selectPF(0,uncommentnum)"
              :class="!zashowbtnactive?'zashowbtnactive zashowbtn':'zashowbtn' "
            >{{$mt('未评分')}}({{uncommentnum}})</div>
          </div>
        </div>

        <div v-if="pagemode=='submit'" style="padding:10px;" class="showemptydesc-submit">
          <div v-if="isScore" class="isZySbmitEdit">
            <div class="text-tips position-c">
              <p>{{$mt('得分')}}:&nbsp;{{this.results[0].score}}</p>
              <p  :class="nozhlang?'nozh':''">{{$mt(isZySbmitEdit)}}</p>
            </div>
          </div>
          <P
            v-if="results.length"
            class="tr colord fontsmall"
            style="padding:10px;position:relative;"
          >
            <span
              class="position-r"
              @click="onSeeAllSubmit(results[0])"
            >{{$mt('编辑记录')}}({{results.length}})</span>
          </P>
          <zuoyedetailedit @textChange="ontextChange" :zdetail="zdetailsubmit" :isScore="isScore"></zuoyedetailedit>
        </div>
        <div v-else>
          <div v-for="(ritem,selindex) in results" v-bind:key="selindex">
            <div v-if="showitem(ritem)">
              <ZuoyeAnswerItem
                :resultitem="ritem"
                :state="zuoyeitem.state"
                @commentClicked="onCommentClick"
                @scoreClicked="onScoreClick"
                @seeAllSubmit="onSeeAllSubmit"
                @setScore="onsetScore"
              ></ZuoyeAnswerItem>
              <div class="devide"></div>
            </div>
          </div>
          <div v-if="showemptydesc" class="tc">{{emptydesc}}</div>
        </div>
      </mt-loadmore>
    </div>
    <!-- 评论 -->
    <mt-popup v-model="popupZuoyePL" position="right" class="mint-popup-3" :modal="false">
      <mt-header :title="$mt('作业结果列表')+' '+$mt('评论区')">
        <mt-button slot="left" icon="back" @click="goBacks">{{$mt('返回')}}</mt-button>
      </mt-header>
      <Discuss
        :itemInfo="studentInfo"
        :zuoyeitem="zuoyeitem"
        :popupZuoyePL="popupZuoyePL"
        @plMessage="onplMessage"
      ></Discuss>
    </mt-popup>
    <!-- 评分 -->
    <mt-popup v-model="popupZuoyePF" position="bottom" class="pf-container-popup">
      <div class="pf-container">
        <p class="tit border-bottom-e5 tc">
          <span class="close-mode fl" @click="goBacks">{{$mt('取消')}}</span>
          {{$mt('给')}}&nbsp;{{studentName}} {{$mt('评分')}}
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
    <!-- 作业信息 -->
    <mt-popup
      v-model="popuPzouyeInfo"
      position="right"
      class="mint-popup-3"
      :modal="false"
      style="background:#f0f0f0"
    >
      <mt-header :title="zuoyeitem.name">
        <mt-button slot="left" icon="back" @click="goBacks">{{$mt('返回')}}</mt-button>
      </mt-header>
      <zouYeInfo :itemInfo="zuoyeitem" :allZuoyeitem="allInitData"></zouYeInfo>
    </mt-popup>
    <!-- 所有人得分 -->
    <mt-popup
      v-model="popuPzouyeAllMark"
      position="right"
      class="mint-popup-3"
      :modal="false"
      style="background:#f0f0f0"
    >
      <mt-header :title="$mt('作业结果列表')+' '+$mt('本次作业所有人得分')">
        <mt-button slot="left" icon="back" @click="goBacks">{{$mt('返回')}}</mt-button>
      </mt-header>
      <studentsMark :itemInfo="zuoyeitem" :allZuoyeitem="allInitData"></studentsMark>
    </mt-popup>
    <!-- 答案 -->
    <mt-popup v-model="popupAnswer" position="right" class="mint-popup-3" :modal="false">
      <mt-header :title="$mt('作业答案')">
        <mt-button icon="back" slot="left" @click="goBacks">{{$mt('返回')}}</mt-button>
      </mt-header>
      <Answer :zuoyeitem="zuoyeitem" :zanswer="zanswer" />
    </mt-popup>
    <!-- 所有提交 -->
    <mt-popup
      v-model="popupAllsubmit"
      position="right"
      class="mint-popup-3 Allsubmit-history"
      :modal="false"
      :style="Preview?{overflow: 'scroll'}:''"
    >
      <mt-header :title="`${AllsubmitName} ${$mt('提交历史')}`" class>
        <mt-button icon="back" slot="left" @click="goBacks">{{$mt('返回')}}</mt-button>
      </mt-header>
      <div v-if="popupAllsubmit">
        <div v-for="(ritem,selindex) in popupAllsubmitItem" v-bind:key="selindex">
          <div v-if="showitem(ritem)">
            <p class="version fontsmall">{{$mt('版本')}}{{popupAllsubmitItem.length-selindex}}</p>
            <ZuoyeAnswerItem
              :resultitem="ritem"
              :seeMySbmit="seeMySbmit"
              :pagemode="pagemode"
              :state="zuoyeitem.state"
              @setScore="onsetScore"
              @commentClicked="onCommentClick"
              @scoreClicked="onScoreClick"
            ></ZuoyeAnswerItem>
            <div class="devide"></div>
          </div>
        </div>
      </div>
    </mt-popup>

    <mt-actionsheet :actions="mzuoyemenu" :cancelText="$mt('取消')" v-model="showmzuoyemenu"></mt-actionsheet>
  </div>
</template>

<script>
import Discuss from "../components/discuss";
import ZuoyeAnswerItem from "../components/ZuoyeAnswerItem";
import { Indicator, Toast, MessageBox, Actionsheet } from "mint-ui";

import zuoyedetailedit from "../ZuoyeDetailEdit";

import nativecode from "@/nativecode";

import maintools from "../maintools";
import commontools from "@/commontools";
import TextEllipsis from "../components/TextEllipsis";
import FileAttachList from "../components/FileAttachList";
//import dispic from "../assets/dis.jpg";
import zouYeInfo from "./info";
import studentsMark from "./studentsMark";
import Answer from "./answer";
import { parseURL, CollectionFn, formateTime, encodehtml } from "@/util";
export default {
  name: "ZuoyeResult",
  props: {
    zuoyeid: {
      default() {
        return 0;
      }
    },
    frompage: {
      default: ""
    },
    cfrompage: {
      default: "bankehome"
    }
  },
  data() {
    return {
      showZdetail: true, //! cjy: 默认显示详细

      studentInfo: {},
      ScoreItemInfo: {},
      isLimitHeight: true,
      popupSubmit: false,
      popupZDetail: false,
      popupZuoyePL: false,
      popupZuoyePF: false,
      popuPzouyeInfo: false,
      popuPzouyeAllMark: false,
      popupAnswer: false,
      popupAllsubmit: false,
      popupAllsubmitItem: [],
      AllsubmitName: "",
      mark: "",
      studentName: "",
      zreadonly: true,
      zuoyeitem: {
        name: "",
        state: 10,
        allowpasstime: 0,
        hassubmittime: 0,
        detaildesc: "",
        submittime: "",
        score: 10
      },

      showmzuoyemenu: false,

      allZuoyeitem: [],
      allInitData: [],
      zdetail: {
        ztext: "",
        localfiles: []
      },
      zanswer: {
        ztext: "",
        localfiles: []
      },
      zdetailsubmit: {
        ztext: "",
        localfiles: []
      },
      results: [],
      resultsTemp: [],
      noPingFengStudentInfo: [],
      showfilter: "all",
      pagemode: "result", //! 页面模式； 复用多种页面模式：result:所有结果列表  submit:学生答题列表
      submitok: false,
      zashowbtnactive: true,
      markArr: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      loadingState: false,
      ismaster: false,
      mymember: true, //! 是否在提交成员名单中

      isShuoc: false,
      prohibit: true,
      isScore: false,
      seeMySbmit: false,

      page: 0,
      pagesize: 10,
      autofill: false,
      listLoadend: false,
      topStatus: "",
      bottomStatus: "",
      allLoaded: false,

      setScoreRepeat: false,
      repeatSubmit: false
    };
  },
  watch: {
    zanswerTextChange() {
      //  this.isScore=true; this.setScoreRepeat = false;
      // console.log('监听zdetailsubmit变化',this.zdetailsubmit);
    },
    showmzuoyemenu(newv, old) {
      if (!newv) {
        this.setScoreRepeat = false;
      }
    }
  },
  computed: {
       nozhlang() {
      let curlang = this.$i18n.locale;
      if (curlang != "zh") {
        return true;
      }
      return false;
    },
    curbanke() {
      return this.$store.state.curbanke;
    },
    zanswerTextChange() {
      // return this.zdetailsubmit.ztext;
    },
    Preview() {
      return this.$store.state.Preview.isPreview;
    },
    mzuoyemenu() {
      let objret = [];
      if (this.setScoreRepeat) {
        objret.push({
          name: this.$mt("打回重做"),
          method: this.repeat
        });
      } else {
        if (nativecode.hassharecommon()) {
          objret.push({
            name: this.$mt("分享作业"),
            method: this.doshare
          });
        }
        objret.push({
          name: this.$mt("编辑作业"),
          method: this.doedit
        });
        if (this.zuoyeitem.state == 100) {
          objret.push({
            name: this.$mt("结束作业"),
            method: this.dostop
          });
        }
      }

      return objret;
    },
    answerdesc() {
      return this.zuoyeitem.answerdesc
        ? this.zuoyeitem.answerdesc
        : this.$mt("未设置答案");
    },
    submitdisabled() {
      if (this.zdetailsubmit.ztext || this.zdetailsubmit.localfiles.length) {
        return false;
      }
      return true;
    },
    titledesc() {
      if (this.pagemode == "submit") {
        return "作答";
      }
      return "结果列表";
    },
    caneditzuoye() {
      if (this.ismaster) {
        return true;
      }
      let isteacher = this.$store.getters.caneditbanke;
      if (!isteacher) {
        return false;
      }
      return true;
    },
    showstopbtn() {
      return this.caneditzuoye;
      // if (this.zuoyeitem.state == 100){
      //     return true;
      // }
      // return false
    },
    statedesc() {
      if (this.zuoyeitem.state == 100) {
        return this.$mt("进行中");
      }
      return this.$mt("已结束");
    },
    unsubmitnum() {
      var ni = 0;
      for (var i = 0; i < this.results.length; i++) {
        if (!this.results[i].submitnum) {
          ni++;
        }
      }
      return ni;
    },
    showemptydesc() {
      if (this.showfilter == "score") {
        if (this.uncommentnum == 0) {
          return true;
        }
      }

      for (var i = 0; i < this.results.length; i++) {
        if (this.results[i].submitnum) {
          return false;
        }
      }
      return true;
    },
    emptydesc() {
      if (this.zuoyeitem.state == 100) {
        //! 评测进行中
        if (!this.ismaster && !this.mymember) {
          return (
            this.$mt("作业尚未结束") + "," + this.$mt("不能查看学员的提交")
          );
        }
      }
      if (this.showfilter == "score") {
        return this.$mt("尚无未评分");
      }

      return this.$mt("尚无提交");
    },
    submitnum() {
      var ni = 0;
      for (var i = 0; i < this.resultsTemp.length; i++) {
        if (this.resultsTemp[i].submitnum) {
          ni++;
        }
      }
      return ni;
    },
    uncommentnum() {
      var ni = 0;
      for (var i = 0; i < this.resultsTemp.length; i++) {
        if (this.resultsTemp[i].score < 0 && this.resultsTemp[i].submitnum) {
          ni++;
        }
      }
      return ni;
    },
    zuoyetimedesc() {
      if (!this.zuoyeitem.hassubmittime) {
        return this.$mt("不限制提交时间");
      }
      var tdesc = commontools.timeToHummanRead(
        this.zuoyeitem.submittime.replace(/-/g, "/"),
        0,
        this
      );
      var tallowpass = this.$mt("允许超时提交");
      if (!this.zuoyeitem.allowpasstime) {
        tallowpass = this.$mt("不允许超时提交");
      }
      var tfmt = "%s " + this.$mt("前") + this.$mt("提交") + " | %s";
      return commontools.sprintf(tfmt, tdesc, tallowpass);
    },
    submitnumdesc() {
      if (!this.results.length) {
        return this.$mt("无学员参与");
      }
      var ni = this.unsubmitnum;
      if (ni == 0) {
        return this.$mt("已全部提交");
      }
      var tfmt = "%i " + this.$mt("人") + this.$mt("未提交");
      return commontools.sprintf(tfmt, ni);
    },
    isZySbmitEdit() {
      if (this.isScore) {
        return this.$mt('作业已被评分,不能编辑');
      } else {
        return "";
      }
    },
    user() {
      return this.$store.getters.curuser;
    },
    miniprogram() {
      if (nativecode.platform == "miniprogram") {
        return true;
      }
      return false;
    },
    zuoyeCfrom() {
      return this.$store.state.zuoyeCfrom;
    }
  },
  methods: {
    loadTop() {
      this.loadAll();
    },
    loadBottom() {},
    goBacks() {
      if (this.popupAllsubmit && !this.popupZuoyePL)
        this.popupAllsubmit = false;
      this.seeMySbmit = false;
      if (this.popupZuoyePL) {
        this.popupZuoyePL = false;
        this.loadAll();
      }
      if (this.popupZuoyePF) {
        this.popupZuoyePF = false;
        this.mark = "";
      }
      if (this.popuPzouyeInfo) this.popuPzouyeInfo = false;
      if (this.popuPzouyeAllMark) this.popuPzouyeAllMark = false;
      if (this.popupAnswer) this.popupAnswer = false;
    },
    onCommentClick(ritem) {
      this.studentInfo = ritem.info;
      this.popupZuoyePL = ritem.state;
      console.log("作业 info", ritem);
    },
    //提交中查看评论
    sbmitSeepl() {
      this.studentInfo = this.results[0];
      this.popupZuoyePL = true;
    },
    onsetScore(item) {
      this.setScoreRepeat = true;
      this.ScoreItemInfo = item;
      this.showmzuoyemenu = true;
    },
    repeat() {
      this.mark = "-2";
      this.submiMark();
    },
    onScoreClick(ritem) {
      let isteacher = this.caneditzuoye; // this.$store.getters.caneditbanke;
      this.ScoreItemInfo = ritem.info;
      console.log("作业 info", ritem);
      if (!isteacher) {
        // if (ritem.info.score >= 0) {
        //   MessageBox("已经评过分啦~~");
        // } else {
        //   MessageBox("等待老师评分哦 ~");
        // }
      } else {
        this.popupZuoyePF = ritem.state;
        this.studentName = ritem.info.username;
        // if (ritem.info.score > "0") {
        //   MessageBox("不能重复评分~~");
        // } else {
        //   this.popupZuoyePF = ritem.state;
        //   this.studentName = ritem.info.username;
        // }
      }
    },
    seleMarkFn(val) {
      this.mark = val;
    },
    submiMark() {
      if (this.mark == "") return;
      this.$http
        .post("/api/Azuoye/setScore", {
          submitid: this.ScoreItemInfo.submitid,
          score: this.mark,
          zuoyeid: this.zuoyeid
        })
        .then(res => {
          this.popupZuoyePF = false;
          //   this.loadAll();
          console.log("评分结果:" + res);
          if (res.data.code == 0) {
            this.ScoreItemInfo.score = res.data.data.score;
          } else {
          }
          this.mark = "";
          this.setScoreRepeat = false;
          this.showmzuoyemenu = false;
        })
        .catch(() => {
          this.popupZuoyePF = false;
          this.showmzuoyemenu = false;
          this.mark = "";
          this.setScoreRepeat = false;
          console.log("评分失败");
        });
    },
    AnswerFn() {
      if (this.zuoyeitem.answerdesc) {
        this.popupAnswer = true;
      }
    },
    ontextChange() {
      this.prohibit = false;
    },
    onSeeAllSubmit(item) {
      // console.log( item);
      //! 查看个人的所有提交
      if (item) {
        this.popupAllsubmit = true;
        this.seeMySbmit = true;
        var url =
          "/api/api/zuoyeresultquery?zuoyeid=" +
          this.zuoyeid +
          "&userid=" +
          item.userid;
        Indicator.open(this.$mt("加载中"));
        this.$http
          .post(url)
          .then(res => {
            Indicator.close();
            // this.$refs.loadmore.onTopLoaded();
            if (res.data.code == 0) {
              let zitem = res.data.data.results;
              for (var i = 0; i < zitem.length; i++) {
                zitem[i].localfiles = maintools.localfilesFromFilelist(
                  zitem[i].files
                );
              }
              this.popupAllsubmitItem = zitem;
              this.AllsubmitName =
                this.user.id == zitem[0].userid
                  ? this.$mt("我的")
                  : zitem[0].username;
            } else {
              Toast(res.data.msg);
            }
          })
          .catch(() => {
            Indicator.close();
            // this.$refs.loadmore.onTopLoaded();
          });
      }
    },
    onplMessage(v) {
      // this.mimiMessage(v);
    },
    //  发送作业批改消息
    mimiMessage(type) {
      let templateid = "aL_1yDadpBIgcjcnkj4xliRol38CgMQ4H7D8RvGYPCo";
      let topage = "/#/zuoyeresult/" + this.zuoyeid;
      let date = formateTime(new Date(), "-");
      let data = {};
      let userid = "";
      if (type == "pf") {
        data.thing1 = this.curbanke.name;
        data.thing2 = this.zuoyeitem.name;
        data.phrase3 = `作业得${this.ScoreItemInfo.score}分`;
        data.thing4 = "个红包飞韩国";
        userid = [this.ScoreItemInfo.userid];
      } else if (type == "pl") {
        data.thing1 = this.curbanke.name;
        data.thing2 = this.zuoyeitem.name;
        data.phrase3 = `有新的评论`;
        data.thing4 = "回复个地方";
        userid = [this.studentInfo.userid];
      } else if (type == "submit") {
        data.name1 = this.user.name;
        data.thing2 = this.zuoyeitem.name;
        data.date3 = date;
        userid = [this.zuoyeitem.userid];
        templateid = "w45YLK2VOms4UJkKoqVIYZFBVyXnc5niGIzleAosf4M";
      }
      //! cjy: 发送消息接口不再提供给客户端，防止伪造的客户端越权
      // this.$http
      //   .post("/api/weixin/pushnotify", {
      //     templateid: templateid,
      //     topage: topage,
      //     data: data,
      //     sendto: {
      //       type: "users",
      //       userids: userid
      //     }
      //   })
      //   .then(res => {})
      //   .catch(() => {});
    },
    changeMark() {},
    goback() {
      console.log("zypage", this.cfrompage);
      if (this.pagemode == "submit") {
        var btip = false;
        if (!this.zuoyeitem.submitnum) {
          btip = true;
        } else {
          if (
            this.zdetailsubmit.ztext.length ||
            this.zdetailsubmit.localfiles.length
          ) {
            btip = true;
          }
        }
        if (this.results.length > 0) {
          btip = false;
        }
        if (btip) {
          this.$confirm({
            msg: "退出作业提交",
            docb: () => {
              this.doback();
            }
          });
          return;
        }
      }
      this.doback();
    },
    doback() {
      if (this.miniprogram) {
        if (this.cfrompage == "/" || this.cfrompage == undefined) {
          this.$router.replace("/");
        } else {
          this.backgo();
        }
      } else {
        this.backgo();
      }
    },
    backgo() {
      if (this.zuoyeCfrom == "coursehome") {
        this.$store.commit("SET_ZYNEW_BACK_STATE", 3);
      }
      this.$router.go(-1);
    },
    showitem(ritem) {
      if (!ritem.submitnum) {
        return false;
      }

      if (this.showfilter == "score") {
        if (ritem.score < 0) {
          return false;
        }
      }
      return true;
    },
    handleTopChange(status) {
      this.topStatus = status;
    },
    handleBottomChange(status) {
      this.bottomStatus = status;
    },
    loadAll() {
      var url = "/api/api/zuoyeresultquery?zuoyeid=" + this.zuoyeid;
      Indicator.open(this.$mt("努力加载数据中") + "...");
      this.$http
        .post(url)
        .then(res => {
          Indicator.close();
          this.$refs.loadmore.onTopLoaded();
          if (res.data.code == 0) {
            //! ok
            // this.allZuoyeitem = res.data.data.results;
            // for (let v of this.allZuoyeitem) {
            //   for (let file of v.files) {
            //     if (file.metainfo && typeof file.metainfo == "string") {
            //       file.metainfo = JSON.parse(file.metainfo);
            //     }
            //   }
            // }
            this.onHttpData(res.data.data);
            this.initfilteruser(this.zashowbtnactive);
            //  console.log(this.results);
          } else {
            Toast(res.data.msg);
          }
        })
        .catch(() => {
          Toast(this.$mt("服务开小差了"));
          Indicator.close();
          // this.$refs.loadmore.onTopLoaded();
        });
    },
    onHttpData(data) {
      for (let v of data.results) {
        if (v.files) {
          for (let file of v.files) {
            if (file.metainfo && typeof file.metainfo == "string") {
              file.metainfo = JSON.parse(file.metainfo);
            }
          }
        }
      }
      if (data.ismaster) {
        this.ismaster = true;
      }
      this.zuoyeitem = data["zuoye"];
      this.allZuoyeitem = data.results;
      for (let item of this.allZuoyeitem) {
        if (item.score < 0) {
          this.noPingFengStudentInfo.push(item);
        }
      }
      this.mymember = data.mymember;
      if (
        this.zuoyeitem.state == 100 &&
        !this.$store.getters.haseditbankerole
      ) {
        //! 提交模式
        if (data.mymember) {
          //! 在提交名单内才提交
          this.pagemode = "submit";
        }
      }
      if (data["zdetail"]) {
        this.zdetail.ztext = data["zdetail"].ztext;
        this.zdetail.localfiles = maintools.localfilesFromFilelist(
          data["zdetail"].files
        );
      }
      if (data["zanswer"]) {
        this.zanswer.ztext = data["zanswer"].ztext;
        this.zanswer.localfiles = maintools.localfilesFromFilelist(
          data["zanswer"].files
        );
      }

      var dresults = data["results"];
      for (var i = 0; i < dresults.length; i++) {
        dresults[i].localfiles = maintools.localfilesFromFilelist(
          dresults[i].files
        );
      }
      this.results = dresults;
      this.resultsTemp = dresults;
      if (dresults.length) {
        this.zdetailsubmit.ztext = this.results[0].ztext;
        this.zdetailsubmit.localfiles = this.results[0].localfiles;
        if (dresults[0].score > -1) {
          this.isScore = true;
        } else if (dresults[0].score == -2) {
          this.repeatSubmit = true;
          let localrepeatSubmit = sessionStorage.getItem("repeatSubmit") || "";
          if (!localrepeatSubmit && !this.showstopbtn) {
            MessageBox(
              this.$mt("提示"),
              `${this.$mt("作业已被打回")},${this.$mt("请重做")}`
            );
          }
          sessionStorage.setItem("repeatSubmit", this.repeatSubmit);
        }
      }
    },
    doshare() {
      nativecode.dosharecommon("zuoye", this.zuoyeid, this.zuoyeitem.name);
    },
    doedit() {
      let bid = this.zuoyeitem.ownerid;
      this.$store.commit("setBankeData", {
        modulename: "zuoyelist",
        bankeid: bid,
        fn: fobj => {
          fobj.editingZuoye = this.zuoyeitem;
        }
      });
      this.$store.commit("setRouterForward", true);
      this.$router.push("/zuoyenew/" + bid + "/" + this.zuoyeitem.ztype);
    },
    dostop() {
      this.$confirm(
        {
          msg: `${this.$mt("结束作业")}\r\n${this.$mt("结束后学生不可再提交")}`,
          docb: () => {
            Indicator.open(this.$mt("处理中"));
            let newstate = 10;
            this.$http
              .post("/api/api/bankezuoyesetstate", {
                zuoyeid: this.zuoyeid,
                state: newstate
              })
              .then(res => {
                Indicator.close();
                if (res.data.code == 0) {
                  this.zuoyeitem.state = newstate;
                } else {
                  Toast(res.data.msg);
                }
              })
              .catch(() => {
                Indicator.close();
              });
          }
        },
        false
      );
    },
    onbtnsubmit() {
      console.log("onbtnsubmit");
      this.$confirm({
        msg: "现在提交作业",
        docb: () => {
          this.dosubmit();
        }
      });
    },
    dosubmit() {
      Indicator.open(this.$mt("提交中"));
      var url = "/api/api/zuoyesubmit?zuoyeid=" + this.zuoyeid;
      this.$http
        .post(url, {
          zdetail: {
            ztext: this.zdetailsubmit.ztext,
            files: maintools.filelistFromLocalfiles(
              this.zdetailsubmit.localfiles
            )
          }
        })
        .then(res => {
          Indicator.close();
          if (res.data.code == 0) {
            Toast(this.$mt("提交成功"));
            var oneitem = res.data.data;
            oneitem.localfiles = maintools.localfilesFromFilelist(
              oneitem.files
            );
            // this.results.splice(0, 0, oneitem);

            //! 清空本地的提交信息
            // this.popupSubmit = false;
            // this.zdetailsubmit.ztext = "";
            // this.zdetailsubmit.localfiles.length = 0;
            //   this.zdetailsubmit.localfiles=[];
            this.prohibit = true;
            // this.mimiMessage("submit");
          } else {
            //! Toast 不可见
            if (res.data.msg.indexOf("over submit") > -1) {
              this.$alert(
                {
                  msg: `${this.$mt("已超时")}，${this.$mt(
                    "无法再提交作业"
                  )}，${this.$mt("请联系老师")}`
                },
                false
              );
            } else {
              this.$alert(
                {
                  msg: res.data.msg
                },
                false
              );
            }
          }
        })
        .catch(() => {
          Indicator.close();
          Toast(this.$mt("异常"));
        });
    },
    showZYinfo() {
      this.allInitData = this.allZuoyeitem;
      this.popuPzouyeInfo = true;
    },
    studentsMarkfn() {
      this.allInitData = this.allZuoyeitem;
      this.popuPzouyeAllMark = true;
    },
    selectPF(type, num) {
      if (!num) return;
      this.zashowbtnactive = type;
      this.initfilteruser(type);
    },
    initfilteruser(type) {
      if (type) {
        this.results = this.resultsTemp;
      } else {
        this.results = this.resultsTemp.filter(item => item.score < 0);
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
      // console.log(this.zuoyeitem);
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
              this.isShuoc = true;
            }
          }
        })
        .catch(err => {});
    }
  },
  created() {
    // var dd = this.$store.getters.getBankeData("zuoyeresult", this.zuoyeid);
    // if (dd && dd.resultdata) {
    //   //console.log(dd.resultdata);
    //   this.onHttpData(dd.resultdata);
    // } else
    this.loadAll();
    //  this.loadTop();
    this.queryuserfav();
  },
  components: {
    ZuoyeAnswerItem,
    zuoyedetailedit,
    Discuss,
    zouYeInfo,
    studentsMark,
    Answer,
    [Actionsheet.name]: Actionsheet
  }
};
</script>
<style lang="less">
.zouye-results-wrap {
  background: #fff;
  overflow: hidden;
  .main {
    height: 94vh;
    min-height: 94vh;
    padding-bottom: 0;
    .showemptydesc-submit {
      .zdetail {
        // height: 20vh;
      }
      .attachdesc {
        text-align: left;
      }
      .blockborder {
        position: relative;
        border: 1px dashed #ccc;
        .textadd {
          position: absolute;
        }
      }
      .imgblock {
        width: 60px;
        height: 60px;
      }
    }
  }
  .mint-cell-value.is-link {
    margin-right: 30px;
  }
  .version {
    height: 53px;
    padding: 0 10px;
    line-height: 53px;
  }
  .Allsubmit-history {
    .zacontainer {
      padding: 0 10px;
      .zatextmain {
        margin-top: 0;
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
<style scoped>
.mint-popup-3 {
  width: 100%;
  height: 100%;
  background-color: white;
}
.popuphalf {
  height: 50%;
}

.zashowbtn {
  width: 25%;
  font-size: 18px;
  color: #0089ff;

  display: inline-block;
  text-align: center;

  padding: 5px;
  margin-right: 10px;
}
.zashowbtnpart {
  height: auto;
  min-height: 10px;
  min-height: 10px;
  padding: 10px;
  background: #f0f0f0;
}
.zashowbtnpart.submit {
  /* height:10px; */
}
.zashowbtnpart.result {
  /* height:44px; */
}
.zashowbtnactive {
  border: 1px solid #0089ff;
  border-radius: 10px;
}

.zuoyetitle {
  position: relative;
  font-size: 20px;
  color: black;
}
.zuoyetitle i {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translate(0, -50%);
  font-size: 25px;
}
.zuoyetitle .iconpinglun {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translate(0, -50%);
  font-size: 25px;
}
.zuoyesubtitle {
  margin-top: 5px;
  font-size: 16px;
  color: #a9a9a9;
}

.zuoyescore {
  color: #ff8800;
}

.titlecontainer {
  padding: 10px 15px;

  background-color: #e7e7e7;
}

.detailcontainer {
  padding: 10px;
  background-color: white;
  font-size: 16px;
}
.detailheader {
  border-bottom: 1px solid #a9a9a9;
}

.submitheader {
  background-color: green;
}
.noheaderscroll .mint-cell:last-child {
  background: none;
}
.noheaderscroll .mint-cell:last-child {
  background: none;
}
.showZdetail-tit.act,
.showZdetail-main.act {
  border-bottom: 1px solid #f0f0f0;
}
.isZySbmitEdit {
  position: relative;
  height: 65px;
  margin-bottom: 20px;
  background: rgba(255, 137, 0, 1);
}
.isZySbmitEdit .text-tips {
  width: 100%;
  height: 100%;
  padding: 0 10px;
  font-size: 18px;
  font-weight: 400;
  line-height: 25px;
  color: rgba(255, 255, 255, 1);
}
.isZySbmitEdit .text-tips .nozh{
  font-size: 12px;
  line-height: 1.3;
}
</style>