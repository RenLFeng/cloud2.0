<template>
  <div class="hudong-warp">
    <mt-header :title="headername" class="mint-header-f">
      <!-- <mt-button icon="back" slot="left" @click="back()">{{$mt('返回')}}</mt-button> -->
    </mt-header>
    <div class="main">
      <div class="userw" v-if="showusgroup">
        <p>
          <img :src="userinfo.avatar" class="userimg" :onerror="$defaultImg('account')" />
          <span>{{userinfo.name}}</span>
        </p>
        <p class="group" @click="groupclick" v-if="userinfo.gname">
          <span>{{userinfo.gname}}</span>
        </p>
      </div>
      <mt-loadmore
        :top-method="loadTop"
        ref="loadmore"
        :auto-fill="autofill"
        :topPullText="$mt('下拉刷新')"
        :topDropText="$mt('释放更新')"
        :topLoadingText="$mt('加载中')"
      >
        <div class="refresh" v-if="showRefreshbtn">
          <div class="tc no-class">
            <!-- <i class="iconfont icontongji fontmaintitle"></i> -->
            <div v-if="!online" class="online-w position-c">
              <div class="bg-img">
                <img src="assets/hudong/bg1.png" alt class="img1" />
                <img src="assets/hudong/bg2.png" alt class="img2" />
              </div>
              <!-- <p class="color0 font18">{{$mt('尚未开课')}}</p> -->
              <p class="color9 tx">
                {{$mt('请下拉本页面')}}
                <span class="colord" @click="Refresh">{{$mt('刷新')}}</span>
              </p>
              <p>{{onlinemsg}}</p>
            </div>
            <Empty v-else :text="['无数据']" />
          </div>
        </div>
      </mt-loadmore>
      <div
        class="item-warp overflow-scroll"
        :class="{'showAnzufy':showAnzufy,'hasgroup':showusgroup}"
      >
        <div class="item-w clearfix" v-for="(item,k) in groups" :key="k">
          <p class="grouptit colora" v-if="initenter && item.length">
            <span>{{getgroupname(k)}}</span>
          </p>
          <div
            class="item"
            :class="v.funname"
            ref="item"
            v-for="(v,i) in item"
            :key="i"
            @click="itemclick(v)"
          >
            <div
              class="citem"
              :class="`state${v.states} btnaction${v.btnaction} ${v.start?'start':''} ${v.hide?'hide':''}`"
              :funname="v.funname"
            >
              <!-- <i
                v-if="v.funname=='classmgr_sign'"
                class="iconfont iconqiandao2 eicotrigger avatarimg"
                style="color:#E46100"
              ></i>
              <i
                class="iconfont icontongji eicotrigger bigfont avatarimg"
                style="color:#38ADA9"
                v-if="v.funname=='classmgr_pingce_msg'"
              ></i>-->
              <img
                :src="`/assets/hudong/${v.funname}.png`"
                class="avatarimg avatarimg-img"
                :onerror="$defaultImg('img')"
              />
              <span class="t-name" :class="{'nozh':nozhlang}">{{v.name}}</span>
              <!-- <span class="color9">states:{{v.states}}{{statesFn(v)}}</span>
              <span class="color9">btnaction:{{v.btnaction}}{{btnactionFn(v.btnaction)}}</span>-->
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="showAnzufy"
      class="record colord font18 nowrap anztxt"
      :class="`states${classmgr_mute.states}`"
      ref="showAnzufy"
      @mousedown="TouchStart"
      @mousemove="TouchMove"
      @mouseup="TouchEnd"
      v-on:touchstart="TouchStart"
      v-on:touchmove="TouchMove"
      v-on:touchend="TouchEnd"
      @click="hasitemclick(classmgr_mute)"
    >
      <img
        class="anzimg"
        @mouseup="TouchEnd"
        v-on:touchend="TouchEnd"
        src="/assets/hudong/azfyb.png"
        style="height: 35px;width:35px"
        alt
        v-if="hasreicon"
      />
      {{mutetext}}
    </div>
  </div>
</template>
<script>
const testData = {
  banke: {
    bankeid: 1030,
    teamac: 1180
  },
  funlist: [
    {
      btnaction: 0,
      funname: "classmgr_name",
      group: "group_fuzhu",
      name: "student",
      states: 0
    },
    {
      btnaction: 0,
      funname: "classmgr_group",
      group: "",
      name: "2组",
      states: 0
    },
    {
      btnaction: 0,
      funname: "classmgr_sign",
      group: "group_hud7ong",
      name: "签到",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_pingce_msg",
      group: "group_hudong",
      name: "评测记录",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_banshu",
      group: "group_hudong",
      name: "板书",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_danmu",
      group: "group_hudong",
      name: "弹幕",
      states: 1
    },
    {
      btnaction: 0,
      funname: "xunlian",
      group: "group_hudong",
      name: "统一训练",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_reset",
      group: "1",
      name: "全体复位",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_record_voice",
      group: "group_voice",
      name: "全体录音",
      states: -1
    },
    {
      btnaction: 0,
      funname: "classmgr_record_playback",
      group: "1",
      name: "全体回放",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_broadcast",
      group: "1",
      name: "语音广播",
      states: 1
    },
    {
      btnaction: 1,
      funname: "classmgr_pc_sound",
      group: "1",
      name: "电脑声音",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_personal_call",
      group: "group_teach",
      name: "个别通话",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_example",
      group: "group_teach",
      name: "学生发言",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_bcast",
      group: "group_teach",
      name: "我要投屏",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_camera",
      group: "group_voice",
      name: "我要直播",
      states: 1
    },
    {
      btnaction: 1,
      funname: "classmgr_bcastteach",
      group: "group_voice",
      name: "投屏广播",
      states: 1
    },
    {
      btnaction: 1,
      funname: "classmgr_broadcastteache",
      group: "group_voice",
      name: "屏幕广播",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_demand",
      group: "2",
      name: "课件库",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_groupdemand",
      group: "2",
      name: "小组文件",
      states: 0
    },
    {
      btnaction: 0,
      funname: "classmgr_control",
      group: "2",
      name: "遥控大屏",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_compare",
      group: "2",
      name: "对比讲解",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_randcall",
      group: "2",
      name: "随机选择",
      states: 1
    },
    {
      btnaction: 2,
      funname: "classmgr_mute",
      group: "2",
      name: "按住发言",
      states: 0
    },
    {
      btnaction: 0,
      funname: "classmgr_banshu",
      group: "group_hudong",
      name: "板书快照",
      states: 1
    }
  ],
  online: {
    msg: "",
    online: true
  },
  user: {
    role: "teacher",
    mac: 1173
  }
};
const testData2 = {
  banke: {
    bankeid: 1029
  },
  funlist: [
    // {
    //   btnaction: 0,
    //   funname: "classmgr_voice",
    //   group: "",
    //   name: "",
    //   states: 1
    // },
    {
      btnaction: 0,
      funname: "classmgr_reset",
      group: "",
      name: "全体复位",
      states: 0
    },
    // {
    //   btnaction: 0,
    //   funname: "classmgr_name",
    //   group: "",
    //   name: "",
    //   states: 0
    // },
    // {
    //   btnaction: 0,
    //   funname: "classmgr_group",
    //   group: "",
    //   name: "",
    //   states: 0
    // },
    {
      btnaction: 0,
      funname: "classmgr_record_voice",
      group: "",
      name: "全体录音",
      states: 0
    },
    {
      btnaction: 0,
      funname: "classmgr_record_playback",
      group: "",
      name: "全体回放",
      states: -1
    },
    {
      btnaction: 0,
      funname: "classmgr_broadcast",
      group: "",
      name: "语音广播",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_pc_sound",
      group: "",
      name: "电脑声音",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_personal_call",
      group: "",
      name: "个别通话",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_example",
      group: "",
      name: "学生发言",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_bcast",
      group: "",
      name: "我要投屏",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_camera",
      group: "",
      name: "我要直播",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_bcastteach",
      group: "",
      name: "投屏广播",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_broadcastteache",
      group: "",
      name: "屏幕广播",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_demand",
      group: "",
      name: "课件库",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_groupdemand",
      group: "",
      name: "小组文件",
      states: 0
    },
    {
      btnaction: 0,
      funname: "classmgr_control",
      group: "",
      name: "遥控大屏",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_compare",
      group: "",
      name: "对比讲解",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_randcall",
      group: "",
      name: "随机选择",
      states: 1
    },
    // {
    //   btnaction: 0,
    //   funname: "classmgr_mute",
    //   group: "",
    //   name: "按住发言",
    //   states: -1
    // },
    {
      btnaction: 0,
      funname: "classmgr_banshu",
      group: "",
      name: "板书快照",
      states: 0
    }
  ],
  online: {
    msg: "",
    online: true
  },
  user: {
    role: "teacher"
  }
};
const testData3 = {
  banke: {
    bankeid: 1029
  },
  funlist: [
    {
      btnaction: 0,
      funname: "classmgr_reset",
      group: "",
      name: "全体复位",
      states: 0
    },
    {
      btnaction: 0,
      funname: "classmgr_record_voice",
      group: "",
      name: "全体录音",
      states: -1
    },
    {
      btnaction: 0,
      funname: "classmgr_record_playback",
      group: "",
      name: "全体回放",
      states: -1
    },
    {
      btnaction: 0,
      funname: "classmgr_broadcast",
      group: "",
      name: "语音广播",
      states: -1
    },
    {
      btnaction: 0,
      funname: "classmgr_pc_sound",
      group: "",
      name: "电脑声音",
      states: -1
    },
    {
      btnaction: 0,
      funname: "classmgr_personal_call",
      group: "",
      name: "个别通话",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_example",
      group: "",
      name: "学生发言",
      states: -1
    },
    {
      btnaction: 0,
      funname: "classmgr_bcast",
      group: "",
      name: "我要投屏",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_camera",
      group: "",
      name: "我要直播",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_bcastteach",
      group: "",
      name: "投屏广播",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_broadcastteache",
      group: "",
      name: "屏幕广播",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_demand",
      group: "",
      name: "课件库",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_groupdemand",
      group: "",
      name: "小组文件",
      states: 0
    },
    {
      btnaction: 0,
      funname: "classmgr_control",
      group: "",
      name: "遥控大屏",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_compare",
      group: "",
      name: "对比讲解",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_randcall",
      group: "",
      name: "随机选择",
      states: 1
    },
    {
      btnaction: 0,
      funname: "classmgr_mute",
      group: "",
      name: "按住发言",
      states: -1
    },
    {
      btnaction: 0,
      funname: "classmgr_banshu",
      group: "",
      name: "板书快照",
      states: 0
    }
  ],
  online: {
    msg: "",
    online: true
  },
  user: {
    role: "teacher"
  }
};
import Empty from "@/common/empty";
import nativecode from "@/nativecode";
import nativebridge from "@/nativebridge";
import { Toast, MessageBox, Indicator } from "mint-ui";
import banke from "../../store/modules/banke";
import { parseURL } from "@/util";
export default {
  name: "",
  props: {
    selected: {
      default: "hudong"
    }
  },
  data() {
    return {
      teaurl: "",
      groups: {
        group_fuzhu: [],
        group_voice: [],
        group_teach: [],
        group_record: [],
        group_hudong: [],
        outer: []
      },

      funlist: [],
      querydata: {},
      testkey: "",
      autofill: true,
      initenter: false,
      timeout: false,
      upindex: 0,
      TouchStartTime: 0,
      TouchEndTime: 0,
      recording: false,
      classmgr_mute: null,
      userinfo: {
        name: "",
        group: "",
        avatar: ""
      },
      clicktimeout: null,
      appcreate: true,
      ecode: 0,
      teacode: null,
      group: ""
    };
  },
  computed: {
    nozhlang() {
      let curlang = this.$i18n.locale;
      if (curlang != "zh") {
        return true;
      }
      return false;
    },
    hasreicon() {
      if (
        !this.recording &&
        this.classmgr_mute.states != -1 &&
        this.classmgr_mute.states != 1
      ) {
        return true;
      }
      return false;
    },
    mutetext() {
      if (this.classmgr_mute.states == -1) {
        return this.$mt("禁用");
      }
      if (this.classmgr_mute.states == 1) {
        return this.$mt("请发言");
      }
      if (!this.recording) {
        if (this.classmgr_mute.btnaction == 2) {
          return this.$mt("按住发言");
        }
        if (this.classmgr_mute.btnaction == 1) {
          return this.$mt("点击发言");
        }
      } else {
        return this.$mt("请发言");
      }
    },
    headername() {
      if (this.online) {
        if (this.querydata.banke.name) {
          return this.querydata.banke.name;
        }
      }
      return this.$mt("语音课堂互动");
    },
    showusgroup() {
      if (Object.keys(this.userinfo).length) {
        if (this.userinfo.name) {
          if (this.userinfo.name && this.online) {
            return true;
          }
        }
      }
      return false;
    },
    showAnzufy() {
      if (this.funlist.length) {
        for (let v of this.funlist) {
          if (v.funname == "classmgr_mute" && this.online) {
            this.classmgr_mute = v;
            return true;
          }
        }
      }
      this.classmgr_mute = null;
      return false;
    },
    userid() {
      if (this.querydata) {
        if (Object.keys(this.querydata).length) {
          if (this.querydata.user) {
            if (this.querydata.user.id) {
              return this.querydata.user.id;
            }
          }
        }
      }
      return 1001;
    },
    bankeid() {
      if (this.querydata) {
        if (Object.keys(this.querydata).length) {
          if (this.querydata.banke) {
            return this.querydata.banke.bankeid;
          }
        }
      }
      return 0;
    },
    showRefreshbtn() {
      if (
        (!this.online && this.initenter) ||
        (this.timeout && this.initenter) ||
        (!this.funlist.length && this.online)
      ) {
        return true;
      }
      return false;
    },
    online() {
      if (this.querydata) {
        if (Object.keys(this.querydata).length) {
          if (this.querydata.online) {
            if (this.querydata.online.online) {
              return true;
            }
          }
        }
      }
      return false;
    },
    onlinemsg() {
      if (this.querydata) {
        if (Object.keys(this.querydata).length) {
          if (this.querydata.online) {
            if (!this.querydata.online.online && this.querydata.online.msg) {
              return this.querydata.online.msg;
            }
          }
        }
      }
      return "";
    },
    hastouchstart() {
      if (nativecode.platform == "exsoftwindows" || nativecode.platform == "") {
        return false;
      }
      return true;
    },
    islogin() {
      return this.$store.getters.islogin;
    }
  },
  watch: {
    selected: function(newv, oldv) {
      if (newv == "hudong") {
        this.initload();
      }
      if (oldv == "hudong") {
        // nativecode.Resultdp("duopingChange", { resultcb: null }, true);
        this.initdata();
      }
    },
    showAnzufy: function(newv, oldv) {
      if (newv) {
        this.stopcontextmenu();
      }
    }
  },
  created() {
    if (this.selected == "hudong") {
      this.initload();
    }
  },
  mounted() {
    // this.stopcontextmenu();
  },
  methods: {
    stopcontextmenu() {
      this.$nextTick(() => {
        let anzEl = this.$refs.showAnzufy;
        if (anzEl != undefined) {
          anzEl.addEventListener("contextmenu", function(e) {
            let ev = e || window.event;
            ev.preventDefault();
          });
        }
      });
    },
    initload() {
      nativecode.Resultdp("duopingChange", { resultcb: this.onchangedp });
      this.enterduoping();
      this.moninAtivecalldp();
    },
    moninAtivecalldp() {
      if (process.env.NODE_ENV == "development") {
        // setTimeout(() => {
        //      nativebridge.nativecalldp(
        //     JSON.stringify({
        //       cmd: "duopingChange",
        //       data: testData
        //     }),
        //     true
        //   );
        // }, 5000);
        // setTimeout(() => {
        //   nativebridge.nativecalldp(
        //     JSON.stringify({
        //       cmd: "duopingChange",
        //       data: testData2
        //     }),
        //     true
        //   );
        // }, 5000);
        // setTimeout(() => {
        //   nativebridge.nativecalldp(
        //     JSON.stringify({
        //       cmd: "duopingChange",
        //       data: testData3
        //     }),
        //     true
        //   );
        // }, 10000);
      }
    },
    hudong(item) {
      let funname = item.funname;
      switch (funname) {
        case "xunlian":
          this.tongyixl();
          break;
        case "classmgr_sign":
          this.tosign();
          break;
        case "classmgr_pingce_msg":
          this.topingce();
          break;
        case "classmgr_pingce":
          this.topingceing();
          break;
        case "classmgr_banshu":
          this.tobanshu();
          break;
        case "classmgr_danmu":
          this.todanmu();
          break;
        default:
          this.itemclick(item, false);
      }
    },
    tongyixl() {
      let url = `/bankehome/${this.bankeid}?slction=true`;
      let tyxlid = sessionStorage.getItem("tyxlid") || "";
      if (tyxlid) {
        url = `/zuoyeresult/${tyxlid}?tongyixl=true&bankeid=${this.bankeid}`;
      } else {
        this.$store.commit("setBHomeSelected", "zuoye");
      }
      this.$store.commit("setRouterForward", true);
      this.$router.push(url);
    },
    tosign() {
      this.$store.commit("setRouterForward", true);
      this.$router.push({
        path: "/sign?fromhudong=true",
        query: { bankeid: this.bankeid }
      });
    },
    topingce() {
      this.$store.commit("setRouterForward", true);
      this.$router.push({
        name: "PingCe",
        params: { bankeid: this.bankeid }
      });
    },
    topingceing() {
      this.$store.commit("setRouterForward", true);
      this.$router.push({
        name: "PingCeing",
        params: { bankeid: this.bankeid }
      });
    },
    tobanshu() {
      this.$store.commit("setRouterForward", true);
      this.$router.push({
        name: "Banshu",
        params: { bankeid: this.bankeid, calcebanshu: true }
      });
      //! cjy: 板书手动删除
      this.$http
        .post("/api/eventmsgs/clear", {
          eventtype: 100,
          bankeid: this.bankeid
        })
        .then(res => {})
        .catch(res => {});
    },
    todanmu() {
      this.$store.commit("setRouterForward", true);
      this.$router.push({
        name: "Danmu",
        params: {
          bankeid: this.bankeid,
          userid: this.userid,
          frompage: "hudong"
        }
      });
    },
    itemclick(v, fristclick = true) {
      if (fristclick) {
        if (v.group == "group_hudong" || v.funname == "xunlian") {
          this.hudong(v);
          return;
        }
      }
      if (v.states < 0) {
        Toast(this.$mt("当前不可用"));
        return;
      }
      if (!this.appcreate) {
        Toast(this.$mt("程序开启中,请稍等"));
        return;
      }
      if (v.btnaction == 1) {
        if (v.states == 0) {
          this.appcreate = false;
          setTimeout(() => {
            this.appcreate = true;
          }, 1000);
        }
      }
      this.testkey = new Date().getTime();
      let json = {
        data: {
          funname: v.funname,
          states: v.states ? 0 : 1
        }
        // cb: cb,
        // finnalcb: () => {
        //   Toast(this.$mt("超时"));
        // }
      };
      v.states = v.states ? 0 : 1;
      v.start = true;
      setTimeout(() => {
        v.start = false;
      }, 100);
      console.log("duopingFun itemclick", v);
      this.nativehudong("duopingFun", json);
      this.moninAtivecalldp();
    },
    loadTop() {
      this.Refresh();
    },
    Refresh() {
      this.enterduoping(true);
    },
    enterduoping(refresh = false) {
      let localData = sessionStorage.getItem("hudongdata") || null;
      let cb = obj => {
        console.log("enterduoping End", obj);
        let res = obj;
        if (typeof res == "string") {
          if (res.substr(0, 1) == "{") {
            res = JSON.parse(res);
          }
        }
        this.querydata = res;
        if (this.querydata.funlist) {
          // this.funlist = [];
          this.funlist = this.querydata.funlist;
        }
        this.commom(this.querydata);
        this.setGroup(this.funlist);
        // console.log("enterduoping querydata", this.querydata);
        this.initenter = true;
        Indicator.close();
        if (refresh) {
          this.$refs.loadmore.onTopLoaded();
        }
      };
      if (localData && !refresh) {
        localData = JSON.parse(localData);
        if (localData) {
          if (Object.keys(localData).length) {
            if (localData.online) {
              if (localData.online.online) {
                cb(localData);
                return;
              }
            }
          }
        }
      }
      Indicator.open(this.$mt("连接中"));
      this.testkey = new Date().getTime();
      let json = {
        data: {},
        cb: cb,
        // callbacktimeout:0,
        finnalcb: this.finnalcb
      };
      const UrlParams = parseURL(window.location.href);
      console.log("互动 teaurl", UrlParams);
      if (UrlParams.teaurl) {
        this.teaurl = UrlParams.teaurl;
      }
      if (UrlParams.teacode) {
        this.teacode = UrlParams.teacode;
      }
      if (UrlParams.group) {
        this.group = UrlParams.group;
      }
      if (this.teaurl) {
        json.data.teaurl = decodeURIComponent(this.teaurl);
      }
      if (this.teacode) {
        json.data.teacode = this.teacode;
      }
      if (this.group) {
        json.data.group = decodeURIComponent(this.group);
      }
      let monicbdata = {
        data: testData,
        key: this.testkey
      };
      this.nativehudong("enterDuoping", json, monicbdata);
    },
    onchangedp(obj) {
      console.log(`duopingChange 推送 End ${(this.upindex += 1)}次`, obj);
      this.userinfo = {
        name: "",
        group: "",
        avatar: ""
      };
      this.recording = false;
      (this.groups = {
        group_fuzhu: [],
        group_voice: [],
        group_teach: [],
        group_record: [],
        group_hudong: [],
        outer: []
      }),
        (this.querydata = obj.data);
      if (this.querydata.funlist) {
        this.funlist = this.querydata.funlist;
      } else {
        this.funlist = [];
      }
      this.commom(this.querydata);
      this.setGroup(this.funlist);
    },
    querysigndata(mac) {
      if (!mac) return;
      sessionStorage.setItem("mac", mac);
      let postdata = { roomid: mac };
      if (process.env.NODE_ENV == "development") {
        postdata = { id: mac };
      }
      this.$http.post("/api/sign/signqueryself", postdata).then(res => {
        if (res.data.code == 0) {
          let rdata = res.data.data;
          this.curSignData = rdata.signdata;
          //! 是否为签到发起者
          if (rdata.master) {
            // this.master = true;
          } else if (rdata.signinfo.length >= 1) {
            let stuSignData = rdata.signinfo[0];
            if (this.curSignData.state == 0 && stuSignData.signnum == 0) {
              let hassignkey = sessionStorage.getItem("hassignkey") || "false";
              let fromsign = sessionStorage.getItem("fromsign") || "";
              if (!fromsign) {
                if (!JSON.parse(hassignkey)) {
                  this.tosign();
                }
              }
            }
          } else {
            // this.ismember = false;
            // // Toast(this.$mt("您不在签到名单中"));
            // this.$confirm({
            //   msg: "你未在签到名单中,是否立刻加入",
            //   ok: "立刻",
            //   docb: () => {
            //     this.$router.push(`/bankejoin/${this.bankeid}`);
            //   }
            // });
          }
        } else {
          //  Toast(this.$mt("未找到签到信息,请重新确认"));
          // if (this.caneditbanke || this.caneditrole) {
          //   this.master = true;
          //   this.signhistory();
          // } else {
          //   this.nobigsign = true;
          // }
        }
      });
    },
    commom(querydata) {
      if (!querydata.online.online) {
        this.$store.commit("SET_online", false);
      } else {
        let code = querydata.banke.code;
        if (code) {
          if (code != this.ecode) {
            this.querysigndata(querydata.banke.teamac);
          }
          this.ecode = code;
        }
        this.$store.commit("SET_online", true);
      }
      sessionStorage.setItem("hudongdata", JSON.stringify(querydata));
    },
    setGroup(funlists) {
      if (!funlists || !funlists.length) return;
      if (!this.querydata.banke.bankeid) {
        for (let v of funlists) {
          let name = v.funname;
          if (
            name == "xunlian" ||
            name == "classmgr_sign" ||
            name == "classmgr_pingce" ||
            name == "classmgr_pingce_msg" ||
            name == "classmgr_banshu" ||
            name == "classmgr_danmu"
          ) {
            v.hide = true;
          }
        }
      }
      let lists = JSON.parse(JSON.stringify(funlists));
      for (let v of lists) {
        v.start = false;
        if (v.funname == "classmgr_name") {
          this.userinfo.name = v.name;
        }
        if (v.funname == "classmgr_group") {
          this.userinfo.gname = v.name;
        }
        let grouptype = v.group;
        if (v.funname != "classmgr_name" && v.funname != "classmgr_group") {
          switch (grouptype) {
            case "group_fuzhu":
              this.groups[grouptype].push(v);
              break;
            case "group_voice":
              this.groups[grouptype].push(v);
              break;
            case "group_teach":
              this.groups[grouptype].push(v);
              break;
            case "group_record":
              this.groups[grouptype].push(v);
              break;
            case "group_hudong":
              this.groups[grouptype].push(v);
              break;
            default:
              this.groups["outer"].push(v);
          }
        }
      }
      console.log(" this.userinfo", this.userinfo);
    },
    getgroupname(grouptype) {
      switch (grouptype) {
        case "group_fuzhu":
          return this.$mt("辅助类");
        case "group_voice":
          return this.$mt("语音类");
        case "group_teach":
          return this.$mt("教学类");
        case "group_record":
          return this.$mt("录音类");
        case "group_hudong":
          return this.$mt("互动类");
        default:
          return this.$mt("其它");
      }
    },
    nativehudong(name, postdata, cbdata = null) {
      let json = postdata;
      if (process.env.NODE_ENV == "development") {
        json.key = this.testkey;
        if (cbdata) {
          this.monidata(cbdata);
        }
      }
      nativecode.jsFn(name, json);
    },
    finnalcb() {
      Toast(this.$mt("超时"));
      Indicator.close();
      this.timeout = true;
      this.initenter = true;
      this.$refs.loadmore.onTopLoaded();
    },
    monidata(monicbdata) {
      let moni = objags => {
        objags.data = JSON.stringify(objags.data);
        setTimeout(() => {
          nativebridge.nativecalled2("callcallback", objags);
        }, 1000);
      };
      moni(monicbdata);
    },
    statesFn(v, init = true) {
      let states = v.states;
      let btnaction = v.btnaction;
      switch (states) {
        case 0:
          return "未开启";
        case 1:
          return "已开启";
        case -1:
          return "禁用";
      }
    },
    btnactionFn(states) {
      switch (states) {
        case 0:
          return "无动作";
        case 1:
          return "当前被按下";
        case 2:
          return "当前被一直按下";
      }
    },
    initdata() {
      Object.assign(this.$data, this.$options.data());
    },
    back() {
      this.$back();
    },
    hasitemclick() {
      if (this.classmgr_mute.btnaction == 1 || this.classmgr_mute.states == 1) {
        this.itemclick(this.classmgr_mute);
      }
    },
    TouchStart(event) {
      if (this.classmgr_mute.states == -1) {
        return;
      }
      if (this.classmgr_mute.btnaction == 1 || this.classmgr_mute.states == 1) {
        return;
      }
      this.recording = true;
      this.TouchStartTime = new Date().getTime();
      let e = event || window.event;
      // e.preventDefault();
      console.log(event);
      let el = this.$refs.showAnzufy;
      // let el = e.target;
      el.classList.add("start");

      let json = {
        data: {
          funname: this.classmgr_mute.funname,
          states: 1
        }
      };
      this.nativehudong("duopingFun", json);
      console.log("TouchStart 按下", json);
    },
    TouchMove(event) {
      let e = event || window.event;
      // e.preventDefault();
    },
    TouchEnd(event) {
      if (this.classmgr_mute.btnaction == 2) {
        this.TouchEndTime = new Date().getTime();
        let e = event || window.event;
        // e.preventDefault();
        let json = {
          data: {
            funname: this.classmgr_mute.funname,
            states: 0
          }
        };
        this.recording = false;
        // let el = e.target;
        let el = this.$refs.showAnzufy;
        el.classList.remove("start");
        this.nativehudong("duopingFun", json);
        console.log("TouchEnd 抬起", json);
      }
    },
    groupclick() {
      let json = {
        data: {
          funname: "classmgr_group",
          states: 1
        }
      };
      this.nativehudong("duopingFun", json);
    }
  },
  components: { Empty }
};
</script>
<style lang='less' scoped>
.hudong-warp {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  .main {
    margin-top: 51px;
    .item-w {
      background: #fff;
      .grouptit {
        background: #f0f0f0;
        padding: 8px 10px;
      }
    }
    .item-warp {
      width: 100%;
      margin: 0 auto;
      height: calc(100vh - 130px);
      overflow: scroll;
      // padding-bottom: 120px;
      &.hasgroup {
        height: calc(100vh - 180px);
      }
      .item {
        width: 25%;
        float: left;
        display: flex;
        height: 100px;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        &.classmgr_mute,
        &.classmgr_name,
        &.classmgr_group {
          display: none;
        }
        .citem {
          position: relative;
          width: 86%;
          height: 85%;
          display: flex;
          // flex-direction: column;
          // align-items: center;
          // justify-content: space-evenly;
          border-radius: 6px;
          color: #000;
          font-size: 16px;
          transition: all 0.1s;

          i {
            font-size: 30px;
          }
          .avatarimg,
          .t-name {
            position: absolute;
            left: 50%;
            transform: translate(-50%, 0);
          }
          .avatarimg.iconfont {
            top: 12px;
            font-size: 36px;
          }
          .avatarimg-img {
            width: 33px;
            height: 33px;
            object-fit: contain;
            top: 12px;
          }
          .t-name {
            width: 100%;
            text-align: center;
            bottom: 10px;
            word-break: break-word;
            overflow: hidden;
            &.nozh {
              bottom: 0;
              height: 28px;
              // align-items: flex-start;
              font-size: 16px;
              line-height: .9;
            }
          }
          &.state1 {
            background: #b2dcff;
            border: 1px solid #00a2de;
          }
          &.state-1 {
            opacity: 0.3;
          }
          &.btnaction0 {
            background: none;
            border: none;
          }
          &.start {
            background: #b2dcff;
            border: 1px solid #00a2de;
          }
          &.hide {
            display: none;
          }
        }
      }
      &.showAnzufy {
        padding-bottom: 60px;
      }
    }
    .refresh {
      width: 100%;
      height: 100vh;
      .no-class {
        position: relative;
        height: 100%;
        .online-w {
          width: 100%;
          top: 40%;
          .bg-img {
            height: 224px;
            background: url("/assets/hudong/bg_rd.png") no-repeat 50% 50%;
            background-size: contain;
            display: flex;
            align-items: center;
            justify-content: center;
            img {
              top: 40%;
              &.img1 {
                margin-right: 22px;
              }
              &.img2 {
              }
            }
          }
          .tx {
            margin-top: 20px;
          }
        }
      }
    }
  }
  .record {
    width: 90%;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    bottom: 85px;
    background: #fff;
    border: 2px solid #26a2ff;
    border-radius: 100px;
    left: 50%;
    transform: translate(-50%, 0);
    transition: all 0.3s;
    &.states1 {
      height: 49px;
      color: #fff;
      background: #0089ff;
    }
    &.states-1 {
      background: #ccc;
      border: 2px solid #ccc;
      color: #fff;
    }
    &.btnaction0 {
      background: #fff;
      border: 2px solid #26a2ff;
    }
    &.start {
      height: 49px;
      color: #fff;
      background: #0089ff;
    }
    img {
      // position: absolute;
      // left: 50px;
    }
  }
  .userw {
    background: #fff;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .userimg {
      width: 30px;
      height: 30px;
      object-fit: contain;
      border-radius: 30px;
      margin-right: 10px;
    }
    .group {
      padding: 5px 20px;
      background: #ccc;
      border-radius: 20px;
    }
  }
}
</style>
<style>
.hudong-warp .mint-loadmore-top {
  opacity: 0;
}
</style>