<template>
  <div class="big-main" v-if="isLoad && showpage">
    <mt-header :title="$mt(mytitle)">
      <mt-button icon="back" slot="left" @click="Backs">{{$mt('返回')}}</mt-button>
      <mt-button
        class="text-ellipsis mergetit"
        slot="right"
        v-if="showmergetit"
        @click="onmerge"
      >{{$mt(mergetit)}}</mt-button>
      <mt-button slot="right" v-if="showsubmitSele" @click="submitSele">{{$mt('确定')}}</mt-button>
    </mt-header>
    <div v-if="showselect">
      <div v-if="!hasselect" class="hasselect" :class="ismergeClick?'ismergeClick':''">
        <p v-if="ismergeClick" class="tips">
          {{$mt('请选择一个或多个班课进行合班教学')}}。
          <span
            class="font-xxs"
            style="display:block;color:#999"
            v-if="!isCodeLogin"
          >{{$mt('提示')}}：{{$mt('至少选择一个自己的班课')}}</span>
        </p>
        <ul class="merge-wrap clearfix" v-if="ismergeClick">
          <li
            class="item fl tc"
            :class="v.isact?'isact':''"
            v-for="(v,i) in tabs"
            :key="i"
            @click="tbaClick(v)"
          >{{$mt(v.name)}}</li>
        </ul>
        <div
          class="banke-wrap overflow-scroll"
          ref="listcontainer"
          v-infinite-scroll="loadMore"
          infinite-scroll-disabled="loading"
          infinite-scroll-distance="10"
          infinite-scroll-immediate-check="false"
        >
          <div class v-if="!ismergeClick">
            <p v-if="selecmergebanke.length" class="tips">
              {{$mt('当前合班班课')}}:
              <TextEllipsis
                :text="selecmergebanks"
                :height="60"
                :isLimitHeight="isLimitHeight"
                class="zatextmain word-wrap colord"
              >
                <template slot="more">
                  <span class>...</span>
                  <span class="zatextviewmore" @click="isLimitHeight=false">{{$mt('查看更多')}}</span>
                </template>
                <span
                  slot="after"
                  class="zatextviewmore"
                  v-if="!isLimitHeight"
                  @click="isLimitHeight=true"
                >
                  <span class="zatextviewmore">{{$mt('收起')}}</span>
                </span>
              </TextEllipsis>
            </p>
            <div v-if="!isCodeLogin">
              <div v-for="(item,i) in curbankes" :key="i" class="querybanke">
                <BankeSimple
                  class="bitem-shadow"
                  :classitem="item"
                  :isCreate="false"
                  :showEditicon="false"
                  @click.native="onbankeclick(item)"
                ></BankeSimple>
              </div>
              <!-- <div
                class="paret-class-wrap"
                v-for="(item,selindex) in curCourses"
                :key="selindex"
                :class="`index${selindex}`"
              >
                <BankeSimple :classitem="item" :isCreate="true" cfrom="big"></BankeSimple>
                <div class="subclass-wrap">
                  <div
                    class="subclass"
                    v-for="(v,i) in filterCourseBanke (item.id)"
                    :key="i"
                    @click="onbankeclick(v)"
                  >
                    <p class="stit color0 font18 ellipse">{{v.name}}</p>
                    <p
                      class="ggao position-c colory font-xxs ellipse tc"
                      v-if="v.info"
                    >公告:&nbsp;{{v.info}}</p>
                    <div class="sinfo-r">
                      <span class="colora font-xxs ellipse membernum">{{v.membernum}}人</span>
                    </div>
                  </div>
                </div>
              </div>
              <BankeSimple
                class="bitem-shadow"
                v-for="(citem,i) in NoCourseidBanke()"
                :key="i+'_index'"
                :classitem="citem"
                :isCreate="true"
                cfrom="big"
                @click.native="onbankeclick(citem)"
              ></BankeSimple>-->
            </div>
          </div>
          <div class v-else>
            <div v-for="(item,i) in mergeBankes" :key="i" class="querybanke">
              <BankeSimple
                class="bitem-shadow"
                :classitem="item"
                :isCreate="false"
                :selection="true"
                @selectionClick="onSelectionClick"
              ></BankeSimple>
            </div>
          </div>
          <BottomLoadmore
            v-if="showLoadtips"
            :showType="Loadtipsobj.showType"
            :loadtext="Loadtipsobj.loadtext"
          />
          <p
            class="position-c color9"
            v-if="!mergeBankes.length && this.ismergeClick"
          >{{$mt('未找到班课')}}...</p>
        </div>
        <mt-button
          class="submitSele"
          :class="hasselemybanke?'hasselemybanke':''"
          v-if="!isCodeLogin"
          @click="startmerge"
        >{{$mt('开始上课')}}</mt-button>
      </div>
      <div v-else>
        <Login
          :bankeItem="selectbanke"
          :ecode="ecode"
          @login="onLogin"
          :mergebankeids="mergebankeids"
        />
      </div>
    </div>
    <div v-else>
      <div v-if="isLogin" class="isLogin">
        <div class="tc no-class empty">
          <i class="iconfont icondapingmu fontmaintitle" @click="sinOut"></i>
          <p class style="color:#000">{{$mt('已登录到大屏')}}</p>
          <div class style="color:#000">
            <p>{{userInfo.mac}}</p>
            <p>{{userInfo.name}}</p>
          </div>
          <p>{{$mt('下课后请及时退出大屏登录')}}</p>
          <div class="button-worp">
            <mt-button class="button-auto-87" @click="Backs">{{$mt('我知道了')}}</mt-button>
          </div>
          <div class="button-worp2">
            <mt-button class="button-auto-87" @click="sinOut">{{$mt('退出大屏')}}</mt-button>
          </div>
        </div>
      </div>
      <div v-else>
        <p v-if="selecmergebanke.length" class="tips">
          {{$mt('当前合班班课')}}:
          <TextEllipsis
            :text="selecmergebanks"
            :height="60"
            :isLimitHeight="isLimitHeight"
            class="zatextmain word-wrap colord"
          >
            <template slot="more">
              <span class>...</span>
              <span class="zatextviewmore" @click="isLimitHeight=false">{{$mt('查看更多')}}</span>
            </template>
            <span
              slot="after"
              class="zatextviewmore"
              v-if="!isLimitHeight"
              @click="isLimitHeight=true"
            >
              <span class="zatextviewmore">{{$mt('收起')}}</span>
            </span>
          </TextEllipsis>
        </p>
        <Login :bankeid="bankeid" @login="onLogin" :mergebankeids="mergebankeids" />
      </div>
    </div>
  </div>
</template>

<script>
import { Indicator, Toast, MessageBox } from "mint-ui";
import Login from "./login";

import BankeEnd from "@/views/my/bankeEnd";

import { parseURL } from "@/util";
import nativecode from "@/nativecode";
import BankeSimple from "@/views/components/BankeSimple";
import BottomLoadmore from "@/common/bottom-loadmore";
import TextEllipsis from "@/views/components/TextEllipsis";
import nativebridge from "@/nativebridge";
export default {
  name: "BigLogin",
  components: {
    Login,
    BankeSimple,
    BottomLoadmore,
    TextEllipsis
  },
  data() {
    return {
      isLoad: false,
      userInfo: {},
      isLogin: false,
      bankeid: 0,
      ecode: 0,
      showselect: false,
      hasselect: false,
      curCourses: [],
      curbankes: [],
      tempcurbankestate: {},
      selectbanke: null,
      selfsel: false,
      queryschool: false,
      tabs: [
        {
          id: 1,
          name: "自己班课",
          isact: true,
          page: 0,
          listLoadend: false,
          allLoaded: false,
          loading: false,
          scrollTop: 0
        },
        {
          id: 100,
          name: "学校班课",
          isact: false,
          page: 0,
          listLoadend: false,
          allLoaded: false,
          loading: false,
          scrollTop: 0
        }
      ],
      ismergeClick: false,
      mergeBankes: [],
      mergebankeids: [],
      selecmergebanke: [],

      page: 0,
      pagesize: 10,
      allLoaded: false,
      loading: false,
      listLoadend: false,
      isLimitHeight: true,

      isCodeLogin: true,

      myCreateBankes: [],
      schoolBankes: [],
      schoolloaded: false,
      customserver: false,
      showpage: true
    };
  },
  mounted() {
    console.log("big login URL", window.location.href);
    Indicator.open(this.$mt("加载中"));
    if (sessionStorage.getItem("customserver")) {
      this.customserver = JSON.parse(sessionStorage.getItem("customserver"));
    }

    // if (!this.canshowpage) {
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
    const UrlParams = parseURL(window.location.href);
    if (UrlParams.ecode) {
      this.ecode = UrlParams.ecode;
      this.showselect = true;
      this.selfsel = true;
    }
    let params = this.$route.params;
    if (params.bankeid) {
      this.bankeid = params.bankeid;
    }
    if (!this.showselect) {
      this.dapingquery();
    } else {
      this.isCodeLogin = false;
      this.isLoad = true;
      this.initbanke();
    }
  },
  computed: {
    canshowpage() {
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
    hasselemybanke() {
      for (let v of this.myCreateBankes) {
        if (v.isAct && !this.isCodeLogin) {
          return true;
        }
      }
      return false;
    },
    showmergetit() {
      if (this.ismergeClick && !this.isCodeLogin) {
        return false;
      } else {
        if (this.showsubmitSele) {
          return false;
        }
        return true;
      }
    },
    showsubmitSele() {
      let str = false;
      for (let v of this.myCreateBankes) {
        if (v.isAct) {
          str = true;
        }
      }
      for (let v of this.schoolBankes) {
        if (v.isAct) {
          str = true;
        }
      }
      if (str && this.isCodeLogin && this.ismergeClick) {
        return true;
      }
      return false;
    },
    user() {
      return this.$store.getters.curuser;
    },
    selecmergebanks() {
      let str = "";
      if (this.selecmergebanke.length) {
        for (let key in this.selecmergebanke) {
          key = JSON.parse(key);
          let item = this.selecmergebanke[key];
          str += item.name;
          if (key < this.selecmergebanke.length - 1) {
            str += "、";
          }
        }
        return str;
      }
      return "";
    },

    showLoadtips() {
      if (this.ismergeClick) {
        if (
          (!this.allLoaded && this.loading) ||
          (this.allLoaded && this.listLoadend && this.mergeBankes.length)
        ) {
          return true;
        }
        return false;
      } else {
        if (
          (!this.allLoaded && this.loading) ||
          (this.allLoaded && this.listLoadend)
        ) {
          return true;
        }
        return false;
      }
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
          loadtext: "加载中..."
        };
      }
      return obj;
    },
    mergetit() {
      if (this.selectbanke) {
        return this.selectbanke.name;
      } else {
        if (this.ismergeClick) {
          return "取消";
        }
        return "合班教学";
      }
    },
    mytitle() {
      if (this.showselect) {
        if (!this.hasselect) {
          if (this.ismergeClick) {
            return "合班教学-选择班课";
          }
          return "大屏登录";
        }
        if (!this.isLogin) {
          return "登录确认";
        }
      }
      if (this.isLogin) {
        return "已登录";
      }
      {
        return "大屏登录";
      }
    }
  },
  methods: {
    onmerge() {
      if (this.hasselect) return;
      this.ismergeClick = !this.ismergeClick;
      if (this.isCodeLogin) {
        this.showselect = true;
      }
      if (!this.isCodeLogin) {
        this.setprestate(this.ismergeClick);
      }
      if (this.ismergeClick) {
        for (let v of this.tabs) {
          v.isact = false;
        }
        this.tabs[0].isact = true;

        this.queryschool = false;
        let item = this.tabs[0];
        this.page = item.page;
        this.listLoadend = item.listLoadend;
        this.allLoaded = item.allLoaded;
        this.loading = item.loading;

        if (this.myCreateBankes.length) {
          this.mergeBankes = this.myCreateBankes;
        } else {
          this.loadInit();
          this.loadMore();
        }
      } else {
        if (this.isCodeLogin) {
          this.showselect = false;
          this.mergebankeids = [];
          this.selecmergebanke = [];
        }
      }
    },
    savScorllState() {
      this.curCourseState.page = this.page;
      this.curCourseState.allLoaded = this.allLoaded;
      this.curCourseState.loading = this.loading;
      this.curCourseState.listLoadend = this.listLoadend;
    },
    tbaClick(item) {
      if (item.isact) return;
      let listcontainer = this.$refs.listcontainer;
      for (let v of this.tabs) {
        if (v.isact) {
          v.scrollTop = listcontainer.scrollTop;
        }
        v.isact = false;
      }

      item.isact = true;
      this.queryschool = !this.queryschool;
      this.page = item.page;
      this.listLoadend = item.listLoadend;
      this.allLoaded = item.allLoaded;
      this.loading = item.loading;

      this.$nextTick(() => {
        listcontainer.scrollTop = item.scrollTop;
      });
      if (this.queryschool) {
        if (this.schoolBankes.length) {
          this.mergeBankes = this.schoolBankes;
          return;
        }
        if (this.schoolloaded) {
          this.mergeBankes = this.schoolBankes;
          return;
        }
        this.initbanke();
      } else {
        if (this.myCreateBankes.length) {
          this.mergeBankes = this.myCreateBankes;
          return;
        }
        this.initbanke();
      }
    },
    onbankeclick(bankeitem) {
      console.log(bankeitem);
      this.selectbanke = bankeitem;
      this.hasselect = true;
      this.ismergeClick = false;
    },
    loadMore() {
      this.loading = true;
      this.initbanke();
    },
    initbanke() {
      var url = "/api/api/bankequery2";
      let postData = {
        page: this.page,
        pagesize: this.pagesize
      };
      if (this.ismergeClick) {
        url = "/api/banke/queryschoolbanke";
        if (this.queryschool) {
          postData.queryschool = this.queryschool;
        }
      }
      this.$http
        .post(url, postData)
        .then(res => {
          if (res.data.code == 0) {
            let serbankes = [];
            let courses = [];
            if (this.ismergeClick) {
              serbankes = res.data.data;
            } else {
              serbankes = res.data.data.bankes;
              courses = res.data.data.courses;
            }
            if (serbankes.length >= this.pagesize) {
              this.loading = false;
              this.page++;
            } else {
              if (this.page) {
                this.listLoadend = true;
              }
              this.loading = true;
              this.allLoaded = true;
            }

            if (this.ismergeClick) {
              for (let v of serbankes) {
                v.isAct = false;
              }
              let templatebankes = [];
              let temp = [];
              if (!this.queryschool) {
                this.myCreateBankes = [...this.myCreateBankes, ...serbankes];
                templatebankes = this.myCreateBankes;
              } else {
                // serbankes[1].userid = 2006;
                // serbankes[2].userid = 2007;
                // serbankes[3].userid = 2008;
                // serbankes[1].id = 6;
                // serbankes[2].id = 7;
                // serbankes[3].id = 8;
                temp = serbankes.filter(item => item.userid != this.user.id);
                this.schoolBankes = [...this.schoolBankes, ...temp];
                templatebankes = this.schoolBankes;
                if (!this.allLoaded) {
                  this.initbanke();
                }
              }
              for (let v of this.tabs) {
                if (v.isact) {
                  v.page = this.page;
                  v.listLoadend = this.listLoadend;
                  v.allLoaded = this.allLoaded;
                  v.loading = this.loading;
                }
              }
              if (this.queryschool && this.allLoaded) {
                this.schoolloaded = true;
              }
              this.mergeBankes = templatebankes;
            } else {
              courses = courses.filter(item => item.userid == this.user.id);
              serbankes = serbankes.filter(item => item.userid == this.user.id);
              for (let citem of courses) {
                citem.username = this.user.name;
              }
              let curbans = [];
              for (let v of serbankes) {
                if (v.ismaster) {
                  curbans.push(v);
                }
              }
              this.curbankes = [...this.curbankes, ...curbans];
              this.curCourses = [...this.curCourses, ...courses];
            }
          } else {
            Toast(this.$mt("请求数据失败"));
          }
        })
        .catch(res => {
          Toast(this.$mt("服务开小差了"));
        });
    },
    filterCourseBanke(cid) {
      return this.curbankes.filter(function(item) {
        return item.courseid == cid;
      });
    },
    NoCourseidBanke() {
      return this.curbankes.filter(function(item) {
        return !item.courseid;
      });
    },
    onSelectionClick(v) {},
    startmerge() {
      if (!this.hasselemybanke) {
        Toast(this.$mt("至少选择一个自己的班课"));
        return;
      }
      this.mergebankeids = [];
      let myselectbnakes = [];
      for (let v of this.schoolBankes) {
        if (v.isAct) {
          this.selecmergebanke.push(v);
          this.mergebankeids.push(v.id);
        }
      }
      let mybankes = [];
      for (let v of this.myCreateBankes) {
        if (v.isAct) {
          this.mergebankeids.push(v.id);
          mybankes.push(v.id);
        }
      }
      this.mergebankeids = this.mergebankeids.filter(v => v != mybankes[0]);
      console.log("mergebankeids", this.mergebankeids);
      this.dapinglogin(mybankes[0]);
    },
    dapinglogin(v) {
      let bid = v;
      if (!v) {
        bid = this.bankeid;
      }
      if (bid == 0) {
        Toast(this.$mt("当前班课无效,请返回重试"));
        return;
      }
      let postData = {
        code: this.ecode,
        bankeid: bid,
        logininfo: {
          sign: true
        }
      };
      if (this.mergebankeids.length) {
        postData.mergebankeids = this.mergebankeids;
      }
      this.$http
        .post("/api/banke/dapinglogin", postData)
        .then(res => {
          if (res.data.code == "0") {
            this.onLogin(res.data.data.daping);
            Toast(this.$mt("登录成功"));
            const UrlParams = parseURL(window.location.href);
            // if (UrlParams.ecode) {
              if (nativebridge.apiversion >= 3 && nativecode.hasduoping()) {
                this.$router.push({
                  path: "/",
                  query: { selected: "hudong" }
                });
              }
            // }
          } else {
            Toast(this.$mt("登录错误") + "：" + res.data.msg);
          }
        })
        .catch(err => {
          Toast(this.$mt("异常") + err);
        });
    },
    submitSele() {
      this.mergebankeids = [];
      this.selecmergebanke = [];
      for (let v of this.schoolBankes) {
        if (v.isAct) {
          this.selecmergebanke.push(v);
          this.mergebankeids.push(v.id);
        }
      }
      for (let v of this.myCreateBankes) {
        if (v.isAct) {
          this.selecmergebanke.push(v);
          this.mergebankeids.push(v.id);
        }
      }
      this.ismergeClick = false;
      if (this.isCodeLogin) {
        this.showselect = false;
      }
      this.setprestate(false);
    },
    dapingquery() {
      Indicator.open(this.$mt("加载中") + "...");
      this.$http
        .post("api/banke/dapingquery", {})
        .then(res => {
          if (res.data.code == "0" && res.data.data) {
            this.isLogin = true;
            this.userInfo = res.data.data.daping;
            console.log("大屏查询", res);
          }
          this.isLoad = true;
          Indicator.close();
        })
        .catch(err => {
          this.isLoad = true;
          Toast(this.$mt("异常"));
          Indicator.close();
        });
    },
    sinOut() {
      this.$confirm({
        msg: "您确定要退出大屏吗",
        docb: () => {
          Indicator.open(this.$mt("加载中") + "...");
          this.$http
            .post("api/banke/dapinglogout", {})
            .then(res => {
              if (res.data.code == "0") {
                Toast(this.$mt("退出成功"));
                if (this.selfsel) {
                  //! 直接返回主页； 当前非在某一班课中
                  this.$router.push("/");
                } else {
                  this.isLogin = false;
                }

                console.log("退出", res);
              } else {
                Toast(this.$mt("退出失败"));
              }
              Indicator.close();
            })
            .catch(err => {
              Toast(this.$mt("异常"));
              Indicator.close();
            });
        }
      });
    },
    onLogin(v) {
      this.isLogin = true;
      this.userInfo = v;
      this.showselect = false;
    },
    Backs() {
      if (this.showselect) {
        if (this.isCodeLogin) {
          this.$back();
          return;
        }
        if (this.ismergeClick) {
          this.onmerge();
          this.mergebankeids = [];
          for (let v of this.schoolBankes) {
            v.isAct = false;
          }
          for (let v of this.myCreateBankes) {
            v.isAct = false;
          }
          return;
        }
        if (!this.isLogin && this.hasselect) {
          this.selectbanke = null;
          this.hasselect = false;
          return;
        }
      } else {
        if (this.isCodeLogin) {
          this.$back();
          return;
        } else {
        }
        //! 这里小程序跳转可能有问题，强制跳转 主页
        this.$router.push("/");
        return;
      }

      if (this.selfsel) {
        //! 直接扫码大屏登录的。
        this.$router.push("/");
        return;
      }

      this.$back();
    },
    loadInit() {
      this.mergeBankes = [];
      this.mergebankeids = [];
      this.selecmergebanke = [];
      this.page = 0;
      this.loading = false;
      this.listLoadend = false;
      this.allLoaded = false;
    },
    setprestate(type) {
      if (type) {
        let listcontainer = this.$refs.listcontainer;
        let prevTop = listcontainer.scrollTop;
        this.tempcurbankestate.prevTop = prevTop;
        this.tempcurbankestate.page = this.page;
        this.tempcurbankestate.allLoaded = this.allLoaded;
        this.tempcurbankestate.loading = this.loading;
        this.tempcurbankestate.listLoadend = this.listLoadend;
      } else {
        this.page = this.tempcurbankestate.page;
        this.allLoaded = this.tempcurbankestate.allLoaded;
        this.loading = this.tempcurbankestate.loading;
        this.listLoadend = this.tempcurbankestate.listLoadend;

        let listcontainer = this.$refs.listcontainer;
        this.$nextTick(() => {
          listcontainer.scrollTop = this.tempcurbankestate.prevTop;
        });
      }
    },
    downloadapp() {
      window.location.href = document.location.origin + "/download.html";
    }
  }
};
</script>

<style scoped lang="less">
.big-main {
  .hasselect {
    position: relative;
    height: 93vh;
    &.ismergeClick {
      height: calc(93vh - 103px);
    }
    .merge-wrap {
      border-bottom: 1px solid #e5e5e5;
      .item {
        width: 50%;
        height: 45px;
        line-height: 45px;
        &.isact {
          color: #0089ff;
          font-size: 18px;
          border-bottom: 2px solid;
        }
      }
    }
    .banke-wrap {
      height: 100%;
    }
  }

  .isLogin {
    height: 100vh;
    min-height: 100vh;
    p {
      margin: 5px 0;
    }
    .button-worp {
      margin-top: 30px;
      button {
        background: #0089ff;
        color: #fff;
      }
    }
    .button-worp2 {
      margin-top: 30px;
      button {
        color: #0089ff;
        background: none;
      }
    }
  }
  .tips {
    padding: 10px;
  }
  .paret-class-wrap {
    width: 95%;
    margin: 0 auto;
    margin-bottom: 10px;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
    border-radius: 10px;
    background: #fff;
    .subclass-wrap {
      padding: 0 10px;
      .subclass {
        position: relative;
        width: 100%;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 0.02667rem solid #f0f0f0;
        padding-right: 24px;
        .stit {
          width: 30%;
        }
        .ggao {
          width: 40%;
        }
        .sinfo-r {
          width: 16%;
          text-align: right;
          .membernum {
            display: block;
            width: 100%;
          }
          .iconfont {
            font-size: 26px;
            right: 0;
            top: 32px;
          }
        }
      }
    }
    &.paret-class-wrap.index0 {
      margin-top: 10px;
    }
  }
  .mergetit {
    width: 100px;
    text-align: right;
  }
  .submitSele {
    position: absolute;
    bottom: -95px;
    background: rgba(0, 0, 0, 0.4);
    color: #fff;
    width: 45%;
    height: 50px;
    left: 50%;
    transform: translate(-50%, 0px);
  }
  .submitSele.hasselemybanke {
    background: #0089ff;
  }
  .querybanke {
    margin: 10px auto;
    width: 95%;
  }
}
</style>
