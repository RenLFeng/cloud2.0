<template>
  <div class="van-navbr-wrap">
    <ul>
      <li
        v-for="(v,i) in tabBar"
        :key="i"
        :class="{'active':v.isActive,'nolen':v.num==0}"
        @click="selectClick($event,v,i)"
        ref="tbLi"
        :style="`width:${width}vw`"
      >
        <span class="lable font18 nowrap">{{$mt(v.label)}}</span>
        <span class="num fontxs">{{v.num}}</span>
      </li>
      <span class="move-bar" :style="`left:${moveBar}px`"></span>
    </ul>
  </div>
</template>
<script>
export default {
  name: "",
  props: {
    tabBar: {
      default() {
        return [];
      }
    },
    seleid: {
      default: "id"
    },
    width: {
      default: "20"
    }
  },
  data() {
    return {
      moveBar: 0
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.$initantbar(this);
  },
  methods: {
    selectClick($event, v, i) {
      if (v.isActive) return;
      if (v.num == 0) return;
      let curel = this.$refs.tbLi[i];
      let targetwidth = curel.offsetWidth;
      let moveBar = (52 - targetwidth) / 2;
      this.moveBar = curel.offsetLeft - moveBar;
      for (let v of this.tabBar) {
        v.isActive = false;
      }
      this.tabBar[i].isActive = true;
      this.$emit("selectClick", v[this.seleid]);
    }
  },
  components: {},
  destroyed() {}
};
</script>
<style lang='less' scoped>
.van-navbr-wrap {
  position: fixed;
  width: 100vw;
  height: 54px;
  overflow-x: scroll;
  margin-top: 49px;
  background: #fff;
  scrollbar-width: none;
  -ms-overflow-style: none;
  z-index: 1000;
  left: 0;
  top: 0;
  border-bottom: 1px solid #f0f0f0;
  > ul {
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    li {
      display: flex;
      width: 52px;
      height: 54px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 5px;
      span {
        display: inline-block;
        width: 100%;
        text-align: center;
        color: #5d5d5d;
      }
      .lable {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
        padding: 0 2px;
      }
      .num {
      }
      &.active {
        span {
          color: #0089ff;
        }
      }
      &.nolen {
        opacity: 0.5;
      }
    }
    .move-bar {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 52px;
      height: 3px;
      background: #0089ff;
      transition: all 0.2s;
    }
  }
  &::-webkit-scrollbar {
    display: none;
  }
  &.nozh {
    > ul {
      li {
        .lable {

        }
      }
    }
  }
}
</style>
