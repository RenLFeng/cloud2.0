<template>
  <div class="upsrt-wrap">
    <mt-header :title="$mt(titlename)" class="mint-header-f">
      <mt-button slot="left" @click="calce">{{$mt('取消')}}</mt-button>
      <!-- <mt-button
        v-if="!srtFiles.length || cansubmit"
        slot="right"
        class="iconfont iconiconfontadd icons fontlarge24 onUploadLocal"
        @click.native="onUploadLocal"
      ></mt-button>-->
      <mt-button
        v-if="srtFiles.length"
        slot="right"
        :disabled="cansubmit"
        @click="setsubSrtfile()"
      >{{$mt('确定')}}</mt-button>
    </mt-header>
    <div
      class="main main-f overflow-scroll"
      v-infinite-scroll="loadMore"
      infinite-scroll-disabled="loading"
      infinite-scroll-distance="10"
      infinite-scroll-immediate-check="false"
    >
      <div class v-for="(item,i) in srtFiles" :key="i">
        <BankeFileSimple
          :fileitem="item"
          :index="i"
          :fileInfo="srtFileinfo"
          :selection="true"
          :cfrom="cfrom"
          @editclick="oneditclick"
          @selectionClick="onSelectionsrt"
        ></BankeFileSimple>
      </div>
      <p v-if="!srtFiles.length" class="position-c emtp font-xs tc">未找到文件...</p>
    </div>
    <mt-popup
      v-model="popupUploadFile"
      position="right"
      class="popup-right"
      :modal="false"
      style="background:#f0f0f0"
    >
      <UpLoadFile
        v-if="popupUploadFile"
        :cfrom="cfrom"
        :bankeid="bankeid"
        :tempUploadFile="tempUploadFile"
        :parentid="parentid"
        :isUpSrtfile="isUpSrtfile"
        :banketype="banketype"
        :repositoryopen="repositoryopen"
        @setsrtUpsuccess="onSetsrtUpsuccess"
        @canlce="onCanlce"
        @adduploadfile="onadduploadfile"
      />
    </mt-popup>
    <!-- multiple -->
    <input
      ref="uploadfilebtn"
      type="file"
      name="file"
      class="upload__input"
      @change="uploadChange"
      style="display:none"
    />
  </div>
</template>

<script>
const _URL = window.URL || window.webkitURL;
import {
  CollectionFn,
  getZYFileType,
  preview,
  defaultImg,
  getZYFileTypeIcon,
  filterItem,
  sortLikeWin
} from "@/util";
import { Indicator, Toast, MessageBox, Actionsheet } from "mint-ui";
const BankeFileSimple = () => import("@/views/components/BankeFileSimple");
import BottomLoadmore from "@/common/bottom-loadmore";
import UpLoadFile from "@/views/bankeZiyuan/upLoadFile";
export default {
  props: {
    role: {
      default: 0
    },
    cfromCloud: {
      default: false
    },
    bankeid: {
      default: 0
    },
    cfromparentid: {
      default: 0
    },
    repositorycopyid: {
      default: 0
    },
    cfrom: {
      default: false
    },
    repositoryopen: {
      default: false
    },
    repositorynewData: {
      default() {
        return {};
      }
    },
    parentid: {
      default: 0
    },
    peditItemFile: {
      default() {
        return {};
      }
    },
    banketype: {
      default: 0
    },
    upsrttype: {
      default: "srt"
    }
  },
  data() {
    return {
      curSeleitemsrt: {},
      srtFiles: [],

      page: 0,
      pagesize: 10,
      autofill: false,
      topStatus: "",
      bottomStatus: "",

      allLoaded: false,
      loading: false,
      listLoadend: false,

      popupUploadFile: false,
      tempUploadFile: [],
      isUpSrtfile: true,

      fileloadEnd: false,
      progress: true,
      tempaudios: [],
      curupindex: 0,
      uploading: false
    };
  },
  watch: {},
  created() {
    this.loadMoreFile(this.parentid);
  },
  mounted() {},
  computed: {
    titlename() {
      if (this.upsrttype == "mp3") {
        return "选择音轨文件";
      }
      return "选择字幕文件";
    },
    srtFileinfo() {
      for (let v of this.srtFiles) {
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
    cansubmit() {
      for (let v of this.srtFiles) {
        if (v.isAct) {
          return false;
        }
      }
      return true;
    }
  },
  methods: {
    loadMore() {
      this.loading = true;
      this.loadMoreFile(this.parentid);
    },
    loadTop() {
      this.loadInit();
      this.loadMoreFile(this.parentid);
    },
    loadInit() {
      this.srtFiles = [];
      this.page = 0;
      this.loading = false;
      this.listLoadend = false;
      this.allLoaded = false;
    },
    loadMoreFile(parentid) {
      Indicator.open(this.$mt("加载中") + "...");
      let banketype = this.banketype;
      let bankeid = this.bankeid;
      let postData = {
        page: this.page,
        pagesize: this.pagesize,
        parentid: parentid,
        finttype: [5]
      };
      if (this.upsrttype == "mp3") {
        postData.finttype = [13];
      }
      if (banketype) {
        postData.banketype = banketype;
      }
      if (this.cfromCloud) {
        postData.bankeid = this.bankeid;
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
              this.srtFiles = [...this.srtFiles, ...res.data.data.files];
              console.log("this.srtFiles", this.srtFiles);
            } else {
              this.srtFiles = [];
            }
          } else {
          }
          Indicator.close();
          //   this.$refs.loadmore.onTopLoaded();
        })
        .catch(err => {
          //   this.$refs.loadmore.onTopLoaded();
          Indicator.close();
        });
    },
    oneditclick(v) {
      this.curSeleitemsrt = v;
    },
    onSelectionsrt(fileitem) {
      if (this.upsrttype == "mp3") {
        fileitem.isAct = !fileitem.isAct;
      } else {
        if (fileitem.isAct) {
          fileitem.isAct = false;
          return;
        }
        for (let v of this.srtFiles) {
          v.isAct = false;
        }
        fileitem.isAct = true;
      }
    },
    setSrtaudio() {
      console.log(this.peditItemFile);
      this.tempaudios = [];
      for (let v of this.srtFiles) {
        if (v.isAct) {
          this.tempaudios.push({
            id: v.id,
            name: v.name,
            srtpath: v.info.srtpath,
            audiopath: v.info.filepath
          });
        }
      }
      this.onUpSrtSuccess();
    },
    setsubSrtfile() {
      if (this.upsrttype == "mp3") {
        this.setSrtaudio();
      } else {
        for (let v of this.srtFiles) {
          if (v.isAct) {
            this.onUpSrtSuccess(v);
          }
        }
      }
    },
    onUpSrtSuccess(srtfile = null) {
      let peditItemFile = JSON.parse(JSON.stringify(this.peditItemFile));
      let srtfileitem = srtfile;
      let postData = {
        id: peditItemFile.id,
        finttype: peditItemFile.finttype,
        info: peditItemFile.info
      };
      if (this.upsrttype == "mp3") {
        postData.info.audios = this.tempaudios;
      } else {
        postData.info.srtid = srtfileitem.id;
        postData.info.srtpath = srtfileitem.info.filepath;
         postData.info.srtlang = srtfileitem.info.srtlang?srtfileitem.info.srtlang:"en_us";
        if (peditItemFile.finttype == 2 || peditItemFile.finttype == 3) {
          if (peditItemFile.finttype == 2) {
            postData.finttype = 12;
          } else {
            postData.finttype = 13;
          }
        }
      }
      postData.info = JSON.stringify(postData.info);
      console.log(postData);
      this.$http
        .post("/api/bankefile/updatefile", postData)
        .then(res => {
          if (res.data.code == "0") {
            Toast(this.$mt("设置成功"));
            if (this.upsrttype != "mp3") {
              this.calce(postData);
              return;
            }
          } else {
            Toast(this.$mt("设置失败"));
          }
          this.calce();
          Indicator.close();
        })
        .catch(err => {
          this.calce();
          Toast(this.$mt("连接服务失败") + "," + this.$mt("稍后再试"));
          Indicator.close();
        });
    },
    onadduploadfile() {
      this.onUploadLocal();
    },
    onUploadLocal() {
      this.$refs.uploadfilebtn.value = "";
      this.$refs.uploadfilebtn.click();
    },
    //上传文件
    uploadChange(event) {
      if (event.target.files.length > 0) {
        var file = event.target.files;
        console.log("原文件", file);
        for (let i = 0; i < file.length; i++) {
          let _filesize = file[i].size;
          if (file[i].name.indexOf(".srt") < 0) {
            MessageBox({
              title: this.$mt("提示"),
              message: `<p>${file[i].name}</p>
              <p>${this.$mt("文件格式不对")}，${this.$mt(
                "请上传"
              )}.srt${this.$mt("文件")}</p>`,
              showCancelButton: true
            });
            continue;
          }
          if (_filesize / (1024 * 1024) > 300) {
            MessageBox({
              title: this.$mt("提示"),
              message: `<p>${file[i].name}</p>
              <p>${this.$mt("此文件大小超过上限,建议小于%s", [300])}M</p>`,
              showCancelButton: true
            });
            continue;
          }
          if (i == file.length - 1) {
            this.fileloadEnd = true;
          }
          this.goUploadInitpage(file[i]);
        }
      }
    },
    goUploadInitpage(file) {
      this.tempUploadFile.push({
        file: file,
        tempImg: _URL.createObjectURL(file)
      });
      if (this.fileloadEnd) {
        this.popupUploadFile = true;
      }
    },
    onSetsrtUpsuccess(datas) {
      this.popupUploadFile = false;
      if (!datas.length) return;
      for (let v of datas) {
        v.info = JSON.parse(v.info);
        this.onUpSrtSuccess(v);
      }
    },
    onCanlce() {
      this.popupUploadFile = false;
      this.tempUploadFile = [];
    },
    calce(postData = null) {
      this.$emit("upsrtcalce", postData ? postData : null);
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
          item.imgsrc = getZYFileTypeIcon(item.info.filepath); //commontools.fileType(item.info);
        }
      } else if (item.ftype == "menu") {
        item.imgsrc = "/assets/file_icon/folder.svg";
      }
    }
  },
  components: {
    BankeFileSimple,
    [Actionsheet.name]: Actionsheet,
    BottomLoadmore,
    UpLoadFile
  }
};
</script>

<style scoped lang="less">
.upsrt-wrap {
  .mint-header .mint-button {
    margin: 0 5px;
  }
  .main {
    height: 94vh;
  }
  .onUploadLocal {
    color: #999 !important;
  }
}
</style>