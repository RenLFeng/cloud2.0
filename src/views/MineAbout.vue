<template>
  <div class="baout-main">
    <div class="avatarpart">
      <div v-if="islogined" @click="onmine">
        <img
          :src="user.avatar"
          :onerror="$defaultImg('account')"
          class="avatarimgpart avatar position-l"
        />
        <div class="avatartextpart position-l">
          <div class="fontsmall namepart ellipse">{{user.name}}</div>
          <!--  cjy： 账户信息暂时隐藏？
          <div class="fontsmall accountpart colora">{{$mt('账户')}}:{{useraccount}}</div>
          -->
          <!-- <i class="iconfont iconcellyoucejiantou position-r"></i> -->
        </div>
        <i class="iconfont iconcellyoucejiantou position-r"></i>
      </div>
      <div v-else class="no-Login">
        <img src :onerror="$defaultImg('account')" class="avatarimgpart avatar position-l" />
        <div
          class="fontsmall namepart ellipse position-c"
          @click.stop="goLogin"
        >{{$mt('未登陆')}}，{{$mt('点击登陆')}}</div>
      </div>
    </div>
    <div class="min-wrap">
      <div v-if="islogined">
        <div class="devide"></div>
        <mt-cell :title="$mt('我的收藏')" is-link @click.native="seeCollection"></mt-cell>
        <mt-cell :title="$mt('已结束班课')" is-link @click.native="queryfinished"></mt-cell>
        <mt-cell :title="$mt('清除所有消息提示')" is-link @click.native="clearEvnet"></mt-cell>
        <div class="devide"></div>
        <mt-cell :title="$mt('学校绑定')" is-link @click.native="bindSchool"></mt-cell>
        <div class="devide"></div>
        <mt-cell :title="$mt('个人学情')" is-link @click.native="MyXueQing"></mt-cell>
        <!-- <mt-cell  title="绑定账户" is-link  @click.native="onbindaccount"></mt-cell> -->
        <!--  cjy: 绑定账户功能暂时隐藏
    <mt-cell v-if="canbindaccount" title="绑定账户" is-link @click.native="onbindaccount"></mt-cell>
        -->
        <!-- <div class="devide"></div>
        <mt-cell :title="$mt('设置')" is-link @click.native="onset"></mt-cell>-->

        <div class="devide"  v-if="!weiximiniprogram"></div>
        <mt-cell :title="$mt('退出')" v-if="!weiximiniprogram" is-link @click.native="onlogout"></mt-cell>
        <!-- <div class="devide"></div>
        <mt-cell :title="$mt('下载语言包')" is-link @click.native="fanyi"></mt-cell>-->
        <div class="devide" v-if="weiximiniprogram"></div>
        <mt-cell v-if="weiximiniprogram" :title="$mt('扫一扫')" is-link @click.native="scanCode"></mt-cell>
        <div class="devide"></div>
        <mt-cell v-if="weiximiniprogram" :title="$mt('消息订阅')" is-link @click.native="onMessage"></mt-cell>
      </div>
      <div class="devide"></div>
      <mt-cell :title="$mt('关于')" v-if="!weiximiniprogram" is-link @click.native="onabout"></mt-cell>
      <div class="devide" v-if="!islogined"></div>
      <van-collapse v-model="collapseAct" v-if="showlang">
        <van-collapse-item
          title="Lang"
          name="1"
          title-class="iconfont iconcellyoucejiantou vancollapse"
        >
          <p
            class="lang-item"
            :class="$i18n.locale==item.type?'act':''"
            v-for="(item,index) in lagelists"
            :key="index"
            @click="selectLange(item)"
          >{{item.name}}</p>
        </van-collapse-item>
      </van-collapse>
    </div>

    <mt-popup v-model="popupBind" position="right" class="mint-popup-3" :modal="false">
      <mt-header :title="$mt('绑定账户')">
        <mt-button slot="left" icon="back" @click="bindBack">{{$mt('返回')}}</mt-button>
      </mt-header>

      <div class="binddiv">
        <div v-show="!shownewaccount" class="title fontnormal">{{$mt('当前绑定账户')}}：{{bindaccount}}</div>
        <!-- cjy: 微信端限制为只能生成登陆账户， 不再提供绑定功能
        <div class="btn-wrap">
          <mt-button
            class
            :class="bindaction=='changebind'?'act':''"
            v-show="!shownewaccount"
            @click="uibindaction('changebind')"
          >更改绑定</mt-button>
          <mt-button
            v-show="!shownewaccount"
            :class="bindaction=='changepassword'?'act':''"
            @click="uibindaction('changepassword')"
          >修改密码</mt-button>
          <mt-button
            v-show="shownewaccount"
            :class="bindaction=='uibindactionchangebind'?'act':''"
            @click.native="uibindactionchangebind('uibindactionchangebind')"
          >新增账户绑定</mt-button>
          <mt-button
            v-show="shownewaccount"
            :class="bindaction=='newaccount'?'act':''"
            @click="uibindaction('newaccount')"
          >生成登陆账户</mt-button>
        </div>
        -->
        <div v-show="showbindpanel">
          <div class="tit">{{bindtitle}}</div>
          <div v-show="bindaction != 'changepassword'" class="input-item-wrap">
            <mt-field
              :label="$mt('账户')+':'"
              :placeholder="$mt('请输入账户名')"
              v-model="inputaccount"
              @blur.native.capture="$setInputScroll"
            ></mt-field>
          </div>
          <div class="input-item-wrap">
            <mt-field
              :label="$mt('密码')"
              :placeholder="$mt('设置密码')"
              type="password"
              v-model="inputpassword"
              @blur.native.capture="$setInputScroll"
            ></mt-field>
          </div>
          <div class="button-worp">
            <mt-button class="button-auto-87 b" @click="uibindsubmit">{{$mt('提交')}}</mt-button>
          </div>
          <div>{{bindstatedesc}}</div>
        </div>
      </div>
    </mt-popup>
    <!-- <mt-popup v-model="popupBankeEnd" position="right" class="mint-popup-3" :modal="false">
      <mt-header title="已结束班课" class="mint-header-f">
        <mt-button slot="left" icon="back" @click="Backs">{{$mt('返回')}}</mt-button>
      </mt-header>
      <BankeEnd :curbankes="curbankes"></BankeEnd>
    </mt-popup>-->
    <mt-popup v-model="popupAbout" position="right" class="mint-popup-3" :modal="false" style>
      <mt-header :title="$mt('关于')" class>
        <mt-button slot="left" icon="back" @click="Backs">{{$mt('我的')}}</mt-button>
      </mt-header>
      <About />
    </mt-popup>
  </div>
</template>

<script>
import Vue from "vue";
import commontools from "@/commontools";
import { Indicator, Toast, MessageBox } from "mint-ui";
import nativecode from "../nativecode";
import nativebridge from "@/nativebridge";
import BankeEnd from "./my/bankeEnd";
import About from "./my/about";
import Collapse from "vant/lib/collapse";
import CollapseItem from "vant/lib/collapse-item";
import { lagelists } from "@/langs/index";
import "vant/lib/collapse/style";
import "vant/lib/collapse-item/style";
Vue.use(Collapse);
Vue.use(CollapseItem);
export default {
  name: "MineAbout",
  data() {
    return {
      lagelists,
      popupBind: false,
      bindaccount: "",
      showbindpanel: true,
      inputaccount: "",
      inputpassword: "",
      bindaction: "changebind",
      bindstatedesc: "",
      bindtitle: "",

      popupBankeEnd: false,
      curbankes: [],
      popupAbout: false,
      collapseAct: ["0"]
    };
  },
  components: {
    BankeEnd,
    About
  },
  created() {
    this.$store.commit("SET_CLOUD_BAR", false);
  },

  computed: {
    showlang() {
      if (process.env.NODE_ENV === "production") {
        if (this.weiximiniprogram) {
          return true;
        }
        if (nativebridge.apiversion >= 3) {
          return false;
        }
      }
      return true;
    },
    haslogout() {
      return nativecode.haslogout();
    },
    shownewaccount() {
      if (this.bindaccount.length > 0) {
        return false;
      }
      return true;
    },
    canbindaccount() {
      return nativecode.canbindaccount();
    },
    isTeacher() {
      return this.$store.getters.isteacher;
    },
    user() {
      return this.$store.getters.curuser;
    },
    islogined() {
      //  return false;
      let u = this.$store.getters.curuser;
      //console.log(u);
      if (u && u.id) {
        return true;
      }
      return false;
    },
    useraccount() {
      let u = this.$store.getters.curuser;
      if (u.accountid == 1 || u.accountid == 2) {
        return this.$mt("微信账户");
      }
      return u.account;
    },
    defaultImage() {
      var srcstr = 'this.src="';
      srcstr += "/assets/account_default.png";
      srcstr += '"';
      return srcstr;
    },
    weiximiniprogram() {
      if (nativecode.platform == "miniprogram") {
        return true;
      }
      return false;
    }
  },
  methods: {
    handleChange() {},
    //收藏
    seeCollection() {
      this.$store.commit("setRouterForward", true);
      this.$router.push({
        name: "Collection",
        params: {}
      });
    },
    onadd() {
      var isteacher = this.$store.getters.isteacher;
      if (isteacher) {
        //! 跳转新增课堂
        this.$store.commit("setRouterForward", true);
        this.$router.push("/bankenew");
      } else {
        //! 跳转搜索课堂
        Toast(this.$mt("加入课堂") + this.$mt("暂未实现"));
      }
      // this.$emit("changeSelected", "banke");
    },
    selectLange(item) {
      if (item.type == this.$i18n.locale) return;
      const langurl = nativecode.getDomainUrl(`/lang_${item.type}.json`);
      commontools.loadlang(this.$http, langurl, this.$i18n, item.type);
      nativecode.jsFn("changeLang", {
        data: { lang: item.code }
      });
    },
    onlogout: function() {
      if (!this.$store.getters.islogin) {
        this.$store.commit("setRouterForward", true);
        this.$router.push("/login");
        return;
      }
      this.$confirm({
        msg: "您确定要退出当前账户吗",
        docb: () => {
          this.dologout();
        }
      });
    },
    bindBack() {
      this.popupBind = false;
      this.$store.commit("SET_CLOUD_BAR", false);
    },
    uibindsubmit: function() {
      var url = "/api/weixin/changebind";
      this.bindstatedesc = this.$mt("处理中") + "...";
      this.$http
        .post(url, {
          action: this.bindaction,
          account: this.inputaccount,
          password: this.inputpassword
        })
        .then(res => {
          this.bindstatedesc = this.$mt("完成");
          if (res.data.code == 0) {
            if (res.data.data && res.data.data.id) {
              //! id发生了改变
              this.bindaccount = res.data.data.account;
              this.$store.commit("setLoginUser", res.data.data);
            } else if (res.data.data && res.data.data.length > 0) {
              //! 新账户
              this.bindaccount = res.data.data;
            }
          } else {
            this.bindstatedesc = res.data.msg;
          }
        })
        .catch(() => {
          this.bindstatedesc = this.$mt("异常");
        });
    },
    uibindactionchangebind: function(sza) {
      this.bindaction = sza;
      this.uibindaction("changebind");
    },
    uibindaction: function(sza) {
      console.log("uibindaction");
      this.bindaction = sza;
      this.bindtitle = "";
      this.bindstatedesc = "";
      this.inputaccount = "";
      this.inputpassword = "";
      if (this.shownewaccount) {
        if (sza == "newaccount") {
          this.bindtitle = this.$mt("创建平台登陆用账户");
        } else if (sza == "changebind") {
          this.bindtitle = this.$mt("新增账户绑定");
        }
      } else {
        if (sza == "changepassword") {
          this.bindtitle = this.$mt("修改密码");
        } else {
          this.bindtitle = this.$mt("更改绑定");
        }
      }
      this.showbindpanel = true;
    },

    onbindaccount: function() {
      Indicator.open(this.$mt("加载中") + "...");
      // this.popupBind = true;
      var url = "/api/weixin/querybind";
      this.$http
        .post(url)
        .then(res => {
          Indicator.close();
          if (res.data.code == 0) {
            if (res.data.data) {
              this.bindaccount = res.data.data;
              //this.bindaction = 'changepassword';
              this.uibindaction("changepassword");
            } else {
              this.bindaccount = "";
              //  this.bindaction = 'newaccount'
              this.uibindaction("newaccount");
            }
            this.showbindpanel = true;
            this.popupBind = true;
            this.$store.commit("SET_CLOUD_BAR", true);
          }
        })
        .catch(() => {
          Indicator.close();
        });
    },
    dologout: function() {
      var url = "/api/api/logout";
      this.$http.post(url).then(() => {
        //! 清空本地账户信息
        this.$store.commit("setLoginUser", {});
        this.$store.commit("setRouterForward", true);
        this.$store.commit("banke/REMOV_BANKES", []);
        this.$router.push("/login");
        commontools.removeSeStorageItem();
        nativecode.jsLogin(0, {});
      });
    },
    onset: function() {
      // Toast("暂未实现");
    },
    bindSchool() {
      this.$store.commit("setRouterForward", true);
      this.$router.push({
        // name: "BindSchool",
        name: "BindSchoolList", //! cjy: 这里直接跳转到schoollist即可
        params: {}
      });
    },
    MyXueQing() {
      this.$store.commit("setRouterForward", true);
      this.$router.push({
        name: "MyXueQing",
        params: {}
      });
    },
    fanyi() {
      let url = "http://192.168.1.133:9982/fanyi.html";
      if (process.env.NODE_ENV !== "development") {
        url = document.location.origin;
        url += "/fanyi.html";
      }
      console.log(url);
      window.location.href = url;
    },
    onabout: function() {
      this.$store.commit("SET_CLOUD_BAR", true);
      this.popupAbout = true;
      // Toast("暂未实现");
    },
    scanCode() {
      nativecode.navigateToScan();
    },
    onMessage() {
      nativecode.navigateToMsg();
    },
    //清除提示
    clearEvnet() {
      this.$confirm({
        msg: "清除所有消息提示",
        docb: () => {
          Indicator.open(this.$mt("加载中") + "...");
          this.$http
            .post("/api/eventmsgs/clear", {})
            .then(res => {
              if (res.data.code == "0") {
                this.$emit("clearevnt", true);
                Toast(this.$mt("清除成功"));
              } else {
                Toast(this.$mt("清除失败"));
              }
              Indicator.close();
            })
            .catch(err => {
              Toast(this.$mt("服务异常"));
              Indicator.close();
            });
        }
      });
    },
    //查询已结束班课
    queryfinished() {
      this.$store.commit("setRouterForward", true);
      this.$router.push({
        name: "EndClass",
        params: {}
      });
      // this.$store.commit("SET_CLOUD_BAR", true);
      // this.popupBankeEnd = true;
      // Indicator.open("加载中...");
      // this.$http
      //   .post("/api/banke/queryfinished", {
      //      page: 0,
      //     pagesize: 10
      //   })
      //   .then(res => {
      //     if (res.data.code == "0") {
      //       console.log(res);
      //       if (res.data.data.length) {
      //         this.curbankes = res.data.data;
      //       } else {
      //         Toast("无数据");
      //       }
      //       this.$store.commit("SET_CLOUD_BAR", true);
      //       this.popupBankeEnd = true;
      //     } else {
      //       Toast("出错了");
      //     }
      //     Indicator.close();
      //   })
      //   .catch(err => {
      //     Toast("服务异常...");
      //     Indicator.close();
      //   });
    },
    onmine: function() {
      if (!this.islogined) {
        nativecode.navigateToLogin(this);
        return;
      }
      this.$store.commit("setRouterForward", true);
      this.$router.push("/mineinfo");
    },
    goLogin() {
      this.$store.commit("setRouterForward", true);
      this.$router.push("/login");
    },
    Backs() {
      if (this.popupBankeEnd) {
        this.popupBankeEnd = false;
        this.$store.commit("SET_CLOUD_BAR", false);
      }
      if (this.popupAbout) {
        this.popupAbout = false;
        this.$store.commit("SET_CLOUD_BAR", false);
      }
    }
  }
};
</script>

<style scoped>
.baout-main {
  /* padding-bottom: 50px; */
}
.my-cell-allow-right::after {
  border: solid 2px #c8c8cd;
  border-bottom-width: 0;
  border-left-width: 0;
  content: " ";
  top: auto;
  right: 20px;
  position: absolute;
  width: 5px;
  height: 5px;

  margin-top: 3px;

  transform: translateY(50%) rotate(45deg);
}

.baout-main .avatarimgpart {
  width: 76px;
  height: 76px;
}

.accountpart {
  margin-top: 5px;
}
.baout-main .namepart {
  margin-top: 10px;
}

.baout-main .avatartextpart {
  width: calc(100% - 150px);
  margin-left: 100px;
  color: #1c1c1c;
}
.baout-main .iconfont {
  color: #a8a8a8;
  right: 16px;
  font-weight: 600;
}

.baout-main .avatarpart {
  position: relative;
  height: 119px;
  padding: 10px;
  background: #fff;
}
.baout-main .avatarpart > .no-Login {
  width: 100%;
  height: 100%;
  position: relative;
}
.baout-main .avatarpart > .no-Login .namepart {
  margin-top: 0;
}
</style>
<style>
.mint-cell-wrapper {
  background-image: none !important;
}
.mint-cell-wrapper > i {
}
.mint-cell-wrapper > i::after {
  height: 10px !important;
  width: 10px !important;
  border-color: #a8a8a8 !important;
}
.mint-cell {
  border-bottom: 1px solid #f0f0f0;
}
.mint-cell-title {
  color: #1c1c1c;
}
.min-wrap {
  height: calc(100vh - 200px);
  overflow: auto;
  background: #f0f0f0;
}
</style>


<style scoped lang="less">
.binddiv {
  padding: 0 10px;
  .title {
    margin: 20px 0;
  }
  .tit {
    margin: 10px 0;
  }
  .btn-wrap {
    border: 1px solid #0089ff;
    border-radius: 30px;
    button {
      width: 50%;
      color: #0089ff;
      border-radius: 30px;
      background: none;
      border: none;
      &.act {
        background: #0089ff;
        color: #fff;
      }
    }
  }
  .input-item-wrap {
    border-bottom: 1px solid #e5e5e5;
  }
  .button-worp {
    margin-top: 50px;
  }
}
</style>
<style>
.van-cell {
  padding: 12px 10px !important;
  color: #1c1c1c !important;
}
.vancollapse.iconcellyoucejiantou:before {
  position: absolute;
  right: 5px;
  background: #fff;
  width: 25px;
  z-index: 10;
  color: #a8a8a8;
  font-weight: bold;
}
.van-collapse-item__content {
  padding: 0 15px;
}
.van-collapse-item__content .lang-item {
  padding: 6px 0;
  color: #282828;
}
.van-collapse-item__content .lang-item.act {
  color: #0089ff;
}
</style>