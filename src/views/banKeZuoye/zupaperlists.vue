<template>
  <div class="zupaper-w">
    <mt-header :title="headername">
      <mt-button icon="back" slot="left" @click="calce">{{$mt('返回')}}</mt-button>
    </mt-header>
    <div class="main">
      <div class="eplist-w">
        <div class="item" v-for="(item,i) in zupaperlists" :key="i">
          <p class="font18">{{item.content.epname}}</p>
          <div class="font14 color9 b">
            <span>{{item.content.createtime}}</span>
            <span class="fr">{{$mt('题量')}}:{{item.content.eplen}}</span>
          </div>
          <mt-button class="position-r cbtn" @click="createep(item)">{{$mt('创建考试')}}</mt-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { Indicator, Toast, MessageBox, Actionsheet } from "mint-ui";
export default {
  name: "",
  props: {
    isCreate: {
      default: ""
    },
    item: {
      default() {
        return {};
      }
    },
    bankeid: {
      default: 0
    }
  },
  data() {
    return {
      zupaperlists: [],
      zuoyeitem: {
        name: "",
        state: 0,
        hassubmittime: 0,
        allowpasstime: 1,
        submittime: "",
        detaildesc: "",
        answerdesc: "",
        ztype: 2
      }
    };
  },
  computed: {
    headername() {
      return this.$mt("选择试卷");
    }
  },
  watch: {},
  created() {
    this.zupaperQuery();
  },
  mounted() {},
  methods: {
    zupaperQuery() {
      Indicator.open(this.$mt("查找中"));
      this.$http
        .post("/api/zupaper/paperquery", {})
        .then(res => {
          if (res.data.code == 0) {
            if (res.data.data.length) {
              this.zupaperlists = res.data.data;
              for (let v of this.zupaperlists) {
                if (v.content) {
                  v.content = JSON.parse(v.content);
                }
              }
            }
          } else {
            Toast(this.$mt("查找失败"));
          }
          Indicator.close();
        })
        .catch(err => {
          Indicator.close();
          Toast(this.$mt("服务走丢了"));
        });
    },
    createep(itemv) {
      let item = JSON.parse(JSON.stringify(itemv));
      let bankeid = this.bankeid;
      var url = "/api/api/bankezuoyeadd?bankeid=" + bankeid;
      Indicator.open(this.$mt("创建中"));
      var zitem = {};
      zitem = this.zuoyeitem;
      zitem.name = item.content.epname;
      zitem.answerdesc = item.paperkey;
      this.$http
        .post(url, {
          zuoye: zitem
        })
        .then(res => {
          Indicator.close();
          if (res.data.code == 0) {
            this.$emit("zuepSuccess", res.data.data);
          } else {
            Toast(this.$mt("创建失败") + res.data.msg);
          }
        })
        .catch(() => {
          Indicator.close();
          Toast(this.$mt("服务走丢了"));
        });
    },
    calce() {
      this.$emit("calce", true);
    }
  },
  components: {},
  destroyed() {}
};
</script>
<style lang='less' scoped>
.zupaper-w {
  width: 100%;
  height: 100%;

  .main {
    width: 100%;
    height: 100%;
    padding: 10px;
    .eplist-w {
      .item {
        position: relative;
        height: 80px;
        padding: 10px;
        background: #fff;
        border-radius: 10px;
        display: flex;
        justify-content: space-around;
        flex-direction: column;
        box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.07);
        margin-bottom: 10px;
        .b {
          padding-right: 120px;
        }
        .cbtn {
          background: #0089ff;
          color: #fff;
          height: 32px;
          border-radius: 26px;
          font-size: 14px;
        }
      }
    }
  }
}
</style>