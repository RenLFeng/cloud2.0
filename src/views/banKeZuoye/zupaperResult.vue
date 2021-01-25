<template>
  <div class="zupaperres-w">
    <mt-header :title="$mt(xunliantitle)" class="mint-header-f">
      <mt-button icon="back" slot="left" @click="$back">{{$mt('返回')}}</mt-button>
    </mt-header>
    <div class="main">
      <div class="tit-info">
        <div class="info-wrap">
          <P class="name">
            <span class="font18">{{zuoyeitem.name}}</span>
            <i
              class="iconfont iconcollect eicotrigger position-r"
              :class="Shuoc?'colory':'color9'"
              @click="shuocFn"
            ></i>
          </P>
          <P class="score">{{$mt('分值')}}:{{zuoyeitem.score}}{{$mt('分')}}</P>
          <P class="color9">{{$mt(curzystate)}}</P>
          <div class="zuoyesubtitle">{{zuoyetimedesc}}</div>
        </div>
        <div class="item" v-if="epitem.content">
          <p class="font18">{{epitem.content.epname}}</p>
          <div class="font14 color9 b">
            <span>{{epitem.content.createtime}}</span>
            <span class="fr">{{$mt('题量')}}:{{epitem.content.eplen}}</span>
          </div>
        </div>
      </div>
      <div class="userlist-w">
        <Vanbr :tabBar="labels" width="30" @selectClick="onselectClick" />
        <!-- <div class="van-navbr-wrap" :class="$i18n.locale!='zh'?'nozh':''">
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
        </div> -->
        <div class="scorll-lists">
          <div class="useritem font18" v-for="(v,i) in members" :key="i" @click="onclick(v)">
            <div class="user-w">
              <p class="name">
                <img class="img" :src="v.useravatar" :onerror="$defaultImg('account')" />
                <span class>{{v.username}}</span>
              </p>

              <span class="score fr">得分:{{v.score}}</span>
            </div>
            <div class="jindu">
              <div class="nub">
                <p class="colord">{{$mt('已完成')}}</p>
                <p>
                  <span>23</span>/
                  <span>23</span>
                </p>
              </div>
              <p class="pro">
                <span class="bar" style="width:100%"></span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { Indicator, Toast, MessageBox, Actionsheet } from "mint-ui";
import commontools from "@/commontools";
import Vanbr from "@/common/van-navbr";
export default {
  name: "",
  props: {
    Shuoc: {
      default: false
    },
    zuoyeid: {
      default: 0
    },
    zuoyeitem: {
      default() {
        return {};
      }
    },
    curzystate: {
      default: ""
    },
    members: {
      default() {
        return [];
      }
    },
    epitem: {
      default() {
        return {};
      }
    },
    paperkey: {
      default: ""
    },
    ismaster: {
      default: false
    }
  },
  data() {
    return {
      moveBar: 18,
      labels: [
        {
          id: 100,
          label: "全部",
          num: 2,
          isActive: true
        },
        {
          id: 1,
          label: "已完成",
          num: 1,
          isActive: false
        },
        {
          id: 2,
          label: "未完成",
          num: 1,
          isActive: false
        }
      ],
      pagemode: "result"
    };
  },
  computed: {
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
    xunliantitle() {
      return "结果列表";
    }
  },
  watch: {},
  created() {},
  mounted() {
  },
  methods: {
    onclick(v) {
      console.log(v);
      let examinfo = v.examinfo;
      let username = encodeURIComponent(v.username);
      let url = `http://192.168.1.104:8086/#/exam?ismaster=${this.ismaster}&paperkey=${this.paperkey}&answerid=${examinfo.answerid}&reviewid=${examinfo.reviewid}&username=${username}`;
      window.location.href = url;
    },
    selectClick(e, v, i) {
      if (v.isActive || !v.nub) return;
      let curel = this.$refs.tbLi[i];
      let targetwidth = e.target.offsetWidth;
      let moveBar = (52 - targetwidth) / 2;
      this.moveBar = e.target.offsetLeft - moveBar;
      for (let v of this.labels) {
        v.isActive = false;
      }
      this.labels[i].isActive = true;
      //   this.filterfinishmb(v.id);
    },
    onselectClick(id) {
      //   this.filterfinishmb(v.id);
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
    shuocFn() {
      this.$emit("clickshuoc");
    }
  },
  components: { Vanbr },
  destroyed() {}
};
</script>
<style lang='less' scoped>
.zupaperres-w {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  .main {
    height: 100%;
    // padding: 10px;
    .tit-info {
      padding: 10px;
      .info-wrap {
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
      .item {
        height: 80px;
        padding: 10px;
        background: #fff;
        border-radius: 10px;
        display: flex;
        justify-content: space-around;
        flex-direction: column;
        box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.07);
        .b {
          padding-right: 50px;
        }
      }
    }
    .userlist-w {
      .scorll-lists {
        .useritem {
          background: #fff;
          margin-bottom: 10px;
          padding: 10px;
          padding-bottom: 20px;
          .user-w {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            img {
              width: 30px;
              height: 30px;
              border-radius: 30px;
            }
          }
          .jindu {
            margin-top: 15px;
            .nub {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
            }
            .pro {
              width: 100%;
              height: 10px;
              position: relative;
              border-radius: 10px;
              background: #ccc;
              .bar {
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                background: #0089ff;
                border-radius: 10px;
              }
            }
          }
        }
      }
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
</style>