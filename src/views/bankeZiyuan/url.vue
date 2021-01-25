<template>
  <div class="url-container fontsmall">
    <mt-header :title="$mt('添加')+' '+$mt('网页链接')">
      <mt-button slot="left" icon="back" @click="goBack()">{{$mt('返回')}}</mt-button>
      <mt-button slot="right" @click="submit">{{$mt('确定')}}</mt-button>
    </mt-header>
    <div class>
      <mt-field :label="$mt('标题')+':'" :placeholder="$mt('请输入')+$mt('标题')" v-model="urlTitle"></mt-field>
      <mt-field :label="$mt('网址')+':'" :placeholder="$mt('请输入')+$mt('链接')" type="url" v-model="url"></mt-field>
      <mt-cell :title="$mt('目录')" is-link :value="menuEndName" @click.native="queryMulu"></mt-cell>
    </div>
    <!-- <div class="button-worp">
      <mt-button class="button-auto-87" type="primary" @click="submit">{{$mt('提交')}}</mt-button>
    </div>-->
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
        v-if="popupmulu"
        @Cancel="onCancel"
        @menuSelectEnd="onMenuSelectEnd"
        :parentTempmenuData="parentTempmenuData"
        :curRootPrevid="curRootPrevid"
        :parentid="parentid"
        :headerName="headerName"
        :cfrom="cfrom"
      />
    </mt-popup>
  </div>
</template>

<script>
import { Indicator, Toast, MessageBox } from "mint-ui";
import { mapState, mapMutations } from "vuex";
import Menu from "./menu";
export default {
  name: "",
  props: {
    bankeid: {
      default: 0
    },
    cfrom: {
      default: false
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
    repositoryopen: {
      default: false
    },
    Repositoryclickdata: {
      default() {
        return {};
      }
    }
  },
  components: {
    Menu
  },
  data() {
    return {
      url: "",
      urlTitle: "",
      popupmulu: false,
      menuSelectEndData: null
    };
  },
  computed: {
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
    user() {
      return this.$store.getters.curuser;
    }
    // ...mapState(["arrZhiyuan"])
  },
  methods: {
    submit() {
      if (!this.urlTitle || !this.url) {
        this.$alert({
          msg: "请填写详细信息"
        });
        return;
      }
      let parentid = this.parentid;
      let banketype = 1;
      if (this.repositoryopen) {
        parentid = this.Repositoryclickdata.parentid;
        banketype = this.Repositoryclickdata.banketype;
      }
      if (this.menuSelectEndData) {
        parentid = this.menuSelectEndData.parentid;
      }
      var url =
        "/api/bankefile/linkadd?bankeid=" +
        this.bankeid +
        "&parentid=" +
        parentid;
      if (this.cfrom) {
        url += "&banketype=" + banketype;
      }
      if (this.repositoryopen) {
        var url =
          "/api/bankefile/linkadd?banketype=" +
          banketype +
          "&bankeid=" +
          this.user.id +
          "&parentid=" +
          parentid;
      }
      this.$http
        .post(url, {
          url: this.url,
          name: this.urlTitle
        })
        .then(res => {
          if (res.data.code == 0) {
            res.data.data.imgsrc = "/assets/file_icon/IT.svg";
            if (this.repositoryopen) {
              this.$emit("reupsuccess", res.data.data);
            } else {
              this.$alert({
                msg: "添加成功",
                cb: () => {
                  if (this.uploadCurRoot) {
                    let arr = [];
                    arr[0] = res.data.data;
                    this.$store.commit("SET_ZHIYUANS", {
                      item: arr,
                      type: 1
                    });
                  }
                  if (!this.cfrom) {
                    this.$store.commit("SET_FOOTER_BAR_STATE", true);
                  }
                  this.url = "";
                  this.urlTitle = "";
                }
              });
            }
          } else {
            this.$alert(
              {
                msg: res.data.msg
              },
              false
            );
          }
          this.$emit("addLinkState", true);
          console.log(res);
        })
        .catch(() => {});
    },
    onMenuSelectEnd(v) {
      this.menuSelectEndData = v;
      this.popupmulu = false;
      console.log("你看了多少呢", this.menuSelectEndData);
    },
    goBack() {
      this.menuSelectEndData = null;
      this.$emit("addLinkState", true);
      this.$store.commit("SET_FOOTER_BAR_STATE", true);
    },
    queryMulu() {
      this.popupmulu = true;
    },
    onCancel() {
      this.popupmulu = false;
    }
    // ...mapMutations(['SET_ZHIYUANS']),
  }
};
</script>

<style lang='less' scoped>
.url-container {
  .button-worp {
    margin-top: 10px;
  }
  .mint-cell-value.is-link {
    margin-right: 30px;
  }
}
</style>
