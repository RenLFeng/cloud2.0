<template>
  <div class="course-wrap">
    <mt-header :title="courseName" class="mint-header-f my-height gl" @click.native="guanlikec">
      <mt-button icon="back" slot="left" @click="back()">{{$mt('返回')}}</mt-button>
    </mt-header>
    <div class="main main-f-2">
      <ul class="tit-wrap">
        <li class="item" v-for="(v,i) of tititems" :key="i" @click="selectClick(v)">
          <!-- <span class="icon" :class="`iconfont ${v.iconfont}`"></span> -->
          <img class="icon" :src="v.iconfont" alt />
          <span class="text font16 ellipse">{{$mt(v.text)}}</span>
        </li>
      </ul>
      <div class="banji-wrap">
        <p class="add-tit">
          <span class="font18 colora">{{$mt('班级')}}</span>
          <span class="iconfont iconicon191 fr colora fontlarge24" @click="newBanke"></span>
        </p>
        <div
          class="list-wrap overflow-scroll"
          v-infinite-scroll="loadMore"
          infinite-scroll-disabled="loading"
          infinite-scroll-distance="10"
          infinite-scroll-immediate-check="false"
        >
          <mt-loadmore
            :top-method="loadTop"
            :top-distance="80"
            ref="loadmore"
            :auto-fill="autofill"
            :topPullText="$mt('下拉刷新')"
            :topDropText="$mt('释放更新')"
            :topLoadingText="$mt('加载中')"
            :class="!allBankes.length?'fileempty':''"
          >
            <!-- v-if="v.inclass" -->
            <div v-if="allBankes.length" class="all-ankes">
              <div class="item" v-for="(v,i) of allBankes" :key="i" @click="bankeDedail(v)">
                <div class="info">
                  <div class="content">
                    <p class="ellipse" style="text-align: right;">{{v.membernum}}{{$mt('人')}}</p>
                    <p class="tit font18 ellipse color0">
                      {{v.name}}
                      <span v-if="v.inclass" class="inclass ellipse">{{$mt('正在上课')}}</span>
                    </p>
                    <p class="ellipse b" style="text-align: right;">{{$mt('班级号')}}: {{v.id}}</p>
                    <!-- <div class="right-info font-xxs position-r">
                      <p class="colora position-t ellipse t"></p>
                      <p class="position-b ellipse b">{{$mt('班级号')}}: {{v.id}}</p>
                    </div>-->
                    <p
                      class="ggao font-xxs colory ellipse"
                      v-if="v.info"
                    >{{$mt('公告')}}:&nbsp;{{v.info}}</p>
                  </div>
                </div>
                <i class="iconfont iconcellyoucejiantou position-r fontnormal colora"></i>
              </div>
              <BottomLoadmore
                v-if="allLoaded && listLoadend"
                showType
                :loadtext="$mt('已经加载全部了')"
                type
                color
              />
              <BottomLoadmore
                v-if="!allLoaded && loading"
                showType="loading"
                :loadtext="$mt('加载中')+'...'"
                type="triple-bounce"
                color
              />
            </div>
            <Empty v-else />
          </mt-loadmore>
        </div>
      </div>
    </div>
    <mt-popup
      v-model="popupGuanlikc"
      position="right"
      class="popup-right"
      :modal="false"
      style="background:#f0f0f0"
    >
      <div class="kc-gl-wrap">
        <mt-header :title="$mt('课程管理')" class="my-height mint-header-f">
          <mt-button icon="back" slot="left" @click="popupGuanlikc=false">{{$mt('返回')}}</mt-button>
        </mt-header>
        <div class="main main-f-2">
          <div class="tit-wrap-g">
            <div class="left-info">
              <img :src="curcourse.avatar" class="avatar" :onerror="$defaultImg('account')" />
              <div class="text-wrap color0">
                <p class="ellipse fontnormal">{{curcourse.name}}</p>
                <p class="ellipse font16">{{$mt('教师')}}: {{curcourse.username}}</p>
              </div>
            </div>
            <i class="iconfont position-r iconbianji colord" @click="edi"></i>
          </div>
          <div class="margin" @click="edBk">
            <mt-cell :title="$mt('归档课程')" class="f00"></mt-cell>
          </div>
          <p class="colora">{{$mt('课程归档后无法发布资源,创建作业等,但仍可以查看已发布的资源,已结束的作业等')}}</p>
        </div>
      </div>
    </mt-popup>
    <mt-popup
      v-model="popupNewbanke"
      position="right"
      class="popup-right"
      :modal="false"
      style="background:#f0f0f0"
    >
      <div class="new-banke-wrap">
        <mt-header :title="$mt('创建班级')" class="my-height">
          <mt-button icon="back" slot="left" @click="popupNewbanke=false">{{$mt('返回')}}</mt-button>
          <mt-button slot="right" @click="onsave" :disabled="savedisable">{{$mt('创建')}}</mt-button>
        </mt-header>
        <div class="main" style="margin-top:10px">
          <mt-field :placeholder="$mt('请输入班级名称')" v-model="classitem.name"></mt-field>
        </div>
      </div>
    </mt-popup>
    <mt-popup
      v-model="popupCoursezy"
      position="right"
      class="popup-right"
      :modal="false"
      style="background:#f0f0f0"
    >
      <div class="zy-main">
        <BankeZiyuan
          v-if="popupCoursezy"
          :courseid="courseid"
          :hasbackbtn="hasbackbtn"
          :allBankes="allBankes"
          :bankename="$mt('课程资源')"
          :cfrom="true"
          :selectxunlianfile="xunlianfile"
          @calce="oncalce"
        ></BankeZiyuan>
      </div>
    </mt-popup>
    <mt-popup
      v-model="popupCoursezuoye"
      position="right"
      class="popup-right"
      :modal="false"
      style="background:#f0f0f0"
    >
      <BankeZuoye
        :courseid="courseid"
        v-if="popupCoursezuoye"
        :bankename="$mt('作业')"
        @calce="oncalce"
        :cfrom="true"
        :newZouyeSuccess="newZouyeSuccess"
      ></BankeZuoye>
    </mt-popup>
    <mt-popup
      v-model="popupCouresNew"
      position="right"
      class="popup-right"
      :modal="false"
      style="background:#f0f0f0"
    >
      <CouresNew
        :courseid="courseid"
        v-if="popupCouresNew"
        :curcourse="curcourse"
        :cfrom="true"
        @ediend="onediend"
        @calce="oncalce"
      ></CouresNew>
    </mt-popup>
  </div>
</template>
<script>
const BankeZiyuan = () => import("@/views/BankeZiyuan");
const Empty = () => import("@/common/empty");
const BankeZuoye = () => import("@/views/BankeZuoye");
const CouresNew = () => import("@/views/couresNew");
import { parseURL } from "@/util";
import nativecode from "@/nativecode";
import { MessageBox, Indicator, Toast } from "mint-ui";
const tititems = [
  // {
  //   id: 1,
  //   text: "教案",
  //   iconfont: "iconwangyelianjie"
  // },
  {
    id: 2,
    text: "课程资源",
    iconfont: require("../../assets/course_zy.svg")
  },
  {
    id: 3,
    text: "作业",
    iconfont: require("../../assets/course_zouy.svg")
  },
  {
    id: 4,
    text: "统计",
    iconfont: require("../../assets/course_tj.svg")
  }
];
export default {
  name: "coursehome",
  props: {
    courseid: {
      default: 0
    },
    frompage: {
      default: ""
    },
    coures: {
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      allBankes: [],
      tititems,
      popupGuanlikc: false,
      popupNewbanke: false,
      popupCoursezy: false,
      classitem: {
        name: "",
        avatar: "",
        type: "",
        ordernum: null,
        courseid: this.courseid
      },
      pagesize: 20,
      page: 0,
      loading: false,
      listLoadend: false,
      allLoaded: false,
      autofill: false,
      curcourse: null,

      popupCoursezuoye: false,
      popupCouresNew: false,
      cfrompage: {},
      newZouyeSuccess: false
    };
  },
  computed: {
    hasbackbtn() {
      if (nativecode.platform == "exsoftdaping") {
        return false;
      }
      return true;
    },
    courseName() {
      if (this.curcourse) {
        return this.curcourse.name;
      }
      return "课程ID" + this.courseid;
    },
    savedisable() {
      if (this.classitem.name.length > 0) {
        return false;
      }
      return true;
    },
    curcourses() {
      return this.$store.state.banke.curcourses;
    },
    zuoyeNewBackState() {
      return this.$store.state.zuoyeNewBackState;
    }
  },
  created() {
    let curcourse = sessionStorage.getItem("curcourse") || "";
    if (curcourse) {
      this.curcourse = JSON.parse(curcourse);
      if (this.curcourse.id != this.courseid) {
        this.coursequery(this.courseid);
      }
    } else {
      this.coursequery(this.courseid);
    }
    this.bankequery();
    if (this.zuoyeNewBackState) {
      this.popupCoursezuoye = true;
    }
    this.xunlianfile = sessionStorage.getItem("xunlianfile") || 0;
  },
  mounted() {},
  watch: {},
  methods: {
    coursequery(id) {
      this.$http
        .post("/api/course/query", {
          where: {
            id: id
          }
        })
        .then(res => {
          if (res.data.code == "0") {
            if (res.data.data.length) {
              let serveData = res.data.data;
              this.curcourse = serveData[0];
              sessionStorage.setItem(
                "curcourse",
                JSON.stringify(this.curcourse)
              );
            }
          } else {
          }
        })
        .catch(err => {});
    },
    edBk() {
      var url = "/api/course/add";
      let twoconfirm = () => {
        this.$confirm({
          msg: "归档后,只能查阅,不可再开始该班课,是否继续",
          docb: () => {
            this.$http
              .post(url, {
                id: this.curcourse.id,
                states: 0
              })
              .then(res => {
                if (res.data.code == "0") {
                  let coursers = JSON.parse(
                    JSON.stringify(this.$store.state.banke.curcourses)
                  );
                  coursers = coursers.filter(v => {
                    return v.id != res.data.data.id;
                  });
                  this.$store.commit("banke/setCourse", coursers);
                  this.$router.push("/");
                } else {
                  Toast(this.$mt("操作失败"));
                }
              })
              .catch((err = {}));
          }
        });
      };
      this.$confirm({
        msg: "确定要归档吗",
        docb: twoconfirm
      });
    },
    edi() {
      this.popupCouresNew = true;
    },
    onediend(v) {
      this.curcourse.name = v.name;
      this.curcourse.avatar = v.avatar;
      this.popupCouresNew = false;
    },
    loadTop() {
      this.loading = false;
      this.listLoadend = false;
      this.allLoaded = false;
      this.page = 0;
      this.allBankes = [];
      this.loadMore();
    },
    loadMore() {
      this.loading = true;
      this.bankequery();
    },
    bankequery() {
      Indicator.open(this.$mt("加载中") + "...");
      this.$http
        .post("/api/banke/bankequery", {
          where: {
            courseid: this.courseid,
            states: 10
          },
          page: {
            pagesize: this.pagesize,
            page: this.page
          }
        })
        .then(res => {
          if (res.data.code == "0") {
            if (res.data.data.length >= this.pagesize) {
              this.loading = false;
              this.page++;
            } else {
              if (this.page) {
                this.listLoadend = true;
              }
              this.loading = true;
              this.allLoaded = true;
            }
            let loadData = res.data.data;
            this.allBankes = [...loadData, ...this.allBankes];
            if (this.xunlianfile) {
              this.popupCoursezy = true;
            }
          }
          Indicator.close();
          this.$refs.loadmore.onTopLoaded();
        })
        .catch(err => {
          this.$refs.loadmore.onTopLoaded();
          Indicator.close();
        });
    },
    newBanke() {
      this.popupNewbanke = true;
    },
    onsave() {
      Indicator.open(this.$mt("创建中") + "...");
      this.classitem.avatar = this.curcourse.avatar;
      var url = "/api/api/bankenew";
      this.$http
        .post(url, this.classitem)
        .then(res => {
          Indicator.close();
          if (res.data.code == 0) {
            this.allBankes = [...[res.data.data], ...this.allBankes];
            this.$store.commit("banke/appendBankes", res.data.data);
            this.popupNewbanke = false;
            this.updateinfo(res.data.data);
          } else {
            let tipmsg = res.data.msg;
            if (tipmsg == "no privilige") {
              tipmsg = this.$mt("无权限");
            } else if (tipmsg == "over num limit") {
              tipmsg = this.$mt("超出数量限制");
            } else if (tipmsg == "disabled") {
              tipmsg = this.$mt("功能已被禁用");
            } else if (tipmsg == "over num limit in school total") {
              tipmsg = this.$mt("学校班课数已达上限");
            } else if (tipmsg == "over num limit in user") {
              tipmsg =
                this.$mt("您创建的班课数已达上限") +
                "\r\n" +
                this.$mt("请先结束部分班课");
            }
            Toast(tipmsg);
          }
        })
        .catch(() => {
          Indicator.close();
          Toast(this.$mt("服务开小差"));
        });
    },
    updateinfo(banke) {
      this.$http
        .post("api/banke/updateinfo", {
          id: banke.id,
          coursename: this.curcourse.name
        })
        .then(res => {
          if (res.data.code == "0") {
          }
        })
        .catch(err => {});
    },
    //进入班课
    bankeDedail(item) {
      let tourl = "/bankehome/" + item.id;
      if (!nativecode.navigateTo(tourl)) {
        this.$store.commit("SET_FOOTER_BAR_STATE", true);
        this.$store.commit("setBHomeSelected", "ziyuan");
        this.$store.commit("setRouterForward", true);
        this.$router.push(tourl);
      }
    },
    selectClick(v) {
      if (!this.allBankes.length) {
        Toast(this.$mt("未创建班级"));
        return;
      }
      switch (v.id) {
        case 1:
          break;
        case 2:
          this.popupCoursezy = true;
          break;
        case 3:
          this.popupCoursezuoye = true;
          break;
        case 4:
          let bankes = [];
          for (let v of this.allBankes) {
            bankes.push({
              id: v.id,
              courseid: this.courseid,
              name: v.name,
              username: v.username
            });
          }
          let url =
            "http://192.168.1.104:8088/#/ClassStatistics?bankes=" +
            encodeURIComponent(JSON.stringify(bankes));

          if (process.env.NODE_ENV !== "development") {
            url = document.location.origin;
            url +=
              "/backend/#/ClassStatistics?bankes=" +
              encodeURIComponent(JSON.stringify(bankes));
          }
          window.location.href = url;
          sessionStorage.setItem("homelocalstate", "");
          break;
        default:
          break;
      }
    },
    guanlikec() {
      this.popupGuanlikc = true;
    },
    oncalce(v) {
      if (this.frompage == "renwu") {
        this.$emit("calce", true);
        return;
      }
      if (this.popupCoursezy) {
        if (this.xunlianfile) {
          this.$router.go(-1);
        } else {
          this.popupCoursezy = false;
        }
      }
      if (this.popupCoursezuoye) {
        this.popupCoursezuoye = false;
      }
      if (this.popupCouresNew) {
        this.popupCouresNew = false;
      }
    },
    back() {
      this.$router.push("/");
    }
  },
  components: {
    Empty,
    BankeZiyuan,
    BankeZuoye,
    CouresNew
  },
  destroyed: function() {
    sessionStorage.removeItem("xunlianfile");
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      console.log("kf", from);
      vm.cfrompage = from.name;
    });
  }
};
</script>

<style scoped lang="less">
.course-wrap {
  .main {
    .tit-wrap {
      display: flex;
      background: #fff;
      padding-bottom: 15px;
      justify-content: center;
      .item {
        display: flex;
        width: 25%;
        flex-direction: column;
        align-items: center;
        padding: 0 2px;
        .text {
          height: 30px;
          width: 100%;
          text-align: center;
          color: #5d5d5d;
        }
        .icon {
          font-size: 48px;
        }
      }
    }
    .banji-wrap {
      margin-top: 10px;
      .add-tit {
        width: 100%;
        height: 48px;
        background: rgba(249, 249, 249, 1);
        line-height: 48px;
        padding: 0 10px;
        border-bottom: 1px solid #f0f0f0;
      }
      .list-wrap {
        height: 69vh;
        min-height: 69vh;
        .fileempty {
          height: 69vh;
        }
        .all-ankes {
          min-height: 69vh;
          .item {
            padding: 0 10px;
            background: #fff;
            position: relative;
            width: 100%;
            height: 92px;
            border-bottom: 1px solid #f0f0f0;
            .info {
              width: 100%;
              height: 100%;
              padding: 10px 0;
              padding-right: 28px;
              .content {
                position: relative;
                width: 100%;
                height: 90%;
                .tit {
                  .inclass {
                    display: inline-block;
                    width: 60px;
                    height: 24px;
                    background: rgba(0, 137, 255, 1);
                    border-radius: 4px;
                    color: #fff;
                    font-size: 12px;
                    line-height: 24px;
                    text-align: center;
                  }
                }
                .right-info {
                  width: 100px;
                  height: 100%;
                  text-align: right;
                  right: 0;
                  .t {
                    top: 0;
                  }
                  .b {
                    bottom: 5px;
                  }
                  * {
                    width: 100%;
                  }
                }
              }
              .ggao {
                width: 100%;
                bottom: 5px;
                padding: 0 10px;
              }
            }
            .iconfont {
              right: 0;
              height: 100%;
              display: flex;
              align-items: center;
            }
          }
        }
      }
    }
  }
  .guanli-btn {
    position: absolute;
  }
  .zy-main {
    margin-top: 50px;
  }
}
.kc-gl-wrap {
  .main {
    .tit-wrap-g {
      position: relative;
      width: 100%;
      height: 80px;
      padding: 10px;
      background: #fff;
      margin-bottom: 150px;
      img {
        width: 55px;
        height: 55px;
      }
      .left-info {
        display: flex;
        width: 100%;
        padding-right: 27px;
        align-items: center;
        .text-wrap {
          margin-left: 10px;
        }
      }
      .iconfont {
        // top: 0;
        font-size: 26px;
      }
    }
    .margin {
      margin-bottom: 15px;
    }
  }
}
</style>
<style >
.course-wrap .gl .mint-header-title {
  position: relative;
  padding-right: 24px;
}
.course-wrap .gl .mint-header-title::after {
  display: block;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translate(0, -50%);
  content: "i";
  width: 15px;
  height: 15px;
  line-height: 15px;
  border-radius: 50%;
  border: 1px solid #0089ff;
  color: #0089ff;
  font-size: 12px;
}
.course-wrap .mint-cell-wrapper {
  background-image: none;
}
.course-wrap .mint-cell:last-child {
  background-image: none;
}
.course-wrap .f00 .mint-cell-text {
  color: #f00;
}
.course-wrap .zy-list-box {
  height: calc(100vh - 174px) !important;
  min-height: calc(100vh - 174px) !important;
}
.course-wrap .zy-list-box.ku {
  height: calc(100vh - 108px) !important;
  min-height: calc(100vh - 108px) !important;
}
</style>