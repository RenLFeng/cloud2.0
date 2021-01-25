<template>
  <div class="uploadfile-wrap">
    <mt-header :title="$mt('上传资源')">
      <mt-button slot="left" @click="canlce('')">{{$mt('取消')}}</mt-button>
      <mt-button slot="right" @click="submitUpload">{{$mt('确定')}}</mt-button>
    </mt-header>
    <div class="main">
      <div class="files-wrap clearfix">
        <div class="imgitem-wrap fl" v-for="(v,i) in tempUploadFile" :key="i">
          <img class="img position-l;" :src="itempic(v)" :onerror="$defaultImg('')" />
          <span class="ellipse font-xxs name">{{v.file.name}}</span>
          <i class="dle" @click="del(v,i)">x</i>
          <!-- <span class="fail position-c" v-if="v.file.fail">上传失败</span> -->
        </div>
        <div class="addfile imgitem-wrap fl" @click="uploadfile">+</div>
      </div>
      <mt-cell
        v-if="!isUpSrtfile"
        :title="$mt('目录')"
        is-link
        :value="menuEndName"
        @click.native="queryMulu"
      ></mt-cell>
    </div>
    <mt-popup
      v-model="popupmulu"
      position="right"
      class="popup-right"
      :modal="false"
      style="background:#f0f0f0"
    >
      <Menu
        :repositoryopen="repositoryopen"
        :Repositoryclickdata="Repositoryclickdata"
        :bankeid="bankeid"
        :cfrom="cfrom"
        @Cancel="onCancel"
        @menuSelectEnd="onMenuSelectEnd"
        v-if="popupmulu"
        :parentTempmenuData="parentTempmenuData"
        :curRootPrevid="curRootPrevid"
        :parentid="parentid"
        :headerName="headerName"
      />
    </mt-popup>
  </div>
</template>
<script>
import commontools from "@/commontools";
const _URL = window.URL || window.webkitURL;
// _URL.createObjectURL(file),
import { Indicator, Toast, MessageBox } from "mint-ui";
import { getZYFileTypeIcon, getFileTypeImg } from "@/util";
import Menu from "./menu";
export default {
  props: {
    bankeid: {
      default: 0
    },
    tempUploadFile: {
      default() {
        return [];
      }
    },
    parentTempmenuData: {
      default() {
        return [];
      }
    },
    curRootPrevid: {
      default: null
    },
    parentid: {
      default: 0
    },
    headerName: {
      default: ""
    },
    cfrom: {
      default: false
    },
    repositoryopen: {
      default: false
    },
    Repositoryclickdata: {
      default() {
        return {};
      }
    },
    isUpSrtfile: {
      default: false
    },
    banketype: {
      default: 0
    }
  },
  data() {
    return {
      _URL,
      popupmulu: false,
      menuSelectEndData: null,
      upsuccessdata: [],
      upindex: 0,
      uploading: false
    };
  },
  computed: {
    UploadFilelen() {
      return this.tempUploadFile.length;
    },
    menuEndName() {
      if (this.menuSelectEndData) {
        return this.menuSelectEndData.menuName;
      } else {
        return this.headerName;
      }
    },
    uploadCurRoot() {
      if (
        !this.menuSelectEndData ||
        this.menuSelectEndData.parentid == this.parentid
      ) {
        return true;
      }
      return false;
    },
    upurl() {
      let parentid = this.parentid;
      let banketype = this.banketype;
      let bankeid = this.bankeid;
      if (this.repositoryopen && !this.isUpSrtfile) {
        parentid = this.Repositoryclickdata.parentid;
        banketype = this.Repositoryclickdata.banketype;
      }
      if (this.menuSelectEndData) {
        parentid = this.menuSelectEndData.parentid;
      }
      let str =
        "/api/bankefile/fileupload?parentid=" +
        parentid +
        "&bankeid=" +
        bankeid;
      if (this.repositoryopen) {
        str =
          "/api/bankefile/fileupload?parentid=" +
          parentid +
          "&banketype=" +
          banketype;
      }
      if (this.cfrom) {
        str =
          "/api/bankefile/fileupload?parentid=" +
          parentid +
          "&bankeid=" +
          bankeid +
          "&banketype=" +
          banketype;
      }
      if (this.isUpSrtfile) {
        if (this.repositoryopen) {
          str =
            "/api/bankefile/fileupload?parentid=" +
            parentid +
            "&banketype=" +
            banketype;
        }
      }
      return str;
    }
  },
  created() {},
  mounted() {},
  watch: {
    uploading: function(newv, olv) {
      if (!newv) {
        let len = this.UploadFilelen;
        if (this.upindex < len) {
          this.uploadbtn = false;
          this.submitUpload();
        }
      }
    }
  },
  methods: {
    douploadonefiledirect(i) {
      let onefile = this.tempUploadFile[i].file;
      if (!onefile) {
        return;
      }
      var formdata = new FormData();
      formdata.append("file", onefile);
      Indicator.open(`${i + 1}-${this.UploadFilelen}${this.$mt('上传中')}...`);
      this.$http({
        url: this.upurl,
        method: "post",
        data: formdata,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      })
        .then(res => {
          if (this.isUpSrtfile) {
            if (res.data.code == 0) {
              this.upsuccessdata.push(res.data.data);
            } else {
              Toast(`${i + 1}-${this.UploadFilelen}${this.$mt('上传失败')}`);
            }
            if (this.UploadFilelen == i + 1) {
              if (this.upsuccessdata.length) {
                this.$emit("setsrtUpsuccess", this.upsuccessdata);
              } else {
                this.canlce("");
              }
              this.upsuccessdata = [];
            }
            this.upindex++;
            this.uploading = false;
            Indicator.close();
          } else {
            if (res.data.code == 0) {
              this.parseOneItem(res.data.data);
              this.upsuccessdata.push(res.data.data);
              if (!this.repositoryopen) {
                let item = res.data.data;
                if (item.ftype == "link") {
                  item.imgsrc = "/assets/file_icon/IT.svg";
                } else if (item.ftype == "file") {
                  if (item.finttype == "1") {
                    if (
                      item.info &&
                      item.info.metainfo &&
                      item.info.metainfo.snapsuffix
                    ) {
                      item.imgsrc =
                        item.info.filepath + item.info.metainfo.snapsuffix;
                    }
                  } else {
                    item.imgsrc = getZYFileTypeIcon(item.info.filepath);
                  }
                }
              }
              this.uploadallEnd(i);
            } else {
              Toast(`${i + 1}-${this.UploadFilelen}${this.$mt('上传失败')}`);
              this.uploadallEnd(i);
            }
          }
        })
        .catch(err => {
          this.canlce("");
          Indicator.close();
          this.upindex=0;
          this.uploading = false;
          Toast(`${this.$mt('服务异常')}，${this.$mt('稍后再试')}`);
        });
    },
    submitUpload() {
      if (this.uploading) return;
      this.uploading = true;
      this.douploadonefiledirect(this.upindex);
    },
    uploadallEnd(curlen) {
      Indicator.close();
      if (curlen + 1 == this.UploadFilelen) {
        if (this.repositoryopen) {
          this.$emit("reupsuccess", this.upsuccessdata, "upfile");
          return;
        }
        if (this.uploadCurRoot) {
          this.$store.commit("SET_ZHIYUANS", {
            item: this.upsuccessdata,
            type: 1
          });
        }
        if (this.upsuccessdata.length > 1) {
          this.canlce(this.upsuccessdata);
        } else {
          this.canlce("");
        }
        this.uploading = true;
        return;
      }
      this.upindex++;
      this.uploading = false;
    },
    del(file, i) {
      this.tempUploadFile.splice(i, 1);
    },
    onMenuSelectEnd(v) {
      this.menuSelectEndData = v;
      this.popupmulu = false;
    },
    uploadfile() {
      this.$emit("adduploadfile", true);
    },
    queryMulu() {
      this.popupmulu = true;
    },
    onCancel(v) {
      this.popupmulu = false;
    },
    canlce(data) {
      this.menuSelectEndData = null;
      this.$emit("canlce", data);
    },
    parseOneItem(item) {
      if (item.info) {
        item.info = JSON.parse(item.info);
        if (item.info.metainfo && typeof item.info.metainfo == "string") {
          item.info.metainfo = JSON.parse(item.info.metainfo);
        }
      }
    },
    itempic(item) {
      if (item.file.type.includes("image")) {
        return item.tempImg;
      } else {
        if (item.file.type.includes("video")) {
          return getFileTypeImg("mp4");
        } else {
          return getZYFileTypeIcon(item.file.name);
        }
      }
    }
  },
  components: { Menu }
};
</script>

<style scoped lang="less">
.uploadfile-wrap {
  .main {
    .files-wrap {
      padding: 10px 0;
      .imgitem-wrap {
        position: relative;
        width: 100px;
        height: 100px;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 10px;
        img {
          width: 60px;
          height: 60px;
          object-fit: cover;
        }
        .name {
          width: 100%;
          padding-top: 5px;
        }
        .dle {
          position: absolute;
          right: 15px;
          top: -7px;
          width: 15px;
          height: 15px;
          line-height: 15px;
          background: #000;
          color: #fff;
          border-radius: 15px;
          text-align: center;
        }
        .fail {
          color: #f00;
        }
      }
      .addfile {
        border: 1px dashed #ccc;
        width: 60px;
        height: 60px;
        line-height: 60px;
        text-align: center;
      }
    }
  }
}
</style>
