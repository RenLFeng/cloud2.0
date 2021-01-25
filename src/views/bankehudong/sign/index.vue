<template>
  <div class="sign-warp">
    <mt-header :title="$mt('签到')" class="mint-header-f" v-if="showpage">
      <mt-button icon="back" slot="left" @click="goback">{{$mt('返回')}}</mt-button>
    </mt-header>
    <div class="main" v-if="showpage">
      <div class="top-state" v-if="master">
        <ul>
          <li class="fontlarge" @click="openSign">
            <i
              class="iconfont iconqiandao2 eicotrigger bigfont"
              :class="curSignData.state==0?'ing':''"
            ></i>
            <span :class="curSignData.state==0?'colord':''">{{$mt(classStateText)}}</span>
          </li>
        </ul>
      </div>
      <div v-if="!master && !showsignhistory" class="stu-wrap">
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
          <div class="itemlists">
            <div v-if="stuhassign" class="sign1 position-c signitem">
              <i class="icon iconfont iconok- colord"></i>
              <div class="c-item font16">
                <p v-if="curSignData.state==1" style="font-size: 20px;">{{$mt('签到已结束')}}</p>
                <P>
                  {{$mt('签到开始时间')}}:&nbsp;
                  <span class="color9">{{curSignData.starttime}}</span>
                </P>
                <P>{{$mt('签到状态')}}:&nbsp;{{signGetStateDesc(stuSignData.state,1,$mt)}}</P>
                <P>{{$mt('签到方式')}}:&nbsp;{{signGetTypeDesc(stuSignData.signnum,$mt)}}</P>
                <p v-if="stuSignData.signnum==2">{{$mt('距离%s米',[distancedist])}}</p>
                <P>
                  {{$mt('我的签到时间')}}:&nbsp;
                  <span class="color9">{{stuSignData.signtime}}</span>
                </P>
              </div>
            </div>
            <div v-if="showtipswrap && !stuhassign" class="position-c signitem nocansign tc">
              <p class="font18" v-if="!ismember">{{$mt('您不在签到名单中')}}</p>
              <div v-if="nocheckdata" class="font18">
                <p>{{$mt('无校验方式,无法签到')}}</p>
                <p>{{$mt('等待教师手动设置')}}</p>
              </div>
              <div v-if="nobigsign" class="font18">
                <p>{{$mt('老师暂未开启签到')}}</p>
                <p class="nobigsign">{{$mt('刷新试试')}}</p>
              </div>
              <div v-if="longdistance" class="font18">
                <p>{{$mt('未到指定区域,无法签到')}}</p>
                <p>{{$mt('距离%s米',[distancedist])}}</p>
                <mt-button @click="getLocation" class>{{$mt('签到')}}</mt-button>
              </div>
              <div v-if="!getLocationData" class="font18">
                <p>{{$mt('定位失败,无法签到')}}</p>
                <mt-button @click="getLocation" class>{{$mt('定位签到')}}</mt-button>
              </div>
              <div v-if="getgpslongtime" @click="getLocation" class="font18">
                <p>{{$mt('定位超时')}}</p>
                <p>{{$mt('再试试')}}</p>
              </div>
              <div v-if="signend" class="font18">
                <p>{{$mt('当前签到已结束,无法签到')}}</p>
                <p>{{curSignData.endtime}}</p>
              </div>
            </div>
            <div class="position-c" v-if="hassignkey">{{$mt('拒绝签到')}}</div>
          </div>
        </mt-loadmore>
        <p @click="showsignhistoryFn" v-if="bankeid" class="histr position-b">{{$mt('查看签到历史记录')}}</p>
      </div>
      <div v-if="showsignhistory" class="history-wrap" :class="!master?'master':''">
        <p class="tips-title">
          <span>{{$mt('签到历史记录')}}</span>
          <span v-if="master" @click="setdistance" class="colord">{{$mt('签到设置')}}</span>
        </p>
        <div
          class="list-wrap overflow-scroll"
          :class="!master?'master':''"
          ref="listcontainer"
          v-infinite-scroll="loadMorehistory"
          infinite-scroll-disabled="loading"
          infinite-scroll-distance="10"
          infinite-scroll-immediate-check="false"
        >
          <mt-loadmore
            :top-method="hloadTop"
            :top-distance="80"
            ref="hloadmore"
            :auto-fill="autofill"
            :topPullText="$mt('下拉刷新')"
            :topDropText="$mt('释放更新')"
            :topLoadingText="$mt('加载中')"
            :class="!signhistoryData.length?'myloadmore-style':''"
          >
            <div v-if="signhistoryData.length" class="wrap">
              <div class="item" v-for="(v,i) in signhistoryData" :key="i" @click="showSignresFn(v)">
                <div>
                  <p class="fist">
                    <span class="font18 l ellipse">
                      {{v.date
                      }} {{$mt(v.week)}} {{$mt('签到')}}
                    </span>
                    <span
                      class="colora r ellipse"
                    >{{$mt('%s人',[v.joinnum])}}/{{$mt('%s人',[v.totalnum])}}</span>
                  </p>
                  <p class="colord" v-if="v.state==0">{{$mt('正在签到')}}...</p>
                  <p class="colora ellipse time-date" v-else>{{v.date +"\n"+ v.time}}</p>
                </div>
                <i class="iconfont iconjiantou icont position-r fontlarge24 color9"></i>
              </div>
              <div v-if="showLoadtips">
                <BottomLoadmore :showType="Loadtipsobj.showType" :loadtext="Loadtipsobj.loadtext" />
              </div>
            </div>
            <Empty v-else :text="['无记录']" />
          </mt-loadmore>
        </div>
      </div>
    </div>
    <mt-popup
      v-model="popupShowSignRes"
      position="right"
      class="popup-right info-popup"
      :modal="false"
      style="background:#f0f0f0"
    >
      <Signres
        v-if="popupShowSignRes"
        :signresData="signresData"
        :master="master"
        @changesigndata="onchangesigndata"
        @cance="oncance"
      />
    </mt-popup>
    <mt-popup
      v-model="popupdistanceconfig"
      position="right"
      class="popup-right info-popup"
      :modal="false"
      style="background:#f0f0f0"
    >
      <DistanceConfig v-if="popupdistanceconfig" @cance="oncance" />
    </mt-popup>
    <div v-if="!showpage &&　cancecbclick" class="cancecbclick font18">
      <p>{{$mt('此功能只支持APP端中扫码使用')}}</p>
      <p class="colord" @click="downloadapp">{{$mt('下载APP')}}</p>
    </div>
  </div>
</template>
<script>
const testData = {
  banke: {
    bankeid: 1029
  },
  online: {
    msg: "",
    online: true
  },
  user: {
    role: "teacher",
    mac: 1175
  }
};
import { Indicator, Toast, MessageBox } from "mint-ui";
import Signres from "./signres";
import DistanceConfig from "./distanceconfig";
import Empty from "@/common/empty";
import {
  Whatweek,
  parseURL,
  signGetTypeDesc,
  signGetStateDesc,
  getDistance
} from "@/util";

import BottomLoadmore from "@/common/bottom-loadmore";
import nativecode from "@/nativecode";
import nativebridge from "@/nativebridge";
export default {
  name: "Sign",
  props: {
    // bankeid: {
    //   default: 0
    // }
  },
  data() {
    return {
      autofill: false,
      signGetStateDesc,
      signGetTypeDesc,
      master: false,
      popupShowSignRes: false,
      signhistoryData: [],
      curSignData: {},
      signresData: {},

      page: 0,
      pagesize: 20,
      autofill: false,
      allLoaded: false,
      loading: false,
      listLoadend: false,
      sid: 0,
      roomid: 0,
      bankeid: 0,
      stuSignData: {},
      showsignhistory: false,
      nobigsign: false,
      ismember: true,
      wifi: {},
      Location: {},
      nocheckdata: false,
      openLocationcheck: true,
      distance: 100,
      // jyLocation: {},
      // jydistance: this.distance,
      distancedist: 0,
      longdistance: false,
      getLocationData: true,
      popupdistanceconfig: false,
      urlhassid: false,
      getgpslongtime: false,

      testkey: null,
      showpage: true,
      cancecbclick: false,
      customserver: false,
      caneditrole: false,
      queryduopingdata: {},
      fromhudong: false,
      teaurl: "",
      signuserinfo: null,

      hassignkey: false,
      caneditbanke: false
    };
  },
  computed: {
    signend() {
      if (
        this.curSignData.state == 1 &&
        this.stuSignData.signnum == 0 &&
        this.ismember
      ) {
        return true;
      }
      return false;
    },
    stuhassign() {
      if (
        this.curSignData.state >= 0 &&
        this.stuSignData.signnum > 0 &&
        this.ismember
      ) {
        return true;
      }
      return false;
    },
    showtipswrap() {
      if (
        !this.ismember ||
        this.nocheckdata ||
        this.longdistance ||
        !this.getLocationData ||
        this.getgpslongtime ||
        this.nobigsign ||
        this.signend
      ) {
        return true;
      }
      return false;
    },
    cansign() {
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
    },
    // caneditbanke() {
    //   let caneditbanke = this.$store.getters.caneditbanke;
    //   return caneditbanke;
    // },
    classStateText() {
      if (this.curSignData.state == 0) {
        return "正在签到";
      }
      return "开始签到";
    },
    classState() {},
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
    user() {
      return this.$store.getters.curuser;
    }
  },
  watch: {},
  created() {
    if (sessionStorage.getItem("customserver")) {
      this.customserver = JSON.parse(sessionStorage.getItem("customserver"));
    }
    this.getlocadata();
  },
  mounted() {
    Indicator.open(this.$mt("加载中"));
    const UrlParams = parseURL(window.location.href);
    console.log("UrlParams sign", window.location.href);
    console.log("UrlParams", UrlParams);
    if (UrlParams.sid) {
      this.urlhassid = true;
      this.sid = UrlParams.sid;
    }
    if (UrlParams.roomid) {
      this.urlhassid = true;
      this.roomid = UrlParams.roomid;
    }
    if (UrlParams.teaurl) {
      this.teaurl = UrlParams.teaurl;
    }
    if (UrlParams.bankeid) {
      this.bankeid = UrlParams.bankeid;
    }
    if (UrlParams.caneditbanke) {
      this.caneditbanke = JSON.parse(UrlParams.caneditbanke);
    }
    if (UrlParams.fromhudong) {
      this.fromhudong = true;
      // this.caneditrole = true;
    }
    // if (!this.cansign) {
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
    this.onSignCheck();
  },
  methods: {
    hassigncheck() {},
    loadMorehistory() {
      this.loading = true;
      this.signhistory();
    },
    loadTop() {
      this.onSignCheck();
    },
    hinit() {
      this.signhistoryData = [];
      this.page = 0;
      this.allLoaded = false;
      this.loading = false;
      this.listLoadend = false;
    },
    hloadTop() {
      this.hinit();
      this.signhistory(true);
    },
    enterduoping(roomid) {
      let cb = obj => {
        console.log("签到 enterduoping cb", obj);
        let res = obj;
        this.queryduopingdata = res;
        let mac = this.queryduopingdata.banke.teamac;
        if (mac == roomid) {
          this.studentSign(this.sid, 101, mac);
        } else {
           console.log("签到  cb roomid", roomid);
          Indicator.close();
          this.$confirm({
            msg: "MAC地址匹配失败,尝试定位签到",
            ok: "定位签到",
            docb: () => {
             this.getLocation();
            }
          });
        }
      };
      if (roomid) {
        Indicator.open(this.$mt("签到中"));
      }
      this.testkey = new Date().getTime();
      let json = {
        data: {},
        cb: roomid ? cb : null
        // callbacktimeout:0,
        // finnalcb: this.finnalcb
      };
      if (this.teaurl) {
        json.data.teaurl = decodeURIComponent(this.teaurl);
      }
      let monicbdata = {
        data: testData,
        key: this.testkey
      };
      console.log("签到 enterduoping postdata", json);
      this.nativehudong("enterDuoping", json, monicbdata);
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
    monidata(monicbdata) {
      let moni = objags => {
        setTimeout(() => {
          nativebridge.nativecalled2("callcallback", objags);
        }, 5000);
      };
      moni(monicbdata);
    },
    onSignCheck() {
      let postdata = { bankeid: this.bankeid };
      if (this.sid) {
        postdata = { id: this.sid };
      }
      if (this.roomid) {
        postdata = { roomid: this.roomid };
      }
      this.$http
        .post("/api/sign/signqueryself", postdata)
        .then(res => {
          this.$refs.loadmore.onTopLoaded();
          if (res.data.code == 0) {
            this.nobigsign = false;
            let rdata = res.data.data;
            this.curSignData = rdata.signdata;
            this.bankeid = this.curSignData.bankeid;
            if (this.roomid || this.bankeid) {
              this.sid = this.curSignData.id;
            }
            console.log("signqueryself", rdata);
            this.getsigninfo(this.curSignData, true);
            //! 是否为签到发起者
            if (rdata.master) {
              this.master = true;
              if (this.curSignData.state == 0) {
                this.showSignresFn(rdata.signdata, true);
              } else {
                this.signhistory();
              }
            } else if (rdata.signinfo.length >= 1) {
              let stuSignData = rdata.signinfo[0];
              if (stuSignData.signinfo) {
                stuSignData.signinfo = JSON.parse(stuSignData.signinfo);
              } else {
                stuSignData.signinfo = {};
              }
              if (this.curSignData.state == 1 || stuSignData.signnum > 0) {
                this.stuSignData = stuSignData;
                if (this.stuSignData.signinfo.distance) {
                  this.distancedist = this.stuSignData.signinfo.distance;
                }
                let roomid = this.curSignData.roomid;
                if (nativebridge.apiversion >= 3 && roomid && this.teaurl) {
                  this.enterduoping("");
                }
                return;
              }
              if (this.curSignData.state == 0 && stuSignData.signnum == 0) {
                if (localStorage.getItem("signuserinfo")) {
                  this.signuserinfo = JSON.parse(
                    localStorage.getItem("signuserinfo")
                  );
                  let signkey = `sign${this.curSignData.id}${this.curSignData.starttime}`;
                  if (signkey == this.signuserinfo.signkey) {
                    this.hassignkey = true;
                    this.$alert({
                      msg: "当前设备已签到,不能再签到"
                    });
                    sessionStorage.setItem(
                      "hassignkey",
                      JSON.stringify(this.hassignkey)
                    );
                    return;
                  }
                }
                if (Object.keys(this.Location).length) {
                  // this.getLocation();
                  let roomid = this.curSignData.roomid;
                  if (
                    (nativebridge.apiversion >= 3 && roomid && this.teaurl) ||
                    this.fromhudong
                  ) {
                    this.enterduoping(roomid);
                  } else {
                    this.getLocation();
                  }
                } else {
                  this.nocheckdata = true;
                }
                return;
              }
            } else {
              this.ismember = false;
              this.$confirm({
                msg: "你未在签到名单中,是否立刻加入",
                ok: "立刻",
                docb: () => {
                  this.$router.push(`/bankejoin/${this.bankeid}`);
                }
              });
            }
          } else {
            if (this.caneditbanke || this.caneditrole) {
              this.master = true;
              this.signhistory();
            } else {
              this.nobigsign = true;
            }
          }
        })
        .catch(err => {
          this.$refs.loadmore.onTopLoaded();
        });
    },
    getLocation(signtype = 0) {
      this.testkey = new Date().getTime();
      let tips = "定位中";
      Indicator.open(this.$mt(tips));
      let cb = obj => {
        console.log("GPS  回调", obj);
        if (obj.code == 0) {
          let res = obj.data;
          if (typeof res == "string") {
            if (res.substr(0, 1) == "{") {
              console.log("json str 解析");
              res = JSON.parse(res);
            }
          }
          let dist = getDistance(
            res.latitude,
            res.longitude,
            this.Location.latitude,
            this.Location.longitude
          );
          dist = parseInt(dist);
          this.distancedist = dist;
          console.log("距离", dist);
          if (dist <= this.distance) {
            // alert("签到成功");
            // Indicator.close();
            this.studentSign(this.sid, 2);
          } else {
            this.longdistance = true;
            Toast(this.$mt("未到指定区域,无法签到"));
            Indicator.close();
          }
        } else {
          this.getLocationData = false;
          Toast(this.$mt("定位失败,无法签到"));
          Indicator.close();
        }
      };
      if (process.env.NODE_ENV == "development") {
        this.moni(false);
      }
      this.nativegetgps(cb);
    },
    //学生签到
    studentSign(sid, signnum, mac = false) {
      Indicator.close();
      Indicator.open(this.$mt("签到中"));
      let signinfo = {};
      if (signnum == 2) {
        signinfo = {
          distance: this.distancedist
        };
      }
      this.$http
        .post("/api/sign/signdo", {
          signid: sid,
          signnum: signnum,
          signinfo: JSON.stringify(signinfo)
        })
        .then(res => {
          if (res.data.code == 0) {
            if (mac) {
              sessionStorage.setItem("mac", mac);
            }
            this.setsigninfo(res.data.data);
            this.stuSignData = { ...this.stuSignData, ...res.data.data };
            console.log("学生签到 signdo", this.stuSignData);
            // if (signnum == 101) {
            //   this.$router.push({
            //     path: "/",
            //     query: { selected: "hudong" }
            //   });
            // }
          } else {
            Toast(this.$mt("签到失败") + ":" + res.data.msg);
          }
          Indicator.close();
        })
        .catch(err => {
          Indicator.close();
          Toast(this.$mt("服务开小差了"));
        });
    },
    setsigninfo(signdata) {
      let signuserinfo = {};
      let signkey = `sign${this.curSignData.id}${this.curSignData.starttime}`;
      signuserinfo.signkey = signkey;
      signuserinfo.userid = signdata.userid;
      localStorage.setItem("signuserinfo", JSON.stringify(signuserinfo));
    },
    //签到 历史记录
    signhistory(loadmore = false) {
      this.showsignhistory = true;
      this.$http
        .post("/api/sign/signqueryhistory", {
          bankeid: this.bankeid,
          pagesize: this.pagesize,
          page: this.page,
          order: "desc"
        })
        .then(res => {
          if (res.data.code == 0) {
            this.$refs.hloadmore.onTopLoaded();
            if (res.data.data.count) {
              if (res.data.data.data.length >= this.pagesize) {
                this.loading = false;
                this.page++;
              } else {
                if (this.page) {
                  this.listLoadend = true;
                }
                this.loading = true;
                this.allLoaded = true;
              }
              for (let v of res.data.data.data) {
                if (v.state == 0 && !this.curSignData.id) {
                  this.curSignData = v;
                  // this.onSignCheck();
                  // this.showsignhistory = false;
                }
                this.parseonesign(v);
              }
              this.signhistoryData = [
                ...this.signhistoryData,
                ...res.data.data.data
              ];
            }
          } else {
            Toast(this.$mt("服务开小差了"));
          }
        })
        .catch(() => {
          this.$refs.hloadmore.onTopLoaded();
          Toast(this.$mt("服务开小差了"));
        });
    },
    //开启签到
    openSign() {
      // if (!this.cansign) {
      //   Toast("请在APP端中使用");
      //   return;
      // }
      if (this.curSignData.state == 0) return;
      this.testkey = new Date().getTime();
      this.$confirm({
        msg: "您确定要开始上课吗",
        docb: () => {
          let cb = obj => {
            this.signadd(obj);
          };
          if (!this.openLocationcheck) {
            let obj = {
              code: 0,
              data: "",
              msg: ""
            };
            cb(obj);
            return;
          }
          Indicator.open(this.$mt("定位中"));
          if (process.env.NODE_ENV == "development") {
            this.moni(true);
          }
          this.nativegetgps(cb);
        }
      });
    },
    signadd(obj) {
      console.log("GPS  回调", obj);
      Indicator.close();
      if (obj.code == 0) {
        let res = obj.data;
        if (typeof res == "string") {
          if (res.substr(0, 1) == "{") {
            console.log("json str 解析");
            res = JSON.parse(res);
          }
        }
        let info = {
          gps: res
        };
        if (this.openLocationcheck) {
          info.gps.gpsdist = this.distance;
          info.distance = this.distance;
        }
        Indicator.open(this.$mt("开启中") + "...");
        let postdata = {};
        postdata.bankeid = this.bankeid;
        postdata.info = JSON.stringify(info);
        if (this.fromhudong) {
          postdata.usedaping = 1; //! 使用大屏的info
        }
        this.$http
          .post("/api/sign/signadd", postdata)
          .then(res => {
            if (res.data.code == 0) {
              this.openSignFn(res.data.data.sign);
            } else {
              Toast(this.$mt("开启签到失败") + ":" + res.data.msg);
            }
            Indicator.close();
          })
          .catch(() => {
            Toast(this.$mt("服务开小差了"));
            Indicator.close();
          });
      } else {
        Toast(this.$mt("定位失败,无法开启签到"));
      }
    },
    openSignFn(data) {
      console.log("教师打卡上课,", data);
      this.sid = data.id;
      let signData = data;
      this.curSignData = this.signresData = signData;
      this.popupShowSignRes = true;
      this.parseonesign(signData);
      this.signhistoryData.unshift(signData);
    },
    showSignresFn(v, init = false) {
      this.signresData = v;
      // if (v.id == this.curSignData.id) {
      //   if (v.state != this.curSignData.state) {
      //     this.signresData = { ...this.curSignData, ...v };
      //   }
      // }
      this.getsigninfo(this.signresData, init);
      this.popupShowSignRes = true;
    },
    onchangesigndata(v) {
      this.curSignData = this.signresData = { ...this.signresData, ...v };
      let temp = [];
      for (let item of this.signhistoryData) {
        if (item.id == v.id) {
          item = { ...item, ...v };
        }
        temp.push(item);
      }
      this.signhistoryData = temp;
    },
    oncance() {
      if (!this.signhistoryData.length) {
        this.signhistory();
      }
      if (this.popupdistanceconfig) {
        this.getlocadata();
      }
      this.popupShowSignRes = false;

      this.popupdistanceconfig = false;
    },
    getlocadata() {
      if (sessionStorage.getItem("distance")) {
        this.distance = sessionStorage.getItem("distance");
      }
      if (sessionStorage.getItem("checkgps")) {
        this.openLocationcheck = JSON.parse(sessionStorage.getItem("checkgps"));
      }
    },
    showsignhistoryFn() {
      if (this.signhistoryData.length) {
        this.showsignhistory = true;
        return;
      }
      this.signhistory();
    },
    parseonesign(v) {
      let splitTime = v.starttime.split(" ");
      v.date = splitTime[0];
      v.time = splitTime[1];
      v.week = Whatweek(v.date);
    },
    setdistance() {
      this.popupdistanceconfig = true;
    },
    finnalcb() {
      Toast(this.$mt("获取定位超时"));
      Indicator.close();
      this.getgpslongtime = true;
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
    moni(type) {
      let gps = {};
      if (type) {
        gps = {
          latitude: 102.112,
          longitude: 55.112
        };
      } else {
        gps = {
          latitude: 102.1123,
          longitude: 55.1123
        };
      }
      let tempobj = {
        data: {
          code: 0,
          data: gps,
          msg: ""
        },
        key: this.testkey
      };
      tempobj.data.data = JSON.stringify(tempobj.data.data);
      tempobj.data = JSON.stringify(tempobj.data);
      setTimeout(() => {
        nativebridge.nativecalled2("callcallback", tempobj);
      }, 2000);
    },
    downloadapp() {
      window.location.href = document.location.origin + "/download.html";
    },
    getsigninfo(tempdata, init = false) {
      if (tempdata.info && typeof tempdata.info == "string") {
        tempdata.info = JSON.parse(tempdata.info);
        if (tempdata.info.gps) {
          if (init) {
            this.Location = tempdata.info.gps;
          }
        }
        if (tempdata.info.gps.gpsdist) {
          if (init) {
            this.distance = tempdata.info.gps.gpsdist;
          }
        }
        if (tempdata.info.distance) {
          if (init) {
            this.distance = tempdata.info.distance;
          }
        }

        // if (tempdata.info.wifi) {
        //   if (init) {
        //     this.wifi = tempdata.info.wifi;
        //   }
        // }
        return;
      }
    },
    goback() {
      if (!this.showpage) {
        this.$router.push("/");
        return;
      }
      if (
        this.curSignData.state == 1 &&
        this.stuSignData.signnum == 0 &&
        this.ismember &&
        !this.master &&
        this.showsignhistory
      ) {
        this.showsignhistory = false;
        return;
      }
      if (
        this.curSignData.state >= 0 &&
        this.stuSignData.signnum > 0 &&
        this.ismember &&
        !this.master &&
        this.showsignhistory
      ) {
        this.showsignhistory = false;
        return;
      }
      if (this.showtipswrap && this.showsignhistory && !this.master) {
        this.showsignhistory = false;
        return;
      }
      if (this.urlhassid) {
        this.$confirm({
          msg: "离开签到页面",
          docb: () => {
            sessionStorage.setItem("fromsign", 1);
            let querydata = {
              path: "/",
              query: {}
            };
            if (this.teaurl) {
              if (nativebridge.apiversion >= 3 && nativecode.hasduoping()) {
                querydata.query = { selected: "hudong" };
              }
            }
            this.$router.push(querydata);
          }
        });
        return;
      }
      this.$back();
    }
  },
  components: { Signres, Empty, BottomLoadmore, DistanceConfig },
  destroyed() {}
};
</script>
<style lang='less' scoped>
.sign-warp {
  .main {
    margin-top: 50px;
    height: 100%;
    .top-state {
      background: #fff;
      padding: 20px 0px;
      ul {
        li {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          i {
            color: #e46100;
            &.ing {
              color: #0089ff;
            }
          }
        }
      }
    }
    .history-wrap {
      &.master {
        height: calc(100vh - 90px);
        min-height: calc(100vh - 90px);
      }
      .tips-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 38px;
        padding: 0 10px;
      }
      .list-wrap {
        background: #fff;
        height: calc(100vh - 205px);
        &.master {
          height: calc(100vh - 90px);
          .wrap {
            // height: calc(100vh - 90px);
          }
        }
        .wrap {
          // height: calc(100vh - 205px);
        }
        .item {
          position: relative;
          padding: 10px;
          border-bottom: 1px solid #f0f0f0;
          div {
            .fist {
              display: flex;
              justify-content: space-between;
              align-items: center;
              width: 95%;
              .l {
                width: calc(100% - 70px);
              }
              .r {
                width: 70px;
                text-align: right;
                padding-right: 10px;
              }
            }
            .time-date {
            }
          }
        }
        .icont {
        }
      }
    }

    .stu-wrap {
      width: 100%;
      height: calc(100vh - 50px);
      min-height: calc(100vh - 50px);
      .itemlists {
        min-height: calc(100vh - 50px);
        .icon {
          display: flex;
          align-items: center;
          font-size: 70px;
          margin-right: 5px;
        }
        .c-item {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .signitem {
          display: flex;
          justify-content: center;
          padding: 20px 0;
          width: 100%;
        }
        .nocansign {
          width: 230px;
          height: 230px;
          background: #0089ff;
          border-radius: 50%;
          flex-direction: column;
          align-items: center;
          color: #fff;
          opacity: 0.4;
        }
        .sign1 {
        }
      }
    }
    .histr {
      width: 90%;
      margin: 0 5%;
      text-align: center;
      border: 1px solid #0089ff;
      padding: 5px 0;
      border-radius: 5px;
    }
  }
  .cancecbclick {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    width: 100%;
  }
}
</style>