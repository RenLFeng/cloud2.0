<template>
  <div class="epaper-wrap">
    <div class="titinfo-wrap">
      <div class="info-wrap">
        <P class="name">
          {{zuoyeitem.name}}
          <i
            class="iconfont iconcollect eicotrigger position-r"
            :class="Shuoc?'colory':'color9'"
            @click="clickshuoc"
          ></i>
        </P>
        <!-- <P class="score">分值:{{zuoyeitem.score}}分</P> -->
        <P class="color9">{{$mt(curzystate)}}</P>
      </div>
    </div>
    <!-- v-infinite-scroll="loadMore"
        infinite-scroll-disabled="loading"
        infinite-scroll-distance="10"
    infinite-scroll-immediate-check="false"-->
    <div class="members overflow-scroll">
      <div class="item" v-for="(v,i) in members" :key="i" @click="onclick(v)">
        <p class="user">
          <img class="img" :src="v.useravatar" :onerror="$defaultImg('account')" />
          <span class="ellipse name font16 color0">{{v.username}}</span>
          <!-- <span>{{}}</span> -->
          <span class="fr">{{membercurstate(v.examinfo?v.examinfo.states:0)}}</span>
        </p>
      </div>
      <!-- <BottomLoadmore
          v-if="showLoadtips"
          :showType="Loadtipsobj.showType"
          :loadtext="Loadtipsobj.loadtext"
      />-->
    </div>
  </div>
</template>
<script>
export default {
  name: "",
  props: {
    zuoyeitem: {
      default() {
        return {};
      }
    },
    curzystate: {
      default: ""
    },
    Shuoc: {
      default: false
    },
    members: {
      default() {
        return [];
      }
    }
  },
  data() {
    return {};
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    onclick(v) {
      this.$emit("epuserclick", v);
    },
    clickshuoc() {
      this.$emit("clickshuoc");
    },
    membercurstate(state) {
      let text = "";
      switch (state) {
        case 0:
          text = "未参加";
          break;
        case 1:
          text = "考试中";
          break;
        case 2:
          text = "考试暂停中";
          break;
        case 5:
          text = "已交卷";
          break;
        case 6:
          text = "已统一交卷";
          break;
        case 10:
          text = "已阅卷";
          if ((this.zuoyeitem.state = 10)) {
            text = "考试已结束";
          }
          break;
        default:
          text = "未参加";
      }
      return this.$mt(text);
    }
  },
  components: {},
  destroyed() {}
};
</script>
<style lang='less' scoped>
.epaper-wrap {
  .titinfo-wrap {
    .info-wrap {
      background: #e7e7e7;
      padding: 10px;
      p {
        margin: 5px 0;
      }
      .name {
        position: relative;
        font-size: 20px;
        color: black;
        //   img {
        //     width: 30px;
        //     height: 30px;
        //     border-radius: 30px;
        //   }
      }
      .score {
        color: #ff8800;
      }
    }
  }
  .members {
    height: 82vh;
    min-height: 82vh;
    .item {
      padding: 10px;
      .user {
        .img {
          width: 30px;
          height: 30px;
          border-radius: 30px;
        }
        .name {
          padding-left: 10px;
        }
      }
    }
  }
}
</style>