<template>
  <div class="myxunlian-wrap">
    <mt-header :title="xunlianname" class="mint-header-f">
      <mt-button icon="back" slot="left" @click="back()">{{$mt('返回')}}</mt-button>
      <mt-button v-if="isSelectend" slot="right" @click="submit()">{{$mt('确定')}}</mt-button>
    </mt-header>
    <div class="van-navbr-wrap" v-if="courses.length">
      <ul class="overflow-scroll">
        <li
          class="ellipse"
          v-for="(v,i) in courses"
          :key="i"
          :class="v.isActive?'active':''"
          ref="tbLi"
        >
          <span class="lable font18" @click="selectClick($event,v,i)">{{v.label}}</span>
          <!-- <span class="num fontxs">{{v.num}}</span> -->
        </li>
        <span class="move-bar" ref="movebar" :style="`left:${moveBar}px`"></span>
      </ul>
    </div>
    <p class="Prev-btn" v-if="showprev" @click="onPrev">
      <i class="iconfont iconwithdraw-fill colord position-l"></i>
      <span class="font16">{{menuName}}>&nbsp;</span>
      <span style="color:#a5a5a5">{{$mt('返回上一层')}}...</span>
    </p>
    <div
      class="main overflow-scroll"
      :class="showprev?'pre':''"
      ref="listcontainer"
      v-infinite-scroll="loadMore"
      infinite-scroll-disabled="loading"
      infinite-scroll-distance="10"
      infinite-scroll-immediate-check="false"
    >
      <div class v-if="arrZhiyuan.length">
        <div v-for="(fitem,selindex) in arrZhiyuan" v-bind:key="selindex" class="item-wrap">
          <div v-if="fitem.ftype=='menu'" class="folder-wrap-item" @click="onFolderClick(fitem)">
            <img
              class="img object-fit-img position-l;"
              :src="fitem.imgsrc"
              :onerror="$defaultImg('')"
            />
            <div class="info-wrap position-r">
              <div class="position-l">
                <p class="name ellipse">{{fitem.name}}</p>
                <p class="time font-xxs colora5">{{fitem.createtime}}</p>
              </div>
              <!-- <i
                class="iconfont iconjiantou1 eicotrigger colord position-r"
                @click.stop="oneditclick(fitem)"
              ></i>-->
            </div>
          </div>
          <BankeFileSimple
            v-else
            :xunlian="true"
            :fileitem="arrZhiyuan[selindex]"
            :index="selindex"
            :arrZhiyuan="arrZhiyuan"
            :fileInfo="fileInfo"
            :selection="true"
            :cfrom="true"
            @selectionClick="onSelectionClick"
          ></BankeFileSimple>
        </div>
      </div>
      <p v-else class="position-c">{{$mt('未找到文件')}}...</p>
    </div>
  </div>
</template>

<script>
import { defaultImg, getZYFileTypeIcon } from "@/util";
import { Indicator, Toast, MessageBox, Actionsheet } from "mint-ui";
const BankeFileSimple = () => import("@/views/components/BankeFileSimple");
export default {
  props: {
    xunlianname: {
      defaulit: '训练'
    },
    xunlianId: {
      default: 0
    },
    isAPP: {
      default: false
    }
  },
  data() {
    return {
      courseid: 0,
      courses: [],
      moveBar: 24,
      arrZhiyuan: [],
      page: 0,
      pagesize: 10,
      allLoaded: false,
      loading: false,
      listLoadend: false,

      tempmenuData: [],
      finttype: [101, 3, 2],
      curFileitem: {},
      tempScorllTop: []
    };
  },
  computed: {
    user() {
      return this.$store.getters.curuser;
    },
    menuName() {
      if (this.tempmenuData.length) {
        return this.tempmenuData[this.tempmenuData.length - 1].name;
      }
      return "";
    },
    showprev() {
      if (this.tempmenuData.length) {
        return true;
      }
      return false;
    },
    parentid() {
      if (this.tempmenuData.length) {
        return this.tempmenuData[this.tempmenuData.length - 1].id;
      }
      return 0;
    },
    fileInfo() {
      for (let v of this.arrZhiyuan) {
        let localfiles = [];
        if (v.info) {
          let arr = [];
          arr[0] = v.info;
          localfiles = arr;
        } else {
          localfiles = [];
        }
        return localfiles;
      }
    },
    isSelectend() {
      for (let v of this.arrZhiyuan) {
        if (v.isAct) {
          return true;
        }
      }
      return false;
    }
  },
  created() {
    this.courseQ();
  },
  mounted() {},
  watch: {},
  methods: {
    courseQ() {
      var url = "/api/api/bankequery2";
      let postData = {
        page: 0,
        pagesize: 10
      };
      this.$http
        .post(url, postData)
        .then(res => {
          if (res.data.code == "0") {
            if (res.data.data.bankes.length) {
              for (let key in res.data.data.bankes) {
                key = parseInt(key);
                let item = res.data.data.bankes[key];
                let isPush = true;
                if (item.courseid) {
                  for (let v of this.courses) {
                    if (v.courseid == item.courseid) {
                      isPush = false;
                    }
                  }
                  if (isPush) {
                    this.courses.push({
                      id: key,
                      label: item.coursename,
                      isActive: false,
                      item: item,
                      courseid: item.courseid
                    });
                  }
                }
              }
               this.courses[0].isActive=true;
              this.courseid = this.courses[0].courseid;
              this.loadMoreFile(this.parentid);
            }
          }
        })
        .catch(err => {});
    },
    
    selectClick(e, v, i) {
      if (v.isActive) return;
      this.courseid = v.courseid;
      let curel = this.$refs.tbLi[i];
      let targetwidth = e.target.offsetWidth;
      let moveBar = (52 - targetwidth) / 2;
      this.moveBar = e.target.offsetLeft - moveBar;
      for (let v of this.courses) {
        v.isActive = false;
      }
      this.courses[i].isActive = true;
      this.tempmenuData = [];
      this.loadTopInit();
      this.loading = true;
      this.loadMoreFile(this.parentid);
    },
    onFolderClick(fitem) {
      let listcontainer = this.$refs.listcontainer;
      let prevTop = listcontainer.scrollTop;
      this.tempScorllTop.push(prevTop);
      let localarrZhiyuan = this.arrZhiyuan;
      this.cMenuItem = fitem;
      this.tempmenuData.push({
        cfrom: true,
        id: fitem.id,
        curRootPrevid: fitem.parentid,
        curRootPrevname: this.menuName,
        name: fitem.name,
        page: this.page,
        allLoaded: this.allLoaded,
        loading: this.loading,
        listLoadend: this.listLoadend,
        datas: localarrZhiyuan
      });
      this.loadMoreFile(this.parentid);
    },
    onPrev() {
      this.arrZhiyuan = this.tempmenuData[this.tempmenuData.length - 1].datas;
      for (let v of this.arrZhiyuan) {
        v.isAct = false;
      }
      this.onprevInitData();
    },
    onprevInitData() {
      let listcontainer = this.$refs.listcontainer;
      this.page = this.tempmenuData[this.tempmenuData.length - 1].page;
      this.allLoaded = this.tempmenuData[
        this.tempmenuData.length - 1
      ].allLoaded;
      this.loading = this.tempmenuData[this.tempmenuData.length - 1].loading;
      this.listLoadend = this.tempmenuData[
        this.tempmenuData.length - 1
      ].listLoadend;
      this.tempmenuData.splice(this.tempmenuData.length - 1, 1);
      this.$nextTick(() => {
        listcontainer.scrollTop = this.tempScorllTop[
          this.tempScorllTop.length - 1
        ];
        this.tempScorllTop.splice(this.tempScorllTop.length - 1, 1);
      });
    },
    loadTopInit() {
      this.arrZhiyuan = [];
      this.page = 0;
      this.loading = false;
      this.listLoadend = false;
      this.allLoaded = false;
      let listcontainer = this.$refs.listcontainer;
      this.$nextTick(() => {
        listcontainer.scrollTop = 0;
      });
    },
    onSelectionClick(fileitem) {
      this.curFileitem = fileitem;
      if (fileitem.isAct) {
        fileitem.isAct = false;
      } else {
        for (let v of this.arrZhiyuan) {
          v.isAct = false;
        }
        fileitem.isAct = true;
      }
    },
    submit() {
      let selectendFiles = {};
      for (let v of this.arrZhiyuan) {
        if (v.isAct) {
          selectendFiles = v;
        }
      }
      if (selectendFiles.info.srtpath || this.xunlianId == 4) {
        let srturl = selectendFiles.info.srtpath;
        srturl = encodeURIComponent(srturl);
        let videourl = selectendFiles.info.filepath;
        videourl = encodeURIComponent(videourl);
        if (this.xunlianId == 4) {
          srturl = selectendFiles.info.filepath;
          videourl = null;
        }
        let topage = this.topage(this.xunlianId);
        let url =
          "http://192.168.1.133:9982/xunlian/do" +
          topage +
          ".html?videourl=" +
          videourl +
          "&srturl=" +
          srturl +
          "&backaction=history";
        if (process.env.NODE_ENV !== "development") {
          url = document.location.origin;
          url +=
            "/xunlian/do" +
            topage +
            ".html?videourl=" +
            videourl +
            "&srturl=" +
            srturl +
            "&backaction=history";
        }
        window.location.href = url;
      } else {
        this.curFileitem.isAct = false;
        Toast(this.$mt('未关联字幕文件,请先关联'));
      }
    },
    topage(type) {
      switch (type) {
        case 1:
          return "tingxie";
        case 2:
          return "kouyu";
        case 3:
          return "peiying";
        case 4:
          return "faying";
      }
    },
    loadMore() {
      this.loading = true;
      this.loadMoreFile(this.parentid, false);
    },
    loadMoreFile(parentid, init = true) {
      let postData = {
        bankeid: this.courseid,
        page: this.page,
        pagesize: this.pagesize,
        parentid: parentid,
        banketype: 1,
        finttype: this.finttype
      };
      if (this.xunlianId == 4) {
        postData.finttype = [5];
      }
      this.$http
        .post("/api/bankefile/querypage", postData)
        .then(res => {
          if (res.data.code == 0) {
            if (res.data.data.files.length >= this.pagesize) {
              this.loading = false;
              this.page++;
            } else {
              if (this.page) {
                this.listLoadend = true;
              }
              this.loading = true;
              this.allLoaded = true;
            }
            if (res.data.data.files.length) {
              for (let item of res.data.data.files) {
                this.parseOneItem(item);
                this.selectIcon(item);
              }
            }
            if (init) {
              this.arrZhiyuan = res.data.data.files;
            } else {
              this.arrZhiyuan = [...this.arrZhiyuan, ...res.data.data.files];
            }
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    onCalce() {},
    back() {
      this.$emit("calce", true);
    },
    parseOneItem(item) {
      if (item.info) {
        item.info = JSON.parse(item.info);
        if (item.info.metainfo && typeof item.info.metainfo == "string") {
          item.info.metainfo = JSON.parse(item.info.metainfo);
        }
      }
    },
    selectIcon(item) {
      if (!item.isAct) {
        item.isAct = false;
      }
      if (item.ftype == "link") {
        item.imgsrc = "/assets/file_icon/IT.svg";
      } else if (item.ftype == "file") {
        if (item.finttype == "1") {
          if (
            item.info &&
            item.info.metainfo &&
            item.info.metainfo.snapsuffix
          ) {
            item.imgsrc = item.info.filepath + item.info.metainfo.snapsuffix;
          } else {
            item.imgsrc = getZYFileTypeIcon(item.info.filepath);
          }
        } else {
          item.imgsrc = getZYFileTypeIcon(item.info.filepath);
        }
      } else if (item.ftype == "menu") {
        item.imgsrc = "/assets/file_icon/folder.svg";
      }
    }
  },
  components: { BankeFileSimple }
};
</script>
<style scoped lang="less">
.myxunlian-wrap {
  position: relative;
  .van-navbr-wrap {
    position: relative;
    left: 0;
    top: 0;
    z-index: 99;
    width: 100vw;
    height: 54px;
    overflow-x: scroll;
    margin-top: 49px;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
    > ul {
      position: absolute;
      left: 0;
      top: 0;
      display: flex;
      li {
        display: flex;
        width: 100px;
        height: 54px;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        span {
          width: 100%;
          text-align: center;
          overflow-x: auto;
          color: #5d5d5d;
        }
        .lable {
        }
        .num {
        }
        &.active {
          span {
            color: #0089ff;
          }
        }
      }
      .move-bar {
        position: absolute;
        left: 0;
        bottom: 5px;
        width: 52px;
        height: 3px;
        background: #0089ff;
        transition: all 0.2s;
      }
    }
  }
  .Prev-btn {
    position: relative;
    width: 100%;
    height: 63px;
    background: rgba(255, 255, 255, 1);
    border: 1px solid rgba(234, 234, 234, 1);
    line-height: 63px;
    padding-left: 50px;
    .iconfont {
      font-size: 30px;
    }
  }
  .main {
    position: relative;
    height: 85vh;
    margin-top: 5px;
    &.pre {
      height: 75vh;
    }
    .folder-wrap-item {
      position: relative;
      height: 82px;
      padding: 10px;
      background: #fff;
      border-bottom: 0.02667rem solid #eaeaea;
      > img {
        height: 100%;
      }
      .info-wrap {
        width: calc(100% - 90px);
        height: 100%;
        > p {
          width: 100%;
          .iconfont {
            font-size: 22px;
            right: 4px;
          }
        }
        .name {
          display: flex;
          // height: 100%;
          padding-right: 30px;
          align-items: center;
          .iconfont {
            height: 100%;
            font-size: 22px;
            display: flex;
            align-items: center;
            &.act {
              color: #ff8900;
            }
          }
          .iconjiantou1 {
            color: #0089ff;
          }
          .iconok- {
            color: #ccc;
          }
        }
        .time {
        }
      }
    }
  }
}
</style>