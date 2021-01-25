<template>
  <div class="discuss-container">
    <mt-header :title="$mt('讨论')" class="mint-header-f" v-if="showheader">
      <mt-button slot="left" icon="back" @click="back">{{$mt('返回')}}</mt-button>
    </mt-header>
    <div class="tit-info" :class="!isLimitHeight || showlocalfiles.length ?'act':''">
      <p class="font16">{{ptit}}</p>
      <TextEllipsis
        :text="ItemInfo.ztype == 1?zdetail.ztext:ItemInfo.ztext"
        :height="50"
        :isLimitHeight="isLimitHeight"
        class="zatextmain word-wrap"
      >
        <template slot="more">
          <span class>...</span>
          <span class="zatextviewmore" @click="isLimitHeightFn">{{$mt('查看更多')}}</span>
        </template>
        <span slot="after" v-if="!isLimitHeight" @click="isLimitHeightFn">
          <span class="zatextviewmore">{{$mt('收起')}}</span>
        </span>
      </TextEllipsis>
      <FileAttachList :isupload="false" :localfiles="showlocalfiles"></FileAttachList>
    </div>
    <div
      class="discuss-list-content"
      :class="{'noheaderfiles':!showlocalfiles.length,'stopdiscus':!candiscuss,'isLimitHeight':!isLimitHeight,'ztext':zdetail.ztext||ItemInfo.ztext}"
    >
      <p class="discuss-number color9 fontnormal">{{$mt('评论')}}（{{commentnum}}）</p>
      <div
        class="list-content"
        v-if="teacherInfo.length"
        v-infinite-scroll="loadMore"
        infinite-scroll-disabled="loading"
        infinite-scroll-distance="50"
      >
        <div class="item clearfix" v-for="(lists ,tindex) in teacherInfo" :key="tindex">
          <img class="tit-pic" :src="lists.useravatar" alt :onerror="$defaultImg('account')" />
          <ul class="teacher-content">
            <li class="teacher-name color9">
              {{lists.username}}
              &nbsp;&nbsp;
              <!-- <mt-badge size="small" color="#ff7403">老师</mt-badge> -->
              <span
                v-if="user.id!=lists.userid && candiscuss"
                class="hui-fu"
                @click="studentHF(lists,tindex)"
              >{{$mt('回复')}}</span>
            </li>
            <li v-if="lists.content" class="text">{{lists.content}}</li>
            <li v-if="lists.files" class="clearfix">
              <!-- <img
                :src="lists.files.filepath"
                class="pic-sub"
                @click="Preview(lists.files.filepath)"
              />-->
              <FileAttachList :isupload="false" class="falist" :localfiles="lists.files"></FileAttachList>
            </li>
            <li
              class="dade color9"
              :class="lists.lastreplydata.length?'border-bottom':''"
            >{{longTime(lists.createtime,$mt)}}</li>
            <li
              v-for="(item ,index) in lists.lastreplydata"
              :key="index"
              class="student-content clearfix"
              :class="index!=lists.lastreplydata.length-1?'border-bottom':''"
            >
              <ul>
                <li class="teacher-name color9">
                  {{item.fromusername}}
                  &nbsp;&nbsp;
                  <!-- <mt-badge size="small" color="#ff7403">老师</mt-badge> -->
                  <span
                    v-if="user.id!=item.fromuserid && candiscuss"
                    class="hui-fu"
                    @click="studentHF(item,tindex)"
                  >{{$mt('回复')}}</span>
                </li>
                <li class="text">{{$mt('回复')}}{{item.tousername}}：{{item.content}}</li>

                <li class="clearfix">
                  <!-- <viewer> -->
                  <!-- <img
                    :src="item.files.filepath"
                    class="pic-sub"
                    @click="Preview(item.files.filepath)"
                  />-->
                  <FileAttachList :isupload="false" class="falist" :localfiles="item.files"></FileAttachList>
                  <!-- </viewer> -->
                  <!-- <viewer>
                    <img
                      v-for="(item,index) in item.files"
                      :key="index"
                      :src="item.filepath"
                      class="pic-sub"
                    />
                  </!-->
                </li>

                <li class="dade color9">{{longTime(item.createtime,$mt)}}</li>
              </ul>
            </li>
          </ul>
          <span
            v-if="lists.replynum>3"
            class="more"
            @click="learnMoreFn(lists,tindex)"
          >{{lists.more?$mt('收起'):$mt('查看更多')}}</span>
        </div>
      </div>
      <div class="no-more" v-if="loading && teacherInfo.length>'10'">{{$mt('我是有底线的')}}~~</div>
      <div class="no-more" v-if="noComment">{{$mt('暂未评论')}}~~</div>
    </div>
    <mt-popup v-model="showhf" position="bottom" class="mint-popup-3">
      <div style class="hf-box">
        <p class="tit border-bottom-e5">
          <span class="qx button-blue" @click="qx">{{$mt('取消')}}</span>
          <span class="qr button-blue" style="float:right" @click="HFSubmit()">{{$mt('确认')}}</span>
        </p>
        <textarea
          class="border-bottom-e5"
          rows="6"
          :placeholder="$mt('输入你的观点')"
          v-model="textareaMsg"
        ></textarea>
        <div class="add-pic">
          <div class="attachdesc">
            <span class="addimg-warp">
              <img
                :class="curupfile?'hasaddimg':''"
                :src="curupfile?curupfile:'/assets/zuoye_add.png'"
                alt
                @click="unloadFn"
              />
              <i v-show="curupfile" class="del" @click="dele">x</i>
            </span>

            <span class="curupfiletext" :class="curupfile?'topp':''">{{$mt(curupfiletext)}}</span>
          </div>
          <!-- <div class="listc clearfix"> -->
          <!-- <img
              class="fl addimg"
              :src="curupfile?curupfile:'/assets/zuoye_add.png'"
              alt
              @click="unloadFn"
          />-->
          <!-- <a class="fl commentPicSrc">
              <img class="upimg" :src="curupfile" alt />
              <i @click="dele(i)">x</i>
          </a>-->
          <!-- <a class="fl commentPicSrc" v-for="(v,i) in commentPicSrc" :key="i">
              <img class="upimg" :src="v" alt />
              <i @click="dele(i)">x</i>
          </a>-->
          <!-- </div> -->
        </div>
      </div>
    </mt-popup>
    <div class="submit-msg clearfix" v-if="candiscuss">
      <div class="upload-content">
        <img src="/assets/zuoye_add.png" alt @click="unloadFn" />
        <input
          ref="uploadPic"
          type="file"
          name="file"
          class="upload"
          @change="uploadChange"
          style="display:none"
          accept="image/*"
        />
      </div>
      <input
        class="msg"
        type="text"
        v-model="discussMsg"
        :placeholder="$mt('在此发表评论')"
        @blur="$setInputScroll"
      />
      <span class="color9 submit" style="color:#26a2ff" @click="submit()">{{$mt('发送')}}</span>
    </div>
  </div>
</template>

<script>
import nativecode from "@/nativecode";
import { Badge, Toast, Indicator } from "mint-ui";
import ImagePreview from "vant/lib/image-preview";
import "vant/lib/image-preview/style";
import mimgcrop from "../../common/m-image-crop";
import { constants } from "crypto";
import { formateTime } from "../../util";
import FileAttachList from "./FileAttachList";
import ZuoyeDetailEdit from "../ZuoyeDetailEdit";
const _URL = window.URL || window.webkitURL;
import commontools from "../../commontools";
import TextEllipsis from "./TextEllipsis";
import maintools from "@/views/maintools";
export default {
  name: "",
  props: {
    itemInfo: {
      default() {
        return {};
      }
    },
    zuoyeitem: {
      default() {
        return {};
      }
    },
    zdetail: {
      default() {
        return {
          ztext: "",
          files: []
        };
      }
    },
    showheader: {
      default: false
    },
    frompage: {
      default: ""
    },
    cfrompagepath: {
      default: "bankehome"
    }
  },
  components: {
    [ImagePreview.name]: ImagePreview,
    [Badge.name]: Badge,
    FileAttachList,
    ZuoyeDetailEdit,
    TextEllipsis
  },
  data() {
    return {
      loading: false,
      textareaMsg: "",
      showhf: false,
      index: "",
      discussMsg: "",
      teacherInfo: [],
      urlinfo: {
        urlupload: "/api/api/zuoyefileupload",
        urldel: "/api/api/zuoyefiledelete"
      },
      imgSrc: [],
      ItemInfo: {},
      indexItem: {},
      imgFileJson: "",
      curupfile: "",
      topid: "",
      noComment: false,
      commentPic: [],
      commentPicSrc: [],
      longTime: commontools.longTime,
      isLimitHeight: true,
      taboutid: 0,
      tabout: 0,
      candiscuss: true,
      curhasSubmit: false,
      pagemode: "results"
    };
  },
  watch: {
    showhf:function(newValue, oldValue) {
      if(!newValue){
        this.qx();
      }
    },
    itemInfo: function(newValue, oldValue) {
      this.backInit();
      this.ItemInfo = newValue;
      console.log("watch", this.ItemInfo);
      this.commentQuery(this.ItemInfo);
    }
  },
  computed: {
    curupfiletext() {
      if (this.curupfile) {
        return "点击重新上传";
      }
      return "添加附件";
    },
    cansubmitzy() {
      if (
        this.zuoyeitem.ztype == 1 &&
        !this.curhasSubmit &&
        this.pagemode == "submit"
      ) {
        return true;
      }
      return false;
    },
    showlocalfiles() {
      if (this.zuoyeitem.ztype == 1) {
        return this.zdetail.localfiles;
      } else {
        if (this.zuoyeitem.ztype == 0 && this.ItemInfo.localfiles) {
          return this.ItemInfo.localfiles;
        }
        return [];
      }
    },
    ptit() {
      if (this.ItemInfo.username) {
        return this.ItemInfo.username +"\n" + this.$mt('作业');
      }
      return this.ItemInfo.name;
    },
    commentnum() {
      if (this.ItemInfo.ztype == "1") {
        return this.teacherInfo.length;
      } else {
        if (this.ItemInfo.commentnum) {
          return this.ItemInfo.commentnum;
        }
        return 0;
      }
    },
    isTeacher() {
      return this.$store.getters.isteacher;
    },
    user() {
      return this.$store.getters.curuser;
    },
    zuoyeCfrom() {
      return this.$store.state.zuoyeCfrom;
    }
  },
  created() {
    this.backInit();
    this.ItemInfo = this.itemInfo;
    console.log("created", this.ItemInfo);
    this.commentQuery(this.ItemInfo);
  },
  mounted() {},
  methods: {
    isLimitHeightFn() {
      this.isLimitHeight = !this.isLimitHeight;
    },
    Preview(img) {
      let images = [img];
      ImagePreview(images);
    },
    commentQuery(item) {
      this.zuoyeresultquery();
      console.log("commentQuery", item);
      console.log("commentQuery zuoyeitem", this.zuoyeitem);
      Indicator.open(this.$t("Indicator.Loading"));
      let url = "";
      this.taboutid = item.submitid;
      if (item.ztype == 1) {
        this.taboutid = item.id;
        this.tabout = item.ztype;
        if (item.state != 100) {
          this.candiscuss = false;
        }
      }
      if (this.topid) {
        url =
          "/api/comment/query?taboutid=" +
          this.taboutid +
          "&tabout=" +
          this.tabout +
          "&topid=" +
          this.topid +
          "&pagesize=10";
      } else {
        url =
          "/api/comment/query?taboutid=" +
          this.taboutid +
          "&tabout=" +
          this.tabout +
          "&pagesize=10";
      }
      this.$http
        .post(url, {})
        .then(res => {
          console.log("查询成功", res);
          if (res.data.code == "0") {
            let serveData = res.data.data;
            if (!serveData.length && !this.teacherInfo.length) {
              this.noComment = true;
            } else {
              if (serveData.length < 10) {
                this.loading = true;
              }
              for (let lists of serveData) {
                if (lists.files && typeof lists.files == "string") {
                  // after
                  let arr = [];
                  arr[0] = JSON.parse(lists.files);
                  lists.files = arr;
                  for (let v of lists.files) {
                    this.initservefiles(v);
                  }

                  //front    lists.files = JSON.parse(lists.files);
                }
                if (lists.lastreplydata == "") {
                  lists.lastreplydata = [];
                } else {
                  lists.lastreplydata = JSON.parse(lists.lastreplydata);
                  console.log("fssfdfs", lists.lastreplydata);
                  for (let item of lists.lastreplydata) {
                    if (item.files) {
                      // after
                      let arr = [];
                      arr[0] = JSON.parse(item.files);
                      item.files = arr;
                      for (let v of item.files) {
                        this.initservefiles(v);
                        // v.metainfo = JSON.parse(v.metainfo);
                        // if (v.filepath && v.metainfo && v.metainfo.snapsuffix) {
                        //   v.imgsrc = v.filepath + v.metainfo.snapsuffix;
                        // } else {
                        //   v.imgsrc = v.filepath;
                        // }
                      }
                      //front   item.files = JSON.parse(item.files);
                    }
                  }
                }
              }
              this.topid = serveData[serveData.length - 1].id;
              // this.teacherInfo = this.teacherInfo.concat(serveData);
              this.teacherInfo = [...this.teacherInfo, ...serveData];
              console.log("评论", this.teacherInfo);
            }
          } else {
          }
          Indicator.close();
        })
        .catch(() => {
          Indicator.close();
          console.log("查询失败");
        });
    },
    initservefiles(v) {
      if (v.metainfo && typeof v.metainfo == "string") {
        v.metainfo = JSON.parse(v.metainfo);
        if (v.filepath && v.metainfo.snapsuffix) {
          v.imgsrc = v.filepath + v.metainfo.snapsuffix;
        } else {
          v.imgsrc = v.filepath;
        }
      } else {
        v.imgsrc = v.filepath;
      }
    },
    loadMore() {
      if (this.teacherInfo.length >= "10") {
        this.commentQuery(this.ItemInfo);
      }
    },
    zuoyeresultquery() {
      var url = "/api/api/zuoyeresultquery?zuoyeid=" + this.zuoyeitem.id;
      this.$http
        .post(url)
        .then(res => {
          if (res.data.code == 0) {
            let results = res.data.data.results;
            if (res.data.data.mymember) {
              this.pagemode = "submit";
            }
            if (this.pagemode == "submit" && results.length) {
              this.curhasSubmit = true;
            }
          }
        })
        .catch(() => {});
    },
    onsubmit() {
      var url = "/api/api/zuoyesubmit?zuoyeid=" + this.zuoyeitem.id;
      this.$http
        .post(url, {
          zdetail: {
            ztext: "",
            files: []
          }
        })
        .then(res => {
          if (res.data.code == 0) {
            this.curhasSubmit = true;
          }
        })
        .catch(err => {});
    },
    //提交评论
    submit() {
      if (!this.discussMsg && !this.imgFileJson) return;
      console.log("dsd", this.itemInfo);
      // return;
      Indicator.open(this.$mt("提交中"));
      this.$http
        .post("/api/comment/addcomment", {
          taboutid: this.taboutid,
          content: this.discussMsg,
          files: this.imgFileJson,
          tabout: this.tabout
        })
        .then(res => {
          console.log("提交成功", res);
          if (res.data.code == "0") {
            let Data = res.data.data;
            if (Data.lastreplydata && typeof Data.lastreplydata == "string") {
              Data.lastreplydata = JSON.parse(Data.lastreplydata);
            }
            if (Data.files) {
              // arft
              let arr = [];
              arr[0] = JSON.parse(Data.files);
              Data.files = arr;
              for (let v of Data.files) {
                this.initservefiles(v);
                // v.metainfo = JSON.parse(v.metainfo);
                // if (v.filepath && v.metainfo && v.metainfo.snapsuffix) {
                //   v.imgsrc = v.filepath + v.metainfo.snapsuffix;
                // } else {
                //   v.imgsrc = v.filepath;
                // }
              }
              // front  Data.files = JSON.parse(Data.files);
            }
            console.log("aaaaa", Data);
            this.teacherInfo.unshift(Data);
            this.ItemInfo.commentnum++;
            this.noComment = false;
            this.init();
            Indicator.close();
            this.$emit("plMessage", "pl");

            if (this.cansubmitzy) {
              this.onsubmit();
            }
          } else {
            Indicator.close();
          }
        })
        .catch(() => {
          Indicator.close();
          console.log("提交失败");
          this.init();
        });
    },
    //回复button
    studentHF(item, index) {
      console.log("回复回复", item);
      this.indexItem = item;
      this.index = index;
      this.showhf = true;
    },
    //回复评论
    HFSubmit() {
      if (!this.textareaMsg && !this.imgFileJson) {
        Toast(this.$mt("请输入内容或上传文件"));
        return;
      }
      let subData = {};
      let item = this.indexItem;
      console.log("cvcv", item);
      subData.tcommentid = item.tcommentid || item.id;

      subData.touserid = item.userid || item.fromuserid;
      subData.tousername = item.username || item.fromusername;

      subData.fromuserid = this.user.id;
      subData.fromusername = this.user.name;

      subData.content = this.textareaMsg;
      // subData.files = JSON.stringify(this.imgFileJson);
      subData.files = this.imgFileJson;

      Indicator.open(this.$mt("提交中"));
      this.$http
        .post("/api/comment/addreply", subData)
        .then(res => {
          console.log("提交成功", res);
          if (res.data.code == "0") {
            let Data = res.data.data;
            if (this.imgFileJson) {
              // arft
              let arr = [];
              arr[0] = JSON.parse(this.imgFileJson);
              Data.files = arr;
              for (let v of Data.files) {
                this.initservefiles(v);
                // v.metainfo = JSON.parse(v.metainfo);
                // if (v.filepath && v.metainfo && v.metainfo.snapsuffix) {
                //   v.imgsrc = v.filepath + v.metainfo.snapsuffix;
                // } else {
                //   v.imgsrc = v.filepath;
                // }
              }
              // front  Data.files = JSON.parse(this.imgFileJson);
            }
            this.teacherInfo[this.index].lastreplydata.push(Data);
            Indicator.close();
            console.log("梵蒂冈的", this.cansubmitzy);
            if (this.cansubmitzy) {
              this.onsubmit();
            }
          } else {
            console.log("提交失败");
            Indicator.close();
          }
          this.init();
        })
        .catch(() => {
          this.init();
          Indicator.close();
          console.log("异常");
        });
    },
    // 查看更多
    learnMoreFn(item, index) {
      item.more = !item.more;
      if (item.more) {
        Indicator.open(this.$mt("加载中"));
        this.$http
          .get(
            "/api/comment/queryreply?tcommentid=" +
              item.id +
              "&topid=&pagesize=",
            {}
          )
          .then(res => {
            let Data = res.data.data;
            for (let item of Data) {
              if (item.files) {
                // arft
                let arr = [];
                arr[0] = JSON.parse(item.files);
                item.files = arr;
                for (let v of item.files) {
                  this.initservefiles(v);
                  // v.metainfo = JSON.parse(v.metainfo);
                  // if (v.filepath && v.metainfo && v.metainfo.snapsuffix) {
                  //   v.imgsrc = v.filepath + v.metainfo.snapsuffix;
                  // } else {
                  //   v.imgsrc = v.filepath;
                  // }
                }
                // front  item.files = JSON.parse(item.files);
              }
            }
            this.teacherInfo[index].lastreplydata = Data;
            Indicator.close();
          })
          .catch(() => {
            Indicator.close();
          });
      } else {
        this.teacherInfo[index].lastreplydata.splice(
          3,
          this.teacherInfo[index].lastreplydata.length
        );
      }
      Indicator.close();
    },
    unloadFn() {
      this.$refs.uploadPic.click();
    },
    uploadChange(e) {
      let that = this;
      let file = e.target.files[0];
      let _filesize = file.size;
      if (_filesize / (1024 * 1024) > 300) {
        MessageBox({
          title: this.$mt("提示"),
          message: `<p>${file.name}</p>
              <p>${this.$mt("此文件大小超过上限,建议小于%s",[300])}M</p>`,
          showCancelButton: true
        });
        return;
      }
      this.uploadImg(file);
      this.$refs.uploadPic.value = "";
    },
    uploadImg(file) {
      let that = this;
      let formdata = new FormData();
      formdata.append("file", file);
      let url = this.urlinfo.urlupload;
      Indicator.open(this.$mt("上传中") + "...");
      this.$http
        .post(url, formdata)
        .then(res => {
          if (res.data.code == 0) {
            // this.imgFileJson.push(JSON.stringify(res.data.data))
            this.imgFileJson = JSON.stringify(res.data.data);
            this.curupfile = _URL.createObjectURL(file);
            if (that.index >= "0") {
              // this.HFSubmit();
              // this.commentPic.push(file);
              // this.commentPicSrc.push(_URL.createObjectURL(file));
              console.log("发的就开始了", this.commentPicSrc);
            } else {
              this.submit();
            }
            // console.log("成功", res.data.data);
            Indicator.close();
          } else {
            Indicator.close();
            console.log("失败", res.data.data);
          }
        })
        .catch(() => {
          Indicator.close();
          console.log("catch", res.data.data);
        });
    },
    qx() {
      this.init();
    },
    init() {
      this.showhf = false;
      this.index = "";
      this.textareaMsg = "";
      this.imgSrc = [];
      this.indexItem = {};
      this.discussMsg = "";
      this.imgFileJson = "";
      this.commentPic = [];
      this.commentPicSrc = [];
      this.curupfile = "";
    },
    backInit() {
      this.teacherInfo = [];
      this.topid = "";
      this.imgSrc = [];
      this.ItemInfo = {};
      this.indexItem = {};
      this.loading = false;
      this.noComment = false;
    },
    dele() {
      // this.imgSrc.splice(index, 1);
      // this.commentPicSrc.splice(index, 1);
      this.imgFileJson = "";
      this.curupfile='';
    },
    unloadServer(files) {
      let param = new FormData();
      for (let i = 0; i < files.length; i++) {
        param.append("imgFile" + (i + 1), files[i]);
      }
    },
    back() {
      if (this.zuoyeCfrom == "coursehome") {
        this.$store.commit("SET_ZYNEW_BACK_STATE", 3);
      }
      this.$back();
      return;

      if (this.zuoyeCfrom == "coursehome") {
        this.$store.commit("SET_ZYNEW_BACK_STATE", 3);
      }
      if (nativecode.platform == "miniprogram") {
        if (this.cfrompagepath == "/" || this.cfrompagepath == undefined) {
          this.$router.replace("/");
          return;
        }
      }
      this.$router.go(-1);
    },
  },
  destroyed() {}
};
</script>

<style lang="less">
.discuss-container {
  position: relative;
  font-size: 14px;
  // margin-top: 50px;
  .tit-info {
    padding: 15px 10px;
    background: #fff;
    border-bottom: 1px solid #e5e5e5;
    overflow: scroll;
    &.act {
      height: 150px;
    }
    .zatextmain {
      color: #888888;
      .zatextviewmore {
        color: #509f7a;
        padding-left: 5px;
      }
    }
    .mint-cell-wrapper {
      font-size: 18px;
      padding: 15px 10px;
    }
  }
  .discuss-list-content {
    width: 100%;
    height: 61vh;
    overflow-y: scroll;
    padding-bottom: 25px;
    &.noheaderfiles {
      height: 75vh;
    }
    &.isLimitHeight {
      height: 62vh;
    }

    &.stopdiscus {
      height: 71vh;
    }
    &.stopdiscus.noheaderfiles {
      height: 85vh;
    }
    &.stopdiscus.noheaderfiles.isLimitHeight {
      height: 71vh;
    }
    .discuss-number {
      padding: 20px 10px;
      background: #f0f0f0;
    }
    .list-content {
      padding: 0 10px;
      .item {
        position: relative;
        // margin-bottom: 5vw;
        border-bottom: 1px solid #cccccc94;
        padding: 10px;
        padding-bottom: 20px;
        img.tit-pic {
          width: 40px;
          position: absolute;
          left: 0;
          top: 10px;
        }
        ul {
          width: 90%;
          height: auto;
          float: right;
          li {
            padding: 5px 0;
          }
          .teacher-name {
            .hui-fu {
              float: right;
              color: #57a4de;
            }
          }
          .student-content {
          }
        }
        .teacher-content {
          width: calc(100% - 43px);
          .pic-sub {
            width: 131px !important;
            // height: 127px!important;
          }
        }
        .more {
          position: absolute;
          bottom: 3px;
          width: 100%;
          text-align: center;
          color: #57a4de;
        }
      }
    }
  }
  .submit-msg {
    position: fixed;
    width: 100%;
    left: 0;
    bottom: 0;
    border: 1px solid #ccc;
    padding: 10px 0;
    border-radius: 8px;
    background: #fff;
    .upload-content {
      position: absolute;
      img {
        width: 60px !important;
        height: 60px !important;
        border-radius: 20% !important;
        left: 55px !important;
        top: 0 !important;
        transform: translate(0, -11%) !important;
        .upload {
          display: none;
        }
      }
    }

    input {
      width: 70%;
      height: 40px;
      padding: 3px 12px 0;
      border: 1px solid #ccc;
      border-radius: 8px;
      margin-left: 60px;
    }

    .submit {
      width: 13%;
      height: 100%;
      position: absolute;
      right: 0;
      top: 50%;
      margin-top: -20px;
      line-height: 40px;
      font-size: 18px;
      text-align: center;
    }
  }
  .mint-popup-bottom {
    width: 100%;
    height: 43vh;
    max-height: 43vh;
    min-height: 43vh;
    overflow-y: scroll;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    box-shadow: 0 0 35px 13px #656060;
    .hf-box {
      .tit {
        padding: 10px;
        .qr {
          float: right;
        }
      }
      textarea {
        width: 100%;
        padding: 15px;
      }
      .add-pic {
        .attachdesc {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 7px;
          .addimg-warp {
            position: relative;
            .del {
              position: absolute;
              right: -7px;
              top: -8px;
              width: 18px;
              height: 18px;
              text-align: center;
              line-height: 18px;
              background: #f00;
              border-radius: 18px;
              color: #fff;
            }
            .hasaddimg {
              width: 60px;
              height: 60px;
            }
          }
          .curupfiletext.topp{
            padding-top: 5px;
          }
        }
        .listc {
          display: flex;
          align-items: center;
          width: 100%;
          position: relative;
          float: left;
          .addimg {
            width: 48px;
            height: 48px;
            position: relative;
            margin: 0 10px;
          }
          .commentPicSrc {
            width: 48px;
            height: 48px;
            position: relative;
            border: 1px dashed #666;
            margin: 0 10px;
            .upimg {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
        }
      }
    }
    .hf-Submit-pic {
      width: 4.375rem;
      height: 3.675rem;
      margin-right: 10px;
    }
  }
  .imgclass {
    height: 100% !important;
  }
}
.mint-cell-label {
  font-size: 14px !important;
  line-height: 20px;
}
</style>