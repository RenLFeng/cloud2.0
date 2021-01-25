<template >
  <div class="zyitemlist-wrap">
    <div class="main">
      <div class="item" @click="goxunlian">
        <div class="user-wrap">
          <p class="user position-l">
            <img class="img" :src="curitem.useravatar" :onerror="$defaultImg('account')" />
            <span class="ellipse name font16 color0">{{curitem.username}}</span>
          </p>
          <span class="position-r xunlian-score">
            <span v-if="curitem.disccscore>=0 && pagemode == 'submit'" class="score disccscore">{{$mt('老师评分')}}:{{curitem.disccscore}}{{$mt('分')}}</span>
              <span class="score">{{$mt('训练得分')}}:{{curitem.score}}{{$mt('分')}}</span>
          </span>
        </div>
        <p v-if="showxunlianbtn" class="colord">
          <mt-button class="showxunlianbtn" size="small" @click.stop="goxunlian">{{$mt('点击继续')}}</mt-button>
        </p>
        <div class="progress">
          <div class="tingxie" v-if="xunliantype=='10'">
            <span>{{$mt(progressdes)}}</span>
            <span class="progress-bar">
              <span class="bar" :style="`width:${finishbl}%`"></span>
            </span>
            <span class="fr">
              <span class="colord">{{curitem.finishnum}}</span>
              <span class="color9" :class="finishstate?'colord':''">/{{curitem.totalnum}}</span>
            </span>
          </div>
          <div class v-if="xunliantype!='10'">
            <p>
              <span>{{$mt(progressdes)}}</span>
              <span class="fr">
                <span class="colord">{{curitem.finishnum}}</span>
                <span class="color9" :class="finishstate?'colord':''">/{{curitem.totalnum}}</span>
              </span>
            </p>
            <p class="progress-bar">
              <span class="bar" :style="`width:${finishbl}%`"></span>
            </p>
          </div>
        </div>
        <div class="btn-wrap" v-if="pagemode=='result'">
          <p class="score" @click.stop="score">
            <span class="colord">{{disccscore}}</span>
            <span>{{$mt('评分')}}</span>
          </p>
          <p class @click.stop="diss">
            <span class="colord">{{curitem.commentnum}}</span>
            <span>{{$mt('评论')}}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    pagemode: {
      default: "result"
    },
    curitem: {
      default() {
        return {};
      }
    },
    xunliantype: {
      default: null
    }
  },
  data() {
    return {};
  },
  computed: {
    disccscore() {
      if (this.curitem.disccscore < 0) {
        return 0;
      }
      return this.curitem.disccscore;
    },
    user() {
      return this.$store.getters.curuser;
    },
    showxunlianbtn() {
      if (
        this.pagemode == "submit" &&
        this.curitem.finishnum < this.curitem.totalnum &&
        this.curitem.userid == this.user.id
      ) {
        return true;
      }
      return false;
    },
    finishbl() {
      if (!this.curitem.totalnum) return 0;
      return (this.curitem.finishnum / this.curitem.totalnum) * 100;
    },
    finishstate() {
      if (
        this.curitem.finishnum == this.curitem.totalnum &&
        this.curitem.finishnum
      ) {
        return true;
      }
      return false;
    },
    progressdes() {
      if (this.finishstate) {
        return "完成";
      }
      return "进度";
    }
  },
  created() {},
  mounted() {
    console.log("没付款了似的", this.curitem);
  },
  watch: {},
  methods: {
    goxunlian() {
      this.$emit("goxunlian", this.curitem);
    },
    score() {
      this.$emit("score", {
        item: this.curitem,
        tpye: "score"
      });
    },
    diss() {
      this.$emit("diss", {
        item: this.curitem,
        tpye: "diss"
      });
    }
  },
  components: {}
};
</script>

<style scoped lang="less">
.zyitemlist-wrap {
  background: #fff;
  margin-bottom: 15px;
  .main {
    .item {
      padding: 10px;
      > div {
        margin-bottom: 10px;
      }
      .user-wrap {
        position: relative;
        height: 48px;
        .user {
          left: 0;
          img {
            width: 30px;
            height: 30px;
            border-radius: 30px;
          }
          .name {
            margin-left: 10px;
          }
        }
        .xunlian-score {
          .score {
            display: block;
            right: 0;
            color: #ff8900;
          }
          .disccscore{
            color: #f00;
          }
        }
      }
      .progress {
        height: 38px;
        p {
          margin-bottom: 10px;
        }
        .progress-bar {
          position: relative;
          height: 10px;
          background: #d8d8d8;
          border-radius: 5px;
          .bar {
            position: absolute;
            height: 100%;
            background: #0089ff;
            border-radius: 5px;
          }
        }
        .tingxie {
          display: flex;
          align-items: center;
          .progress-bar {
            width: 66%;
            margin: 0 10px;
            .bar {
              width: 100%;
              max-width: 100%;
            }
          }
        }
      }
      .btn-wrap {
        border-top: 1px solid #999;
        display: flex;
        margin-top: 30px;
        > p {
          display: flex;
          height: 55px;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 50%;
          padding: 10px 0;
        }
        .score {
          border-right: 1px solid #999;
        }
      }
    }
  }
  .showxunlianbtn {
    background: #0089ff;
    color: #fff;
  }
}
</style>
