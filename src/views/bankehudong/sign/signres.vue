<template>
  <div class="signres-wrap">
    <mt-header :title="$mt(signTitle)" class="mint-header-f">
      <mt-button icon="back" slot="left" @click="cance">{{$mt('返回')}}</mt-button>
    </mt-header>
    <div class="main">
      <div class="top-info-wrap">
        <p class="start-time">{{$mt('签到开始时间')}}:{{signresData.date}}&nbsp;{{signresData.time}}</p>
        <div class="info">
          <p>{{$mt('校验方式')}}:</p>
          <div>
            <div v-if="Location">
              <p>
                {{$mt('位置校验')}}:
                <span>{{$mt('%s米',[distance])}}</span>
              </p>
            </div>
            <div v-else>{{$mt('当前无校验方式,教师手动签到')}}</div>
          </div>
        </div>
      </div>
      <p
        class="allset colord"
        @click="setall"
        v-if="master &&  signresData.state == 0"
      >{{$mt('一键设置签到')}}</p>
      <Vanbr :tabBar="tabBar"  @selectClick="onselectClick" />
      <!-- <div class="van-navbr-wrap" :class="$i18n.locale!='zh'?'nozh':''">
        <ul>
          <li
            v-for="(v,i) in tabBar"
            :key="i"
            :class="v.isActive?'active':''"
            @click="selectClick($event,v,i)"
            ref="tbLi"
          >
            <span class="lable font18 nowrap">{{$mt(v.label)}}</span>
            <span class="num fontxs">{{v.num}}</span>
          </li>
          <span class="move-bar" :style="`left:${moveBar}px;`"></span>
        </ul>
      </div> -->
      <div class="member-list-wrap">
        <ul class="overflow-scroll" :class="master&&signresData.state == 0?'master':''">
          <li v-for="(v,i) in signmembers" :key="i" @click="itemedit(v)">
            <img :src="v.avatar" :onerror="$defaultImg('account')" class="avatarimg position-l" />
            <!-- <img :src="v.avatar" :onerror="$defaultImg('account')" class="avatarimg position-l" /> -->
            <div class="user-info">
              <p class="t">
                <span class="color1 ellipse name">{{v.name}}</span>
                <span class="fr colora color9">{{v.typedesc}}</span>
              </p>
              <p class="b">
                <span :style="`color:${signGetStateDesc(v.state,0)}`">{{v.stateText}}</span>
                <span class="fr colora color9">{{$mt('得分')}}:{{v.score}}</span>
              </p>
            </div>
          </li>
        </ul>
        <Empty v-if="!signmembers.length" :text="['无记录']" />
      </div>
    </div>
    <div class="footer" v-if="master && signresData.state == 0">
      <p>
        <span class="colord">{{signmemberNuber}}</span>/
        <span>{{signmembers.length}}</span>
      </p>
      <p @click="SignEnd">{{$mt('结束')}}</p>
    </div>
    <mt-actionsheet
      :actions="actions"
      :cancelText="$mt('取消')"
      v-model="actionShow"
      ref="Actionsheet"
      id="Actionsheet"
    ></mt-actionsheet>
  </div>
</template>
<script>
import nativecode from "@/nativecode";
import Empty from "@/common/empty";
import { Indicator, Toast, MessageBox, Actionsheet } from "mint-ui";
import { Whatweek, parseURL, signGetTypeDesc, signGetStateDesc } from "@/util";
import Vanbr from "@/common/van-navbr";
export default {
  name: "",
  props: {
    signresData: {
      default() {
        return {};
      }
    },
    master: {
      default: false
    }
    // distance: {
    //   default: 100
    // },
    // Location: {
    //   default() {
    //     return {};
    //   }
    // }
  },
  data() {
    return {
      tabBar: [
        {
          id: 100,
          label: "ALL",
          num: 0,
          isActive: true
        },
        {
          id: 1,
          label: "已签到",
          isActive: false,
          num: 0
        },
        {
          id: 0,
          label: "未签到",
          isActive: false,
          num: 0
        },
        {
          id: 2,
          label: "迟到",
          num: 0,
          isActive: false
        },
        {
          id: 3,
          label: "超时",
          num: 0,
          isActive: false
        }
      ],
      moveBar: 0,
      filterType: 100,
      signmembers: [],
      signmemberNuber: 0,
      signGetStateDesc,
      signGetTypeDesc,
      isitem: true,
      actionShow: false,
      times: null,
      distance: 100,
      Location: null
    };
  },
  computed: {
    canedit() {
      if (this.master && this.signresData.state == 0) {
        return true;
      }
      return false;
    },
    actions() {
      let objret = [];
      if (this.isitem) {
        objret.push({
          name: this.$mt("设为已签到"),
          state: 1,
          method: this.changState
        });
        objret.push({
          name: this.$mt("设为未签到"),
          state: 0,
          method: this.changState
        });
      } else {
        objret.push({
          name: this.$mt("一键设为已签到"),
          state: 1,
          method: this.changState
        });
        objret.push({
          name: this.$mt("一键设为未签到"),
          state: 0,
          method: this.changState
        });
      }

      return objret;
    },
    signTitle() {
      if (this.signresData.state == 0) {
        return "签到中";
      }
      return "签到结果";
    }
  },
  watch: {},
  created() {
    console.log("当前签到 结果页", this.signresData);
    if (this.signresData.info) {
      if (typeof this.signresData.info == "string") {
        if (this.signresData.info.substr(0, 1) == "{") {
          console.log("json str 解析");
          this.signresData.info = JSON.parse(this.signresData.info);
        }
      }
      if (this.signresData.info.gps) {
        this.Location = this.signresData.info.gps;
        if (this.signresData.info.gps.gpsdist) {
          this.distance = this.signresData.info.gps.gpsdist;
        }
      }
      if (this.signresData.info.distance) {
        this.distance = this.signresData.info.distance;
      }
    }
  },
  mounted() {
    this.signquerymember();
    // this.times = setInterval(() => {
    //   this.signquerymember();
    // }, 2000);
  },
  methods: {
    signquerymember() {
      this.$http
        .post("/api/sign/signquerymember", { id: this.signresData.id })
        .then(res => {
          if (res.data.code == 0) {
            this.signmemberNuber = 0;
            if (res.data.data && res.data.data.signmembers.length) {
              let users = Object.values(res.data.data.users);
              let signmembers = Object.values(res.data.data.signmembers);

              console.log("users111", users);
              console.log("signmember222s", signmembers);
              let mergeData = [];
              for (let v of res.data.data.signmembers) {
                if (v.signinfo) {
                  v.signinfo = JSON.parse(v.signinfo);
                }
                for (let user of res.data.data.users) {
                  if (v.userid == user.id) {
                    v.name = user.name;
                    v.avatar = user.avatar;
                  }
                }
                if (v.state > "0") {
                  this.signmemberNuber++;
                }
                v.stateText = signGetStateDesc(v.state, 1, this.$mt);
                v.typedesc = signGetTypeDesc(v.signnum, this.$mt);
                mergeData.push(v);
              }
              this.signmembers = mergeData;
              this.tempsignmembers = mergeData;
              console.log("signmembers 签到成员", this.signmembers);
              this.filterData(this.filterType);
              this.Statistics(this.tempsignmembers);
            }
          } else {
          }
        })
        .catch(err => {});
    },
    setall() {
      if (!this.canedit) return;
      this.isitem = false;
      this.actionShow = true;
    },
    itemedit(v) {
      //  console.log(v);
      //  console.log(this.signresData);
      // console.log(this.signmembers);
      // return
      if (!this.canedit) return;
      this.curEdititem = v;
      this.isitem = true;
      this.actionShow = true;
    },
    changState(v) {
      if (!this.isitem) {
        this.setAllSignState(v.state);
        return;
      }
      this.$http
        .post("/api/sign/changestate", {
          signid: this.signresData.id,
          userid: this.curEdititem.userid,
          state: v.state
        })
        .then(res => {
          if (res.data.code == 0) {
            this.signquerymember();
          } else {
            Toast(this.$mt("设置失败"));
          }
        })
        .catch(err => {
          Toast(this.$mt("服务开小差了"));
        });
    },

    //批量修改签到状态
    setAllSignState(state) {
      this.$http
        .post("/api/sign/batchstate", {
          signid: this.signresData.id,
          state: state
        })
        .then(res => {
          if (res.data.code == 0) {
            this.signquerymember();
          } else {
            Toast(this.$mt("设置失败"));
          }
        })
        .catch(err => {
          Toast(this.$mt("服务开小差了"));
        });
    },
    SignEnd() {
      this.$confirm({
        msg: "您确定要结束签到",
        docb: () => {
          Indicator.open(this.$mt("结束中") + "...");
          this.$http
            .post("/api/sign/signupdate", {
              id: this.signresData.id,
              state: 1
            })
            .then(res => {
              if (res.data.code == 0) {
                this.$emit("changesigndata", res.data.data);
              } else {
                Toast(this.$mt("失败") + res.data.msg);
              }
              Indicator.close();
            })
            .catch(() => {
              Toast(this.$mt("服务开小差了"));
              Indicator.close();
            });
        }
      });
    },
    selectClick(e, v, i) {
      if (!v.num) return;
      let curel = this.$refs.tbLi[i];
      this.moveBar = curel.offsetLeft;
      this.filterType = v.id;
      for (let v of this.tabBar) {
        v.isActive = false;
      }
      this.tabBar[i].isActive = true;
      this.filterData(this.filterType);
    },
    onselectClick(id) {
      this.filterType = id;
      this.filterData(this.filterType);
    },
    filterData(type) {
      if (type == 100) {
        this.signmembers = this.tempsignmembers;
        return;
      }
      this.signmembers = this.tempsignmembers.filter(item => {
        return type == item.state;
      });
    },
    Statistics(arr) {
      if (Array.isArray(arr)) {
        this.initStatistics();
        this.tabBar[0].num = arr.length;
        for (let i = 0; i < arr.length; ++i) {
          let signState = arr[i].state;
          for (let j = 1; j < this.tabBar.length; j++) {
            let v = this.tabBar[j];
            if (v.id == signState) {
              v.num++;
            }
          }
        }
      }
    },
    initStatistics() {
      for (let v of this.tabBar) {
        v.num = 0;
      }
    },
    cance() {
      clearInterval(this.times);
      this.$emit("cance", false);
    }
  },
  components: { [Actionsheet.name]: Actionsheet, Empty,Vanbr },
  destroyed() {}
};
</script>
<style lang='less' scoped>
.signres-wrap {
  .main {
    margin-top: 50px;
    .top-info-wrap {
      background: #fff;
      padding: 10px;
      .start-time {
        margin-bottom: 15px;
      }
    }
    .allset {
      background: #fff;
      padding: 10px;
    }
    .van-navbr-wrap {
      position: relative;
      width: 100vw;
      height: 54px;
      overflow: hidden;
      background: #fff;
      margin-top: 0;
      > ul {
        
      }
    }
    .member-list-wrap {
      background: #fff;
      margin-top: 2px;
      ul {
        height: calc(100vh - 199px);
        &.master {
          height: calc(100vh - 316px);
        }
        li {
          width: 100%;
          position: relative;
          display: flex;
          align-items: center;
          padding: 20px 0 20px 70px;
          border-bottom: 1px solid #e5e5e5;
          .avatarimg {
            display: block;
            width: 60px;
            height: 60px;
            border-radius: 60px;
          }
          .user-info {
            width: 100%;
            padding: 0 10px;
            .t {
              .name {
                display: inline-block;
                width: calc(100% - 80px);
              }
            }
          }
        }
      }
    }
  }
  .footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 60px;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fff;
    font-size: 18px;
    padding: 40px 0;
    border-top: 1px solid #ccc;
    p {
      padding: 5px 0;
    }
  }
}
</style>