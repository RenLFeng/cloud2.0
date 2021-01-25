<template>
  <div class="mainpart zy-content" @click.stop="onclick">
    <div class="img-wrap" :class="fileitem.eventmsgs?'reddot-Tips':''">
      <img class="img object-fit-img" :src="fileitem.imgsrc" :onerror="$defaultImg('')" />
    </div>
    <div class="maincontent">
      <div class="mainctitle info-left position-r">
        <p class="name ellipse">{{fileitem.name}}</p>
        <p class="ellipse font-xxs colora5">{{filesizedesc}}</p>
        <p class="font-xxs colora5">{{filetimedesc}}</p>
      </div>
      <div
        v-if="!selection && canEditItem && curxunliantp==1000"
        @click.stop="icoclick"
        class="maincsubtitle text-ellipsis info-right position-r"
      >
        <p>
          <i class="iconfont iconjiantou1 eicotrigger colord" v-if="seeState"></i>
        </p>
        <P v-if="!cfromCloud">
          <span class="fr" v-if="seeState">{{fileitem.viewnum}}{{$mt('人查看')}}</span>
        </P>
        <p class v-if="!cfromCloud">
          <span class="fr">{{$mt('分值')}}:{{fileitem.score}}{{$mt('分')}}</span>
        </p>
      </div>
      <div
        v-if="selection"
        class="select-icon position-r tc"
        @click.stop="selectionClick(fileitem)"
      >
        <i class="iconfont iconok- position-c" :class="fileitem.isAct?'act':''"></i>
      </div>
    </div>
  </div>
</template>

<script>
const fileType = ["txt", "rar", "xlsx", "docx", "ppt", "pdf"];
import commontools from "../../commontools";
import FileAttachList from "./FileAttachList";
export default {
  name: "BankeFileSimple",
  components: {
    FileAttachList
  },
  created() {},
  computed: {
    localfiles() {
      let arr = [];
      if (this.fileitem.info) {
        arr[0] = this.fileitem.info;
        if (this.fileitem.eventmsgs) {
          //红点提示
          arr[0].eventmsgs = true;
        }
        this.fileitem.localfile = arr;
        for (let v of this.fileitem.localfile) {
          if (v.filepath && v.metainfo) {
            v.imgsrc = v.filepath + v.metainfo.snapsuffix;
          } else if (v.filename.includes("png")) {
            v.imgsrc = v.filepath;
          } else {
            v.imgsrc = "";
          }
        }
      } else {
        this.fileitem.localfile = [];
      }
      return this.fileitem.localfile;
    },
    filesizedesc() {
      if (this.fileitem.info) {
        return commontools.renderFileSizeDesc(this.fileitem.info.filesize);
      } else {
        return this.fileitem.url;
      }
    },
    filetimedesc() {
      // return '11';
      var str = this.fileitem.createtime;
      str += this.$mt('发布');
      return str;
    }
  },
  data() {
    return {
      pendclick: false
    };
  },
  methods: {
    onclick() {
      if (this.selection) return;
      if (this.curxunliantp != 1000) {
        this.$emit("gotoxunlain", this.fileitem);
        return;
      }
      if (this.pendclick) {
        this.pendclick = false;
        return;
      }
      this.$emit("normalclick", this.fileitem);
    },
    icoclick() {
      this.pendclick = true;
      this.$emit("editclick", this.fileitem);
    },

    selectionClick(fileitem) {
      this.$emit("selectionClick", fileitem);
    }
  },
  props: {
    fileitem: {
      type: Object,
      default() {
        return {
          filename: "++",
          filepath: "",
          filesize: 0,
          uploadtime: ""
        };
      },
      required: false
    },
    hasedit: {
      default() {
        return true;
      }
    },
    index: {
      default: 0
    },
    arrZhiyuan: {
      default() {
        return [];
      }
    },
    seeState: {
      default: 1
    },
    selection: {
      default: false
    },
    cfrom: {
      default: false
    },
    cfromCloud: {
      default: false
    },
    canEditItem: {
      default: true
    },
    curxunliantp: {
      default: 1000
    }
  }
};
</script>

<style scoped>
.mainpart {
  height: 83px;
  border-bottom: 1px solid #eaeaea;
  padding: 10px;
  position: relative;
  background: #fff;
}
.mainimg {
  width: 62px;
  height: 62px;
  border-radius: 10px;
}

.mainleft {
  float: left;
}

.maincontent {
  /* position: relative; */
  margin-left: 70px;
}

.zy-content .mainctitle {
  /* position: relative; */
  font-size: 18px;
  color: #313131;
  margin-bottom: 6px;
}
.mainctitle > div {
  width: 90%;
}
.mainctitle > i {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translate(0, -50%);
  color: #0089ff;
}

.maincsubtitle {
  font-size: 12px;
  color: #a5a5a5;
  text-align: right;
}

.mainright {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translate(0, -50%);
}
.eicotrigger {
  font-size: 22px;

  margin-right: 5px;
}
.mainpart .flist-container {
  width: auto;
  height: auto;
  position: absolute;
  left: 0;
}
.zy-content .img-wrap {
  border: 0;
  vertical-align: middle;
  width: 60px;
  height: 60px;
  border-radius: 10px;
  position: absolute;
}
.zy-content .img-wrap .img {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 10px;
}
.info-left {
  width: calc(100% - 90px);
  padding-right: 60px;
}
.select-icon {
  width: 35px;
  height: 100%;
}
.select-icon .iconfont {
  color: #ccc;
  font-size: 22px;
}
.select-icon .iconfont.act {
  color: #ff8900;
}
</style>