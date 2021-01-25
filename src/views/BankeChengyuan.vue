<template>
  <div class="memberdesc-main">
    <div class="memberdesc clearfix Average-wrap">
      <div class="membertitledesc">
        <p
          style="padding-left:10px;margin-right:15px"
          class="nowrap"
        >{{$mt('成员总数%s人',[membernumdesc])}}</p>
        <p @click="AverageScoreEchart" class="colord Average nowrap">
          <span class="ellipse sct">{{$mt('平均得分')}}:</span> &nbsp;
          <span>{{Average}}</span>
        </p>
      </div>
      <i
        class="iconfont iconjiantou eicotrigger colord position-r Average-to"
        @click="AverageScoreEchart"
      ></i>
    </div>

    <div class="listcontainer Member scrollingtouch">
      <mt-loadmore
        :top-method="loadTop"
        @top-status-change="handleTopChange"
        :top-distance="80"
        ref="loadmore"
        class
        :auto-fill="autofill"
        :topPullText="$mt('下拉刷新')"
        :topDropText="$mt('释放更新')"
        :topLoadingText="$mt('加载中')"
      >
        <div class="list-wrap">
          <div
            v-infinite-scroll="loadMoreMember"
            infinite-scroll-disabled="loadingState"
            infinite-scroll-distance="10"
          >
            <div
              v-for="(mitem,selindex) in members"
              v-bind:key="selindex"
              @click="seeMemberDetail(mitem)"
            >
              <BankeMemberSimple
                :indexShow="1"
                :icon="1"
                :memberuser="members[selindex]"
                :index="selindex"
                @editclick="onEditclick"
              ></BankeMemberSimple>
            </div>
          </div>
          <div v-if="membersempty" class="tc emptydesc">{{liststatedesc}}</div>
        </div>
      </mt-loadmore>
    </div>
    <mt-popup
      v-model="popupMemberDetail"
      position="right"
      class="popup-right info-popup"
      :modal="false"
      style="background:#f0f0f0"
    >
      <mt-header :title="$mt('成员详情')" class>
        <mt-button slot="left" icon="back" @click="goBack()">{{$mt('返回')}}</mt-button>
      </mt-header>
      <div class="content-main popup-scroll-MemberDetail">
        <MemberDetail :memberuser="DetailItem" :chartData="chartData" />
      </div>
    </mt-popup>
    <mt-actionsheet :actions="actions" v-model="actionShow" :cancelText="$mt('取消')"></mt-actionsheet>
  </div>
</template>

<script>
import { Indicator, Toast, MessageBox, Actionsheet } from "mint-ui";
import { filterItem } from "@/util";
import BankeMemberSimple from "./components/BankeMemberSimple";
import MemberDetail from "./bankeMember/detail";
import commontools from "../commontools";

export default {
  name: "BankeZiyuan",
  props: {
    bankeid: {
      default() {
        return 0;
      }
    },
    schollid: {
      default: 0
    }
  },
  data() {
    return {
      members: [],
      membersid: [],
      liststatedesc: "",
      loadingState: false,
      isloading: false,
      Average: 0,
      popupMemberDetail: false,
      DetailItem: {},
      chartData: {},

      actionShow: false,

      autofill: false,
      topStatus: false
    };
  },
  computed: {
    isteacher() {
      let isteacher = this.$store.getters.caneditbanke;
      return isteacher;
    },
    showcontrol() {
      if (this.$store.getters.caneditbanke) {
        return true;
      }
      return false;
    },
    actions() {
      let objret = [];
      objret.push({
        name: this.$mt("查看"),
        method: this.see
      });
      let canopt = this.$store.getters.caneditbanke;
      if (canopt) {
        objret.push({
          name: this.$mt("删除"),
          method: this.dlMember
        });
      }
      return objret;
    },
    membersempty() {
      if (this.members.length) {
        return false;
      }
      return true;
    },
    membernumdesc() {
      if (this.isloading) {
        return 0;
      }
      var nnum = 0;
      if (this.members.length) {
        nnum = this.members.length;
      }
      // nnum += ' 人';
      return nnum;
    }
  },
  created() {},
  components: {
    BankeMemberSimple,
    MemberDetail,
    [Actionsheet.name]: Actionsheet
  },
  methods: {
    loadTop() {
      this.Average = 0;
      this.loadMoreMember();
    },
    handleTopChange(status) {
      this.topStatus = status;
    },
    seeMemberDetail(item) {
      this.DetailItem = item;
      this.popupMemberDetail = true;
      this.$store.commit("SET_FOOTER_BAR_STATE", false);
      this.chartData = {
        account: item.account
      };
    },
    onEditclick(item) {
      this.DetailItem = item;
      this.actionShow = true;
    },
    see() {
      this.actionShow = false;
      this.popupMemberDetail = true;
      this.$store.commit("SET_FOOTER_BAR_STATE", false);
      this.chartData = {
        account: item.account
      };
    },
    dlMember() {
      if (!this.showcontrol) {
        Toast(this.$mt("你无权限"));
        return;
      }
      let deluserid = this.DetailItem.memberuserid;
      this.$confirm({
        msg: "您确定要删除吗",
        docb: () => {
          this.$http
            .post("/api/banke/memberdelete", {
              bankeid: this.bankeid,
              userid: deluserid
            })
            .then(res => {
              if (res.data.code == 0) {
                Toast(this.$mt("删除成功"));
                for (let i = 0; i < this.members.length; i++) {
                  if (this.members[i].memberuserid == deluserid) {
                    this.members.splice(i, 1);
                    break;
                  }
                }
              } else {
                Toast(this.$mt("删除失败"));
              }
            })
            .catch(() => {
              Toast(this.$mt("服务异常"));
            });
        }
      });
    },
    AverageScoreEchart() {
      let userids = this.$store.commit("setRouterForward", true);
      // let tourl = "/AverageScore/" + this.bankeid;
      // this.$router.push(tourl);
      this.$router.push({
        name: "AverageScore",
        params: { classid: this.bankeid, userids: this.membersid }
      });
    },
    onMemberSign() {},
    onMemberGroup() {},
    loadMoreMember() {
      this.loadingState = true;
      this.isloading = true;
      Indicator.open(this.$mt("加载中"));
      var url = "/api/api/bankememberquery?bankeid=" + this.bankeid;

      this.$http
        .post(url)
        .then(res => {
          this.isloading = false;
          if (res.data.code == 0) {
            let members = res.data.data["members"];
            for (let v of members) {
              if (!v.name) {
                v.name = this.$mt("未知名");
              }
              if (!v.avatar) {
                v.avatar = "";
              }
              this.membersid.push(v.memberuserid);
            }
            let curbanke = this.$store.state.curbanke;
            if (typeof curbanke["scorerule1"] == "undefined") {
            }
            for (let v of members) {
              v.score = 0;
              v.score =
                (v.score1 * curbanke.scorerule1) / 100 +
                (v.score2 * curbanke.scorerule2) / 100 +
                (v.score3 * curbanke.scorerule3) / 100 +
                (v.score4 * curbanke.scorerule4) / 100;
              this.Average += v.score;
            }
            this.Average = parseInt(
              this.Average / (members.length ? members.length : 1)
            );
            if (this.schollid && members.length) {
              this.querybind(members);
            } else {
              this.members = members;
            }
          }
          this.liststatedesc = "";
          Indicator.close();
          this.$refs.loadmore.onTopLoaded();
        })
        .catch(() => {
          this.isloading = false;
          this.loadingState = false;
          Indicator.close();
          this.$refs.loadmore.onTopLoaded();
        });
    },
    //查询是否有绑定
    querybind(members) {
      this.$http
        .post("/api/school/querybind", {
          schoolid: this.schollid,
          userids: this.membersid
        })
        .then(res => {
          if (res.data.code == "0") {
            if (res.data.data.bind.length) {
              for (let v of members) {
                for (let item of res.data.data.bind) {
                  if (v.memberuserid == item.userid) {
                    v.sno = item.sno;
                    v.snoTitle =
                      item.schoolrole > 5 ? this.$mt("工号") : this.$mt("学号");
                  }
                }
              }
            }
          }
          this.members = members;
        })
        .catch(err => {
          this.members = members;
        });
    },
    goBack() {
      if (this.popupMemberDetail) {
        this.popupMemberDetail = false;
      }
      this.$store.commit("SET_FOOTER_BAR_STATE", true);
    }
  }
};
</script>

<style scoped>
.memberdesc-main {
  /* background: #fff; */
  margin-top: 10px;
}
.memberdesc-main .head {
  background: #fff;
}
.memberdesc {
  font-size: 18px;
  border-bottom: 1px solid #eaeaea;
  border-top: 1px solid #eaeaea;
  padding: 10px 10px;
}
.membertitledesc {
  display: flex;
  align-items: center;
}
.membertitledesc p {
  width: 50%;
}
.membertitledesc p.Average {
  position: relative;
  display: flex;
}
.membertitledesc p.Average .sct {
  width: 100%;
}
.membertitledesc p.Average i {
  right: 0;
}
.membernumdesc {
  float: right;
}
.Average-wrap {
  background: #fff;
  position: relative;
}
.Average-to {
  background: #fff;
  font-weight: bold;
  height: 85%;
  display: flex;
  align-items: center;
  border-left: 1px solid #f5f0f0;
}
.Average {
  padding: 0 19px;
  text-align: center;
}

.loadmore {
  min-height: 200px;
}

.uploadtabbar {
  position: static;
}

.emptydesc {
  margin-top: 50px;
}

.uploadimgsize {
  width: 35px;
  heigth: 35px;

  margin-bottom: 2px;
}

.uploadtabbar img {
  border-radius: 50%;
}

.uploadpart {
}
.listcontainer.Member {
  height: 71vh;
  min-height: 71vh;
  overflow: scroll;
}
.listcontainer.Member .list-wrap {
  min-height: 71vh;
}
.popup-scroll-MemberDetail {
  height: 100vh;
  min-height: 100vh;
  overflow: auto;
  padding-bottom: 50px;
}
</style>