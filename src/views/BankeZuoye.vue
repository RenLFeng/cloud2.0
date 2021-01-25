<template>
  <div class="bankezy-wrap">
    <mt-header v-show="hasnavbar" :title="bankename" class="mint-header-f">
      <mt-button v-if="hasbackbtn" icon="back" slot="left" @click="goback">{{$mt('返回')}}</mt-button>
      <!-- <mt-button
        :disabled="!showslctionSubmit"
        v-if="tmpzuoyeslction && hasedit &&ZYType"
        slot="right"
        @click.native="xunlianstart"
      >{{$mt('发起训练')}}</mt-button>-->
      <!-- <mt-button @click="toyi" slot="right" style="margin-left:10px" v-if="canshow">统一训练</mt-button> -->
    </mt-header>
    <div class="controlpart tc" :class="{'nohasedit':!hasedit ||!ZYType,'cfrom':cfrom}">
      <div class="temp-wrap" v-if="hasedit">
        <ul class="controlbtn-wrap">
          <li
            class="font16 nowrap"
            :class="ZYType==v.id?'act colorf':''"
            v-for="(v, sindex) in SelectTypelist"
            :key="sindex"
            @click="onSelectType(v)"
          >
            <span class="ellipse">{{$mt(v.name)}}</span>
          </li>
        </ul>
        <span class="iconfont iconicon191 colora position-r" @click="onAdditem"></span>
      </div>

      <p class="filter-wrap font18" v-if="ZYType">
        <span
          :class="ZYState==v.id?'colord':''"
          v-for="(v, i) in filterZuoyelist"
          :key="i"
          @click="filterZuoye(v)"
        >{{$mt(v.name)}}</span>
      </p>
    </div>
    <!-- :bottom-method="loadMore"
        @bottom-status-change="handleBottomChange"
        :bottom-all-loaded="allLoaded"
        bottomPullText
    bottomDropText="上拉加载更多"-->
    <div
      class="zy-list-box bankezy-wrap-main overflow-scroll"
      :class="{'ku ZYType':!ZYType,'cfrom':cfrom,'cfrom':zuoyeslction,'nohasedit':!hasedit,'zuoyeslction':zuoyeslction}"
      v-infinite-scroll="loadMore"
      infinite-scroll-disabled="loading"
      infinite-scroll-distance="10"
      infinite-scroll-immediate-check="false"
    >
      <mt-loadmore
        :top-method="loadTop"
        :top-distance="80"
        @top-status-change="handleTopChange"
        ref="loadmore"
        :auto-fill="autofill"
        :topPullText="$mt('下拉刷新')"
        :topDropText="$mt('释放更新')"
        :topLoadingText="$mt('加载中')"
        class="zyloadmore"
      >
        <div class="devide"></div>
        <div
          class="list-wrap"
          :class="{'cfrom':courseid,'cfrom':zuoyeslction,'nohasedit':!hasedit}"
        >
          <div v-for="(zitem, sindex) in zuoyelist" :key="sindex" class="zuoye">
            <BankeZuoyeSimple
              :selection="tmpzuoyeslction"
              :ZYType="ZYType"
              :ZYState="ZYState"
              :zuoyeitem="zuoyelist[sindex]"
              :hasedit="hasedit"
              :tongyixl="zuoyeslction"
              v-if="showitem(zitem)"
              @editclick="onitemedit"
              @normalclick="onnormalclick"
              @fabuzy="onfabuzy"
              @selection="onselection"
            ></BankeZuoyeSimple>
          </div>
          <div class="tc position-c" v-show="canshowtipstxt">
            {{ $mt(tipstxt)}}
            <span
              v-if="!ZYType&&!zuoyelist.length"
              class="colord"
              @click="onAdditem"
            >{{$mt('马上创建')}}</span>
          </div>
          <!-- <div v-else>
            <p v-if="!tmpshowitems && ZYType">{{ZYState==100?$mt('无进行中的作业'):$mt('无结束作业')}}</p>
          </div>-->
        </div>
        <!-- 
        <div slot="top" class="mint-loadmore-top">
          <span v-show="topStatus !== 'loading'">{{ $mt('下拉刷新全部') }}</span>
          <span v-show="topStatus === 'loading'">{{ $mt('加载中') }}</span>
        </div>

        <div slot="bottom" class="mint-loadmore-bottom">
          <span v-show="bottomStatus === 'drop'">{{ $mt('上拉加载更多') }}</span>
          <span v-show="bottomStatus === 'loading'">{{$mt('加载中') }}</span>
        </div>-->
        <BottomLoadmore
          v-if="allLoaded && zuoyelist.length"
          showType
          loadtext="已经加载全部了"
          type
          color
        />
      </mt-loadmore>
    </div>

    <mt-actionsheet
      :actions="editmenudata"
      v-model="editmenuvisible"
      :cancelText="$mt('取消')"
      class="sheetdialog"
    ></mt-actionsheet>
    <mt-popup
      v-model="popupFabu"
      position="right"
      class="popup-right"
      :modal="false"
      style="background:#f0f0f0"
    >
      <Fabu v-if="popupFabu" :curzuoye="curzuoye" @calce="oncalce" :bankeid="bankeid" />
    </mt-popup>
    <mt-popup
      v-model="popupZuoye"
      position="right"
      class="popup-right"
      :modal="false"
      style="background:#f0f0f0"
    >
      <ZuoyeNew v-if="popupZuoye" @calce="oncalce" :bankeid="courseid" :cfrom="cfrom" />
    </mt-popup>
    <mt-popup
      v-model="popupZupaper"
      position="right"
      class="popup-right"
      :modal="false"
      style="background:#f0f0f0"
    >
      <Zupaperlist
        v-if="popupZupaper"
        @calce="oncalce"
        :bankeid="bankeid"
        @zuepSuccess="onzuepSuccess"
      />
    </mt-popup>
  </div>
</template>

 <script>
let SelectTypelist = [
  { id: 110, name: "已发布", act: true },
  { id: 0, name: "作业库", act: false }
];
let filterZuoyelist = [
  { id: 100, name: "进行中", act: true },
  { id: 10, name: "已结束", act: false }
];
import BankeZuoyeSimple from "./components/BankeZuoyeSimple";

import { Indicator, Toast, MessageBox, Actionsheet } from "mint-ui";

import commontools from "../commontools";
import { CollectionFn, getZYFileType, parseURL } from "@/util";
import nativebridge from "@/nativebridge";
import nativecode from "@/nativecode";
import BottomLoadmore from "@/common/bottom-loadmore";
const Fabu = () => import("@/views/banKeZuoye/fabu");
const Zupaperlist = () => import("@/views/banKeZuoye/zupaperlists");
const ZuoyeNew = () => import("@/views/ZuoyeNew");
export default {
  name: "BankeZuoye",
  props: {
    bankeid: {
      default() {
        return 0;
      }
    },
    courseid: {
      default() {
        return 0;
      }
    },
    bankename: {
      default: ""
    },
    cfrom: {
      default: false
    },
    newZouyeSuccess: {
      default: false
    },
    zuoyeslction: {
      default: ""
    }
  },
  data() {
    return {
      SelectTypelist,
      filterZuoyelist,
      // btnlist: !this.$store.getters.caneditbanke ? "btnlist" : "btnlist2",
      popupZupaper: false,
      zuoyelist: [],
      curzuoye: null,
      editmenuvisible: false,
      topStatus: "",
      bottomStatus: "",
      autofill: false,
      // hasedit: this.$store.getters.caneditbanke,
      page: 0,
      pagesize: 10,
      allLoaded: false,
      loading: false,
      ZYType: 110,
      // ZYState: 100,
      popupFabu: false,
      popupZuoye: false,

      addBtn: false,
      curtempid: 0,
      tmpselectionitems: [],
      selectionitem: null,
      tmpzuoyeslction: "",
      tmpshowitems: 0,
      allBankes: [],
      canshowtipstxt: false,
      slction: false
    };
  },
  computed: {
    tipstxt() {
      if (!this.zuoyelist.length) {
        if (!this.ZYType) {
          return "没有库存";
        }
        return "未找到发布过的作业";
      }

      let cou = 0;
      for (let v of this.zuoyelist) {
        if (this.ZYState == v.state) {
          cou++;
        }
      }
      if (!cou) {
        if (this.ZYType) {
          if (this.ZYState == 100) {
            return "未发布作业";
          } else {
            return "无结束作业";
          }
        }
      }
    },

    canshow() {
      return false;
      if (process.env.NODE_ENV == "development") {
        return true;
      }
      if (this.hasedit) {
        if (this.user.id == 1002) {
          return true;
        }
      }
      return false;
    },
    user() {
      return this.$store.getters.curuser;
    },
    showslctionSubmit() {
      if (this.tmpzuoyeslction) {
        if (this.selectionitem) {
          return true;
        }
      }
      return false;
    },
    ZYState() {
      return this.$store.state.zuoyeShowState;
    },
    hasedit() {
      if (nativecode.platform == "exsoftdaping") {
        return true;
      }
      let caneditbanke = this.$store.getters.caneditbanke;
      if (caneditbanke || this.cfrom) {
        return true;
      }
      return false;
    },
    caneditbanke() {
      let caneditbanke = this.$store.getters.caneditbanke;
      return caneditbanke;
    },
    hasnavbar() {
      return nativecode.hasnavbar();
    },
    hasbackbtn() {
      if (nativecode.platform == "exsoftdaping") {
        return false;
      }
      return true;
    },
    miniprogram() {
      if (nativecode.platform == "miniprogram") {
        return true;
      }
      return false;
    },
    isEN() {
      return this.$store.state.lang;
    },
    editmenudata() {
      var odatas = [];
      // console.log(this.curzuoye);
      if (this.addBtn) {
        let xl = [];
        xl.push({
          name: this.$mt("创建影视配音训练"),
          type: 12,
          subtype: "peiying",
          method: this.onAddXunlain
        });
        xl.push({
          name: this.$mt("创建听写训练"),
          type: 11,
          subtype: "tingxie",
          method: this.onAddXunlain
        });
        xl.push({
          name: this.$mt("创建发音训练"),
          type: 10,
          subtype: "fanyi",
          method: this.onAddXunlain
        });
        if (this.slction) {
          odatas = xl;
        } else {
          odatas.push({
            name: this.$mt("创建作业"),
            type: 0,
            subtype: "zuoye",
            method: this.onAddZuoye
          });
          for (let v of xl) {
            odatas.push(v);
          }
          if (process.env.NODE_ENV == "development") {
            odatas.push({
              name: this.$mt("新增考试"),
              type: 2,
              subtype: "exam",
              method: this.onAddExam
            });
            odatas.push({
              name: this.$mt("新增组卷考试"),
              type: 2,
              subtype: "exam",
              method: this.onAddZuepaper
            });
          }
          odatas.push({
            name: this.$mt("新建讨论"),
            type: 1,
            subtype: "discuss",
            method: this.onAddDiscuss
          });
        }
      } else {
        if (this.curzuoye) {
          if (nativecode.hassharecommon() && this.curzuoye.state > 0) {
            odatas.push({
              name: this.$mt("分享作业"),
              method: this.sharezuoye
            });
          }

          if (this.curzuoye.state == 100) {
            //!

            if (this.curzuoye.ztype == "2") {
              odatas.push({
                name: this.$mt("结束考试"),
                method: this.menustop,
                state: 10
              });
              odatas.push({
                name: this.$mt("结束阅卷"),
                method: this.menustop,
                state: 10
              });
            } else {
              odatas.push({
                name: this.$mt("结束"),
                method: this.menustop,
                state: 10
              });
            }
          } else if (this.curzuoye.state == 10) {
            odatas.push({
              name: this.$mt("删除"),
              method: this.menudel
            });
          } else {
            // odatas.push({
            //   name: this.$t("common.Strat"),
            //   method: this.menustart
            // });
            odatas.push({
              name: this.$mt("编辑"),
              method: this.menuedit
            });
            odatas.push({
              name: this.$mt("删除"),
              method: this.menudel
            });
          }
          if (this.curzuoye.state > 0) {
            //! 开始后才允许收藏
            odatas.push({
              name: this.$mt("收藏"),
              method: this.Collection
            });
          }
        }
      }

      return odatas;
    },
    unpublish() {
      if (this.ZYType) {
        return false;
      }
      return true;
    },
    zuoyeNewBackState() {
      return this.$store.state.zuoyeNewBackState;
    }
  },
  created() {
    const UrlParams = parseURL(window.location.href);
    if (UrlParams.slction) {
      this.slction = JSON.parse(UrlParams.slction);
    }
    this.bankequery();
    if (this.zuoyeslction) {
      this.tmpzuoyeslction = this.zuoyeslction;
      this.ZYType = 0;
      // this.$store.commit("SET_ZUOYE_SHOW_STATE", 100);
    }
    var d = this.$store.getters.getBankeData("zuoyelist", this.bankeid);
    if (d && d.zuoyelist && d.zuoyelist.length) {
      this.zuoyelist = commontools.clone(d.zuoyelist);
    }
    if (this.courseid) {
      this.$store.commit("SET_ZUOYE_CFROM", "coursehome");
    } else {
      this.$store.commit("SET_ZUOYE_CFROM", "");
    }
    if (this.zuoyeNewBackState) {
      if (this.zuoyeNewBackState == "1") {
        this.zuoyelist = [];
        this.ZYType = 0;
        this.doQueryZuoye(true);
      } else {
        this.doQueryZuoye(true);
      }
    } else {
      this.doQueryZuoye(true);
    }
  },
  methods: {
    Collection() {
      // console.log(this.curzuoye)
      let imgIcon = "zuoye";
      let title = this.curzuoye.name;
      let cobj = {};
      CollectionFn(
        cobj,
        3,
        imgIcon,
        this.curzuoye.id,
        this.curzuoye.ownerid,
        this,
        title
      );
    },
    onzuepSuccess(item) {
      this.popupZupaper = false;
      Toast(this.$mt("创建成功,请在作业库中发布"));
      this.changeZYType(0);
    },
    onfabuzy(zitem) {
      this.curzuoye = zitem;
      if (this.zuoyeslction) {
        this.$confirm({
          msg: "您确定要开始统一训练吗",
          docb: () => {
            this.publish();
          }
        });
        return;
      }
      this.popupFabu = true;
      if (this.curzuoye) {
        this.$store.commit("setBankeData", {
          modulename: "zuoyelist",
          bankeid: this.bankeid,
          fn: fobj => {
            fobj.editingZuoye = this.curzuoye;
          }
        });
      }

      // this.$store.commit("setBankeData", {
      //   modulename: "zuoyelist",
      //   bankeid: this.bankeid,
      //   fn: fobj => {
      //     fobj.editingZuoye = this.curzuoye;
      //   }
      // });
    },
    publish() {
      Indicator.open(this.$mt("开启中"));
      let bankeids = [];
      let bankeitems = [];
      for (let v of this.allBankes) {
        if (v.act) {
          bankeids.push(v.id);
          bankeitems.push({
            courseid: v.courseid,
            id: v.id,
            name: v.name
          });
        }
      }
      let updateinfo = {
        publishdesc: {
          bankeitems: bankeitems
        },
        submittime: this.curzuoye.hassubmittime ? this.curzuoye.submittime : "",
        hassubmittime: this.curzuoye.hassubmittime ? 1 : 0,
        allowpasstime: this.curzuoye.allowpasstime
          ? this.curzuoye.allowpasstime
          : 0
      };
      updateinfo.publishdesc = JSON.stringify(updateinfo.publishdesc);
      var url = "/api/api/zuoyepublish";
      this.$http
        .post(url, {
          zuoyeid: this.curzuoye.id,
          publishtobanke: bankeids,
          updateinfo: updateinfo
        })
        .then(res => {
          if (res.data.code == 0) {
            this.startxl(res.data.data.id);
          } else {
            Toast(this.$mt("开启失败") + res.data.msg);
          }
          Indicator.close();
        })
        .catch(() => {
          Indicator.close();
          Toast(this.$mt("连接服务失败"));
        });
    },
    bankequery() {
      let curbank = sessionStorage.getItem("curbanke");
      if (curbank) {
        curbank = JSON.parse(curbank);
        this.$http
          .post("/api/banke/bankequery", {
            where: {
              courseid: curbank.courseid
            }
          })
          .then(res => {
            if (res.data.code == 0) {
              let loadData = res.data.data;
              loadData = res.data.data.filter(item => {
                return item.states > 0;
              });
              for (let i = 0; i < loadData.length; i++) {
                let v = loadData[i];
                v.act = true;
              }
              this.allBankes = [...loadData, ...this.allBankes];
            }
          })
          .catch(err => {});
      }
    },
    onSelectType(v) {
      if (this.ZYType == v.id) return;
      if (!this.hasedit && !this.cfrom) {
        Toast(this.$mt("你无权限"));
        return;
      }
      this.changeZYType(v.id);
    },
    changeZYType(id) {
      this.canshowtipstxt = false;
      this.zuoyelist = [];
      this.ZYType = id;
      this.doQueryZuoye(true);
      this.selectionitem = null;
    },
    filterZuoye(v) {
      if (this.ZYState == v.id) return;
      this.$store.commit("SET_ZUOYE_SHOW_STATE", v.id);
    },
    showitem(zitem) {
      if (this.ZYType == 110) {
        if (this.ZYState == 100) {
          if (this.tmpzuoyeslction) {
            if (zitem.state == 100) {
              return zitem.ztype >= 10 && zitem.ztype < 13;
            }
          }
        }
        return zitem.state == this.ZYState;
      }
      if (this.ZYType == 0) {
        if (this.tmpzuoyeslction) {
          return zitem.ztype >= 10 && zitem.ztype < 13;
        }
        return zitem.state == 0;
      }
      return;

      if (!this.$store.getters.caneditbanke) {
        //! 学生
        if (useindex > 0) {
          useindex += 1;
        }
      }
      if (useindex == 0) {
        return true;
      }
      if (useindex == 1) {
        //! 未开始
        if (zitem.state == 0) {
          return true;
        }
      }
      if (useindex == 2) {
        //! 进行中
        if (zitem.state == 100) {
          return true;
        }
      }
      if (useindex == 3) {
        //! 已结束
        if (zitem.state == 10) {
          return true;
        }
      }
      return false;
    },
    onAdditem() {
      this.addBtn = true;
      this.editmenuvisible = true;
    },
    //新建作业
    onAddZuoye(v) {
      this.newzuoyeitem(v);
    },
    //新增训训练
    onAddXunlain(v) {
      this.newzuoyeitem(v);
    },
    //新增考试
    onAddExam(v) {
      this.newzuoyeitem(v);
    },
    //新增组卷考试
    onAddZuepaper() {
      this.popupZupaper = true;
    },
    //新建讨论
    onAddDiscuss(v) {
      this.newzuoyeitem(v);
    },
    newzuoyeitem(v) {
      let bankeid = this.bankeid;
      if (this.courseid) {
        bankeid = this.courseid;
      }
      this.$store.commit("setBankeData", {
        modulename: "zuoyelist",
        bankeid: bankeid,
        fn: fobj => {
          fobj.editingZuoye = null;
        }
      });
      this.$store.commit("setRouterForward", true);
      var url = "/zuoyenew/" + bankeid + "/" + v.type;
      this.$router.push(url);
      sessionStorage.setItem("zyitemType", JSON.stringify(v));
    },
    menustop(v) {
      this.domenuopt(v.state);
    },
    sharezuoye() {
      if (this.curzuoye) {
        nativecode.dosharecommon("zuoye", this.curzuoye.id, this.curzuoye.name);
      }
    },
    menudel() {
      this.$confirm({
        msg: "您确定要删除吗",
        docb: () => {
          this.$http
            .post("/api/azuoye/delete", { id: this.curzuoye.id })
            .then(res => {
              console.log(res);
              if (res.data.code == 0) {
                for (let i = 0; i < this.zuoyelist.length; i++) {
                  if (this.curzuoye.id == this.zuoyelist[i].id) {
                    this.zuoyelist.splice(i, 1);
                    return;
                  }
                }
                this.$alert({
                  msg: "删除成功"
                });
              } else {
                this.$alert({
                  msg: "失败"
                });
              }
            })
            .catch(() => {});
        }
      });
    },
    menustart() {
      this.domenuopt(100);
    },
    menuedit() {
      if (this.curzuoye) {
        console.log("方式打开了", this.curzuoye);
        this.$store.commit("setBankeData", {
          modulename: "zuoyelist",
          bankeid: this.bankeid,
          fn: fobj => {
            fobj.editingZuoye = this.curzuoye;
          }
        });
        this.$store.commit("setRouterForward", true);
        this.$router.push(
          "/zuoyenew/" + this.bankeid + "/" + this.curzuoye.ztype
        );
      }
    },
    menuresult() {
      if (this.curzuoye) {
        this.toResultView();
        //! 先加载，再跳转，避免次级界面跳跃
        // var zuoyeid = this.curzuoye.id;
        // var url = "/api/api/zuoyeresultquery?zuoyeid=" + zuoyeid;
        // Indicator.open(this.$t("Indicator.Loading"));
        // this.$http
        //   .post(url)
        //   .then(res => {
        //     Indicator.close();
        //     if (res.data.code == 0) {
        //       this.$store.commit("setBankeData", {
        //         modulename: "zuoyeresult",
        //         bankeid: zuoyeid,
        //         fn: fobj => {
        //           fobj.resultdata = res.data.data;
        //         }
        //       });
        //       this.toResultView();
        //     } else {
        //       Toast(res.data.msg);
        //     }
        //   })
        //   .catch(() => {
        //     Indicator.close();
        //     Toast("异常");
        //   });
      }
    },
    toResultView() {
      this.$store.commit("setRouterForward", true);
      this.$router.push("/zuoyeresult/" + this.curzuoye.id);
    },
    toyi() {
      this.tmpzuoyeslction = true;
    },
    xunlianstart() {
      this.$confirm({
        msg: "您确定要开始统一训练吗",
        docb: () => {
          this.startxl(this.selectionitem.id);
        }
      });
    },
    startxl(id) {
      let cmdobj = {
        cmd: "tongyistart",
        activitytype: 10,
        bankeid: this.bankeid,
        data: {
          xunlianid: id
        }
      };
      this.selectionitem = null;
      this.tmpzuoyeslction = "";
      for (let v of this.zuoyelist) {
        v.act = false;
      }
      if (!this.ZYType) {
        this.ZYType = 110;
        this.doQueryZuoye(true);
        this.$store.commit("SET_ZUOYE_SHOW_STATE", 100);
      }
      nativebridge.nativecalldp(cmdobj, true);
      let url = `/zuoyeresult/${id}?tongyixl=true`;
      this.$router.push(url);
      sessionStorage.setItem("tyxlid", id);
    },
    onselection(zyitem) {
      if (zyitem.act) {
        zyitem.act = false;
        this.selectionitem = null;
        return;
      }
      for (let v of this.zuoyelist) {
        v.act = false;
      }
      zyitem.act = true;
      this.selectionitem = zyitem;
    },
    onnormalclick(zitem) {
      if (this.tmpzuoyeslction) {
        if (this.ZYType == 110) {
          if (this.ZYState == 100) {
            this.selectionitem = zitem;
            this.xunlianstart();
            return;
          }
        }
      }
      this.curzuoye = zitem;
      if (!this.curzuoye.state) {
        this.editmenuvisible = true;
        // this.$store.commit("SET_FOOTER_BAR_STATE", false);
        // this.menuedit();
      } else {
        this.menuresult();
      }
    },
    domenuopt(nstateto) {
      let tyxlid = sessionStorage.getItem("tyxlid") || "";
      if (this.curzuoye) {
        let doopt = () => {
          Indicator.open(this.$mt("处理中"));
          this.$http
            .post("/api/api/bankezuoyesetstate", {
              zuoyeid: this.curzuoye.id,
              state: nstateto
            })
            .then(res => {
              Indicator.close();
              if (res.data.code == 0) {
                for (let item of this.zuoyelist) {
                  if (item.id == this.curzuoye.id) {
                    item.state = nstateto;
                    return;
                  }
                }
                // commontools.arrayMergeAsIds(this.zuoyelist, res.data.data);
              } else {
                Toast(res.data.msg);
              }
            })
            .catch(() => {
              Indicator.close();
            });
        };
        if (tyxlid && this.curzuoye.id == tyxlid) {
          this.$confirm(
            {
              msg: "当前作业是统一训练,确定要结束吗",
              docb: () => {
                doopt();
                let cmdobj = {
                  cmd: "tongyistop",
                  activitytype: 10,
                  bankeid: this.bankeid,
                  data: {}
                };
                nativebridge.nativecalldp(cmdobj, true);
              }
            },
            false
          );
          return;
        }
        if (nstateto == 10) {
          let tips = `${this.$mt("结束作业")}？\r\n${this.$mt(
            "结束后学生不可再提交"
          )}`;
          if (this.curzuoye.ztype == "1") {
            tips = `${this.$mt("结束讨论")}？\r\n${this.$mt(
              "结束后将不可再提交"
            )}`;
          }
          this.$confirm(
            {
              msg: tips,
              docb: () => {
                doopt();
              }
            },
            false
          );
        } else {
          doopt();
        }

        //!
        //this.curzuoye.state = nstateto;
      }
    },
    onitemedit(zitem) {
      this.curzuoye = zitem;
      this.editmenuvisible = true;
      this.$store.commit("SET_FOOTER_BAR_STATE", false);
    },
    loadTop() {
      this.allLoaded = false;
      this.loading = false;
      this.doQueryZuoye(true);
    },
    loadMore() {
      this.loading = true;
      this.doQueryZuoye(false);
    },
    handleTopChange(status) {
      this.topStatus = status;
    },
    handleBottomChange(status) {
      this.bottomStatus = status;
      console.log(status);
    },
    doQueryZuoye(ball) {
      let bankeid = this.bankeid;
      var url = "/api/api/bankezuoyequery?bankeid=" + bankeid;
      if (this.cfrom) {
        bankeid = 0;
        url =
          "/api/api/bankezuoyequery?bankeid=" +
          bankeid +
          "&courseid=" +
          this.courseid;
      }
      if (!ball) {
        if (this.zuoyelist.length) {
          var lasti = this.zuoyelist[this.zuoyelist.length - 1];
          url += "&topzuoyeid=" + lasti.id;
        }
      }
      this.$http
        .post(url, {
          unpublish: this.unpublish
        })
        .then(res => {
          if (ball) {
            this.$refs.loadmore.onTopLoaded();
          } else {
            this.$refs.loadmore.onBottomLoaded();
          }
          if (res.data.code == 0) {
            if (!res.data.data.length) {
              this.allLoaded = true;
              this.loading = true;
            } else {
              this.loading = false;
            }
            let zlist = res.data.data;
            for (let v of zlist) {
              v.act = false;
              if (v.publishdesc == null) {
                v.publishdesc = { bankeitems: [] };
              } else if (v.publishdesc && v.publishdesc != null) {
                v.publishdesc = JSON.parse(v.publishdesc);
              }
              v.eventmsgs = false; //! 预创建member
            }
            if (ball) {
              //! clear cur all
              // this.zuoyelist = [];  //! cjy: 这里清空会导致vue界面闪烁（呈现为无item的界面）
              //! 这里需要清空， 否则遗留上个班课或上个账户的作业
              //  this.zuoyelist = zlist;
            } else {
              //    commontools.arrayMergeAsIds(this.zuoyelist, zlist);
            }

            let ids = [];
            for (let v of res.data.data) {
              ids.push(v.id);
            }
            this.eventmsgsOnactivity(res.data.data, ids, ball);
          } else {
            this.canshowtipstxt = true;
          }
          this.$store.commit("SET_ZYNEW_BACK_STATE", 0);
        })
        .catch(() => {
          this.canshowtipstxt = true;
          // this.appendzlist(res.data.data, ball);
          // this.$store.commit("SET_ZYNEW_BACK_STATE", 0);
        });
    },
    //红点查询
    eventmsgsOnactivity(serverData, eventids, ball) {
      if (serverData.length == 0) {
        this.canshowtipstxt = true;
        return;
      }
      let obj = {};
      serverData = serverData.reduce((cur, next) => {
        obj[next.id] ? "" : (obj[next.id] = true && cur.push(next));
        return cur;
      }, []);
      this.$http
        .post("/api/eventmsgs/onactivity", {
          bankeid: this.bankeid,
          eventtype: 3,
          eventids: [...eventids]
        })
        .then(res => {
          if (res.data.code == "0") {
            for (let v of serverData) {
              for (let id of res.data.data) {
                if (v.id == id) {
                  v.eventmsgs = true;
                }
              }
            }
            console.log("红点查询", res.data.data);
          } else {
          }
          this.canshowtipstxt = true;
          this.appendzlist(serverData, ball);
        })
        .catch(err => {
          this.canshowtipstxt = true;
          this.appendzlist(serverData, ball);
        });
    },
    appendzlist(serverData, ball) {
      if (ball) {
        this.zuoyelist = serverData;
      } else {
        commontools.arrayMergeAsIds(this.zuoyelist, serverData);
      }
      this.showitemnb(this.ZYState);
    },
    oncalce(v) {
      this.popupFabu = false;
      this.popupZuoye = false;
      this.popupZupaper = false;
      if (v == "zuoyeCreate") {
        this.ZYType = 0;
        this.doQueryZuoye(true);
      }
      if (v == "success") {
        this.ZYType = 110;
        this.$store.commit("SET_ZUOYE_SHOW_STATE", 100);
        // this.ZYState = 100;
        this.doQueryZuoye(true);
      }
    },
    goback() {
      let cfrompage = this.$store.state.fabuRenwuClick;
      if (cfrompage) {
        this.$router.go(-1);
      } else {
        if (this.cfrom) {
          this.$emit("calce", true);
        } else {
          if (this.miniprogram) {
            this.$router.replace("/");
          } else {
            this.$router.go(-1);
          }
        }
      }
    },
    showitemnb(state) {
      this.tmpshowitems = 0;
      for (let v of this.zuoyelist) {
        if (v.state == state) {
          this.tmpshowitems++;
        }
      }
    }
  },
  destroyed() {
    this.$store.commit("setBankeData", {
      modulename: "zuoyelist",
      bankeid: this.bankeid,
      fn: zobj => {
        zobj.zuoyelist = this.zuoyelist;
      }
    });
  },
  watch: {
    ZYState(nv, olv) {
      this.showitemnb(nv);
    },
    editmenuvisible(nv, olv) {
      if (nv) {
        this.$store.commit("SET_FOOTER_BAR_STATE", true);
      }
    },
    editmenuvisible(v, ol) {
      if (!v) {
        this.addBtn = false;
      }
    }
  },
  components: {
    BankeZuoyeSimple,
    BottomLoadmore,
    [Actionsheet.name]: Actionsheet,
    Fabu,
    ZuoyeNew,
    Zupaperlist
  }
};
</script>
 <style scoped>
.sheetdialog {
  z-index: 99999;
}
.controlbtn {
  width: 25%;
  border: none;
  color: #0089ff;
  font-size: 18px;
  height: 40px;
  margin-top: 0px;

  background: rgba(0, 0, 0, 0);

  padding: 10px;

  display: inline-block;

  outline: none;
}
.isEn {
  font-size: 14px !important;
}
.controlbtnthree {
  width: 33.33%;
}

.controlbtnactive {
  background-color: #0089ff;
  color: white;

  border-radius: 13px;
}
</style>
<style lang="less" scoped>
.bankezy-wrap {
  .mint-header-f {
    margin-bottom: 50px;
  }
  .controlpart {
    // position: fixed;
    // left: 0;
    // top: 48px;
    width: 100%;
    height: 126px;
    &.nohasedit {
      height: 60px;
    }
    &.cfrom {
      margin-top: 48px;
    }
    .temp-wrap {
      position: relative;
      display: flex;
      height: 66px;
      background: #fff;
      align-items: center;
      justify-content: center;
      .iconfont {
        font-size: 30px;
        font-weight: bold;
      }
      .controlbtn-wrap {
        width: 192px;
        height: 40px;
        display: flex;
        border: 1px solid rgba(0, 137, 255, 1);
        border-radius: 20px;
        li {
          display: flex;
          width: 50%;
          height: 100%;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
          span {
            width: 100%;
            padding: 0 5px;
          }
          &.act {
            background: #0089ff;
          }
        }
      }
    }
    .filter-wrap {
      display: flex;
      height: 60px;
      background: #f9f9f9;
      span {
        width: 50%;
        height: 100%;
        align-items: center;
        display: flex;
        justify-content: center;
        border-bottom: 3px solid #fff;
        &.colord {
          border-bottom: 3px solid #0089ff;
        }
      }
    }
  }
  .zy-list-box {
    height: calc(100vh - 263px);
    min-height: calc(100vh - 263px);
    .devide {
      height: 6px;
    }
    .list-wrap {
      min-height: calc(100vh - 263px);
      .zuoye {
        background: #fff;
      }
    }
    &.zuoyeslction {
      min-height: calc(100vh - 171px);
      .list-wrap {
        min-height: calc(100vh - 217px);
      }
    }
    &.ku {
      height: calc(100vh - 196px);
      min-height: calc(100vh - 196px);
    }
    &.cfrom {
      height: calc(100vh - 175px);
      min-height: calc(100vh - 175px);
    }
    &.cfrom.ZYType {
      height: calc(100vh - 108px);
      min-height: calc(100vh - 108px);
    }
    &.nohasedit {
      height: calc(100vh - 196px);
      min-height: calc(100vh - 196px);
    }
  }
}
</style>