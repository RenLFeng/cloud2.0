<template>
  <div class="repository-wrap">
    <mt-header :title="menuName">
      <mt-button v-if="!cfromCloud&&!cfromzy" slot="left" @click="canlce()">{{$mt('取消')}}</mt-button>
      <mt-button
        v-if="cfromCloud && cfromprogram=='cloud' || cfromzy"
        icon="back"
        slot="left"
        @click="back()"
      >{{$mt('返回')}}</mt-button>
      <mt-button v-if="isSelectend" slot="right" @click="submit()">{{$mt('确定')}}</mt-button>
      <mt-button
        v-if="!firstmenu && !isSelectend && canUpload"
        slot="right"
        class="iconfont iconiconfontadd icons fontlarge24"
        @click.native="onaddFile"
      ></mt-button>
    </mt-header>

    <div class="main" :class="cfromCloud?'cfromCloud':''">
      <p class="Prev-btn" v-if="showprev" @click="onPrev">
        <i class="iconfont iconwithdraw-fill colord position-l"></i>
        <span style="color:#a5a5a5">{{$mt('返回上一层')}}...</span>
      </p>
      <div
        ref="listcontainer"
        class="listcontainer overflow-scroll"
        :class="{'haspre':showprev,'cfromCloud':cfromCloud}"
        v-infinite-scroll="loadMore"
        infinite-scroll-disabled="loading"
        infinite-scroll-distance="10"
        infinite-scroll-immediate-check="false"
      >
        <div class="repository-items-wrap" v-if="firstmenu">
          <ul>
            <li class="item" v-for="(v,i) in repositoryitems" :key="i" @click="onsitoryClick(v)">
              <img class="img object-fit-img position-l;" :src="v.icon" :onerror="$defaultImg('')" />
              <span class="name">{{v.name}}</span>
            </li>
          </ul>
        </div>
        <mt-loadmore
          :top-method="loadTop"
          :top-distance="80"
          ref="loadmore"
          :auto-fill="autofill"
          :topPullText="$mt('下拉刷新')"
          :topDropText="$mt('释放更新')"
          :topLoadingText="$mt('加载中')"
        >
          <div class="wrap" :class="showprev?'prev':''" v-if="!firstmenu">
            <div v-for="(fitem,selindex) in arrZhiyuan" v-bind:key="selindex" class="item-wrap">
              <div
                v-if="fitem.ftype=='menu'"
                class="folder-wrap-item"
                @click="onFolderClick(fitem)"
              >
                <img
                  class="img object-fit-img position-l;"
                  :src="fitem.imgsrc"
                  :onerror="$defaultImg('')"
                />
                <div class="info-wrap position-r">
                  <p class="name ellipse position-c">
                    {{fitem.name}}
                    <i
                      v-if="cfromCloud && canUpload"
                      class="iconfont iconjiantou1 eicotrigger position-r"
                      @click.stop="oneditclick(fitem)"
                    ></i>
                    <i
                      v-if="menuselection"
                      class="iconfont iconok- position-r"
                      :class="fitem.isAct?'act':''"
                      @click.stop="onSelectionClick(fitem)"
                    ></i>
                  </p>
                </div>
              </div>
              <BankeFileSimple
                v-else
                :cfromCloud="cfromCloud"
                :canEditItem="canUpload || mediaxunlain"
                :fileitem="arrZhiyuan[selindex]"
                :index="selindex"
                :arrZhiyuan="arrZhiyuan"
                :fileInfo="fileInfo"
                :selection="!cfromCloud"
                :cfrom="cfrom"
                @normalclick="onviewfile"
                @editclick="oneditclick"
                @selectionClick="onSelectionClick"
              ></BankeFileSimple>
            </div>
            <BottomLoadmore
              v-if="showLoadtips"
              :showType="Loadtipsobj.showType"
              :loadtext="Loadtipsobj.loadtext"
            />
            <div v-if="filesempty && isload" class="tc emptydesc position-c">{{$mt('未找到到文件')}}</div>
          </div>
        </mt-loadmore>
      </div>
    </div>
    <mt-actionsheet
      :actions="actions"
      v-model="actionShow"
      :cancelText="$mt('取消')"
      ref="Actionsheet"
      id="Actionsheet"
    ></mt-actionsheet>
    <mt-popup
      v-model="popupSrtSelect"
      position="right"
      class="popup-right"
      :modal="false"
      style="background:#f0f0f0"
    >
      <UpsrtFile
        v-if="popupSrtSelect"
        :bankeid="bankeid"
        :peditItemFile="editItemFile"
        :parentid="parentid"
        :banketype="repositoryitemsnb"
        :cfrom="cfrom"
        :repositoryopen="true"
        :upsrttype="upsrttype"
        @upsrtcalce="onUpsrtcalce"
      />
    </mt-popup>

    <mt-popup v-model="myactionsheet" position="bottom" style="height:140px">
      <div data-v-1fca5e37 class="mint-actionsheet" id="Actionsheet" style>
        <ul>
          <li class="mint-actionsheet-listitem" @click="upfileInfo(false)">{{$mt('英文')}}</li>
          <li class="mint-actionsheet-listitem" @click="upfileInfo(true)">{{$mt('中文')}}</li>
        </ul>
        <a class="mint-actionsheet-button" @click="myactionsheet=false">{{$mt('取消')}}</a>
      </div>
    </mt-popup>
  </div>
</template>
<script>
import {
  CollectionFn,
  getZYFileType,
  preview,
  defaultImg,
  getZYFileTypeIcon,
  filterItem,
  sortLikeWin
} from "@/util";
import nativecode from "@/nativecode";
const BankeFileSimple = () => import("@/views/components/BankeFileSimple");
const UpsrtFile = () => import("@/views/bankeZiyuan/upsrt");
import { Indicator, Toast, MessageBox, Actionsheet } from "mint-ui";
import BottomLoadmore from "@/common/bottom-loadmore";
export default {
  props: {
    role: {
      default: 0
    },
    cfromCloud: {
      default: ""
    },
    cfromprogram: {
      default: "cloud"
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
    repositorynewData: {
      default() {
        return {};
      }
    },
    cfromzy: {
      default: false
    }
  },
  data() {
    return {
      popupSrtSelect: false,

      isload: false,
      repositoryitems: [
        {
          id: 4,
          parentid: 0,
          name: this.$mt("公共"),
          icon: "/assets/file_icon/folder.svg",
          items: [],
          upLoadRole: 100
        },
        {
          id: 3,
          parentid: 0,
          name: this.$mt("学校"),
          icon: "/assets/file_icon/folder.svg",
          items: [],
          upLoadRole: 50
        },
        {
          id: 2,
          parentid: 0,
          name: this.$mt("我的"),
          icon: "/assets/file_icon/folder.svg",
          items: [],
          upLoadRole: 10
        }
      ],
      // localarrZhiyuans:[],
      arrZhiyuan: [],
      tempmenuData: [],
      tempScorllTop: [],
      actionShow: false,
      firstmenu: true,
      editItemFile: {},
      cMenuItem: {},
      repositoryitemsnb: 0,

      page: 0,
      pagesize: 10,
      autofill: false,
      topStatus: "",
      bottomStatus: "",

      allLoaded: false,
      loading: false,
      listLoadend: false,

      dlid: null,
      isfirstmenuClick: false,
      uploadbtn: false,
      finttype: null,
      upfileName: "",
      myactionsheet: false,
      lang: "en_us",
      uplang: false,
      mediaxunlain: "",
      doxunlianclick: false,
      upsrttype: "srt"
    };
  },
  computed: {
    menuselection() {
      if (this.cfromzy) {
        return false;
      } else {
        if (!this.cfromCloud) {
          return true;
        }
        return false;
      }
    },
    showprev() {
      if (this.mediaxunlain) {
        if (this.tempmenuData.length > 1) {
          return true;
        }
        return false;
      } else {
        if (this.tempmenuData.length) {
          return true;
        }
        return false;
      }
    },
    filesempty() {
      if (this.arrZhiyuan.length) {
        return false;
      }
      return true;
    },
    menuName() {
      if (this.mediaxunlain) {
        if (this.tempmenuData.length > 1) {
          return this.$mt(this.tempmenuData[this.tempmenuData.length - 1].name);
        }
        return this.$mt("视听语言训练");
      } else {
        if (this.tempmenuData.length) {
          return this.tempmenuData[this.tempmenuData.length - 1].name;
        }
        return this.$mt("资源库");
      }
    },
    showxunliantab() {
      if (
        this.editItemFile.finttype == 2 ||
        this.editItemFile.finttype == 3 ||
        this.editItemFile.finttype == 12 ||
        this.editItemFile.finttype == 13
      ) {
        return 12;
      }
      if (this.editItemFile.finttype == 5) {
        return 10;
      }
      return "";
    },
    actions() {
      let objret = [];
      if (this.doxunlianclick) {
        if (this.mediaxunlain) {
          objret.push({
            name: this.$mt("跟读模仿"),
            method: this.mediaxunlian,
            xunliantype: 12
          });
          objret.push({
            name: this.$mt("语音实践"),
            method: this.mediaxunlian,
            xunliantype: 12
          });
          objret.push({
            name: this.$mt("拓展练习"),
            method: this.mediaxunlian,
            xunliantype: 11
          });

          objret.push({
            name: this.$mt("语音学习"),
            method: this.mediaxunlian,
            xunliantype: 10
          });
          return objret;
        }
      }
      if (this.uploadbtn) {
        objret.push({
          name: this.$mt("上传本地文件"),
          method: this.onUploadLocal
        });
        objret.push({
          name: this.$mt("添加网页链接"),
          method: this.addLink
        });
        objret.push({
          name: this.$mt("新建文件夹"),
          method: this.newFolder
        });
      }
      if (!this.uploadbtn) {
        objret.push({
          name: this.$mt("删除"),
          method: this.deletezy
        });
        objret.push({
          name: this.$mt("移动"),
          method: this.movecuritem
        });
        if (this.editItemFile.ftype == "menu") {
          objret.push({
            name: this.$mt("重命名"),
            method: this.repeatname
          });
        }
        if (
          this.editItemFile.finttype == 2 ||
          this.editItemFile.finttype == 3 ||
          this.editItemFile.finttype == 12 ||
          this.editItemFile.finttype == 13
        ) {
          objret.push({
            name: this.$mt("设置字幕"),
            method: this.setSrt,
            type: "srt"
          });
          objret.push({
            name: this.$mt("设置语系"),
            method: this.setlang
          });
          // if( this.editItemFile.finttype == 2 || this.editItemFile.finttype == 12 ){
          //   objret.push({
          //   name: this.$mt('设置多音轨'),
          //   method: this.setSrt,
          //   type:'mp3',
          // });
          // }
        }
      }

      return objret;
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
    },
    canUpload() {
      let canUpload = true;
      let role = JSON.parse(this.role);
      switch (this.repositoryitemsnb) {
        case 4:
          if (role != 100) {
            canUpload = false;
          }
          break;
        case 3:
          if (role != 50) {
            canUpload = false;
          }
          break;
        default:
      }
      return canUpload;
    },

    showLoadtips() {
      if (
        (!this.allLoaded && this.loading) ||
        (this.allLoaded && this.listLoadend)
      ) {
        return true;
      }
      return false;
    },
    Loadtipsobj() {
      let obj = {};
      obj = {
        showType: "",
        loadtext: "已经加载全部了"
      };
      if (!this.allLoaded && this.loading) {
        obj = {
          showType: "loading",
          loadtext: "加载中"
        };
      }
      return obj;
    },
    upfileInfodata() {
      let obj = {};
      let editItemFile = JSON.parse(JSON.stringify(this.editItemFile));
      let postData = {
        id: editItemFile.id,
        info: editItemFile.info
      };
      if (this.uplang) {
        postData.info.srtlang = this.lang;
      }

      postData.info = JSON.stringify(postData.info);
      obj.tips = "";
      obj.postData = postData;
      return obj;
    },
    curzuoyetype() {
      return this.$store.state.curZuoyeType;
    }
  },
  created() {},
  mounted() {
    this.mediaxunlain = sessionStorage.getItem("mediaxunlain") || ""; //视听语言训练
    if (this.mediaxunlain == "open") {
      this.onsitoryClick(this.repositoryitems[0]);
    }
  },
  watch: {
    repositorynewData: function(newv, olv) {
      this.loadTop();
    },
    actionShow: function(newv, olv) {
      if (!newv) {
        this.uploadbtn = false;
        this.doxunlianclick = false;
      }
    }
  },
  methods: {
    mediaxunlian(v) {
      console.log("xunliantype", v.xunliantype);
      console.log(this.editItemFile);
      if (!this.editItemFile.info.srtpath && this.editItemFile.finttype > 10) {
        Toast(this.$mt("请设置字幕文件"));
        return;
      }
      if (
        this.editItemFile.finttype == 12 ||
        this.editItemFile.finttype == 13 ||
        this.editItemFile.finttype == 2 ||
        this.editItemFile.finttype == 3
      ) {
        if (v.xunliantype == 10) {
          Toast(
            this.$mt("当前文件不支持此功能") + "," + this.$mt("仅支持前三项")
          );
          return;
        }
      }
      if (this.editItemFile.finttype == 5) {
        if (v.xunliantype != 10) {
          Toast(
            this.$mt("当前文件不支持此功能") + "," + this.$mt("仅支持最后一项")
          );
          return;
        }
      }
      this.$emit("mediaxunlian", {
        fitem: this.editItemFile,
        curxunliantp: v.xunliantype,
        headername: v.name
      });
    },
    upfileInfo(t) {
      if (t) {
        this.lang = "zh_cn";
      }
      this.$http
        .post("/api/bankefile/updatefile", this.upfileInfodata.postData)
        .then(res => {
          if (res.data.code == "0") {
            Toast(this.$mt("成功"));
          } else {
            Toast(this.$mt("失败"));
          }
          this.lang = "en_us";
          this.myactionsheet = false;
          this.uplang = false;
        })
        .catch(err => {
          this.lang = "en_us";
          this.myactionsheet = false;
          this.uplang = false;
          Toast(this.$mt("连接服务失败"));
        });
    },
    loadMore() {
      this.loading = true;
      this.loadMoreFile(this.parentid);
    },
    loadTop() {
      this.loadInit();
      this.loadMoreFile(this.parentid);
    },
    loadInit() {
      this.arrZhiyuan = [];
      this.page = 0;
      this.loading = false;
      this.listLoadend = false;
      this.allLoaded = false;
    },
    loadMoreFile(parentid) {
      this.isload = false;
      Indicator.open(this.$mt("加载中"));
      let postData = {
        page: this.page,
        pagesize: this.pagesize,
        parentid: parentid,
        banketype: this.repositoryitemsnb
      };
      if (this.finttype != null) {
        postData.finttype = this.finttype;
      }
      if (this.cfromzy) {
        if (this.curzuoyetype == "10") {
          postData.finttype = [5, 101];
        } else if (this.curzuoyetype == "11" || this.curzuoyetype == "12") {
          postData.finttype = [12, 13, 101];
        } else if (this.curzuoyetype == "2") {
          postData.finttype = [6, 101];
        }
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
              this.arrZhiyuan = [...this.arrZhiyuan, ...res.data.data.files];
            }
          }
          this.isload = true;
          Indicator.close();
          this.$refs.loadmore.onTopLoaded();
        })
        .catch(err => {
          this.$refs.loadmore.onTopLoaded();
          this.isload = true;
          Indicator.close();
        });
    },
    onsitoryClick(v) {
      this.arrZhiyuan = [];
      this.tempmenuData = [];
      this.tempScorllTop = [];
      this.repositoryitemsnb = v.id;
      this.firstmenu = false;
      this.onFolderClick(v, false);
    },
    onFolderClick(fitem, type = true) {
      if (!type) {
        this.isfirstmenuClick = true;
      }
      let listcontainer = this.$refs.listcontainer;
      let prevTop = listcontainer.scrollTop;
      this.tempScorllTop.push(prevTop);
      let localarrZhiyuan = this.arrZhiyuan;
      localarrZhiyuan = JSON.parse(JSON.stringify(localarrZhiyuan));
      this.cMenuItem = fitem;
      this.tempmenuData.push({
        cfrom: true,
        id: type ? fitem.id : fitem.parentid,
        curRootPrevid: fitem.parentid,
        curRootPrevname: this.menuName,
        name: fitem.name,
        page: this.page,
        allLoaded: this.allLoaded,
        loading: this.loading,
        listLoadend: this.listLoadend,
        datas: localarrZhiyuan
      });
      this.loading = true;
      this.loadTop(this.parentid);
    },
    onPrev() {
      if (this.tempmenuData[this.tempmenuData.length - 1].id == 0) {
        this.arrZhiyuan = [];
        this.firstmenu = true;
      } else {
        this.arrZhiyuan = this.tempmenuData[this.tempmenuData.length - 1].datas;
        for (let v of this.arrZhiyuan) {
          v.isAct = false;
        }
      }
      this.onprevInitData();
    },
    onSelectionClick(fileitem) {
      if (this.cfromzy) {
        if (fileitem.isAct) return;
        for (let v of this.arrZhiyuan) {
          v.isAct = false;
        }
        fileitem.isAct = true;
      } else {
        fileitem.isAct = !fileitem.isAct;
      }
      // fileitem.isAct = !fileitem.isAct;
    },
    submit() {
      if (this.cfromzy) {
        this.zuoyeuopload();
      } else {
        Indicator.open(this.$mt("上传中"));
        let copyfileitems = [];
        let postData = {
          bankeid: this.bankeid,
          parentid: this.repositorycopyid,
          srcids: [],
          banketype: 1
        };
        for (let v of this.arrZhiyuan) {
          if (v.isAct) {
            postData.srcids.push(v.id);
            copyfileitems.push(v);
          }
        }
        this.$http
          .post("/api/bankefile/copyfile", postData)
          .then(res => {
            if (res.data.code == "0") {
              this.$emit("copyfile", copyfileitems);
            } else {
              Toast(this.$mt("上传失败"));
            }
            Indicator.close();
          })
          .catch(err => {
            Toast(this.$mt("服务出错") + "," + this.$mt("稍后再试"));
            Indicator.close();
          });
      }
    },
    zuoyeuopload() {
      let copyfileitems = [];
      for (let v of this.arrZhiyuan) {
        if (v.isAct) {
          copyfileitems.push(v);
        }
      }
      console.log(copyfileitems);
      sessionStorage.setItem("xunlianzyfile", JSON.stringify(copyfileitems));
      this.$back();
    },
    oneditclick(v) {
      console.log("编辑", v);
      this.editItemFile = v;
      this.dlid = v.id;
      this.actionShow = true;
    },
    deletezy() {
      this.$confirm({
        msg: "您确定要删除吗",
        docb: () => {
          this.$http
            .get("/api/Bankefile/delete?id=" + this.dlid, {})
            .then(res => {
              if (res.data.code == 0) {
                this.$alert({
                  msg: "删除成功",
                  cb: () => {
                    this.arrZhiyuan = this.arrZhiyuan.filter(v => {
                      return v.id != this.dlid;
                    });
                  }
                });
              } else {
                this.$alert(
                  {
                    msg: res.data.msg
                  },
                  false
                );
              }
              console.log(res);
            })
            .catch(() => {});
        }
      });
    },
    //下载资源
    onviewfile(fileitem) {
      this.editItemFile = fileitem;
      if (this.mediaxunlain && this.showxunliantab) {
        this.doxunlianclick = true;
        this.dlid = fileitem.id;
        this.actionShow = true;
      } else {
        this.$emit("reponviewfile", fileitem);
        return;
        if (fileitem.ftype == "file") {
          nativecode.fileviewSingle(this, fileitem.info);
        } else if (fileitem.ftype == "link") {
          nativecode.fileviewUrl(this, fileitem);
        }
      }
    },
    onaddFile() {
      this.uploadbtn = true;
      this.actionShow = true;
    },
    onUploadLocal() {
      this.$emit("uploadfile", {
        banketype: this.repositoryitemsnb,
        parentid: this.parentid,
        parentname: this.menuName,
        tempmenuData: this.tempmenuData
      });
    },
    newFolder() {
      this.$emit("newmenu", {
        banketype: this.repositoryitemsnb,
        parentid: this.parentid,
        parentname: this.menuName,
        tempmenuData: []
      });
    },
    setSrt(v) {
      this.upsrttype = v.type;
      this.actionShow = false;
      this.popupSrtSelect = true;
    },
    setlang() {
      console.log(this.editItemFile);
      this.uplang = true;
      this.myactionsheet = true;
    },
    onUpsrtcalce() {
      this.popupSrtSelect = false;
    },
    repeatname() {
      this.$prompt({
        msg: "请输入文件名",
        docb: value => {
          if (!value) {
            Toast(this.$mt("不能为空"));
            return;
          }
          this.upfileName = value;
          this.updateItem();
        }
      });
    },
    updateItem() {
      let editItemFile = this.editItemFile;
      let tips = this.$mt("修改中") + "...";
      let postData = {
        id: editItemFile.id,
        name: this.upfileName
      };
      Indicator.open(tips);
      this.$http
        .post("/api/bankefile/updatefile", postData)
        .then(res => {
          if (res.data.code == "0") {
            this.editItemFile.name = this.upfileName;
          } else {
            Toast(this.$mt("失败"));
          }
          this.upfileName = "";
          Indicator.close();
        })
        .catch(err => {
          Toast(this.$mt("连接服务失败"));
          Indicator.close();
          this.upfileName = "";
        });
    },
    movecuritem() {
      this.$emit("moveitem", {
        banketype: this.repositoryitemsnb,
        parentid: this.parentid,
        parentname: this.menuName,
        tempmenuData: this.tempmenuData,
        editItemFile: this.editItemFile
      });
    },
    addLink() {
      this.$emit("addlinkitem", {
        banketype: this.repositoryitemsnb,
        parentid: this.parentid,
        parentname: this.menuName,
        tempmenuData: this.tempmenuData
      });
    },
    canlce() {
      this.$emit("Cancel", true);
      // if (this.firstmenu) {
      //   this.$emit("Cancel", true);
      // } else {
      //   this.firstmenu = true;
      // }
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
      this.$nextTick(() => {
        listcontainer.scrollTop = this.tempScorllTop[
          this.tempScorllTop.length - 1
        ];
        this.tempmenuData.splice(this.tempmenuData.length - 1, 1);
        this.tempScorllTop.splice(this.tempScorllTop.length - 1, 1);
      });
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
    },
    back() {
      this.$back();
      sessionStorage.removeItem("mediaxunlain");
    }
  },
  components: {
    BankeFileSimple,
    UpsrtFile,
    [Actionsheet.name]: Actionsheet,
    BottomLoadmore
  }
};
</script>
<style scoped lang="less">
.repository-wrap {
  .main {
    &.cfromCloud {
      margin-top: 5px;
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
    .listcontainer {
      position: relative;
      height: calc(100vh - 55px);
      .wrap {
        min-height: calc(100vh - 55px);
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
            height: 100%;
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
      &.haspre {
        height: calc(100vh - 113px);
        .wrap {
          min-height: calc(100vh - 113px);
        }
      }
    }
    .listcontainer.cfromCloud {
      .wrap {
      }
    }
    .repository-items-wrap {
      padding: 0 10px;
      background: #fff;
      .item {
        border-bottom: 1px solid #f0f0f0;
        img {
          width: 60px;
          height: 60px;
        }
        span.name {
          padding-left: 20px;
        }
      }
    }
  }
  .popupsrt-wrap {
    background: #fff;
    width: 100%;
    height: 102px;
    ul {
      width: 100%;
      li {
        padding: 13px 0;
        text-align: center;
        border-bottom: 1px solid #e0e0e0;
      }
    }
  }
}
</style>
