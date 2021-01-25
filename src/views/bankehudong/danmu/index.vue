<template>
  <div class="danmu-wrap">
    <mt-header :title="$mt('弹幕互动')" class="mint-header-f">
      <mt-button slot="left" icon="back" @click="$back">{{$mt('返回')}}</mt-button>
      <!-- <mt-button @click="test" slot="right">test</mt-button> -->
    </mt-header>
    <div class="main main-f">
      <!-- :bottom-method="loadMore"
          @bottom-status-change="handleBottomChange"
          :bottom-all-loaded="allLoaded"
          bottomPullText=""
      bottomDropText="上拉加载更多"-->

      <!-- v-infinite-scroll="loadMore"
          infinite-scroll-disabled="loading"
          infinite-scroll-distance="10"
      infinite-scroll-immediate-check="false"-->
      <div class="list-scoll-wrap">
        <div class="scroll-w scrollingtouch" ref="scrollw" id="scrollw">
          <mt-loadmore
            ref="loadmore"
            :auto-fill="autofill"
            :top-method="loadTop"
            :bottom-method="viewNewmsgfn"
            :topPullText="$mt('下拉刷新')"
            :topDropText="$mt('释放更新')"
            :topLoadingText="$mt('加载中')"
            :bottomPullText="$mt('上拉刷新')"
            :bottomDropText="$mt('释放更新')"
            :bottomLoadingText="$mt('加载中')"
            @top-status-change="handleTopChange"
          >
            <div class="aaa wrap">
              <mt-spinner v-if="scloadMore" class="load-icon"></mt-spinner>
              <div class="item" v-for="(v,i) in danmuDataList" :key="i">
                <p
                  class="info-text fontsmall overflow-scroll"
                  :style="`color:${v.info.color}`"
                >{{v.info.text}}</p>
                <div class="info-name position-r">
                  <p v-show="v.info.hidename">
                    {{$mt('匿名')}}
                    <span>***</span>
                  </p>
                  <p v-show="!v.info.hidename" class="font16 name overflow-scroll">{{v.info.name}}</p>
                  <p class="font-xxs time">{{v.day}}&nbsp;{{v.time}}</p>
                </div>
              </div>
            </div>
            <Empty v-if="!danmuDataList.length" :text="['无数据']" />
            <div slot="top" class="mint-loadmore-top">
              <span style="color:#b9b9b9">{{ $mt('加载中') }}</span>
            </div>
          </mt-loadmore>
        </div>
      </div>
      <!-- <div class="mask"></div> -->
    </div>
    <div class="submit-wrap" :class="isOpen?'act':''">
      <div class="field-wrap clearfix">
        <p class="i-w">
          <span
            @click="openMore(1)"
            style="padding-right: 6px;"
            class="iconfont iconyangshi eicotrigger colord"
          ></span>
          <span @click="openMore(2)" class="iconfont iconkehou-xuanzhong eicotrigger colord"></span>
        </p>
        <div class="mint-field fl position-l">
          <!-- <input
            v-model="inputVal"
            :placeholder="$mt('请输入弹幕内容')"
            autocomplete="off"
            class="text-input"
            @keyup.enter="submitDanmu()"
            @input="textChange($event.target.value)"
            @blur="$setInputScroll"
            maxlength="24"
            ref="inputel"
          />-->
          <textarea
            name
            id
            v-model="inputVal"
            :placeholder="$mt('请输入弹幕内容')"
            autocomplete="off"
            class="text-input position-c"
            @keyup.enter="submitDanmu()"
            @input="textChange($event.target.value)"
            @blur="$setInputScroll"
            maxlength="24"
            ref="inputel"
          ></textarea>
        </div>
        <p class="position-r submit-btn-w">
          <span class="submit-btn nowrap" @click="submitDanmu()">{{$mt('发送')}}</span>
          <span class="submit-btn nowrap" @click="nimingsub()">{{$mt('匿名发送')}}</span>
        </p>
      </div>
      <div class="colors-wrap overflow-scroll" v-show="showColor">
        <p class="tit fontsmall">{{$mt('弹幕颜色')}}</p>
        <div class="colors clearfix">
          <span
            class="fl fontsmall tc"
            v-for="(v,i) in colors"
            :key="i"
            @click="selectColorFn(i)"
            :style="`background:${v.isAct?v.color:''};color:${v.isAct?'#fff':v.color};border:1px solid ${v.color}`"
          >{{$mt(v.name)}}</span>
        </div>
        <!-- <div class="niming-w">
          <p class="tit fontsmall">{{$mt('弹幕设置')}}</p>
          <p class="txt-icon" @click="nimingselt">
            <i class="iconfont iconok- position-l" :class="isniming?'colory':'color9'"></i>
            <span>{{$mt('匿名发送弹幕')}}</span>
          </p>
        </div>-->
      </div>
      <div v-show="showTxt" class="defaultTxt">
        <p v-for="(v,i) in defaultTxt" :key="i" @click="defaultTxtFn(v)">
          <span v-if="i<5">{{v.txt}}</span>
        </p>
      </div>
    </div>
    <p class="totop" ref="totop">{{$mt(nomoretxt)}}</p>
  </div>
</template>

<script>
import { Indicator, Toast, MessageBox, Spinner } from "mint-ui";
import Empty from "@/common/empty";
import { parseURL, uniqueArr, sortFn } from "@/util";
import BottomLoadmore from "@/common/bottom-loadmore";
import nativecode from "@/nativecode";
export default {
  name: "Danmu",
  props: {},
  data() {
    return {
      bankeid: 0,
      userid: 0,
      isOpen: false,
      isLink: false,
      LinkInfo: {},
      danmuDataList: [],
      inputVal: "",
      colorEnd: "#000000",
      colors: [
        {
          color: "#FF6600",
          name: "橙色",
          isAct: false
        },
        {
          color: "#FF0000",
          name: "红色",
          isAct: false
        },
        {
          color: "#0089FF",
          name: "蓝色",
          isAct: false
        },
        {
          color: "#C500FF",
          name: "紫色",
          isAct: false
        },
        {
          color: "#00BB1F",
          name: "绿色",
          isAct: false
        },
        {
          color: "#FEA6D2",
          name: "粉色",
          isAct: false
        }
      ],
      defaultTxt: [
        // {
        //   txt: "谢谢老师!"
        // },
        // {
        //   txt: "讲得很生动"
        // },
        // {
        //   txt: "前方高能!"
        // }
      ],
      page: 0,
      pagesize: 20,
      loading: false,

      autofill: false,
      listLoadend: false,
      topStatus: "",
      bottomStatus: "",
      allLoaded: false,
      dropType: 0,
      scloadMore: false,
      moretime: null,
      showColor: false,
      showTxt: false,
      selectType: null,
      isniming: false,
      viewNewsubmit: false,
      viewNewsubmitindex: 0,
      newsubmtnub: 0,
      frompage: ""
    };
  },
  computed: {
    nomoretxt() {
      if (this.danmuDataList.length > this.pagesize) {
        return "到顶了";
      }
      return "没有更多了";
    },
    hudongonline() {
      if (this.$store.getters.getonline) {
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
    },
    user() {
      return this.$store.getters.curuser;
    },
    caneditbanke() {
      let caneditbanke = this.$store.getters.caneditbanke;
      return caneditbanke;
    },
    detail_go_school() {
      return this.$store.state.detail_go_school;
    },
    weiximiniprogram() {
      if (nativecode.platform == "miniprogram") {
        return true;
      }
      return false;
    }
  },
  created() {
    let defaultTxt = localStorage.getItem("defaultTxt") || "";
    if (defaultTxt) {
      this.defaultTxt = JSON.parse(defaultTxt);
    }
    let params = this.$route.params;
    if (params.bankeid) {
      this.bankeid = params.bankeid;
      this.userid = params.userid;
      this.frompage = params.frompage;
    }
    this.queryDapingLink();
    this.queryDanmu();
  },
  mounted() {
    let scrollWrap = this.$refs.scrollw;
    scrollWrap.addEventListener("scroll", this.onscrollfn, false);
  },
  watch: {},
  methods: {
    handleTopChange(status) {
      this.topStatus = status;
    },
    test() {
      this.$refs.scrollw.scrollTop = this.scrollHeightnb;
    },
    onscrollfn() {
      if (this.isOpen) {
        this.isOpen = false;
      }

      if (this.$refs.scrollw.scrollTop == 0) {
        if (!this.allLoaded) {
          if (
            nativecode.platform == "exsoftwindows" ||
            nativecode.platform == ""
          ) {
            this.scloadMore = true;
            this.loadMore();
          }
        } else {
          this.shownomoretxt();
        }
      }
      // console.log("scrollTop", this.$refs.scrollw.scrollTop);
      // console.log("scrollHeight", this.$refs.scrollw.scrollHeight);
      // console.log("offsetHeight", this.$refs.scrollw.offsetHeight);
      // console.log(
      //   document.documentElement.clientHeight +
      //     "-----------" +
      //     window.innerHeight
      // ); // {{$mt('可视区域高度')}}
      // console.log(document.body.scrollTop); // {{$mt('滚动高度')}}
      // console.log(document.body.offsetHeight); // {{$mt('文档高度')}}
    },
    viewNewmsgfn() {
      this.viewNewsubmit = true;
      this.queryDanmu(false);
    },
    loadTop() {
      this.shownomoretxt(false);
      if (this.allLoaded) {
        this.shownomoretxt();
        this.$refs.loadmore.onTopLoaded();
        return;
      }
      this.scloadMore = true;
      this.loadMore();
    },
    loadMore() {
      this.loading = true;
      this.queryDanmu(false);
    },
    handleBottomChange(status) {
      this.bottomStatus = status;
    },
    queryDanmu(init = true) {
      this.$http
        .post("/api/danmu/query", {
          bankeid: this.bankeid,
          page: this.viewNewsubmit ? this.viewNewsubmitindex : this.page,
          pagesize: this.pagesize
        })
        .then(res => {
          if (res.data.code == "0") {
            if (res.data.data.length) {
              let datalists = res.data.data.reverse();
              if (datalists.length >= this.pagesize) {
                this.loading = false;
                if (!this.viewNewsubmit) {
                  this.page++;
                }
              } else {
                this.loading = true;
                this.allLoaded = true;
                if (this.page) {
                  this.listLoadend = true;
                  this.shownomoretxt();
                }
              }
              for (let v of datalists) {
                try {
                  v.info = JSON.parse(v.info);
                  let createtime = v.createtime.replace(/-/g, "/");
                  v.timeStr = new Date(createtime).getTime();
                } catch (e) {}

                v.time = v.createtime.split(" ")[1];
                v.day = this.getDayName(v.createtime);
              }
              if (this.viewNewsubmit) {
                for (let v of datalists) {
                  let hasitem = false;
                  for (let curitem of this.danmuDataList) {
                    if (curitem.id == v.id) {
                      hasitem = true;
                    }
                  }
                  if (!hasitem) {
                    this.danmuDataList.push(v);
                    this.newsubmtnub++;
                  }
                }
              } else {
                this.danmuDataList = [...datalists, ...this.danmuDataList];
              }
              // this.danmuDataList.sort(sortFn("timeStr", 0));
              // console.log("danmu", this.danmuDataList);
              if (!this.viewNewsubmit) {
                this.$nextTick(() => {
                  if (init) {
                    this.$refs.scrollw.scrollTop = this.$refs.scrollw.scrollHeight;
                    this.scrollHeightnb = this.$refs.scrollw.scrollHeight;
                  } else {
                    if (res.data.data.length >= this.pagesize) {
                      this.$refs.scrollw.scrollTop = this.scrollHeightnb;
                    }
                  }
                });
              }
              if (this.newsubmtnub >= this.pagesize) {
                this.viewNewsubmitindex++;
                this.viewNewmsgfn();
              } else {
                this.viewNewsubmitindex = 0;
              }
            } else {
              this.allLoaded = true;
              this.listLoadend = true;
              this.viewNewsubmitindex = 0;
            }
          } else {
            this.viewNewsubmitindex = 0;
            Toast(this.$mt('查询失败"'));
          }
          this.scloadMore = false;
          this.$refs.loadmore.onTopLoaded();
          this.$refs.loadmore.onBottomLoaded();
          this.viewNewsubmit = false;
          this.newsubmtnub = 0;
        })
        .catch(err => {
          this.newsubmtnub = 0;
          this.viewNewsubmit = false;
          this.scloadMore = false;
          this.$refs.loadmore.onTopLoaded();
          this.$refs.loadmore.onBottomLoaded();
          Toast(this.$mt("服务开小差了"));
        });
    },
    textChange(v) {
      if (v.length > 23) {
        Toast(this.$mt("最大可输入24个字符"));
      }
    },
    setScroll() {
      if (this.weiximiniprogram) {
      }
      setTimeout(function() {
        var scrollHeight =
          document.documentElement.scrollTop || document.body.scrollTop || 0;
        window.scrollTo(0, Math.max(scrollHeight - 1, 0));
      }, 100);

      // window.scrollTo(0, 0);
      // window.scrollTo(0,document.documentElement.clientHeight);
    },
    defaultTxtFn(v) {
      this.inputVal = v.txt;
    },
    nimingsub() {
      this.isniming = true;
      this.submitDanmu();
    },
    submitDanmu() {
      if (this.frompage != "hudong") {
        if (!this.isLink) {
          // if (process.env.NODE_ENV != "development") {
          Toast(this.$mt("当前班课未开课"));
          return;
          // }
        }
      }
      if (!this.inputVal) {
        Toast(this.$mt("请输入弹幕内容"));
        return;
      }
      let submitData = {
        bankeid: this.bankeid,
        info: {
          text: this.inputVal,
          color: this.colorEnd,
          name: this.user.name,
          hidename: this.isniming
        }
      };
      submitData.info = JSON.stringify(submitData.info);
      Indicator.open(this.$mt("发送中") + "...");
      this.$http
        .post("/api/danmu/add", submitData)
        .then(res => {
          if (res.data.code == "0") {
            let hastxt = false;
            for (let v of this.defaultTxt) {
              if (v.txt == this.inputVal) {
                hastxt = true;
              }
            }
            if (!hastxt) {
              this.defaultTxt = [
                ...[{ txt: this.inputVal }],
                ...this.defaultTxt
              ];
              this.setDfaultTxt();
            }
            this.sendSuccess(res);
          } else {
            Toast(this.$mt("发送失败"));
          }
          Indicator.close();
          this.isniming = false;
        })
        .catch(err => {
          this.isniming = false;
          Toast(this.$mt("服务异常"));
          Indicator.close();
        });
    },
    sendSuccess(res) {
      this.inputVal = "";
      this.isOpen = false;
      res.data.data.info = JSON.parse(res.data.data.info);
      res.data.data.time = res.data.data.createtime.split(" ")[1];
      res.data.data.day = this.getDayName(res.data.data.createtime);
      this.danmuDataList = [...this.danmuDataList, ...[res.data.data]];
      this.$nextTick(() => {
        this.$refs.scrollw.scrollTop = this.$refs.scrollw.scrollHeight;
        this.scrollHeightnb = this.$refs.scrollw.scrollHeight;
      });
    },
    openMore(type) {
      let Fn = type => {
        this.showColor = false;
        this.showTxt = false;
        switch (type) {
          case 1:
            this.showColor = true;
            break;
          case 2:
            this.showTxt = true;
            break;
        }
      };
      if (this.isOpen) {
        if (this.selectType == type) {
          this.isOpen = false;
        } else {
          Fn(type);
          this.selectType = type;
        }
        return;
      }
      Fn(type);
      this.selectType = type;
      this.isOpen = true;
    },
    selectColorFn(i) {
      if (this.colors[i].isAct) {
        this.colors[i].isAct = false;
        this.colorEnd = "#000000";
        return;
      }
      for (let v of this.colors) {
        v.isAct = false;
      }
      this.colors[i].isAct = true;
      this.colorEnd = this.colors[i].color;
    },
    nimingselt() {
      this.isniming = !this.isniming;
    },
    //查询大屏登录
    queryDapingLink() {
      this.$http
        .post("/api/banke/dapingquery", {
          userid: this.userid
        })
        .then(res => {
          if (res.data.code == "0") {
            if (res.data.data == null) {
              //  this.isLink=true;
            } else {
              this.LinkInfo = res.data.data.daping;
              console.log(this.LinkInfo);
              let curbanke = this.$store.state.curbanke;
              if (curbanke.id == this.LinkInfo.bankeid) {
                this.isLink = true;
              }
            }
          }
          Indicator.close();
        })
        .catch(err => {
          // Toast('服务异常')
          Indicator.close();
        });
    },
    getDayName(date) {
      let td = new Date();
      td = new Date(td.getFullYear(), td.getMonth(), td.getDate());
      let od = new Date(date.replace(/-/g, "/"));
      od = new Date(od.getFullYear(), od.getMonth(), od.getDate());
      let xc = (od - td) / 1000 / 60 / 60 / 24;
      if (xc < -2) {
        return this.$mt("%s天前", [Math.abs(xc)]);
      } else if (xc < -1) {
        return this.$mt("前天");
      } else if (xc < 0) {
        return this.$mt("昨天");
      } else if (xc == 0) {
        return this.$mt("今天");
      } else if (xc < 2) {
        return this.$mt("明天");
      } else if (xc < 3) {
        return this.$mt("后天");
      } else {
        return this.$mt("%s天后", [xc]);
      }
    },
    shownomoretxt(show = true) {
      let $totop = this.$refs.totop;
      if (!show) {
        clearTimeout(this.moretime);
        $totop.classList.remove("act");
        return;
      }
      $totop.classList.add("act");
      this.moretime = setTimeout(function() {
        $totop.classList.remove("act");
      }, 1000);
    },
    setDfaultTxt() {
      let txt = [];
      let curTxts = JSON.parse(JSON.stringify(this.defaultTxt));
      if (curTxts.length) {
        if (curTxts.length > 5) {
          txt = curTxts.splice(0, 5);
        } else {
          txt = curTxts;
        }
      }
      if (txt.length) {
        localStorage.setItem("defaultTxt", JSON.stringify(txt));
      }
    }
  },
  destroyed: function() {
    // this.setDfaultTxt();
  },
  components: {
    Empty,
    BottomLoadmore,
    [Spinner.name]: Spinner
  }
};
</script>

<style scoped lang="less">
.danmu-wrap {
  .main {
    height: 93vh;
    min-height: 93vh;
    position: relative;
    margin-top: 49px;
    .list-scoll-wrap {
      width: 100%;
      transition: all 0.3s;
      .scroll-w {
        width: 100%;
        height: calc(100vh - 140px);
        min-height: calc(100vh - 140px);
        overflow: scroll;
        .wrap {
          min-height: calc(100vh - 140px);
          padding-bottom: 15px;
          .item {
            position: relative;
            height: 87px;
            max-height: 87px;
            padding: 0 10px;
            border-top: 1px solid #f0f0f0;
            background: #fff;
            .info-text {
              position: absolute;
              left: 10px;
              top: 20px;
              width: calc(100% - 110px);
              height: 80%;
              overflow: scroll;
            }
            .info-name {
              width: 24%;
              text-align: right;
              color: #5d5d5d;
              .time {
                margin-top: 7px;
              }
            }
          }
        }
      }
    }
    .mask {
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      z-index: 9;
    }
  }
  .submit-wrap {
    position: fixed;
    width: 100%;
    height: 90px;
    max-height: 280px;
    left: 0;
    bottom: 0;
    z-index: 10;
    background: #fff;
    transition: all 0.3s;
    box-shadow: 0px -3px 6px rgba(0, 0, 0, 0.16);
    .field-wrap {
      position: relative;
      width: 100%;
      height: 90px;
      border-bottom: 1px solid #e4e4e4;
      .i-w {
        position: absolute;
        width: 60px;
        height: 100%;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: space-evenly;
      }
      .iconfont {
        font-size: 33px;
      }
      .submit-btn-w {
        width: 100px;
        height: 100%;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        flex-direction: column;
      }
      .submit-btn {
        width: 100%;
        height: 33px;
        font-size: 16px;
        text-align: center;
        background: #0089ff;
        line-height: 33px;
        color: #fff;
        border-radius: 30px;
      }
      .mint-field {
        width: calc(100% - 190px);
        height: 100%;
        left: 66px;
        .text-input {
          width: 100%;
          height: 90%;
          background: #e8e8e8;
          border: 1px solid #bfbebe;
          padding: 10px;
          opacity: 1;
          border-radius: 8px;
        }
      }
    }
    .colors-wrap {
      padding: 0 10px;
      .tit {
        color: #5d5d5d;
        padding-bottom: 5px;
        font-size: 16px;
      }
      .colors {
        span {
          width: 28%;
          height: 50px;
          margin: 3px 2.6%;
          line-height: 50px;
          border-radius: 10px;
          &.act {
          }
        }
      }
      .niming-w {
        .txt-icon {
          position: relative;
          padding: 5px 0 5px 30px;
          i {
            font-size: 26px;
            left: 0;
          }
        }
      }
    }
    .defaultTxt {
      width: 100%;
      height: 100%;

      p {
        width: 96%;
        height: 40px;
        line-height: 40px;
        padding: 0 5px;
        margin: 0 auto;
        border-bottom: 1px solid #e4e4e4;
      }
    }
    &.act {
      height: 280px;
      transition: all 0.3s;
    }
  }
  .totop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 0;
    background: #f0f0f0;
    color: #b9b9b9;
    text-align: center;
    font-size: 0.32rem;
    transition: all 0.5s;
    &.act {
      z-index: 10;
      top: 49px;
    }
  }
}
</style>
<style>
.danmu-wrap .mint-spinner-snake {
  width: 20px !important;
  height: 20px !important;
  margin: 0 auto;
}
.danmu-wrap .mint-field-core {
  background: #f9f9f9;
  border: 1px solid #f0f0f0;
  padding: 5px 5px;
  border-radius: 8px;
}
.danmu-wrap input::placeholder {
  font-weight: bold;
}
</style>