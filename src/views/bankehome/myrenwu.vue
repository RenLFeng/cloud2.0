<template>
  <div class="myrenwu-wrap">
    <mt-header :title="$mt('我的任务')" class="mint-header-f">
      <mt-button icon="back" slot="left" @click="back()">{{$mt('返回')}}</mt-button>
    </mt-header>
    <div class="main main-f overflow-scroll">
      <div v-for="(v, i) in zuoyelist" :key="i" class="zuoye" @click="renwuClick(v)">
        <BankeZuoyeSimple
          :zuoyeitem="v"
          :myrenwu="true"
          :hasedit="v.isMy?true:false"
          @editclick="onitemedit"
        ></BankeZuoyeSimple>
      </div>
    </div>
    <mt-actionsheet :actions="actions" :cancelText="$mt('取消')" v-model="actionShow" ref="Actionsheet" id="Actionsheet"></mt-actionsheet>
  </div>
</template>

<script>
import { Indicator, Toast, MessageBox, Actionsheet } from "mint-ui";
const BankeZuoyeSimple = () => import("@/views/components/BankeZuoyeSimple");
import { CollectionFn } from "@/util";
export default {
  props: {},
  data() {
    return {
      zuoyelist: [],
      zuoyeid: 0,
      curzuoye: {},
      actionShow: false
    };
  },
  computed: {
    user() {
      return this.$store.getters.curuser;
    },
    actions() {
      let obj = [];
      if (this.curzuoye.state == 100) {
        obj.push({
          name: this.$mt("结束"),
          method: this.endzuoye
        });
      }
      if (this.curzuoye.state == 10) {
        obj.push({
          name: this.$mt("删除"),
          method: this.del
        });
      }
      obj.push({
        name: this.$mt("收藏"),
        method: this.Collection
      });
      return obj;
    }
  },
  created() {
    this.myRenwu();
  },
  mounted() {},
  watch: {},
  methods: {
    myRenwu() {
      var url = "/api/api/bankezuoyequery";
      this.$http
        .post(url, {})
        .then(res => {
          if (res.data.code == "0") {
            this.zuoyelist = res.data.data;
            if (this.zuoyelist.length) {
              for (let v of this.zuoyelist) {
                if (v.userid == this.user.id) {
                  v.isMy = true;
                } else {
                  v.isMy = false;
                }
                if (v.publishdesc == null) {
                  v.publishdesc = { bankeitems: [] };
                } else if (v.publishdesc && v.publishdesc != null) {
                  v.publishdesc = JSON.parse(v.publishdesc);
                }
              }
            }
          }
        })
        .catch(err => {});
    },
    renwuClick(item) {
      this.zuoyeid = item.id;
      this.$store.commit("setRouterForward", true);
      this.$store.commit("SET_MYRENWUZUOYE_CLICK", 1);
      this.$router.push("/zuoyeresult/" + this.zuoyeid);
    },
    onitemedit(v) {
      this.curzuoye = v;
      this.actionShow = true;
    },
    del() {
      this.$confirm({
        msg: "您确定要删除吗",
        docb: () => {
          this.$http
            .post("/api/azuoye/delete", { id: this.curzuoye.id })
            .then(res => {
              console.log(res);
              if (res.data.code == 0) {
                for (let i = 0; i < this.zuoyelist.length; i++) {
                  if (this.curzuoye.id == this.zuoyelist[i].id) {
                    this.zuoyelist.splice(i, 1);
                    return;
                  }
                }
                this.$alert({
                  msg: "删除成功"
                });
              } else {
                this.$alert({
                  msg: "失败"
                });
              }
            })
            .catch(() => {});
        }
      });
    },
    Collection() {
      let imgIcon = "zuoye";
      let title = this.curzuoye.name;
      let cobj = {};
      CollectionFn(
        cobj,
        3,
        imgIcon,
        this.curzuoye.id,
        this.curzuoye.ownerid,
        this,title
      );
    },
    endzuoye() {
      this.end(10);
    },
    end(nstateto) {
      if (this.curzuoye) {
        let doopt = () => {
          Indicator.open(this.$mt("处理中"));
          this.$http
            .post("/api/api/bankezuoyesetstate", {
              zuoyeid: this.curzuoye.id,
              state: nstateto
            })
            .then(res => {
              Indicator.close();
              if (res.data.code == 0) {
                for (let item of this.zuoyelist) {
                  if (item.id == this.curzuoye.id) {
                    item.state = nstateto;
                    return;
                  }
                }
              } else {
                Toast(res.data.msg);
              }
            })
            .catch(() => {
              Indicator.close();
            });
        };

        if (nstateto == 10) {
          let tips =
            this.$mt("结束作业") + "\r\n" + this.$mt("结束后学生不可再提交");
          if (this.curzuoye.ztype == "1") {
            tips =
              this.$mt("结束讨论") + "\r\n" + this.$mt("结束后将不可再提交");
          }
          this.$confirm(
            {
              msg: tips,
              docb: () => {
                doopt();
              }
            },
            false
          );
        } else {
          doopt();
        }
      }
    },
    onCalce() {},
    back() {
      this.$store.commit("SET_MYRENWUZUOYE_CLICK", false);
      this.$emit("calce", true);
    }
  },
  components: { BankeZuoyeSimple, [Actionsheet.name]: Actionsheet }
};
</script>
<style scoped lang="less">
.myrenwu-wrap {
  .main {
    height: 94vh;
  }
}
</style>