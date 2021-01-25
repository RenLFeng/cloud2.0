<template>
  <div class="url-wrap fontsmall zhiyan-wrap">
    <mt-header :title="menuName?menuName:bankename" class="mint-header-f">
      <mt-button v-if="hasbackbtn" icon="back" slot="left" @click="backHome">{{$mt('返回')}}</mt-button>
      <mt-button slot="right" class="iconfont iconpaixu icons fontlarge24" @click.native="onSort"></mt-button>
      <mt-button
        v-if="showaddFile"
        slot="right"
        class="iconfont iconiconfontadd icons fontlarge24"
        @click.native="onaddFile"
      ></mt-button>
      <mt-button
        v-if="selectxunlianfile && hasselection "
        slot="right"
        @click.native="onxunlianfile"
      >{{$mt('确定')}}</mt-button>
    </mt-header>
    <Vanbr :tabBar="labels" width="25" @selectClick="onselectClick" v-if="!cfrom" />
    <!-- <div class="van-navbr-wrap" v-if="!cfrom" :class="$i18n.locale!='zh'?'nozh':''">
      <ul class="overflow-scroll">
        <li
          class="ellipse"
          v-for="(v,i) in labels"
          :key="i"
          :class="v.isActive?'active':''"
          ref="tbLi"
        >
          <span class="lable font18 nowrap" @click="selectClick($event,v,i)">{{$mt(v.label)}}</span>
        </li>
        <span class="move-bar" ref="movebar" :style="`left:${moveBar}px`"></span>
      </ul>
    </div>-->

    <p class="Prev-btn" v-if="tempmenuData.length" @click="onPrev">
      <i class="iconfont iconwithdraw-fill colord position-l"></i>
      <span style="color:#a5a5a5">{{$mt('返回上一层')}}...</span>
    </p>
    <div class="items-container" :class="showupload?'showupload':''">
      <!-- <p v-if="arrZhiyuan.length" class="Resources-total fonttiny">资源总数:{{filetotal}}</p> -->
      <mt-tab-container v-model="selected">
        <mt-tab-container-item
          id="1"
          :class="{'listcontainer-wrap':true,'cfrom':cfrom,'showupload':showupload,'onPrev':tempmenuData.length}"
        >
          <!-- 
             :bottom-method="loadMore"
              @bottom-status-change="handleBottomChange"
              :bottom-all-loaded="allLoaded"
              bottomPullText
          bottomDropText="上拉加载更多"-->

          <div
            ref="listcontainer"
            class="listcontainer scrollingtouch"
            v-infinite-scroll="loadMore2"
            infinite-scroll-disabled="loading"
            infinite-scroll-distance="10"
            infinite-scroll-immediate-check="false"
          >
            <mt-loadmore
              :top-method="loadTop2"
              @top-status-change="handleTopChange"
              :top-distance="80"
              ref="loadmore"
              :auto-fill="autofill"
              :class="filesempty?'filesempty':''"
              :topPullText="$mt('下拉刷新')"
              :topDropText="$mt('释放更新')"
              :topLoadingText="$mt('加载中')"
            >
              <div class="scontent-wrap wrap" :class="prevStyle?'prev':''" v-if="!repositoryopen">
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
                      <p class="name ellipse position-t">
                        {{fitem.name}}
                        <i
                          v-if="!isxunlianOption"
                          class="iconfont iconjiantou1 eicotrigger colord position-r"
                          @click.stop="oneditclick(fitem)"
                        ></i>
                      </p>
                      <p class="time font-xxs colora5 position-b">
                        {{fitem.createtime}}&nbsp;{{$mt('更新')}}
                        <span class="fr">{{$mt('文件夹')}}</span>
                      </p>
                    </div>
                  </div>
                  <BankeFileSimple
                    v-else
                    :fileitem="arrZhiyuan[selindex]"
                    :index="selindex"
                    :arrZhiyuan="arrZhiyuan"
                    :fileInfo="fileInfo"
                    :selection="selection"
                    :cfrom="cfrom"
                    :curxunliantp="curxunliantp"
                    @editclick="oneditclick"
                    @normalclick="onviewfile"
                    @selectionClick="onSelectionClick"
                    @gotoxunlain="ongotoxunlain"
                  ></BankeFileSimple>
                </div>
                <BottomLoadmore
                  v-if="showLoadtips"
                  :showType="Loadtipsobj.showType"
                  :loadtext="Loadtipsobj.loadtext"
                />
              </div>
              <div
                v-if="filesempty && !cfromCloud"
                class="tc emptydesc position-c"
              >{{$mt(liststatedesc)}}</div>
            </mt-loadmore>
          </div>
        </mt-tab-container-item>
        <mt-tab-container-item id="3" class="tc">{{$mt('尽请期待')}}</mt-tab-container-item>
        <mt-popup
          v-model="popupUploadLink"
          position="right"
          class="popup-right"
          :modal="false"
          style="background:#f0f0f0"
        >
          <URL
            :bankeid="curBankeid"
            @addLinkState="onAddLinkState"
            @reupsuccess="onreupsuccess"
            :cfrom="cfrom"
            :parentTempmenuData="curtempmenuData"
            :curRootPrevid="curRootPrevid"
            :parentid="parentid"
            :headerName="menuHeaderName"
            :repositoryopen="repositoryopen"
            :Repositoryclickdata="onRepositoryclickdata"
          />
        </mt-popup>
      </mt-tab-container>
    </div>
    <input
      ref="uploadfilebtn"
      type="file"
      name="file"
      multiple
      class="upload__input"
      @change="uploadChange"
      style="display:none"
    />
    <mt-popup
      v-model="popupEditInfo"
      position="right"
      class="popup-right info-popup"
      :modal="false"
    >
      <mt-header :title="editItemFile.name">
        <mt-button slot="left" icon="back" @click="goBack()">{{$mt('返回')}}</mt-button>
      </mt-header>
      <BankeFileSimple :fileitem="editItemFile" :seeState="0"></BankeFileSimple>
      <div class="info-list-main" v-if="popupEditInfo">
        <div class="tit-table">
          <p class="clearfix tc">
            <span :class="!seeState?'act fl':'fl'" @click="see(0,editItemFile.noviewnum)">
              {{$mt('未查看')}}({{editItemFile.noviewnum}}
              <a
                class="ast"
                :class="{'nozh':nozhlang}"
              >{{$mt('人')}}</a>)
            </span>
            <span :class="seeState?'act fr':'fr'" @click="see(1,fileviewsnum)">
              {{$mt('已查看')}}({{fileviewsnum}}
              <a class="ast" :class="{'nozh':nozhlang}">{{$mt('人')}}</a>)
            </span>
          </p>
        </div>
        <ul class="list-content overflow-scroll">
          <li v-for="(item,index) in UserList" :key="index" class="clearfix">
            <span class="name ellipse position-l">
              <span class="user ellipse">{{item.name}}</span>
              <span
                v-if="showplaynum"
                class="viewnum ellipse"
              >{{$mt('播放次数')}}{{item.viewnum?item.viewnum:0}}</span>
            </span>
            <span class="score-wrap position-r tr">
              <span v-if="item.score" class="score fr">{{$mt('得分')}}&nbsp;{{item.score}}</span>
              <span v-else class="score fr">{{$mt('未查看')}}</span>
              <span class="time fonttiny colora">{{item.countdate}}</span>
            </span>
          </li>
        </ul>
      </div>
    </mt-popup>
    <!-- <mt-popup v-model="popupAudio" position="right" class="popup-right info-popup" :modal="false">
      <Audio :audioInfo="viewfileItem.info" @Backs="goBack" v-if="popupAudio" />
    </mt-popup>-->
    <mt-popup
      v-model="popupSuperLink"
      position="right"
      class="popup-right"
      :modal="false"
      style="background:#f0f0f0"
    >
      <AddSuperLink v-if="popupSuperLink" :bankeid="curBankeid" @watchBack="onWatchBack" />
    </mt-popup>
    <mt-popup
      v-model="popupUploadFile"
      position="right"
      class="popup-right"
      :modal="false"
      style="background:#f0f0f0"
    >
      <UpLoadFile
        v-if="popupUploadFile"
        :repositoryopen="repositoryopen"
        :Repositoryclickdata="onRepositoryclickdata"
        :cfrom="cfrom"
        :bankeid="curBankeid"
        :tempUploadFile="tempUploadFile"
        :parentid="parentid"
        :parentTempmenuData="curtempmenuData"
        :curRootPrevid="curRootPrevid"
        :headerName="menuHeaderName"
        :banketype="banketype"
        @reupsuccess="onreupsuccess"
        @adduploadfile="onUploadLocal"
        @canlce="UpFileCanlce"
      />
    </mt-popup>
    <mt-popup
      v-model="popupmulu"
      position="right"
      class="popup-right"
      :modal="false"
      style="background:#f0f0f0"
    >
      <Menu
        :repositoryopen="repositoryopen"
        :Repositoryclickdata="onRepositoryclickdata"
        :bankeid="curBankeid"
        :cfrom="cfrom"
        :moveItemFile="repositoryopen?onRepositoryclickdata.editItemFile:editItemFile"
        :parentTempmenuData="curtempmenuData"
        v-if="popupmulu"
        :parentid="parentid"
        :headerName="menuHeaderName"
        @Cancel="onCancel"
        @menuSelectEnd="onMenuSelectEnd"
      />
    </mt-popup>
    <mt-popup
      v-model="repositoryopen"
      :position="!cfromCloud?'right':''"
      :class="!cfromCloud?'popup-right':''"
      :modal="false"
      :style="!cfromCloud?'background:#f0f0f0':cfromCloudstyle"
    >
      <Repository
        :role="!role?curRole:role"
        :cfromCloud="cfromCloud"
        :cfromprogram="cfromprogram"
        :bankeid="cfrom?courseid:bankeCourseid"
        :cfrom="cfrom"
        :repositorynewData="repositorynewData"
        v-if="repositoryopen"
        :cfromparentid="parentid"
        :repositorycopyid="repositorycopyid"
        :isUpSrtfile="isUpSrtfile"
        :cfromzy="cfromzy"
        @Cancel="goBack()"
        @uploadfile="onUploadLocal"
        @newmenu="newFolder"
        @addlinkitem="onUploadLink"
        @moveitem="movecuritem"
        @copyfile="oncopyfile"
        @mediaxunlian="onMediaxunlian"
        @reponviewfile="onreponviewfile"
      />
    </mt-popup>
    <mt-actionsheet
      :actions="actions"
      :cancelText="$mt('取消')"
      v-model="actionShow"
      ref="Actionsheet"
      id="Actionsheet"
    ></mt-actionsheet>
    <mt-popup v-model="popupSort" position="bottom" style="height:140px">
      <div data-v-1fca5e37 class="mint-actionsheet" id="Actionsheet" style>
        <ul class="mint-actionsheet-list" style="margin-bottom: 5px;" v-if="!uplang">
          <li
            class="mint-actionsheet-listitem"
            :style="`color:${sortFile?'#0089ff':''}`"
            @click="sortfileFn(arrZhiyuan)"
          >{{$mt('按文件名称排序')}}</li>
          <li
            class="mint-actionsheet-listitem"
            :style="`color:${sortTime?'#0089ff':''}`"
            @click="sorttimeFn(arrZhiyuan)"
          >{{$mt('按时间倒序排序')}}</li>
        </ul>
        <ul v-if="uplang">
          <li class="mint-actionsheet-listitem" @click="upfileInfo(false)">{{$mt('英文')}}</li>
          <li class="mint-actionsheet-listitem" @click="upfileInfo(true)">{{$mt('中文')}}</li>
        </ul>
        <a class="mint-actionsheet-button" @click="popupSort=false">{{$mt('取消')}}</a>
      </div>
    </mt-popup>
    <mt-popup
      v-model="popupSrtSelect"
      position="right"
      class="popup-right"
      :modal="false"
      style="background:#f0f0f0"
    >
      <UpsrtFilePage
        v-if="popupSrtSelect"
        :bankeid="curBankeid"
        :peditItemFile="editItemFile"
        :parentid="parentid"
        :banketype="banketype"
        :cfromCloud="true"
        :cfrom="cfrom"
        :upsrttype="upsrttype"
        @upsrtcalce="onUpsrtcalce"
      />
    </mt-popup>
  </div>
</template>

<script>
const _URL = window.URL || window.webkitURL;
import Vue from "vue";
import { fixCaptureImage, parseURL } from "../util";
import BottomLoadmore from "@/common/bottom-loadmore";
import {
  Indicator,
  Toast,
  MessageBox,
  TabContainer,
  TabContainerItem,
  Actionsheet,
  Tabbar,
  TabItem
} from "mint-ui";

import BankeFileSimple from "./components/BankeFileSimple";
const Menu = () => import("@/views/bankeZiyuan/menu");
const Repository = () => import("@/views/bankeZiyuan/repository");
import URL from "./bankeZiyuan/url";
import UpLoadFile from "./bankeZiyuan/upLoadFile";
import AddSuperLink from "./bankeZiyuan/addSuperLink";
import commontools from "../commontools";
import { constants } from "crypto";
import { mapState, mapMutations } from "vuex";
import Audio from "../common/audio";
import Vanbr from "@/common/van-navbr";
import {
  CollectionFn,
  getZYFileType,
  preview,
  defaultImg,
  getZYFileTypeIcon,
  filterItem,
  sortLikeWin
} from "@/util";
import nativecode from "../nativecode";
const UpsrtFilePage = () => import("@/views/bankeZiyuan/upsrt");
export default {
  name: "BankeZiyuan",
  props: {
    role: {
      default: 0
    },
    bankeid: {
      default: 0
    },
    hasbackbtn: {
      default: true
    },
    bankename: {
      default: ""
    },
    courseid: {
      default: 0
    },
    cfromCloud: {
      default: ""
    },
    cfromprogram: {
      default: "cloud"
    },
    cfrom: {
      default: false
    },
    Refresh: {
      default: false
    },
    allBankes: {
      default() {
        return [];
      }
    },
    cfromzy: {
      default: false
    },
    selectxunlianfile: {
      default: 0
    }
  },
  data() {
    return {
      curbanke: {},
      selected: "1",
      files: [],
      liststatedesc: "加载中",
      list: ["11", "22"],
      loadingState: false,
      popupUploadLink: false,

      popupZiyuanEdit: false,
      popupEditInfo: false,

      UserList: [],
      noViewUserList: [],

      topid: "",
      loadMorePosition: "bottom",
      editItemFile: {
        url: ""
      },

      seeState: 0,

      actionShow: false,

      filetotal: 0,

      popupAudio: false,
      viewfileItem: {},

      headerName: "",
      rootid: 0,
      headerAddBtn: false,
      headerSortBtn: false,
      popupSuperLink: false,
      popupUploadFile: false,
      tempUploadFile: [],
      tempUploadImg: [],
      newFileName: "",

      selection: false,
      selectnmb: 0,
      dlid: null,

      page: 0,
      pagesize: 10,
      autofill: false,
      topStatus: "",
      bottomStatus: "",

      allLoaded: false,
      loading: false,
      listLoadend: false,

      popupmulu: false,
      mypageState: 0,
      bankeCourseid: 0,

      cMenuItem: {},
      tempmenuData: [],
      sortFile: false,
      sortTime: false,
      showJiaoAn: true,
      menuSelectEndData: null,
      tempScorllTop: [],

      moveId: null,

      popupSort: false,
      // changParentid: false,
      curcfromBanke: {},
      showallbankes: false,
      fileviewsnum: 0,

      repositoryopen: false,
      onRepositoryclickdata: null,
      repositorynewData: null,
      cfromCloudstyle: {
        top: 0,
        left: 0,
        transform: "none",
        height: "300px",
        background: "#f0f0f0"
      },
      popupSrtSelect: false,
      srtFiles: [],
      srtEditfile: {},
      isUpSrtfile: false,
      lang: "en_us",
      uplang: false,
      finttype: null,

      upsrtfilePreState: {},
      upfileName: "",
      xunlainfilterfiles: [],
      labels: [
        {
          id: 1000,
          label: "课程资源",
          isActive: true
        },
        {
          id: 12,
          label: "配音训练",
          isActive: false
        },
        {
          id: 11,
          label: "听写训练",
          isActive: false
        },
        {
          id: 10,
          label: "发音训练",
          isActive: false
        }
      ],
      moveBar: 19,
      mediaviewnum: 0,
      upsrttype: "srt",
      copyarrZhiyuan: [],
      glvideofiles: [],
      glsrtfiles: [],
      curslangfid: 0
    };
  },
  watch: {
    selected() {
      this.$emit("UploadLinkSelectEd", this.selected);
    },
    actionShow(v, o) {
      if (!v) {
        this.headerAddBtn = false;
        this.headerSortBtn = false;
      }
    },
    popupSrtSelect(v, ol) {
      if (!v) {
        this.srtFiles = [];
        this.pagesize = 10;
      }
    }
  },
  computed: {
    showplaynum() {
      if (this.editItemFile.url.includes("mp4")) {
        return true;
      }
      return false;
    },
    hasselection() {
      if (this.selection) {
        for (let v of this.arrZhiyuan) {
          if (v.isAct) {
            return true;
          }
        }
        return false;
      } else {
        return false;
      }
    },
    curxunliantp() {
      for (let v of this.labels) {
        if (v.isActive) {
          return v.id;
        }
      }
    },
    isxunlianOption() {
      if (this.curxunliantp == 1000) {
        return false;
      }
      return true;
    },
    curBankeid() {
      if (this.cfrom) {
        return this.courseid;
      }
      return this.bankeid;
    },
    curtempmenuData() {
      if (this.repositoryopen && this.onRepositoryclickdata != null) {
        return this.onRepositoryclickdata.tempmenuData;
      } else {
        return this.tempmenuData;
      }
    },
    showasort() {},
    showaddFile() {
      if (this.showupload || this.cfrom) {
        return true;
      }
      return false;
    },
    isteacher() {
      let isteacher = this.$store.getters.caneditbanke;
      return isteacher;
    },
    nozhlang() {
      let curlang = this.$i18n.locale;
      if (curlang != "zh") {
        return true;
      }
      return false;
    },
    actions() {
      let objret = [];
      if (this.showupload || this.cfrom) {
        if (this.headerAddBtn) {
          objret.push({
            name: this.$mt("从资源库上传"),
            method: this.repository
          });
          objret.push({
            name: this.$mt("上传本地文件"),
            method: this.onUploadLocal
          });
          if (!this.popupSrtSelect) {
            objret.push({
              name: this.$mt("添加网页链接"),
              method: this.addLink
            });
            // objret.push({
            //   name: "添加精选网站",
            //   method: this.superLink
            // });
            objret.push({
              name: this.$mt("新建文件夹"),
              method: this.newFolder
            });
          }
        }
        if (!this.headerSortBtn && !this.headerAddBtn) {
          objret.push({
            name: this.$mt("删除"),
            method: this.deletezy
          });
          if (this.editItemFile.ftype == "menu") {
            objret.push({
              name: this.$mt("重命名"),
              method: this.repeatname
            });
          }
          objret.push({
            name: this.$mt("移动"),
            method: this.movecuritem
          });
          if (
            this.editItemFile.finttype == 2 ||
            this.editItemFile.finttype == 3 ||
            this.editItemFile.finttype == 12 ||
            this.editItemFile.finttype == 13
          ) {
            objret.push({
              name: this.$mt("设置字幕"),
              method: this.srtSelect,
              type: "srt"
            });
            objret.push({
              name: this.$mt("设置语系"),
              method: this.showsetlang
            });
            // if ( this.editItemFile.finttype == 2 || this.editItemFile.finttype == 12) {
            //   objret.push({
            //     name: this.$mt('设置多音轨'),
            //     method: this.srtSelect,
            //     type: "mp3"
            //   });
            // }
          }
          if (this.editItemFile.finttype == 5) {
            objret.push({
              name: this.$mt("设置语系"),
              method: this.showsetlang
            });
          }
        }
      }
      if (!this.headerSortBtn && !this.headerAddBtn) {
        objret.push({
          name: this.$mt("收藏"),
          method: this.Collection
        });
        if (!this.cfrom && this.editItemFile.ftype != "menu") {
          objret.push({
            name: this.$mt("查看情况"),
            method: this.showInfo
          });
        }
      }
      return objret;
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
    showupload() {
      if (nativecode.platform == "exsoftdaping") {
        return true;
      }
      if (this.$store.getters.caneditbanke) {
        return true;
      }
      return false;
    },
    filesempty() {
      if (this.files.length) {
        return false;
      } else {
        if (this.arrZhiyuan.length) {
          return false;
        } else {
          return true;
        }
      }
    },
    arrZhiyuan() {
      if (!this.isxunlianOption) {
        return this.$store.state.arrZhiyuan;
      }
      return this.xunlainfilterfiles;
    },
    miniprogram() {
      if (nativecode.platform == "miniprogram") {
        return true;
      }
      return false;
    },

    menuName() {
      if (this.tempmenuData.length) {
        return this.tempmenuData[this.tempmenuData.length - 1].name;
      }
      return this.bankename;
    },
    menuHeaderName() {
      if (this.repositoryopen && this.onRepositoryclickdata != null) {
        return this.onRepositoryclickdata.parentname;
      } else {
        if (this.menuName) {
          return this.menuName;
        } else {
          return this.bankename;
        }
      }
    },
    parentid() {
      if (this.repositoryopen && this.onRepositoryclickdata != null) {
        return this.onRepositoryclickdata.parentid;
      } else {
        if (this.tempmenuData.length) {
          return this.tempmenuData[this.tempmenuData.length - 1].id;
        }
        return 0;
      }
    },
    repositorycopyid() {
      if (this.tempmenuData.length) {
        return this.tempmenuData[this.tempmenuData.length - 1].id;
      }
      return 0;
    },
    prevStyle() {
      if (this.allLoaded && this.listLoadend && this.tempmenuData.length) {
        return true;
      }
      return false;
    },
    curRootPrevid() {
      if (this.tempmenuData.length) {
        return this.tempmenuData[this.tempmenuData.length - 1].curRootPrevid;
      }
      return null;
    },
    user() {
      return this.$store.getters.curuser;
    },
    curRole() {
      return this.user.role;
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
    cansetsrt() {
      for (let v of this.srtFiles) {
        if (v.isAct) {
          return false;
        }
      }
      return true;
    },
    banketype() {
      if (this.cfrom) {
        return 1;
      }
      if (this.repositoryitemsnb) {
        return this.repositoryitemsnb;
      }
      return 0;
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
    isVideoFile() {
      if (this.editItemFile.finttype == 2 || this.editItemFile.finttype == 12) {
        return true;
      }
      return false;
    }
    // ...mapState(["arrZhiyuan"])
  },
  created() {
    if (this.selectxunlianfile) {
      this.selection = true;
      switch (this.selectxunlianfile) {
        case "10":
          this.finttype = [5, 101];
          break;
        case "11":
          this.finttype = [12, 13, 101];
          break;
        case "12":
          this.finttype = [12, 13, 101];
          break;
        default:
          this.finttype = null;
      }
    }
    if (this.cfromCloud || this.cfromzy) {
      this.repositoryopen = true;
    }
    if (this.cfrom) {
      sessionStorage.setItem("cfrom", this.cfrom);
    }
    this.$store.commit("SET_ZHIYUANS", {
      item: [],
      type: 3
    });
    let curbanke = sessionStorage.getItem("curbanke");
    if (curbanke) {
      this.curbanke = JSON.parse(curbanke);
      this.bankeCourseid = this.curbanke.courseid;
    }
    this.loadMoreFile(this.parentid);
    // this.loadMore(this.parentid);
    if (this.cfrom) {
      // this.curcfromBanke = JSON.parse(JSON.stringify(this.allBankes[0]));
    }
  },
  mounted() {},

  components: {
    BankeFileSimple,
    URL,
    Audio,
    AddSuperLink,
    UpLoadFile,
    BottomLoadmore,
    Menu,
    Repository,
    [TabContainer.name]: TabContainer,
    [TabContainerItem.name]: TabContainerItem,
    [Actionsheet.name]: Actionsheet,
    [TabItem.name]: TabItem,
    [Tabbar.name]: Tabbar,
    UpsrtFilePage,
    Vanbr
  },
  methods: {
    selectClick(e, v, i) {
      if (v.isActive) return;
      let curel = this.$refs.tbLi[i];
      let targetwidth = e.target.offsetWidth;
      let moveBar = (52 - targetwidth) / 2;
      this.moveBar = e.target.offsetLeft - moveBar;
      for (let v of this.labels) {
        v.isActive = false;
      }
      this.labels[i].isActive = true;
      this.fiterxunlianfile(this.curxunliantp);
    },
    onselectClick(id) {
      this.fiterxunlianfile(this.curxunliantp);
    },
    fiterxunlianfile(type) {
      let filtertp = [];
      switch (type) {
        case 10:
          filtertp = [5, 101];
          break;
        case 11:
          filtertp = [12, 13, 101];
          break;
        case 12:
          filtertp = [12, 13, 101];
          break;
        default:
          filtertp = [];
      }
      let tempfile = [];
      if (filtertp.length) {
        let arrzhiyuan = this.$store.state.arrZhiyuan;
        console.log("打卡机", arrzhiyuan);
        Object.keys(filtertp).map(key => {
          tempfile = [
            ...arrzhiyuan.filter(item => {
              return item.finttype == filtertp[key];
            }),
            ...tempfile
          ];
          // tempfile = [
          //   ...this.copyarrZhiyuan.filter(item => {
          //     return item.finttype == filtertp[key];
          //   }),
          //   ...tempfile
          // ];
        });
        this.xunlainfilterfiles = tempfile;
      }
    },
    ongotoxunlain(fitem) {
      console.log("凡是加快", fitem);
      if (this.curxunliantp != 10) {
        if (!fitem.info.srtpath) {
          Toast(this.$mt("未关联字幕"));
          return;
        }
      }
      this.toxunlianpage(fitem, this.curxunliantp);
    },
    onMediaxunlian(v) {
      let fitem = v.fitem;
      let curxunliantp = v.curxunliantp;
      let headername = v.headername;
      console.log("fsfs", v);
      this.toxunlianpage(fitem, curxunliantp, headername);
    },
    toxunlianpage(fitem, xunliantp, name = "") {
      let cookie = this.$store.state.loginuser.cookie;
      console.log(fitem);
      // let cookie = nativecode.getcookie();
      let topage = this.topage(xunliantp);
      let srturl = "";
      let videourl = "";
      let aboutid = fitem.id;
      let abouttype = 1;
      let userid = this.user.id;
      let headername = name;
      let recsave = "recsave";
      let lang = this.lang;
      if (fitem.info) {
        if (fitem.info.srtlang) {
          lang = fitem.info.srtlang;
        }
      }
      if (this.curslangfid == fitem.id) {
        lang = this.lang;
      }
      let flang = this.$i18n.locale ? this.$i18n.locale : "zh";
      if (xunliantp == 10) {
        srturl = fitem.info.filepath;
      } else {
        srturl = fitem.info.srtpath;
        videourl = fitem.info.filepath;
      }
      srturl = encodeURIComponent(srturl);
      videourl = encodeURIComponent(videourl);
      let URLdata =
        "do" +
        topage +
        ".html?videourl=" +
        videourl +
        "&cookie=" +
        cookie +
        "&srturl=" +
        srturl +
        "&aboutid=" +
        aboutid +
        "&abouttype=" +
        abouttype +
        "&userid=" +
        userid +
        "&flang=" +
        flang +
        "&lang=" +
        lang +
        "&recsave=" +
        recsave +
        "&readonly=false&backaction=history";
      if (headername) {
        headername = encodeURIComponent(headername);
        URLdata += "&headername=" + headername;
      }
      let url = `http://192.168.1.104:8080/${URLdata}`;
      if (process.env.NODE_ENV !== "development") {
        url = document.location.origin;
        url += `/xunlian/${URLdata}`;
      }
      console.log(parseURL(url));
      console.log(url);
      this.curslangfid = 0;
      // this.loadTop();
      window.location.href = url;
    },
    topage(type) {
      switch (type) {
        case 11:
          return "tingxie";
        case 2:
          return "kouyu";
        case 12:
          return "peiying";
        case 10:
          return "faying";
      }
    },
    queryxunlianfile() {
      this.$http
        .post("/api/xunlian/info", {
          where: {
            aboutid: {
              in: [1]
            },
            abouttype: 0,
            xunliantype: 10,
            userid: {
              in: [1, 2]
            }
          }
        })
        .then(res => {})
        .catch(err => {});
    },
    //选择
    selects() {
      this.selection = true;
    },
    //全选
    selectAll() {
      let temp = JSON.parse(JSON.stringify(this.arrZhiyuan));
      for (let v of temp) {
        v.isAct = true;
      }
      this.$store.commit("SET_ZHIYUANS", {
        item: temp,
        type: 3
      });
    },
    //取消多选
    cancelSelect() {
      this.selection = false;
      let temp = JSON.parse(JSON.stringify(this.arrZhiyuan));
      for (let v of temp) {
        v.isAct = false;
      }
      this.$store.commit("SET_ZHIYUANS", {
        item: temp,
        type: 3
      });
    },
    onSelectionClick(fileitem) {
      if (fileitem.isAct) return;
      if (this.popupSrtSelect) {
        for (let v of this.srtFiles) {
          v.isAct = false;
        }
        fileitem.isAct = true;
      } else {
        this.editItemFile = fileitem;
        let temp = JSON.parse(JSON.stringify(this.arrZhiyuan));
        let srtfileitem = {};
        for (let v of temp) {
          v.isAct = false;
          if (v.id == fileitem.id) {
            v.isAct = !v.isAct;
            srtfileitem = v;
          }
        }
        this.$store.commit("SET_ZHIYUANS", {
          item: temp,
          type: 3
        });
      }
    },
    upsrtfile() {
      this.isUpSrtfile = true;
      this.onaddFile();
    },
    //资源库上传文件
    repository() {
      this.repositoryopen = true;
    },
    srtSelect(v) {
      console.log("付款收到了吗", v);
      this.upsrttype = v.type;
      this.popupSrtSelect = true;
    },
    //设置语系
    showsetlang() {
      console.log(this.editItemFile);
      this.uplang = true;
      this.popupSort = true;
    },
    upfileInfo(t) {
      if (t) {
        this.lang = "zh_cn";
      } else {
        this.lang = "en_us";
      }
      console.log(
        "upfileInfo srtlang",
        this.upfileInfodata.postData,
        "的方式来看",
        JSON.parse(this.upfileInfodata.postData.info)
      );
      this.$http
        .post("/api/bankefile/updatefile", this.upfileInfodata.postData)
        .then(res => {
          if (res.data.code == "0") {
            this.curslangfid = this.upfileInfodata.postData.id;
            this.$alert({
              title: "设置成功",
              msg: "请确认设置语系与字幕相同,否则训练功能将无法评分"
            });
          } else {
            Toast(this.$mt("失败"));
          }
          this.popupSort = false;
          this.uplang = false;
        })
        .catch(err => {
          this.lang = "en_us";
          this.popupSort = false;
          this.uplang = false;
          Toast(this.$mt("连接服务失败"));
        });
    },
    onUpsrtcalce(postData) {
      if (postData && postData != null) {
        let localarrZhiyuan = JSON.parse(
          JSON.stringify(this.$store.state.arrZhiyuan)
        );
        for (let v of localarrZhiyuan) {
          if (v.id == postData.id) {
            let info = JSON.parse(postData.info);
            v.finttype = postData.finttype;
            v.info = info;
            this.$store.commit("SET_ZHIYUANS", {
              item: [v],
              type: 4
            });
          }
        }
      }
      this.popupSrtSelect = false;
    },
    onFolderClick(fitem) {
      let listcontainer = this.$refs.listcontainer;
      let prevTop = listcontainer.scrollTop;
      this.tempScorllTop.push(prevTop);
      let localarrZhiyuan = this.$store.state.arrZhiyuan;
      localarrZhiyuan = JSON.parse(JSON.stringify(localarrZhiyuan));
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
      this.loadTop();
    },
    onPrev() {
      this.$store.commit("SET_ZHIYUANS", {
        item: this.tempmenuData[this.tempmenuData.length - 1].datas,
        type: 3
      });
      this.copyarrZhiyuan = this.tempmenuData[
        this.tempmenuData.length - 1
      ].datas;
      this.onprevInitData();
      this.fiterxunlianfile(this.curxunliantp);
    },
    //收藏
    Collection() {
      let imgIcon = "";
      let cobj = {}; //! cjy: 减少信息； 这里的editItemfile 非常大
      if (this.editItemFile.ftype == "file") {
        let filesize = 0;
        if (this.editItemFile.info && this.editItemFile.info.filesize) {
          filesize = this.editItemFile.info.filesize;
        }
        cobj = {
          url: this.editItemFile.url,
          ftype: "file",
          filesize: filesize
        };
        //console.log(this.editItemFile);
        switch (this.editItemFile.finttype) {
          case 0:
            imgIcon = getZYFileType(this.editItemFile.url);
            break;
          case 1:
            // this.editItemFile.pic = this.editItemFile.localfile[0].imgsrc;
            //  imgIcon = this.editItemFile.localfile[0].imgsrc;
            imgIcon = this.editItemFile.imgsrc;
            break;
          case 2:
            imgIcon = "MP4";
            break;
          case 12:
            imgIcon = "MP4";
            break;
          case 3:
            imgIcon = "MP3";
            break;
          case 13:
            imgIcon = "MP3";
            break;
          case 4: //! 文档
            imgIcon = getZYFileType(this.editItemFile.url);
            break;
          default:
            //! iqiqta
            imgIcon = getZYFileType(this.editItemFile.url);
            break;
        }
      } else if (this.editItemFile.ftype == "link") {
        imgIcon = "IT";
        cobj = {
          url: this.editItemFile.url,
          ftype: "link"
        };
      }
      let title = this.editItemFile.name;
      CollectionFn(
        cobj,
        1,
        imgIcon,
        this.editItemFile.id,
        this.bankeid,
        this,
        title
      );
    },
    oneditclick(fileitem) {
      this.moveId = fileitem.id;
      this.editItemFile = fileitem;
      this.dlid = this.editItemFile.id;
      this.actionShow = true;
    },
    // showallBanke() {
    //   this.showallbankes = !this.showallbankes;
    // },
    // select(v) {
    //   if (v.id == this.curcfromBanke.id) return;
    //   this.curcfromBanke = v;
    //   this.showallbankes = false;
    //   this.queryviews(this.editItemFile);
    // },
    queryviews(fileitem) {
      this.fileviewsnum = 0;
      let postdata = {
        id: fileitem.id,
        bankeid: this.bankeid
      };
      if (this.cfrom) {
        postdata.bankeid = this.courseid;
        postdata.banketype = 1;
      }
      this.$http
        .post("api/bankefile/queryviews", postdata)
        .then(res => {
          if ((res.data.code = "0")) {
            console.log("queryviews", res);

            this.noViewUserList = [];
            this.UserList = [];
            this.seeState = 0;
            fileitem.memberids = res.data.data.memberids;
            fileitem.users = res.data.data.users;
            fileitem.views = res.data.data.views.filter(v => {
              return v.userid != 0;
            });
            fileitem.noviewnum =
              fileitem.memberids.length - fileitem.views.length;
            fileitem.noviewnum =
              fileitem.noviewnum > 0 ? fileitem.noviewnum : 0;
          }
          if (fileitem.views.length) {
            this.fileviewsnum = fileitem.views.length;
            for (let v of fileitem.views) {
              for (let item of fileitem.users) {
                if (v.userid == item.id) {
                  v.name = item.name;
                  item.isView = true;
                }
              }
            }
            for (let v of fileitem.users) {
              if (!v.isView) {
                this.noViewUserList.push(v);
                console.log("附件是看的", v);
              }
            }
          } else {
            this.noViewUserList = fileitem.users;
          }
          if (this.noViewUserList.length) {
            this.UserList = this.noViewUserList;
          } else {
            this.seeState = 1;
            this.UserList = fileitem.views;
          }
        })
        .catch(err => {});
    },
    showInfo() {
      this.popupEditInfo = true;
      this.queryviews(this.editItemFile);
    },
    //学生查看or未查看
    see(v, numb) {
      if (!numb) return;
      this.seeState = v;
      if (v == "0") {
        this.UserList = this.noViewUserList;
      } else {
        this.UserList = this.editItemFile.views;
      }
    },
    //设置已阅读资源
    setSeeResources(fileitem) {
      let postdata = {
        bankefileid: fileitem.id,
        classid: this.bankeid
      };
      if (this.cfrom) {
        postdata.classid = this.courseid;
        postdata.banketype = 1;
      }
      this.$http
        .post("api/bankefile/setview", postdata)
        .then(res => {
          if (res.data.code == "0") {
            fileitem.viewnum++;
            fileitem.eventmsgs = false;
          } else {
          }
        })
        .catch(res => {});
    },
    //资源库 or 课程 下载资源
    onreponviewfile(fileitem) {
      if (fileitem.ftype == "file") {
        nativecode.fileviewSingle(this, fileitem.info);
      } else if (fileitem.ftype == "link") {
        nativecode.fileviewUrl(this, fileitem);
      }
      this.setSeeResources(fileitem);
    },
    //下载资源
    onviewfile(fileitem) {
      this.editItemFile = fileitem;
      if (this.cfrom) {
        this.onreponviewfile(fileitem);
      } else {
        if (fileitem.ftype == "link") {
          this.onreponviewfile(fileitem);
          return;
        }
        if (this.isVideoFile && !this.isteacher) {
          this.getview(fileitem);
        } else {
          this.onreponviewfile(fileitem);
        }
      }
    },
    getview(fileitem) {
      let cb = () => {
        this.setSeeResources(fileitem);
      };
      let postdata = {
        bankefileid: fileitem.id,
        classid: this.bankeid
      };
      if (this.cfrom) {
        postdata.classid = this.courseid;
        postdata.banketype = 1;
      }
      this.$http
        .post("api/bankefile/getview", postdata)
        .then(res => {
          if (res.data.code == "0") {
            if (res.data.data != null) {
              this.mediaviewnum = res.data.data.viewnum;
            }
            nativecode.fileviewSingle(this, fileitem.info, cb);
          } else {
            Toast(this.$mt("服务开小差") + "," + this.$mt("刷新试试") + "..");
          }
        })
        .catch(err => {
          Toast(this.$mt("服务开小差") + "," + this.$mt("刷新试试") + "..");
        });
    },
    deletezy() {
      if (!this.$store.getters.caneditbanke && !this.cfrom) {
        Toast(this.$mt("你无权限"));
        return;
      }
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
                    this.$store.commit("DEL_ZHIYUAN_ITEM", this.dlid);
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
    parseOneItem(item) {
      if (item.info) {
        item.info = JSON.parse(item.info);
        if (item.info.metainfo && typeof item.info.metainfo == "string") {
          item.info.metainfo = JSON.parse(item.info.metainfo);
        }
      }
    },
    loadTopInit() {
      this.$store.commit("SET_ZHIYUANS", {
        item: [],
        type: 3
      });
      this.copyarrZhiyuan = [];
      this.files = [];
      this.page = 0;
      this.loading = false;
      this.listLoadend = false;
      this.allLoaded = false;
      let listcontainer = this.$refs.listcontainer;
      this.$nextTick(() => {
        listcontainer.scrollTop = 0;
      });
    },
    loadTop2() {
      if (!this.isxunlianOption) {
        this.loadTopInit();
        this.loadMore(this.parentid);
      } else {
        this.$refs.loadmore.onTopLoaded();
      }
    },
    loadMore2() {
      this.loading = true;
      if (!this.isxunlianOption) {
        this.loadMoreFile(this.parentid);
      } else {
        this.loading = false;
      }
    },
    loadTop() {
      this.loadTopInit();
      this.loadMore(this.parentid);
    },
    loadMore() {
      this.loading = true;
      this.loadMoreFile(this.parentid);
    },
    handleTopChange(status) {
      this.topStatus = status;
    },
    handleBottomChange(status) {
      this.bottomStatus = status;
    },
    loadMoreFile(parentid) {
      let postData = {
        bankeid: this.bankeid,
        page: this.page,
        pagesize: this.pagesize,
        parentid: parentid
      };
      if (this.cfrom) {
        (postData.bankeid = this.courseid), (postData.banketype = 1);
      } else if (this.repositoryitemsnb) {
        postData.banketype = this.repositoryitemsnb;
      } else {
        postData.needviewnum = true;
      }
      if (this.sortTime) {
        postData.ordername = "id";
        postData.order = "asc";
      }
      if (this.sortFile) {
        postData.ordername = "name";
        postData.order = "asc";
      }
      if (this.popupSrtSelect) {
        postData.finttype = [5];
        postData.page = 0;
      }
      if (this.finttype) {
        postData.finttype = this.finttype;
      }

      this.$http
        .post("/api/bankefile/querypage", postData)
        .then(res => {
          if (res.data.code == 0) {
            // res.data.data.files[0].ftype = "folder";
            this.filetotal = res.data.data.total;
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
            console.log("资源", res);
            let ids = [];
            for (let item of res.data.data.files) {
              ids.push(item.id);
              this.parseOneItem(item);
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
                    item.imgsrc =
                      item.info.filepath + item.info.metainfo.snapsuffix;
                  } else {
                    item.imgsrc = getZYFileTypeIcon(item.info.filepath);
                  }
                } else if (item.finttype == 2 || item.finttype == 12) {
                  item.imgsrc = item.info.filepath + "_snap.jpg";
                } else {
                  item.imgsrc = getZYFileTypeIcon(item.info.filepath); //commontools.fileType(item.info);
                }
              } else if (item.ftype == "menu") {
                item.imgsrc = "/assets/file_icon/folder.svg";
              }
            }
            // console.log("方式发多少", res.data.data.files);
            if (this.popupSrtSelect) {
              let data = [];
              this.srtFiles = res.data.data.files;
            } else {
              this.eventmsgsOnactivity(res.data.data.files, ids);
            }
            if (this.filesempty) {
              this.liststatedesc = "未找到文件";
              this.loadingState = true;
            }
          } else {
            this.liststatedesc = this.$mt("出错了") + "...";
            this.loadingState = true;
          }
          this.$refs.loadmore.onTopLoaded();
        })
        .catch(res => {
          this.$refs.loadmore.onTopLoaded();
          console.log(res);
          //! cjy: 这里server 的http code 非200 页会走这里。
          //! 因此不能继续加载
          this.loadingState = true;
        });
    },
    //红点查询
    eventmsgsOnactivity(serverData, eventids) {
      if (serverData.length == 0) {
        this.fiterxunlianfile(this.curxunliantp);
        return;
      }
      this.$http
        .post("/api/eventmsgs/onactivity", {
          bankeid: this.bankeid,
          eventtype: 1,
          eventids: [...eventids]
        })
        .then(res => {
          if (res.data.code == "0" && res.data.data.length) {
            for (let v of serverData) {
              for (let id of res.data.data) {
                if (v.id == id) {
                  v.eventmsgs = true;
                }
              }
            }
          }
          // commontools.arrayMergeAsIds(this.files, serverData);
          this.$store.commit("SET_ZHIYUANS", {
            item: serverData,
            type: 2
          });
          this.copyarrZhiyuan = [...this.copyarrZhiyuan, ...serverData];
          this.fiterxunlianfile(this.curxunliantp);
        })
        .catch(err => {
          // commontools.arrayMergeAsIds(this.files, serverData);
          this.$store.commit("SET_ZHIYUANS", {
            item: serverData,
            type: 2
          });
          this.copyarrZhiyuan = [...this.copyarrZhiyuan, ...serverData];
          this.fiterxunlianfile(this.curxunliantp);
        });
    },
    onSort() {
      this.uplang = false;
      this.popupSort = true;
    },
    onaddFile() {
      this.headerAddBtn = true;
      this.actionShow = true;
    },
    //文件排序
    sortfileFn(data) {
      if (this.sortFile) return;
      this.sortFile = true;
      this.sortTime = false;
      let temp = JSON.parse(JSON.stringify(data));
      let finalList = temp.sort((a, b) => sortLikeWin(a.name, b.name));
      this.$store.commit("SET_ZHIYUANS", {
        item: finalList,
        type: 3
      });
      this.popupSort = false;
    },
    //时间倒序排序
    sorttimeFn(data) {
      if (this.sortTime) return;
      this.sortTime = true;
      this.sortFile = false;
      let temp = JSON.parse(JSON.stringify(data));
      temp.sort(function(a, b) {
        return a.createtime > b.createtime ? 1 : -1;
      });
      this.$store.commit("SET_ZHIYUANS", {
        item: temp,
        type: 3
      });
      this.popupSort = false;
    },
    //添加网站
    addLink(v) {
      this.onUploadLink(v);
    },
    onUploadLink(v) {
      if (v) {
        this.onRepositoryclickdata = v;
      }
      this.popupUploadLink = true;
      this.$store.commit("SET_FOOTER_BAR_STATE", false);
    },
    onAddLinkState(state) {
      if (state) {
        this.popupUploadLink = false;
        this.selected = "1";
      }
    },
    //添加精选网站
    superLink() {
      this.popupSuperLink = true;
      this.$store.commit("SET_FOOTER_BAR_STATE", false);
    },
    //新建文件夹
    newFolder(v) {
      if (v) {
        this.onRepositoryclickdata = v;
      }
      var url =
        "/api/bankefile/menuadd?parentid=" +
        this.parentid +
        "&bankeid=" +
        this.bankeid;
      if (this.cfrom) {
        url =
          "/api/bankefile/menuadd?parentid=" +
          this.parentid +
          "&bankeid=" +
          this.courseid +
          "&banketype=" +
          1;
      }
      if (this.repositoryopen) {
        let parentid = this.onRepositoryclickdata.parentid;
        let banketype = this.onRepositoryclickdata.banketype;
        url =
          "/api/bankefile/menuadd?parentid=" +
          parentid +
          "&bankeid=" +
          this.user.id +
          "&banketype=" +
          banketype;
      }
      this.$prompt({
        msg: "请输入文件名",
        docb: value => {
          this.newFileName = value;
          Indicator.open(this.$mt("创建中") + "...");
          this.$http
            .post(url, {
              name: this.newFileName
            })
            .then(res => {
              if (res.data.code == "0") {
                if (this.repositoryopen) {
                  this.repositorynewData = res.data.data;
                } else {
                  let item = res.data.data;
                  item.imgsrc = "/assets/file_icon/folder.svg";
                  let arr = [];
                  arr[0] = res.data.data;
                  this.$store.commit("SET_ZHIYUANS", {
                    item: arr,
                    type: 1
                  });
                }
              } else {
                Toast(this.$mt("创建失败"));
              }
              Indicator.close();
            })
            .catch(err => {
              Toast(this.$mt("服务连接失败"));
              Indicator.close();
            });
        }
      });
    },
    oncopyfile(v) {
      this.$store.commit("SET_ZHIYUANS", {
        item: v,
        type: 1
      });
      this.repositoryopen = false;
    },
    onWatchBack() {
      this.popupSuperLink = false;
      this.$store.commit("SET_FOOTER_BAR_STATE", true);
    },
    //上传本地文件btn
    onUploadLocal(v) {
      if (v) {
        this.onRepositoryclickdata = v;
      }
      console.log("那就", this.onRepositoryclickdata);
      this.$refs.uploadfilebtn.value = "";
      this.$refs.uploadfilebtn.click();
    },
    //上传文件
    uploadChange(event) {
      if (event.target.files.length > 0) {
        var file = event.target.files;
        if (this.isUpSrtfile) {
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
            this.douploadonefile(file[i]);
          }
        } else {
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
            this.douploadonefile(file[i]);
          }
        }
      }
    },
    douploadonefile(onefile) {
      let type = onefile.type;
      if (type.indexOf("image") > -1) {
        //! cjy: 因为可能选择手机照片； 而手机照片可能很大（10M-30M），且带旋转， 因此这里需要处理
        fixCaptureImage(onefile, true)
          .then(res => {
            this.goUploadInitpage(res);
          })
          .catch(err => {
            this.goUploadInitpage(err);
          });
      } else {
        this.goUploadInitpage(onefile);
      }
    },
    goUploadInitpage(file) {
      this.tempUploadFile.push({
        file: file,
        tempImg: _URL.createObjectURL(file)
      });
      if (!this.popupUploadFile) {
        this.popupUploadFile = true;
      }
    },
    //关闭上传popup
    UpFileCanlce(v) {
      this.popupUploadFile = false;
      this.tempUploadFile = [];
      if (v && v.length) {
        this.autoguanlianfile(v);
      }
    },
    //多文件上传关联srt文件
    autoguanlianfile(upsuccessdata) {
      this.glvideofiles = [];
      this.glsrtfiles = [];
      for (let i = 0; i < upsuccessdata.length; i++) {
        let curItem = upsuccessdata[i];
        if (curItem.finttype == 2 || curItem.finttype == 3) {
          this.glvideofiles.push(curItem);
        }
        if (curItem.finttype == 5) {
          this.glsrtfiles.push(curItem);
        }
      }
      for (let i = 0; i < this.glvideofiles.length; i++) {
        let v = this.glvideofiles[i];
        let vname = v.name.split(".")[0];
        for (let srt of this.glsrtfiles) {
          let srtname = srt.name.split(".")[0];
          if (vname == srtname) {
            this.onUpSrtSuccess(srt, v, i);
          }
        }
      }
    },
    onUpSrtSuccess(srtfileitem, peditItemFile, len = null) {
      let postData = {
        id: peditItemFile.id,
        info: peditItemFile.info
      };
      postData.info.srtpath = srtfileitem.info.filepath;
      if (peditItemFile.finttype == 2 || peditItemFile.finttype == 3) {
        if (peditItemFile.finttype == 2) {
          postData.finttype = 12;
        } else {
          postData.finttype = 13;
        }
      }
      // postData.info.srtlang = this.lang;
      postData.info = JSON.stringify(postData.info);
      this.$http
        .post("/api/bankefile/updatefile", postData)
        .then(res => {
          if (res.data.code == "0") {
            // Toast("设置成功");
          } else {
            // Toast("设置失败");
          }
          if (len == this.glvideofiles.length - 1) {
            this.loadTop();
          }
        })
        .catch(err => {});
    },
    //资源库上传文件成功
    onreupsuccess(v, type = "null") {
      this.tempUploadFile = [];
      this.popupUploadFile = false;
      this.repositorynewData = v;
      if (type == "upfile") {
        if (v && v.length) {
          this.autoguanlianfile(v);
        }
      }
    },
    goBack() {
      if (this.repositoryopen) {
        this.repositoryopen = false;
      }
      if (this.popupAudio) {
        this.popupAudio = false;
        this.$store.commit("SET_FOOTER_BAR_STATE", true);
      }
      if (this.popupSuperLink) {
        this.popupSuperLink = false;
        this.$store.commit("SET_FOOTER_BAR_STATE", true);
      }
      if (this.popupEditInfo) {
        this.popupEditInfo = false;
        this.showallbankes = false;
      }
    },
    backHome() {
      if (this.cfrom) {
        this.$emit("calce", true);
      } else {
        if (this.Refresh) {
          this.$router.replace("/");
        } else {
          this.$router.go(-1);
        }
        return;
        if (this.miniprogram) {
          if (this.Refresh) {
            this.$router.replace("/");
          } else {
            this.$router.go(-1);
          }
        } else {
          this.$router.go(-1);
        }
      }
    },
    //教案
    jiaoan() {
      this.showJiaoAn = false;
      this.$store.commit("SET_FOOTER_BAR_STATE", false);
    },
    movecuritem(v) {
      if (v) {
        this.onRepositoryclickdata = v;
      }
      this.popupmulu = true;
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
      let parentid = this.parentid;
      let editItemFile = this.editItemFile;
      if (this.repositoryopen) {
        editItemFile = this.onRepositoryclickdata.editItemFile;
      }
      if (this.menuSelectEndData) {
        parentid = this.menuSelectEndData.parentid;
      }
      let tips = "正全速移动";
      let postData = {
        id: editItemFile.id,
        parentid: parentid
      };
      if (this.upfileName) {
        postData = {
          id: editItemFile.id,
          name: this.upfileName
        };
        tips = "修改中";
      }
      Indicator.open(this.$mt(tips));
      this.$http
        .post("/api/bankefile/updatefile", postData)
        .then(res => {
          if (res.data.code == "0") {
            if (this.upfileName) {
              this.editItemFile.name = this.upfileName;
            } else {
              if (this.repositoryopen) {
                this.repositorynewData = editItemFile;
              } else {
                let curzhiyuans = this.arrZhiyuan;
                curzhiyuans = curzhiyuans.filter(item => {
                  return item.id != editItemFile.id;
                });
                this.$store.commit("SET_ZHIYUANS", {
                  item: curzhiyuans,
                  type: 3
                });
                Toast(this.$mt("成功"));
              }
            }
          } else {
            Toast(this.$mt("失败"));
          }
          this.upfileName = "";
          Indicator.close();
          this.popupmulu = false;
        })
        .catch(err => {
          Toast(this.$mt("连接服务失败"));
          Indicator.close();
          this.popupmulu = false;
          this.upfileName = "";
        });
    },
    onMenuSelectEnd(v) {
      console.log("引发的", v);
      this.menuSelectEndData = v;
      this.updateItem();
    },
    onCancel(v) {
      this.popupmulu = false;
      this.menuSelectEndData = null;
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
    onxunlianfile() {
      let copyfileitems = [];
      for (let v of this.arrZhiyuan) {
        if (v.isAct) {
          copyfileitems.push(v);
        }
      }
      // console.log(copyfileitems);
      sessionStorage.setItem("xunlianzyfile", JSON.stringify(copyfileitems));
      this.$back();
    }

    // onsubmitUpload() {
    //   this.douploadonefiledirect(this.tempUploadFile.file);
    // },
    // douploadonefiledirect(onefile) {
    //   console.log("上传照片", onefile);
    //   if (!onefile) {
    //     console.log("上传照片 失败");
    //     return;
    //   }
    //   var formdata = new FormData();
    //   formdata.append("file", onefile);
    //   let parentid = this.parentid;
    //   if (this.selectMenuItem) {
    //     parentid = this.selectMenuItem.id;
    //   }
    //   var url = "/api/bankefile/fileupload?parentid=" + parentid;
    //   if (this.cfrom) {
    //     url += "&bankeid=" + this.courseid + "&banketype=" + 1;
    //   } else {
    //     url += "&bankeid=" + this.bankeid;
    //   }

    //   Indicator.open(this.$mt('上传中'));

    //   this.$http({
    //     url: url,
    //     method: "post",
    //     data: formdata,
    //     headers: { "Content-Type": "application/x-www-form-urlencoded" }
    //   })
    //     .then(res => {
    //       Indicator.close();
    //       if (res.data.code == 0) {
    //         console.log("54", res.data.data);
    //         this.parseOneItem(res.data.data);
    //         let item = res.data.data;
    //         if (item.ftype == "link") {
    //           item.imgsrc = "/assets/file_icon/IT.svg";
    //         } else if (item.ftype == "file") {
    //           if (item.finttype == "1") {
    //             if (
    //               item.info &&
    //               item.info.metainfo &&
    //               item.info.metainfo.snapsuffix
    //             ) {
    //               item.imgsrc =
    //                 item.info.filepath + item.info.metainfo.snapsuffix;
    //             }
    //           } else {
    //             item.imgsrc = getZYFileTypeIcon(item.info.filepath);
    //           }
    //         }
    //         commontools.arrayMergeAsIds(this.files, res.data.data);
    //         //  res.data.data.info = JSON.parse(res.data.data.info);
    //         let arr = [];
    //         arr[0] = res.data.data;
    //         this.$store.commit("SET_ZHIYUANS", {
    //           item: arr,
    //           type: 1
    //         });

    //         this.tempUploadFile = {};
    //         this.popupUploadFile = false;
    //       } else {
    //         Toast("上传失败");
    //       }
    //     })
    //     .catch(err => {
    //       Indicator.close();
    //       console.log(err);
    //     });
    // },

    // ...mapMutations(["SET_ZHIYUANS"])
  },
  destroyed: function() {
    // sessionStorage.removeItem("curbanke");
  }
};
</script>

<style scoped>
.mint-tabbar > .mint-tab-item.is-selected {
  background: none;
}
.loadmore {
  min-height: 200px;
}

.uploadtabbar {
  background: #fff;
  position: static;
}
.uploadimgsize {
  width: 35px;
  height: 35px;

  margin-bottom: 2px;
}

.uploadtabbar img {
  border-radius: 50%;
}

.uploadpart {
}
.listcontainer {
  position: relative;
  height: 100%;
  border-top: 1px solid #eaeaea;
}
</style>
<style lang="less" scoped>
.url-wrap {
  .btn-wrap {
    position: relative;
    width: 100%;
    height: 60px;
    background: #fff;
    span.showupload {
      font-size: 28px;
    }
    .jiaoan {
      width: 64px;
      height: 32px;
      background: rgba(255, 255, 255, 1);
      border: 1px solid rgba(170, 170, 170, 1);
      border-radius: 4px;
      .btn {
        height: 100%;
        color: #aaaaaa;
        background: #fff;
      }
      .iconfont {
        right: 0;
      }
    }
    .right-wrap {
      &.cfrom {
        width: 100%;
        .sort {
          left: 20px;
        }
        .file {
          right: 0;
        }
      }
      .iconfont {
        font-size: 28px;
      }
    }
  }
  .items-container {
    margin-top: 4px;
    .Resources-total {
      text-align: right;
      background: #fff;
      padding: 8px;
    }
    &.showupload {
      margin-top: 0;
    }
  }
  .edit-container {
    padding: 15px;
    p {
      padding: 0.26667rem 0;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 20px;
      word-break: break-all;
    }
    ul {
      li {
        width: 33%;
        i {
          font-size: 0.8rem;
          background: #e3e3e3;
          border-radius: 50%;
          padding: 8px;
        }
        span {
          display: block;
          margin-top: 10px;
        }
      }
    }
  }
  .info-popup {
    background: #f0f0f0;
    .cfrom-view-header {
      position: relative;
      width: 100%;
      height: 50px;
      .header-wrap {
        position: relative;
        z-index: 9999;
        width: 100%;
        height: 100%;
        background: #fff;
        .name {
          i {
            font-size: 26px;
            right: -30px;
            color: #aaa;
          }
        }
      }
      .bankes-wrap {
        position: absolute;
        width: 100%;
        height: 210px;
        top: -160px;
        left: 0;
        background: #fff;
        text-align: center;
        opacity: 0;
        border-top: 1px solid #f0f0f0;
        transition: all 0.2s;
        overflow: auto;
        li {
          height: 53px;
        }
        &.act {
          top: 100%;
          opacity: 1;
          transition: all 0.2s;
          z-index: 9998;
        }
        li {
          width: 100%;
          height: 50px;
          border-bottom: 1px solid #f0f0f0;
          line-height: 50px;
          color: #000;
          font-size: 16px;
          &.act {
            color: #0089ff;
          }
        }
      }
      .v-modal {
        z-index: 9997;
      }
    }
    .info-list-main {
      background: #fff;
      margin-top: 15px;
      .tit-table {
        p {
          padding: 15px 0;
          span {
            width: 50%;
            &.act {
              color: #0089ff;
              .ast {
                color: #0089ff;
              }
            }
            .ast.nozh {
              font-size: 12px;
            }
          }
        }
      }
      .list-content {
        height: 70vh;
        min-height: 70vh;
        li {
          position: relative;
          height: 55px;
          padding: 0 10px;
          border-top: 1px solid #f0f0f0;
          .name {
            width: 73%;
            span {
              display: inline-block;
              width: 50%;
            }
            .user {
            }
            .viewnum {
              color: #aaaaaa;
              font-size: 16px;
            }
          }
          .score-wrap {
            width: 27%;
            span {
              display: block;
            }
            .time {
            }
            .score {
              color: #ff8900;
              margin-left: 20px;
            }
          }
        }
      }
    }
  }
}
.zhiyan-wrap {
  position: relative;
  .listcontainer-wrap {
    height: calc(100vh - 193px);
    min-height: calc(100vh - 193px);
    position: relative;
    .listcontainer {
      overflow: scroll;
      .wrap {
        min-height: calc(100vh - 193px);
        &.prev {
          padding-bottom: 64px;
        }
      }
    }
    &.cfrom {
      height: calc(100vh - 50px);
      min-height: calc(100vh - 50px);
      .listcontainer {
        .wrap {
          min-height: calc(100vh - 50px);
        }
      }
    }
    &.onPrev {
      height: calc(100vh - 256px);
      min-height: calc(100vh - 256px);
      .listcontainer {
        .wrap {
          min-height: calc(100vh - 256px);
        }
      }
    }
  }
  &.prev {
    margin-top: 61px;
  }
  .icons {
    color: #aaa !important;
    margin: 0 6px;
    font-size: 20px;
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
  .items-container {
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
          padding-right: 30px;
        }
        .time {
        }
      }
    }
  }
  .selection-wrap {
    z-index: 10000;
    background: #fff;
    padding: 14px 0;
    box-shadow: 0 -3px 5px 0px #ccc;
    ul {
      width: 90%;
      margin: 0 auto;
      li {
        width: 25%;
        text-align: center;
        span {
          display: block;
        }
        .iconfont {
          font-size: 30px;
        }
      }
    }
  }
  .item-wrap {
    position: relative;
  }
  .select-icon {
    width: 35px;
    height: 100%;
    .iconfont {
      color: transparent;
      border: 1px solid #ccc;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      font-size: 26px;
      &.act {
        color: #ff8900;
        border: none;
      }
    }
  }
  .srtmain {
    height: 94vh;
    position: relative;
    .emtp {
      width: 100%;
      color: #666;
    }
  }
  // .van-navbr-wrap {
  //   position: fixed;
  //   left: 0;
  //   top: 0;
  //   z-index: 1000;
  //   width: 100vw;
  //   height: 55px;
  //   overflow-x: scroll;
  //   margin-top: 49px;
  //   background: #fff;
  //   border-bottom: 1px solid #f0f0f0;
  //   > ul {
  //     position: absolute;
  //     left: 0;
  //     top: 0;
  //     display: flex;
  //     li {
  //       display: flex;
  //       width: 90px;
  //       height: 54px;
  //       flex-direction: column;
  //       align-items: center;
  //       justify-content: center;
  //       padding: 0 5px;
  //       span {
  //         width: 100%;
  //         text-align: center;
  //         // overflow-x: auto;
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
  //     }
  //     .move-bar {
  //       position: absolute;
  //       left: 0;
  //       bottom: 0;
  //       width: 52px;
  //       height: 3px;
  //       background: #0089ff;
  //       transition: all 0.2s;
  //     }
  //   }
  // }
}
</style>
<style>
.mint-tab-container-wrap {
  /* height: 100%; */
}
.mint-loadmore.filesempty {
  /* height: 100%; */
}
.mint-loadmore.filesempty .mint-loadmore-content {
  /* position: relative;
  height: 100%; */
}
</style>