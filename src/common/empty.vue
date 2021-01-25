<template>
  <div class="empty-wrap tc">
    <i class="iconfont fontmaintitle" :class="icon"></i>
    <p v-for="t in text" :key="t">
      {{$mt(t)}}...
      <button v-if="isreload" class="reload colord" @click="reload">{{$mt('刷新')}}</button>
    </p>
  </div>
</template>

<script>
export default {
  props: {
    icon: {
      default: "iconzanwushuju"
    },
    text: {
      default() {
        return ["暂无数据"];
      }
    },
    isreload: {
      default: false
    }
  },
  data() {
    return {};
  },
  computed: {},
  created() {},
  mounted() {},
  watch: {},
  methods: {
    reload() {
      this.$emit("reload", true);
    }
  },
  components: {}
};
</script>

<style scoped lang="less">
.empty-wrap {
  position: fixed;
  width: 100%;
  max-width: 640px;
  left: 50%;
  top: 50%;
  font-size: 14px;
  transform: translate(-50%, -50%);
  color: #999;
  i {
    font-size: 30px;
  }
  p {
    margin: 5px 0;
    .reload {
      border: none;
      background: none;
      font-size: 16px;
    }
  }
}
</style>
