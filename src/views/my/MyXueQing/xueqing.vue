<template>
  <div class="my-xueqing-wrap">
    <mt-header :title="$mt('个人学情')" class="mint-header-f">
      <mt-button slot="left" icon="back" @click="goBack()">{{$mt('返回')}}</mt-button>
    </mt-header>
    <div class="main main-f">
      <div class="top">
        <div class="user">
          <img
            :src="memberuserid?memberuser.avatar:user.avatar"
            :onerror="$defaultImg('account')"
            class="position-l avatarimgpart avatar"
          />
          <div
            class="fontsmall namepart ellipse position-l"
          >{{memberuserid?memberuser.name:user.name}}</div>
        </div>
        <!-- <div class="devide"></div> -->
        <mt-cell :title="$mt('所属学校')" is-link @click.native="bindSchool"></mt-cell>
      </div>
      <div class="lable tc">
        <p :class="!isJoin?'act navbar':''" @click="selectClass(0)">
          <!-- cjy: 此界面会被其他人所见，不应当显示 我加入的 -->
          <span class="tit-name fontsmall">{{$mt('加入的班课')}}</span>
          <span class="tit-nub font16">{{myJoin.length?myJoin.length:0}}</span>
        </p>
        <p :class="isJoin?'act navbar':''" @click="selectClass(1)">
          <span class="tit-name fontsmall">{{$mt('创建的班课')}}</span>
          <span class="tit-nub font16">{{myCreate.length?myCreate.length:0}}</span>
        </p>
      </div>
      <div class="info-list-wrap scrollingtouch">
        <div v-if="classData.length">
          <div class="item" v-for="(v,i) in classData" :key="i">
            <img :src="v.avatar" :onerror="$defaultImg('account')" class="position-l avatarimgpart" />
            <div class="item-info">
              <p class="fontsmall ellipse">{{v.name}}</p>
              <p v-show="isJoin" class="fontsmall nub">{{$mt('班课人数')}}:&nbsp;{{v.membernum}}</p>
              <p v-show="!isJoin" class="fontsmall nub">{{$mt('在班课中得分')}}:&nbsp;{{v.allScore}}</p>
            </div>
          </div>
        </div>
        <Empty v-else :text="['未找到班课']" />
      </div>
    </div>
  </div>
</template>
<script>
import { Indicator, Toast, MessageBox } from "mint-ui";
import Empty from "@/common/empty";
export default {
  props: {
    memberuser: {
      default() {
        return {};
      }
    },
    memberuserid: {
      default: ""
    }
  },
  data() {
    return {
      isJoin: 0,
      classData: [],
      myCreate: [],
      myJoin: []
    };
  },
  computed: {
    user() {
      return this.$store.getters.curuser;
    },
    caneditbanke() {
      let caneditbanke = this.$store.getters.caneditbanke;
      return caneditbanke;
    }
  },
  created() {},
  mounted() {
    this.queryuserbanke(this.isJoin);
  },
  watch: {
    memberuserid: function(newValue, oldValue) {}
  },
  methods: {
    selectClass(type) {
      this.isJoin = type;
      if (type) {
        this.classData = this.myCreate;
      } else {
        this.classData = this.myJoin;
      }
    },
    queryuserbanke(type) {
      let postData = {
        userid: this.memberuserid ? this.memberuserid : this.user.id
      };
      if (type) {
        postData.queryowner = 1;
      }
      Indicator.open(this.$mt('加载中')+"...");
      this.$http
        .post("/api/banke/queryuserbanke", postData)
        .then(res => {
          if (res.data.code == "0") {
            if (res.data.data.length) {
              if (!type) {
                for (let item of res.data.data) {
                  item.allScore =
                    (item.score1 * item.scorerule1) / 100 +
                    (item.score2 * item.scorerule2) / 100 +
                    (item.score3 * item.scorerule3) / 100 +
                    (item.score4 * item.scorerule4) / 100 +
                    (item.score5 * item.scorerule5) / 100;
                }
                this.myJoin = res.data.data;
                this.classData = this.myJoin;
              } else {
                this.myCreate = res.data.data;
              }
            } else {
            }
          }
          if (!type) {
            this.queryuserbanke(1);
          }
          Indicator.close();
        })
        .catch(err => {
          Indicator.close();
        });
    },
    bindSchool() {
      if (this.memberuserid) {
        this.$store.commit("SET_GO_SCHOOL", true);
        // if (!this.caneditbanke) {
        //   this.$store.commit("SET_GO_SCHOOL", true);
        // }
      }
      this.$store.commit("setRouterForward", true);
      this.$router.push({
        // name: "BindSchool",
        name: "BindSchoolList", //! cjy: 这里直接跳转到schoollist即可
        params: { userid: this.memberuserid }
      });
    },
    goBack() {
      if (this.memberuserid) {
        this.$emit("goback", false);
      } else {
        this.$router.go(-1);
      }
    }
  },
  components: {
    Empty
  }
};
</script>
<style scoped lang="less">
.my-xueqing-wrap {
  // border: 1px solid #f00;
  .main {
    .top {
      background: #fff;
      .user {
        position: relative;
        height: auto;
        padding-left: 100px;
        height: 105px;
        border-bottom: 1px solid#f0f0f0;
        > div {
          margin-left: 95px;
          width: calc(100% - 105px);
        }
        .avatarimgpart {
          width: 76px;
          height: 76px;
          float: left;
        }
        .accountpart {
          color: #c8c8cd;
          margin-top: 5px;
        }
      }
    }
    .lable {
      width: 100%;
      height: 60px;
      line-height: 30px;
      background: #fff;
      margin-top: 10px;
      > p {
        position: relative;
        display: inline-block;
        width: 50%;
      }
      .tit-name,
      .tit-nub {
        color: #5d5d5d;
        display: block;
      }
      .act {
        .tit-name,
        .tit-nub {
          color: #0089ff;
        }
      }
    }
    .info-list-wrap {
      position: relative;
      height: 60vh;
      min-height: 60vh;
      overflow-y: auto;
      background: #fff;
      .item {
        position: relative;
        padding: 15px 15px 15px 80px;
        border-top: 1px solid #f0f0f0;
        .avatarimgpart {
          width: 60px;
          height: 60px;
          float: left;
        }
        .accountpart {
          color: #c8c8cd;
          margin-top: 5px;
        }
        .item-info {
          .nub {
            color: #ff8900;
          }
        }
      }
    }
  }
}
</style>