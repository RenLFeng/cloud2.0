<template>
  <div class="pingce-wrap">
    <mt-header :title="$mt('评测记录')" class="mint-header-f">
      <mt-button icon="back" slot="left" @click="Backs">{{$mt('返回')}}</mt-button>
    </mt-header>
    <Vanbr
      :tabBar="tabBar"
      width="18"
      @selectClick="onselectClick"
      seleid="id"
      v-if="pingceHistoryList.length"
    />
    <!-- <div
      class="van-navbr-wrap"
      v-if="pingceHistoryList.length"
      :class="$i18n.locale!='zh'?'nozh':''"
    >
      <ul>
        <li
          v-for="(v,i) in tabBar"
          :key="i"
          :class="{'active':v.isActive,'nolen':!v.num}"
          @click="selectClick($event,v,i)"
          ref="tbLi"
        >
          <span class="lable font18 nowrap">{{$mt(v.label)}}</span>
          <span class="num fontxs">{{v.num}}</span>
        </li>
        <span class="move-bar" :style="`left:${moveBar}px`"></span>
      </ul>
    </div>-->

    <!-- :bottom-method="loadMore"
        @bottom-status-change="handleBottomChange"
        :bottom-all-loaded="allLoaded"
        bottomPullText
    bottomDropText="上拉加载更多"-->
    <div
      class="main scrollingtouch"
      v-infinite-scroll="loadMore"
      infinite-scroll-disabled="loading"
      infinite-scroll-distance="10"
      infinite-scroll-immediate-check="false"
    >
      <mt-loadmore
        :top-method="loadTop"
        @top-status-change="handleTopChange"
        :top-distance="80"
        ref="loadmore"
        :auto-fill="autofill"
        :topPullText="$mt('下拉刷新')"
        :topDropText="$mt('释放更新')"
        :topLoadingText="$mt('加载中')"
      >
        <div v-if="pingceHistoryList.length" class="box">
          <List
            v-for="(v,index) in pingceHistoryList"
            :key="index"
            :item="v"
            type="pingce"
            @click.native="details(v)"
            @edit="onEdit"
          />
          <BottomLoadmore v-if="allLoaded && listLoadend" showType loadtext="已经加载全部了" type color />
          <BottomLoadmore
            v-if="!allLoaded && loading"
            showType="loading"
            loadtext="加载中"
            type="triple-bounce"
            color
          />
        </div>
        <Empty v-else />
      </mt-loadmore>
    </div>

    <mt-popup
      v-model="popupDeatil"
      position="right"
      class="mint-popup"
      :modal="false"
      style="background:#f0f0f0;    overflow: auto;"
    >
      <mt-header :title="$mt(pingceType(pingceItemfile.ptype))" class>
        <mt-button icon="back" slot="left" @click="goBacks">{{$mt('返回')}}</mt-button>
      </mt-header>
      <Deatil :data="pingceItemfile" :showState="popupDeatil" />
    </mt-popup>
    <mt-actionsheet :actions="actions" :cancelText="$mt('取消')" v-model="actionShow"></mt-actionsheet>
  </div>
</template>

<script>
import Empty from "@/common/empty";
import Vanbr from "@/common/van-navbr";
import List from "@/common/list";
import Deatil from "./detail";
import { pingceType, CollectionFn } from "@/util";
import BottomLoadmore from "@/common/bottom-loadmore";
import { Indicator, Toast, MessageBox, Actionsheet } from "mint-ui";
export default {
  name: "PingCe",
  watch: {
    popupDeatil: function(val) {}
  },
  components: {
    List,
    Deatil,
    Empty,
    BottomLoadmore,
    [Actionsheet.name]: Actionsheet,
    Vanbr
  },

  data() {
    return {
      pingceHistoryList: [],
      tempHistory: [],
      bankeid: 0,

      popupDeatil: false,

      pingceItemfile: {},
      pingceType,

      page: 0,
      pagesize: 10,
      actions: [
        {
          name: this.$mt("收藏"),
          method: this.Collection
        }
      ],
      actionShow: false,
      editItemObj: {},

      showsingle: false,
      pingceid: 0,

      moveBar: 0,
      filterType: 0,
      tabBar: [
        {
          id: 0,
          label: "ALL",
          num: 0,
          isActive: true
        },
        {
          id: 2,
          label: "选择",
          num: 0,
          isActive: false
        },
        {
          id: 1,
          label: "判断",
          num: 0,
          isActive: false
        },
        {
          id: 4,
          label: "主观",
          num: 0,
          isActive: false
        },
        {
          id: 5,
          label: "写作",
          num: 0,
          isActive: false
        },
        {
          id: 6,
          label: "抢答",
          num: 0,
          isActive: false
        },
        {
          id: 10,
          label: "投票",
          num: 0,
          isActive: false
        }
      ],

      autofill: false,
      listLoadend: false,
      topStatus: "",
      bottomStatus: "",
      allLoaded: false,
      dropType: 0,
      loading: false
    };
  },
  mounted() {
    let params = this.$route.params;
    if (params.bankeid) {
      this.bankeid = params.bankeid;
    } else if (params.pingceid) {
      this.pingceid = params.pingceid;
      this.showsingle = true;
    }
    this.HistoryListRQuery();
  },
  methods: {
    selectClick(e, v, i) {
      // if (!v.num) return;
      // let curel = this.$refs.tbLi[i];
      // this.moveBar = curel.offsetLeft;
      // this.filterType = v.id;
      // for (let v of this.tabBar) {
      //   v.isActive = false;
      // }
      // this.tabBar[i].isActive = true;
      // this.filterData(this.filterType);
    },
    onselectClick(id) {
      this.filterType = id;
      this.filterData(this.filterType);
    },
    filterData(type) {
      if (!type) {
        this.pingceHistoryList = this.tempHistory;
        return;
      }
      this.pingceHistoryList = this.tempHistory.filter(item => {
        if (type == 2) {
          return type == item.ptype || item.ptype == 3;
        } else {
          return type == item.ptype;
        }
      });
      this.$nextTick(() => {});
    },
    onEdit(item) {
      console.log(item);
      this.editItemObj = item;
      this.actionShow = true;
    },
    //收藏
    Collection() {
      let imgIcon = "";
      //this.editItemObj.pic = this.editItemObj.files + "_snap.jpg";
      //this.editItemObj.name=pingceType(this.editItemObj.ptype)
      imgIcon = this.editItemObj.files + "_snap.jpg";
      let title = pingceType(this.editItemObj.ptype);
      let cobj = {};
      CollectionFn(
        cobj,
        4,
        imgIcon,
        this.editItemObj.id,
        this.bankeid,
        this,
        title
      );
    },
    loadTop() {
      this.pingceHistoryList = [];
      this.tempHistory = [];
      this.page = 0;
      this.allLoaded = false;
      this.listLoadend = false;
      this.loading = false;
      this.HistoryListRQuery();
    },
    loadMore() {
      this.loading = true;
      this.HistoryListRQuery();
    },
    handleTopChange(status) {
      this.topStatus = status;
    },
    handleBottomChange(status) {
      this.bottomStatus = status;
    },
    HistoryListRQuery() {
      let qobj = {
        page: this.page,
        pagesize: this.pagesize
      };
      if (this.showsingle) {
        qobj.id = this.pingceid;
      } else {
        qobj.bankeid = this.bankeid;
      }
      this.$http
        .post("api/pingce/query", qobj)
        .then(res => {
          if (res.data.code == "0") {
            if (res.data.data.length) {
              for (let v of res.data.data) {
                if (v.ptype == 2 || v.ptype == 3) {
                  v.optdesc = JSON.parse(v.optdesc);
                }
              }
            }
            if (res.data.data.length >= this.pagesize) {
              this.loading = false;
              this.page++;
            } else {
              if (this.page) {
                this.listLoadend = true;
              }
              this.allLoaded = true;
              this.loading = true;
            }
            this.pingceHistoryList = [
              ...this.pingceHistoryList,
              ...res.data.data
            ];
            this.tempHistory = [...this.tempHistory, ...res.data.data];
            this.filterData(this.filterType);
            this.Statistics(this.tempHistory);
            console.log("pingce/query", res);
            if (this.showsingle) {
              if (res.data.data.length == 0) {
                Toast(this.$mt("未找到记录"));
              } else {
                this.details(this.pingceHistoryList[0]);
              }
            }
            console.log("pingceHistoryList", this.pingceHistoryList);
          } else {
            Toast(this.$mt("连接错误"));
          }
          if (this.dropType) {
            this.$refs.loadmore.onBottomLoaded();
          } else {
            this.$refs.loadmore.onTopLoaded();
          }
        })
        .catch(err => {
          if (this.dropType) {
            this.$refs.loadmore.onBottomLoaded();
          } else {
            this.$refs.loadmore.onTopLoaded();
          }
          Toast(this.$mt("异常"));
        });
    },
    details(v) {
      console.log("dddd", v);
      this.pingceItemfile = v;
      if (
        this.pingceItemfile.info &&
        typeof this.pingceItemfile.info == "string"
      ) {
        this.pingceItemfile.info = JSON.parse(this.pingceItemfile.info);
        for (let i = 0; i < this.pingceItemfile.info.opts.length; i++) {
          this.pingceItemfile.info.opts[i] = JSON.parse(
            this.pingceItemfile.info.opts[i]
          );
        }
      }
      this.popupDeatil = true;
    },
    Backs() {
      this.$back();
    },
    goBacks() {
      if (this.popupDeatil) {
        this.popupDeatil = false;
        if (this.showsingle) {
          this.Backs();
        }
      }
    },
    handler(e) {
      e.preventDefault();
    },
    Statistics(arr) {
      if (Array.isArray(arr)) {
        this.initStatistics();
        this.tabBar[0].num = arr.length;
        for (let i = 0; i < arr.length; ++i) {
          let ptype = arr[i].ptype;
          for (let j = 1; j < this.tabBar.length; j++) {
            let v = this.tabBar[j];
            if (v.id == ptype || (v.id == 2 && ptype == 3)) {
              v.num++;
            }
          }
        }
      }
      console.log("ccc", this.tabBar);
    },
    initStatistics() {
      for (let v of this.tabBar) {
        v.num = 0;
      }
    }
  }
};
</script>

<style lang='less' scoped>
.pingce-wrap {
  overflow: hidden;
  // .van-navbr-wrap {
  //   position: fixed;
  //   z-index: 99;
  //   width: 100vw;
  //   height: 54px;
  //   overflow: hidden;
  //   margin-top: 49px;
  //   background: #fff;
  //   > ul {
  //     position: absolute;
  //     left: 0;
  //     top: 0;
  //     display: flex;
  //     li {
  //       display: flex;
  //       width: 52px;
  //       height: 54px;
  //       flex-direction: column;
  //       align-items: center;
  //       justify-content: center;
  //       padding: 0 5px;
  //       span {
  //         display: inline-block;
  //         width: 100%;
  //         text-align: center;
  //         color: #5d5d5d;
  //       }
  //       .lable {
  //       }
  //       .num {
  //       }
  //       &.active {
  //         span {
  //           color: #0089ff;
  //         }
  //       }
  //       &.nolen {
  //         opacity: 0.5;
  //       }
  //     }
  //     .move-bar {
  //       position: absolute;
  //       left: 0;
  //       bottom: 0;
  //       width: 52px;
  //       height: 3px;
  //       background: #0089ff;
  //     }
  //   }
  // }
  .main {
    margin-top: 110px;
    height: 84vh;
    overflow: auto;
    .box {
      min-height: 84vh;
    }
  }
}
</style>
<style>
.pingce-wrap .van-tabs__nav {
  border: none;
  border-radius: 0;
}
.pingce-wrap .van-tabs__wrap {
  width: 100%;
}
.pingce-wrap .van-navbr-wrap {
}
</style>