<template>
  <div class="bk-edit-container">
    <!-- <div class="pic-container" @click="unloadFn">
      <img :src="imgSrc?imgSrc:bankeInfo.avatar" alt :onerror="$defaultImg('banke')" />
      <p>{{$mt('班课封面')}}</p>
    </div>-->
    <div class="bk-info-lists">
      <ul class="border-bottom-e5">
        <!-- <li>
          <mt-field label="班级" placeholder v-model="banji"></mt-field>
        </li>-->
        <li>
          <mt-field :label="$mt('班级名')" placeholder v-model="bankeInfo.name"></mt-field>
        </li>
      </ul>
    </div>
    <div class="submit-fixed">
      <mt-button class="botton-96" type="default" @click="submit">
        <p>{{$mt('保存')}}</p>
      </mt-button>
    </div>
    <input
      ref="uploadPic"
      type="file"
      name="file"
      class="upload"
      @change="uploadChange"
      accept="image/*"
      style="display:none"
    />
    <mt-popup
      v-model="popupMimgcrop"
      position="right"
      class="mint-popup-3"
      :modal="false"
      style="background:#000"
    >
      <mt-header :title="$mt('编辑头像')">
        <mt-button icon="back" slot="left" @click="popupMimgcrop = false">{{$mt('返回')}}</mt-button>
      </mt-header>
      <div class="cropComp">
        <mimgcrop
          v-model="imgobj"
          class="cropComp"
          ref="mimgcrop"
          @cancel="popupMimgcrop = false"
          @submit="onimgsubmit"
        ></mimgcrop>
      </div>
    </mt-popup>
  </div>
</template>
<script>
import { MessageBox, Indicator } from "mint-ui";
import mimgcrop from "@/common/m-image-crop";
export default {
  name: "",
  props: {
    bankeInfo: {
      default() {
        return {};
      }
    },
    editBkState: {
      default() {
        return "";
      }
    }
  },
  watch: {
    bankeInfo(newValue, oldValue) {
      this.bankeInfoData = newValue;
    },
    editBkState(newValue, oldValue) {
      //   if (!newValue) {
      this.banji = this.bankeInfo.id;
      this.bankeNmae = this.bankeInfo.name;
      //   }
    }
  },
  components: { mimgcrop },
  data() {
    return {
      popupMimgcrop: false,
      imgobj: {},

      pic: "",
      defaultPic: "/assets/account_default.png",
      banji: "",
      bankeNmae: "",
      bankeInfoData: {},
      urlinfo: {
        urlupload: "/api/api/zuoyefileupload",
        urldel: "/api/api/zuoyefiledelete"
      },
      imgSrc: "",
      BankeData: []
    };
  },
  created() {},
  computed: {
    defaultimg() {
      var srcstr = 'this.src="';
      srcstr += "/assets/100x100.png";
      srcstr += '"';
      return srcstr;
    }
  },
  methods: {
    unloadFn() {
      // ****
      this.$refs.uploadPic.value = "";
      this.imgobj = {};

      this.$refs.uploadPic.click();
    },
    submit() {
      let BankeData = this.$store.state.banke.curbankes;
      this.$http
        .post("/api/banke/updateinfo", {
          id: this.bankeInfo.id,
          name: this.bankeInfo.name,
          states: this.bankeInfo.states,
          avatar: this.imgSrc ? this.imgSrc : this.bankeInfo.avatar
        })
        .then(res => {
          if (res.data.code == 0) {
            this.$alert({
              msg: "操作成功",
              cb: () => {
                this.imgSrc = res.data.data.avatar;
                this.pic = res.data.data.avatar;
                for (let item of BankeData) {
                  if (item.id == res.data.data.id) {
                    item.name = res.data.data.name;
                    item.avatar = this.imgSrc;
                  }
                }
                this.$store.commit("banke/setBankes", BankeData);
                this.$emit("imgSrcLoad", this.imgSrc);
              }
            });
            // MessageBox.alert(this.$mt("操作成功")).then(() => {
            //   this.imgSrc = res.data.data.avatar;
            //   this.pic = res.data.data.avatar;
            //   for (let item of BankeData) {
            //     if (item.id == res.data.data.id) {
            //       item.name = res.data.data.name;
            //       item.avatar = this.imgSrc;
            //     }
            //   }
            //   this.$store.commit("banke/setBankes", BankeData);
            //   this.$emit("imgSrcLoad", this.imgSrc);
            // });
          } else {
            this.$alert({
              msg: res.data.msg
            },false);
           
          }
        })
        .catch(() => {});
    },
    uploadChange(e) {
      let file = e.target.files[0];
      // this.uploadImg(file);
      this.$refs.uploadPic.value = "";

      // ****
      this.$refs.mimgcrop.loadfile(file);
      this.popupMimgcrop = true;
    },
    onimgsubmit() {
      this.popupMimgcrop = false;
      console.log(this.imgobj);
      this.uploadimagedata(this.imgobj.base64);
    },

    uploadimagedata(base64str) {
      var url = "/api/banke/saveavatar?bankeid=" + this.bankeInfo.id;
      Indicator.open(this.$mt("上传中"));
      this.$http
        .post(url, {
          jpeg: base64str
        })
        .then(res => {
          Indicator.close();
          if (res.data.code == 0) {
            this.imgSrc = res.data.data.filepath;
          }
        })
        .catch(res => {
          Indicator.close();
        });
    },
    uploadImg(file) {
      let formdata = new FormData();
      formdata.append("file", file);
      let url = this.urlinfo.urlupload;
      this.$http
        .post(url, formdata)
        .then(res => {
          if (res.data.code == 0) {
            this.imgSrc = res.data.data.filepath;
            console.log("成功", res);
          } else {
            console.log("失败", res);
          }
        })
        .catch(() => {
          console.log("catch", res.data.data);
        });
    },
    init() {}
  },
  destroyed() {}
};
</script>

<style lang='less'>
.bk-edit-container {
  .pic-container {
    text-align: center;
    padding: 30px 0;
    img {
      width: 88px;
      height: 88px;
    }
    p {
      font-size: 14px;
      margin-top: 5px;
    }
  }
  .mint-field-core {
    text-align: right;
  }
  .mint-cell .mint-cell-wrapper {
    padding-right: 10px;
  }
}
</style>
