<template>
  <div class="class-config-wrap">
    <mt-header :title="bankeInfo.name">
      <mt-button slot="left" icon="back" @click="goBack()">{{$mt('返回')}}</mt-button>
      <mt-button slot="right" @click="submit" :disabled="calce">{{$mt('确定')}}</mt-button>
    </mt-header>
    <div class="main">
      <mt-cell :title="$mt('允许学生加入')">
        <mt-switch v-model="funcdesc.disablejoin"></mt-switch>
      </mt-cell>
      <mt-cell :title="$mt('允许学生退课')">
        <mt-switch v-model="funcdesc.disablequit"></mt-switch>
      </mt-cell>
    </div>
  </div>
</template>

<script>
import { Indicator, Toast, MessageBox, Switch, DatetimePicker } from "mint-ui";
export default {
  props: {
    bankeInfo: {
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      funcdesc: {}
    };
  },
  computed: {
    calce() {
      if (
        this.funcdesc.disablejoin == this.bankeInfo.funcdesc.disablejoin &&
        this.funcdesc.disablequit == this.bankeInfo.funcdesc.disablequit
      ) {
        return true;
      }
      return false;
    }
  },
  created() {
    this.funcdesc = JSON.parse(JSON.stringify(this.bankeInfo.funcdesc));
    console.log("分开始了吗", this.bankeInfo);
  },
  mounted() {},
  watch: {},
  methods: {
    goBack() {
      if (this.calce) {
        this.$emit("back", true);
      } else {
        this.$confirm({
          msg: "你有未保存的修改,是否退出",
          docb: () => {
            this.$emit("back", true);
          }
        });
      }
    },
    submit() {
      let postData = {};
      if (!this.funcdesc.disablejoin) {
        postData.disablejoin = false;
      }
      if (!this.funcdesc.disablequit) {
        postData.disablequit = false;
      }
      console.log(postData);
      // return;
      this.$confirm({
        msg: "你确定要修改吗",
        docb: () => {
          let BankeData = this.$store.state.banke.curbankes;
          this.$http
            .post("api/banke/updateinfo", {
              id: this.bankeInfo.id,
              funcdesc: JSON.stringify(postData)
            })
            .then(res => {
              if (res.data.code == "0") {
                Toast(this.$mt("设置成功"));
                for (let item of BankeData) {
                  if (item.id == res.data.data.id) {
                    item.funcdesc = this.funcdesc;
                  }
                }
                this.$store.commit("banke/setBankes", BankeData);
                this.$emit("back", true);
              }
            })
            .catch(err => {});
        }
      });
    }
  },
  components: { [Switch.name]: Switch }
};
</script>

<style scoped lang="less">
.class-config-wrap {
  .main {
  }
}
</style>
