<template>
  <div class="mystudy-wrap">
    <mt-header :title="$mt(myStudytext)" class="mint-header-f"></mt-header>
    <div class="main main-f">
      <ul class="item-wrap clearfix">
        <li v-if="canShow">
          <ul>
            <li class="item fontlarge" @click="repository">
              <span class="name position-l font18">{{$mt('资源库')}}</span>
              <i
                class="iconfont iconziyuanku eicotrigger bigfont colord position-r commoniconfontsize"
              ></i>
            </li>
            <li class="item fontlarge" @click="setRenwu">
              <span class="name position-l font18">{{$mt('发布任务')}}</span>
              <i
                class="iconfont iconfaburenwu2 eicotrigger bigfont colord position-r commoniconfontsize"
              ></i>
            </li>
            <!-- <li class="item fontlarge" @click="editepaper">
              <span class="name position-l font18">{{$mt('试卷编辑')}}</span>
              <i class="iconfont iconqiandao2 eicotrigger bigfont colord position-r"></i>
            </li>
            <li class="item fontlarge" @click="edittiku">
              <span class="name position-l font18">{{$mt('题库编辑')}}</span>
              <i class="iconfont iconqiandao2 eicotrigger bigfont colord position-r"></i>
            </li>-->
            <!-- <li class="item fontlarge" @click="mediaxunlain">
              <span class="name position-l font18">{{$mt('视听语言训练')}}</span>
              <i class="iconfont icondibushiting eicotrigger bigfont colord position-r"></i>
            </li>-->
          </ul>
        </li>
        <li v-else>
          <ul></ul>
        </li>
        <li class="item fontlarge" @click="myRenwu">
          <span class="name position-l font18">{{$mt('我的任务')}}</span>
          <i class="iconfont iconrenwu eicotrigger bigfont colord position-r"></i>
        </li>
        <li class="item fontlarge" @click="myrecord">
          <span class="name position-l font18">{{$mt(recordtext)}}</span>
          <i class="iconfont iconluyinwenjianguanli eicotrigger bigfont colord position-r"></i>
        </li>
      </ul>
    </div>
    <mt-popup
      v-model="fabuRenwuPopup"
      position="right"
      class="popup-right"
      :modal="false"
      style="background:#f0f0f0"
    >
      <Faburenwu v-if="fabuRenwuPopup" @calce="onCalce"></Faburenwu>
    </mt-popup>
    <mt-popup
      v-model="myRenwuZuoyePopup"
      position="right"
      class="popup-right"
      :modal="false"
      style="background:#f0f0f0"
    >
      <MyrenwuPage @calce="onCalce" v-if="myRenwuZuoyePopup" />
    </mt-popup>
    <mt-popup
      v-model="popupxunlian"
      position="right"
      class="popup-right"
      :modal="false"
      style="background:#f0f0f0"
    >
      <XunLianPage
        @calce="onCalce"
        v-if="popupxunlian"
        :xunlianname="xunlianname"
        :xunlianId="xunlianId"
        :isAPP="isAPP"
      />
    </mt-popup>
  </div>
</template>

<script>
import nativecode from "@/nativecode";
import nativebridge from "@/nativebridge";
import { ispcBroswer } from "@/util";
import { Indicator, Toast, MessageBox } from "mint-ui";
const Faburenwu = () => import("@/views/bankehome/faburenwu");
const MyrenwuPage = () => import("@/views/bankehome/myrenwu");
const XunLianPage = () => import("@/views/bankehome/xunlian");

export default {
  props: {
    myStudytext: {
      default: "我的教学"
    }
  },
  data() {
    return {
      popupfaburenwu: false,
      myRenwuitems: [],
      popupxunlian: false,
      xunlianname: "",
      xunlianId: 0,
      serveraddrurl: "",
      myRenwuZuoyePopup: false,
      fabuRenwuPopup: false
    };
  },
  computed: {
    recordtext() {
      if (this.myStudytext == "我的教学") {
        return "学生录音";
      }
      return "我的录音";
    },
    isAPP() {
      if (
        nativecode.platform == "exsoftandroid" ||
        nativecode.platform == "exsoftios"
      ) {
        return true;
      }
      return false;
    },
    canShow() {
      if (this.user.role >= 10) {
        return true;
      }
      return false;
    },
    user() {
      return this.$store.getters.curuser;
    },
    RenwuClick() {
      if (this.$store.state.myRenwuZuoye) {
        return true;
      }
      return false;
    },
    fabuRWClick() {
      if (this.$store.state.fabuRenwuClick) {
        return true;
      }
      return false;
    }
  },
  created() {},
  mounted() {
    if (this.RenwuClick) {
      this.myRenwuZuoyePopup = true;
    }
    if (this.fabuRWClick) {
      this.fabuRenwuPopup = true;
    }
  },
  watch: {},
  methods: {
    xunlian(name, id) {
      this.xunlianname = name;
      this.xunlianId = id;
      this.popupxunlian = true;
    },
    onUploadLocal() {
      this.$refs.uploadfilebtn.value = "";
      this.$refs.uploadfilebtn.click();
    },
    uploadChange(event) {
      if (event.target.files.length >= 6) {
        this.$alert({
          msg: "最多同时上传5个文件"
        });

        return;
      }
      this.popupSrt = false;
      if (event.target.files.length > 0) {
        var file = event.target.files;
        console.log("原文件", file);
        for (let i = 0; i < file.length; i++) {
          let _filesize = file[i].size;
          if (_filesize / (1024 * 1024) > 300) {
            MessageBox({
              title: this.$mt("提示"),
              message: `<p>${file[i].name}</p>
              <p>${this.$mt("此文件大小超过上限,建议小于%s", [300])}M</p>`,
              showCancelButton: true
            });
            continue;
          }
          // this.douploadonefile(file[i]);
        }
      }
    },
    repository() {
      let tourl = "/Repository/" + this.user.role + "/cloud";
      this.$store.commit("setRouterForward", true);
      this.$router.push(tourl);
    },
    setRenwu() {
      this.fabuRenwuPopup = true;
    },
    myRenwu() {
      this.myRenwuZuoyePopup = true;
    },
    myrecord() {
      this.$http
        .post("/api/school/bindschool")
        .then(res => {
          if (res.data.code == 0) {
            if (res.data.data.serveraddr) {
              this.serveraddrurl = res.data.data.serveraddr;
              let pageurl = `/record/index.html?userid=${this.user.id}`;
              if (this.user.role >= 10) {
                pageurl += `&teauserid=${this.user.id}`;
              }
              if (nativecode.platform == "") {
                let url = `${this.serveraddrurl}${pageurl}`;
                window.open(url);
              } else if (nativecode.platform == "miniprogram") {
                pageurl += `&tshow=${true}`;
                let url = `${document.location.origin}${pageurl}`;
                window.location.href = url;
              } else {
                if (nativebridge.apiversion >= 1) {
                  let openurl = this.serveraddrurl + pageurl;
                  nativebridge.ncall("openurl", { url: openurl });
                } else {
                  Toast(this.$mt("请在新版app中查看"));
                }
              }
            } else {
              Toast(this.$mt("未设置服务器"));
            }
          } else {
            Toast(this.$mt("未设置服务器"));
          }
        })
        .catch(() => {
          Toast(this.$mt("服务开小差了"));
        });
    },
    mediaxunlain() {
      this.repository();
      sessionStorage.setItem("mediaxunlain", "open");
    },
    editepaper() {
      if (!ispcBroswer()) {
        Toast(this.$mt("请在PC浏览器中打开"));
        return;
      }
      let url = `http://192.168.1.133:9982/doepaper`;
      if (process.env.NODE_ENV !== "development") {
        url = document.location.origin;
        url += `/doepaper`;
      }
      window.open(url);
    },
    edittiku() {
      if (!ispcBroswer()) {
        Toast(this.$mt("请在PC浏览器中打开"));
        return;
      }
      let url = `http://192.168.1.133:9982/doepaper/doitemedit.html`;
      if (process.env.NODE_ENV !== "development") {
        url = document.location.origin;
        url += `/doepaper/doitemedit.html`;
      }
      window.open(url);
    },
    onCalce() {
      if (this.popupxunlian) {
        this.popupxunlian = false;
      }
      if (this.fabuRenwuPopup) {
        this.fabuRenwuPopup = false;
      }
      if (this.myRenwuZuoyePopup) {
        this.myRenwuZuoyePopup = false;
      }
    }
  },
  components: { Faburenwu, MyrenwuPage, XunLianPage }
};
</script>

<style scoped lang="less">
.mystudy-wrap {
  background: #fff;
  // margin-top: 60px;
  .main {
    margin-top: 52px;
    .item-wrap {
      width: 100%;
      background: #f0f0f0;
      height: 79vh;
      overflow: scroll;
      .item {
        position: relative;
        width: 95%;
        height: 80px;
        border-radius: 10px;
        box-shadow: 0 0.08rem 0.16rem rgba(0, 0, 0, 0.16);
        background: #fff;
        margin: 10px auto;
        .name {
          display: inline-block;
          width: calc(100% - 70px);
          white-space: nowrap;
          overflow-x: scroll;
        }
        .iconfont {
          font-size: 48px;
        }
      }
    }
  }
  .myrenwu-wrap {
  }
  .commoniconfontsize {
    font-size: 43px !important;
  }
}
</style>
<style >
.mint-msgbox-message {
  word-break: break-all;
}
</style>