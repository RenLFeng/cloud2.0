<template>
  <div class="DistanceConfig-wrap">
    <mt-header :title="$mt('校验配置')" class="mint-header-f">
      <mt-button icon="back" slot="left" @click="cance">{{$mt('返回')}}</mt-button>
    </mt-header>
    <div class="main">
      <div class="Location">
        <div class="switch">
          <span>{{$mt('位置校验')}}:</span>
          <mt-switch v-model="open"></mt-switch>
        </div>
        <div class="set">
          <p>{{$mt('签到范围')}}:&nbsp;{{$mt('%s米',[distance])}}&nbsp;</p>
          <div class="input-wrap">
            <input
              type="number"
              :placeholder="$mt('请设置校验距离')"
              @input="onInput($event.target.value)"
            />
            <button @click="onset">{{$mt('设置')}}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { Indicator, Toast, MessageBox, Switch, DatetimePicker } from "mint-ui";
export default {
  name: "",
  props: {},
  data() {
    return { distance: 100, open: true };
  },
  computed: {},
  watch: {
    open: function(newv, volv) {
      sessionStorage.setItem("checkgps", JSON.stringify(newv));
    }
  },
  created() {
    if (sessionStorage.getItem("distance")) {
      this.distance = sessionStorage.getItem("distance");
    }
    if (sessionStorage.getItem("checkgps")) {
      this.open = JSON.parse(sessionStorage.getItem("checkgps"));
    }
  },
  mounted() {},
  methods: {
    onset() {
      if (!this.open) {
        Toast(this.$mt("未开启校验"));
        return;
      }
      sessionStorage.setItem("distance", this.distance);
      Toast(this.$mt("设置成功"));
    },
    onInput(v) {
      console.log(v);
      this.distance = v;
    },
    cance() {
      this.$emit("cance", false);
    }
  },
  components: { [Switch.name]: Switch },
  destroyed() {}
};
</script>
<style lang='less' scoped>
.DistanceConfig-wrap {
  .main {
    margin-top: 50px;
    .Location {
      padding: 0 10px;
      background: #fff;
      .switch {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;
      }
      .set {
        padding: 10px 0;
        .input-wrap {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          input {
            border: 1px solid #ccc;
            border-radius: 5px;
            padding: 8px 5px;
            width: calc(100% - 83px);
          }
          button {
            background: #26a2ff;
            color: #fff;
            border: none;
            padding: 9px;
            border-radius: 3px;
          }
        }
      }
    }
  }
}
</style>