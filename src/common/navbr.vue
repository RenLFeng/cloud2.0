<template>
  <div class="van-navbr-wrap">
    <div>
      <div class="">
        <ul class="overflow-scroll">
          <li
            class="ellipse"
            v-for="(v,i) in items"
            :key="i"
            :class="v.isActive?'active':''"
            ref="tbLi"
          >
            <span class="lable font18" @click="change($event,v,i)">{{$mt(v.label)}}</span>
            <!-- <span class="num fontxs">{{v.num}}</span> -->
          </li>
          <span class="move-bar" ref="movebar" :style="`left:${moveBar}px`"></span>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
      items:{
          default(){
              return []
          }
      }
  },
  data() {
    return {
        moveBar:24
    };
  },
  computed: {},
  created() {},
  mounted() {},
  watch: {},
  methods: {
      change(){}
  },
  components: {}
};
</script>

<style scoped lang="less">
.van-navbr-wrap {
  .main {
    position: relative;
    left: 0;
    top: 0;
    z-index: 99;
    width: 100vw;
    height: 54px;
    overflow-x: scroll;
    margin-top: 49px;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
    > ul {
      position: absolute;
      left: 0;
      top: 0;
      display: flex;
      li {
        display: flex;
        width: 100px;
        height: 54px;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        span {
          width: 100%;
          text-align: center;
          overflow-x: auto;
          color: #5d5d5d;
        }
        .lable {
        }
        .num {
        }
        &.active {
          span {
            color: #0089ff;
          }
        }
      }
      .move-bar {
        position: absolute;
        left: 0;
        bottom: 5px;
        width: 52px;
        height: 3px;
        background: #0089ff;
        transition: all 0.2s;
      }
    }
  }
}
</style>
