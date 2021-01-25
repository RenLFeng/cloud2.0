<template>
  <div class="new-zuoye-wrap">
    <mt-header :title="$mt(transformtips())" class="mint-header-f">
      <mt-button slot="left" @click="back">{{$mt('取消')}}</mt-button>

      <mt-button slot="right" :disabled="savedisable" @click="doSave">{{$mt(savebtntext)}}</mt-button>
    </mt-header>

    <div class="main main-f">
      <div class="zuoye-info-wrap">
        <mt-field label :placeholder="$mt('请输入标题')" v-model="zuoyeitem.name"></mt-field>
        <zuoyedetailedit
          v-if="type<='1'"
          :zdetail="zdetail"
          :placeholder="$mt(transformtips('placeholder'))"
        ></zuoyedetailedit>
        <!-- 训练类 -->
        <div class="files-wrap clearfix" v-if="isxunlian">
          <p class="tc tit">{{$mt('选择训练资源')}}</p>
          <div class="imgitem-wrap fl" v-for="(v,i) in zdetail.localfiles" :key="i">
            <img class="img position-l;" :src="v.filepath+'_snap.jpg'" :onerror="$defaultImg('')" />
            <span class="ellipse font-xxs name">{{v.filename}}</span>
            <i class="dle" @click="xunlianfileDel(i)">x</i>
          </div>
          <div class="addfile imgitem-wrap fl" @click="selefile">+</div>
        </div>
      </div>
      <div v-if="type=='0'">
        <mt-cell :title="$mt('答案设置')" is-link @click.native="onZAnaswer">{{zanswerdesc}}</mt-cell>
        <p class="tips font-xxs">{{$mt('作业结束后查看参考答案')}}，{{$mt('你可以随时对参考答案进行编辑')}}。</p>
      </div>
    </div>

    <mt-datetime-picker
      ref="timepicker"
      type="datetime"
      :cancelText="$mt('取消')"
      :confirmText="$mt('确定')"
      :startDate="curdatetime"
      month-format="{value} 月"
      date-format="{value} 日"
      hourFormat="{value} 时"
      minuteFormat="{value} 分"
      v-model="pickervalue"
      @confirm="pickerconfirm"
    ></mt-datetime-picker>

    <mt-popup v-model="popupVisibleDetail" position="right" class="mint-popup-3" :modal="false">
      <mt-header :title="$mt('作业详情')">
        <mt-button slot="right" @click="popupVisibleDetail = false">{{$mt('确定')}}</mt-button>
      </mt-header>

      <zuoyedetailedit :zdetail="zdetail"></zuoyedetailedit>
    </mt-popup>
    <mt-popup v-model="popupAnswer" position="right" class="mint-popup-3" :modal="false">
      <mt-header :title="$mt('作业答案')">
        <!-- <mt-button icon="back" slot="left" @click="goBack">返回</mt-button> -->
        <mt-button slot="right" @click="popupAnswer = false">{{$mt('确定')}}</mt-button>
      </mt-header>
      <Answer :zanswer="zanswer" :states="false" />
    </mt-popup>
    <mt-actionsheet :actions="actions" :cancelText="$mt('取消')" v-model="actionShow"></mt-actionsheet>
  </div>
</template>

<script>
import commontools from "../commontools";
import zuoyedetailedit from "./ZuoyeDetailEdit";
import Answer from "./banKeZuoye/answer";
import {
  Indicator,
  Toast,
  MessageBox,
  Switch,
  DatetimePicker,
  Actionsheet
} from "mint-ui";
import maintools from "./maintools";
import { formateTime } from "@/util.js";

export default {
  name: "ZuoyeNew",
  data() {
    return {
      popupAnswer: false,
      popupVisibleDetail: false,
      zuoyeitem: {
        name: this.defaultzuoyename(),
        state: 0,
        hassubmittime: 0,
        allowpasstime: 1,
        submittime: "",
        detaildesc: "",
        answerdesc: "",
        ztype: this.type
      },
      zdetail: {
        ztext: "",
        localfiles: []
      },
      zanswer: {
        //! 答案
        ztext: "",
        localfiles: []
      },
      curdatetime: new Date(),
      isEditMode: false, //! 是否编辑模式
      pickervalue: "",

      cfromPath: {},
      cfrompage: "",
      xunlianfile: [],
      actionShow: false,
      iscoure: true
    };
  },
  props: {
    bankeid: {
      default() {
        return 0;
      }
    },
    type: {
      default() {
        return 0;
      }
    },
    cfrom: {
      default: false
    }
  },
  computed: {
    isxunlian() {
      if ((this.type > 9 && this.type < 13) || this.type == 2) {
        return true;
      }
      return false;
    },
    user() {
      return this.$store.getters.curuser;
    },
    actions() {
      let objret = [];
      objret.push({
        name: this.$mt("从资源库上传"),
        method: this.upxunlianfile,
        type: 100
      });
      if (this.type != "2" && this.iscoure) {
        objret.push({
          name: this.$mt("从课程资源上传"),
          method: this.upxunlianfile,
          type: 1
        });
      }
      return objret;
    },
    curbanke() {
      return this.$store.state.curbanke;
    },
    zdetaildesc() {
      if (this.zuoyeitem.detaildesc) {
        return this.zuoyeitem.detaildesc;
      }
      return this.$mt("未填写");
    },
    savebtntext() {
      if (this.isEditMode) {
        return "保存";
      }
      return "创建";
    },
    zanswerdesc() {
      if (this.zuoyeitem.answerdesc) {
        return this.zuoyeitem.answerdesc;
      }
      return this.$mt("未设置");
    },
    submittimedesc() {
      if (!this.zuoyeitem.hassubmittime) {
        return "";
      }
      return commontools.timeToHummanRead(
        this.zuoyeitem.submittime.replace(/-/g, "/"),
        0,
        this
      );
    },
    savedisable() {
      if (this.isxunlian) {
        if (this.zdetail.localfiles.length) {
          return false;
        }
        if (this.isEditMode) {
          return false;
        }
        return true;
      } else {
        if (this.zuoyeitem.name) {
          return false;
        }
        return true;
      }
    },
    submittime: {
      get() {
        return commontools.timeTimedateToJsDate(this.zuoyeitem.submittime);
      },
      set(val) {
        this.zuoyeitem.submittime = commontools.timeJsDateToTimedate(val);
      }
    },
    hassubmittime: {
      get() {
        if (this.zuoyeitem.hassubmittime) {
          return true;
        }
        return false;
      },
      set(val) {
        if (val) {
          this.zuoyeitem.hassubmittime = 1;
          this.$refs.timepicker.open();
        } else {
          this.zuoyeitem.hassubmittime = 0;
          this.zuoyeitem.submittime = "";
        }
      }
    },
    allowpasstime: {
      get() {
        if (this.zuoyeitem.allowpasstime) {
          return true;
        }
        return false;
      },
      set(val) {
        if (val) {
          this.zuoyeitem.allowpasstime = 1;
        } else {
          this.zuoyeitem.allowpasstime = 0;
        }
      }
    },
    zuoyeCfrom() {
      return this.$store.state.zuoyeCfrom;
    }
  },
  watch: {
    popupVisibleDetail() {
      if (!this.popupVisibleDetail) {
        this.zuoyeitem.detaildesc = commontools.maxLength(this.zdetail.ztext);
      }
    },
    popupAnswer() {
      if (!this.popupAnswer) {
        this.zuoyeitem.answerdesc = commontools.maxLength(this.zanswer.ztext);
      }
    }
  },
  methods: {
    bankesearch() {
      this.$http
        .post("/api/banke/search", {
          id: this.bankeid
        })
        .then(res => {
          if (res.data.code == 0 && res.data.data.length > 0) {
            let bankeItem = res.data.data[0];
            if (!bankeItem.courseid) {
              this.iscoure = false;
            }
          }
        })
        .catch(err => {});
    },
    xunlianfileDel(i) {
      this.zdetail.localfiles.splice(i, 1);
    },

    selefile() {
      this.actionShow = true;
    },
    upxunlianfile(v) {
      let id = 0;
      let curbanke = sessionStorage.getItem("curbanke") || "";
      if (curbanke) {
        curbanke = JSON.parse(curbanke);
        if (curbanke.id == this.bankeid) {
          id = curbanke.courseid;
        } else {
          id = this.bankeid;
        }
      } else {
        id = this.bankeid;
      }
      let type = v.type;
      this.$store.commit("setRouterForward", true);
      if (type == 1) {
        let tourl = "/coursehome/" + id;
        this.$router.push(tourl);
      } else if ((type = 100)) {
        let tourl = "/Repository/" + this.user.role + "/cloud";
        this.$router.push(tourl);
      }
      sessionStorage.setItem("zyEditMode", this.isEditMode);
      sessionStorage.setItem("xunlianfile", this.type);
      sessionStorage.setItem("xunlianfilename", this.zuoyeitem.name);
      this.$store.commit("SET_CURZUOYE_TYPE", this.type);
    },
    transformtips(tipstype = false) {
      switch (this.type) {
        case "0":
          if (tipstype == "placeholder") {
            return "请输入作业详情";
          } else {
            if (this.isEditMode) {
              return "作业编辑";
            }
            return "创建作业";
          }
        case "1":
          if (tipstype == "placeholder") {
            return "请输入讨论详情";
          } else {
            if (this.isEditMode) {
              return "讨论编辑";
            }
            return "创建新讨论";
          }
        case "2":
          if (tipstype == "placeholder") {
            return "请输入考试详情";
          } else {
            if (this.isEditMode) {
              return "考试编辑";
            }
            return "创建新考试";
          }
        case "10":
          if (this.isEditMode) {
            return "编辑";
          }
          return "创建发音训练作业";
        case "11":
          if (this.isEditMode) {
            return "编辑";
          }
          return "创建听写训练作业";
        case "12":
          if (this.isEditMode) {
            return "编辑";
          }
          return "创建影视配音作业";
      }
    },
    onZDetail() {
      this.popupVisibleDetail = true;
    },
    onZAnaswer() {
      this.popupAnswer = true;
    },
    pickerconfirm() {
      this.zuoyeitem.submittime = commontools.timeJsDateToTimedate(
        this.pickervalue
      );
      console.log("发顺丰", this.zuoyeitem.submittime);
    },
    AnswerSubmit() {},
    defaultzuoyename() {
      //! cjy: no default zname, confused?
      // return '';
      let xunlianfilename = sessionStorage.getItem("xunlianfilename") || "";
      if (xunlianfilename) {
        return xunlianfilename;
      }
      var t = new Date();
      var szfmt = `${this.$mt("新作业")} %02i%02i%02i %02i%02i`;
      switch (this.type) {
        case "1":
          szfmt = `${this.$mt("新讨论")} %02i%02i%02i %02i%02i`;
          break;
        case "2":
          szfmt = `${this.$mt("新考试")} %02i%02i%02i %02i%02i`;
          break;
        case "10":
          szfmt = `${this.$mt("新发音训练作业")} %02i%02i%02i %02i%02i`;
          break;
        case "11":
          szfmt = `${this.$mt("新听写训练作业")} %02i%02i%02i %02i%02i`;
          break;
        case "12":
          szfmt = `${this.$mt("新影视配音作业")} %02i%02i%02i %02i%02i`;
          break;
      }

      var nyear = t.getFullYear() % 100;
      return commontools.sprintf(
        szfmt,
        nyear,
        t.getMonth() + 1,
        t.getDate(),
        t.getHours(),
        t.getMinutes()
      );
    },
    doSave() {
      if (this.zuoyeitem.state != 0) {
        this.doSaveUpload();
        return;
      }
      this.doSaveUpload();
      // MessageBox({
      //   message: "是否现在开始作业？",
      //   showCancelButton: true,
      //   confirmButtonText: "立即开始",
      //   cancelButtonText: "暂不开始"
      // })
      //   .then(res2 => {
      //     if (res2 == "confirm") {
      //       this.zuoyeitem.state = 100;
      //     }
      //     this.doSaveUpload();
      //   })
      //   .catch(() => {
      //     this.doSaveUpload();
      //   });
      // var ttip = "已完成创建？";
      // if (this.isEditMode) {
      //   ttip = "已完成编辑？";
      // }
      // MessageBox({
      //   message: ttip,
      //   showCancelButton: true
      // }).then(res => {
      //   //  console.log(res);
      //   if (res == "confirm") {
      //     MessageBox({
      //       message: "是否现在开始作业？",
      //       showCancelButton: true,
      //       confirmButtonText: "立即开始",
      //       cancelButtonText: "暂不开始"
      //     })
      //       .then(res2 => {
      //         if (res2 == "confirm") {
      //           this.zuoyeitem.state = 100;
      //         }
      //         this.doSaveUpload();
      //       })
      //       .catch(() => {
      //         this.doSaveUpload();
      //       });
      //   }
      // });
    },
    doSaveUpload() {
      let bankeid = this.bankeid;
      var url = "/api/api/bankezuoyeadd?bankeid=" + bankeid;
      if (this.zuoyeCfrom == "coursehome") {
        url = "/api/api/bankezuoyeadd?bankeid=0&courseid=" + bankeid;
      }
      Indicator.open(this.isEditMode ? this.$mt("保存中") : this.$mt("创建中"));

      var zitem = {};
      zitem = this.zuoyeitem;
      let zdetail = {
        ztext: this.zdetail.ztext,
        files: maintools.filelistFromLocalfiles(this.zdetail.localfiles)
      };
      let zanswer = {
        ztext: this.zanswer.ztext,
        files: maintools.filelistFromLocalfiles(this.zanswer.localfiles)
      };
      if (this.xunlianfile.length) {
        if (this.isxunlian) {
          // this.xunlianfile[0].info.fileid=110;
          // this.xunlianfile[0].info.filepath = "/downloads/resdisk/20201217/053041b839c7eafb5d9c30885da281fff.expaper";
          zdetail.files = [this.xunlianfile[0].info];
          // if (this.type == "10" || this.type == "2") {
          //   zdetail.files = [
          //     {
          //       filepath: this.zdetail.localfiles[0].info.filepath, //字幕
          //       fileid: this.zdetail.localfiles[0].id
          //     }
          //   ];
          // } else if (this.type == "11" || this.type == "12") {
          //   zdetail.files = [
          //     {
          //       filepath: this.zdetail.localfiles[0].info.srtpath, //字幕
          //       fileid: this.zdetail.localfiles[0].info.srtid
          //     },
          //     {
          //       filepath: this.zdetail.localfiles[0].info.filepath, //视频
          //       fileid: this.zdetail.localfiles[0].id
          //     }
          //   ];
          // }
        }
      }

      this.$http
        .post(url, {
          zdetail: zdetail,
          zanswer: zanswer,
          zuoye: zitem
        })
        .then(res => {
          Indicator.close();
          if (res.data.code == 0) {
            let msg = this.isEditMode
              ? this.$mt("保存成功")
              : this.$mt("创建成功");
            if (this.cfromPath.path.includes("zuoyeresult")) {
              Toast(this.$mt("保存成功"));
              this.$router.go(-1);
            } else {
              Toast(msg + "\xa0" + this.$mt("请在作业库中发布作业"));
              this.$router.go(-1);
              this.$store.commit("SET_ZYNEW_BACK_STATE", 1);
              if (this.isxunlian) {
                sessionStorage.removeItem("xunlianzyfile");
                sessionStorage.removeItem("xunlianfilename");
                sessionStorage.removeItem("xunlianfile");
              }
            }
          } else {
            Toast(res.data.msg);
          }
        })
        .catch(() => {
          Indicator.close();
          Toast(this.$mt("异常"));
        });
    },
    //  发送作业消息
    mimiMessage() {
      //! cjy: 发送消息接口不再提供给客户端，防止伪造的客户端越权
      // let date = formateTime(new Date(), "-");
      // this.$http
      //   .post("/api/weixin/pushnotify", {
      //     templateid: "yEWdaUgS7luynNFryYXXwZUqEKqqXcglt7gD70Aue7s",
      //     topage: '/#/zuoyeresult/' + this.zuoyeitem.id,
      //     data: {
      //       thing3: "今天作业已经发布",
      //       name5: this.curbanke.name,
      //       date7: date
      //     },
      //     sendto: {
      //       type: "banke",
      //       bankeid: this.curbanke.id
      //     }
      //   })
      //   .then(res => {})
      //   .catch(() => {});
    },
    onTimePicker() {
      //  var testdate = new Date(this.zuoyeitem.submittime);
      // if (testdate){
      // console.log(testdate.getFullYear());
      //  console.log(testdate.getDate());
      //   console.log(testdate.getMonth());
      //  console.log(testdate.getHours());
      //}

      if (!this.zuoyeitem.hassubmittime) {
        return;
      }
      this.curdatetime = new Date();
      this.pickervalue = commontools.timeTimedateToJsDate(
        this.zuoyeitem.submittime
      );
      this.$refs.timepicker.open();
    },
    assignZDetail(to, from) {
      to.ztext = from.ztext;
      to.localfiles = maintools.localfilesFromFilelist(from.files);
    },
    back() {
      if (this.isxunlian) {
        sessionStorage.removeItem("xunlianzyfile");
        sessionStorage.removeItem("xunlianfilename");
        sessionStorage.removeItem("xunlianfile");
      }
      if (this.zuoyeCfrom == "coursehome") {
        this.$store.commit("SET_ZYNEW_BACK_STATE", 3);
      }
      this.$router.go(-1);
    },
    checkxlfile(jz = false) {
      if (this.isxunlian) {
        let xunlianzyfile = sessionStorage.getItem("xunlianzyfile") || "";
        if (xunlianzyfile) {
          xunlianzyfile = JSON.parse(xunlianzyfile);
          console.log("作业训练文件", xunlianzyfile);
          this.xunlianfile = xunlianzyfile;
          let obj = [xunlianzyfile[0].info];
          if (jz) {
            jz.files = obj;
          } else {
            this.assignZDetail(this.zdetail, { files: obj });
          }
        }
      }
    }
  },
  components: {
    zuoyedetailedit,
    Answer,
    [Switch.name]: Switch,
    [DatetimePicker.name]: DatetimePicker,
    [Actionsheet.name]: Actionsheet
  },
  created() {
    this.checkxlfile();
    var dd = this.$store.getters.getBankeData("zuoyelist", this.bankeid);
    console.log(" canch zuoyelist 编辑", dd);
    if (dd && dd.editingZuoye && dd.editingZuoye != null) {
      this.zuoyeitem = dd.editingZuoye;
      this.isEditMode = true;
      //! 拉取zdetail 和zanswer 信息
      Indicator.open(this.$mt("加载中"));
      this.$http
        .post("/api/api/bankezuoyedetail", { zuoyeid: this.zuoyeitem.id })
        .then(res => {
          Indicator.close();
          if (res.data.code == 0) {
            this.zuoyeitem = res.data.data["zuoye"];
            let localeditname = sessionStorage.getItem("xunlianfilename") || "";
            if (localeditname) {
              this.zuoyeitem.name = localeditname;
            }
            var jz = res.data.data["zdetail"];
            this.checkxlfile(jz);
            this.assignZDetail(this.zdetail, jz);
            if (res.data.data["zanswer"]) {
              this.assignZDetail(this.zanswer, res.data.data["zanswer"]);
            }
          }
        })
        .catch(() => {
          Indicator.close();
        });
    }
  },
  destroyed() {
    if (!this.isEditMode) {
      this.$store.commit("setBankeData", {
        modulename: "zuoyelist",
        bankeid: this.bankeid,
        fn: fobj => {
          fobj.editingZuoye = null; //! 清空当前编辑的作业
        }
      });
    }

    // this.$store.commit("setBankeData", {
    //   modulename: "zuoyelist",
    //   bankeid: this.bankeid,
    //   fn: fobj => {
    //     fobj.editingZuoye = this.zuoyeitem;
    //   }
    // });
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.cfromPath = from;
      vm.cfrompage = from.path;
      console.log("beforeRouteEnter newzy", from);
      if (vm.cfrompage.indexOf("coursehome") < 0 && vm.type >= 10) {
        vm.bankesearch();
      }
    });
  }
};
</script>

<style scoped>
.mint-popup-3 {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
.mint-cell {
  padding-right: 10px;
}
.mint-cell-value {
  margin-right: 15px;
}
.mint-cell-value {
  color: #33a0ff;
}
.mint-header-f {
  border-bottom: 1px solid #f0f0f0;
}
</style>
<style lang="less">
.new-zuoye-wrap {
  overflow: hidden;
  .main {
    height: 94vh;
    min-height: 94vh;
    overflow: auto;
    .zuoye-info-wrap {
      background: #fff;
      .mint-field {
        padding: 10px;
      }
      .container {
        padding: 10px;
      }
      .attachdesc {
        border-bottom: none;
        padding: 5px;
      }
      textarea {
        height: 112px;
        max-height: 112px;
        padding: 0;
      }
      .imgblock {
        width: 60px;
        height: 60px;
        border: 1px dashed #aaaaaa;
      }
      .bottommargin {
        height: 0;
      }
      .xunlian-up {
        position: relative;
        padding-bottom: 50px;
        .xlupitem-wrap {
          display: flex;
          .xl-up-item {
            position: relative;
            width: 60px;
            height: 60px;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 0 10px;
            img {
              width: 60px;
              height: 60px;
            }
            .name {
              width: 100%;
              position: absolute;
              bottom: -26px;
              text-align: center;
            }
          }
        }

        .seleup {
          width: 60px;
          height: 60px;
          text-align: center;
          line-height: 60px;
          color: #eaeaea;
          border: 1px dashed #aaaaaa;

          position: relative;
          left: 50%;
          transform: translate(-50%, 0);
          bottom: -38px;
          .up-icon {
            font-size: 30px;
            color: #999;
          }
        }
      }
      .files-wrap {
        .tit {
          padding-bottom: 20px;
          color: #999;
          font-size: 16px;
        }
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
    .mint-switch-input:checked + .mint-switch-core {
      border-color: #4cd964;
      background-color: #4cd964;
    }
    .tips {
      color: #939393;
      padding: 10px;
    }
  }
}
</style>