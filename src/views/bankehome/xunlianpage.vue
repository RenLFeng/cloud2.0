<template>
  <div class="xunliana-wrap">
    <mt-header :title="titname" class="mint-header-f">
      <mt-button icon="back" slot="left" @click="back()">{{$mt('返回')}}</mt-button>
    </mt-header>
      <div class="van-navbr-wrap" v-if="courses.length">
      <ul>
        <li
          v-for="(v,i) in courses"
          :key="i"
          :class="v.isActive?'active':''"
          @click="selectClick($event,v,i)"
          ref="tbLi"
        >
          <span class="lable font18">{{v.label}}</span>
          <!-- <span class="num fontxs">{{v.num}}</span> -->
        </li>
        <span class="move-bar" :style="`left:${moveBar}px`"></span>
      </ul>
    </div>
    <div class="main main-f overflow-scroll">

    </div>
  </div>
</template>

<script>
import nativecode from "@/nativecode";
export default {
  props: {},
  data() {
    return {
      courseid: 0,
        courses: [
      ],
      moveBar:0,
    };
  },
  computed: {
      titname(){
          return this.$mt('训练');
      },
    user() {
      return this.$store.getters.curuser;
    }
  },
  created() {
    this.fabuRenwuQ();
  },
  mounted() {},
  watch: {},
  methods: {
    fabuRenwuQ() {
      var url = "/api/course/query";
      this.$http
        .post(url, {
          where: {
            states: {
              ">": 0
            },
            userid: this.user.id
          }
        })
        .then(res => {
          if (res.data.code == "0") {
            let courses = res.data.data;
            if(courses.length){
                  for(let key in  courses){
                let item=courses[key];
                    this.courses.push({
                        id:key,
                        label:item.name,
                        isActive:!key?true:false,
                        item:item,
                    })    
            }
            }
          
          }
        })
        .catch(err => {});
    },
      selectClick(e, v, i) {
      if (!v.num) return;
      let curel = this.$refs.tbLi[i];
      this.moveBar = curel.offsetLeft;
      console.log(this.moveBar);
    //   this.filterType = v.id;

    //   // return;
    //   // let ev = e || window.event;
    //   // console.log(ev);
    //   // this.$nextTick(()=>{
    //   // })
    //   for (let v of this.tabBar) {
    //     v.isActive = false;
    //   }
    //   this.tabBar[i].isActive = true;
    //   this.filterData(this.filterType);
    },
    courseClick(item) {
      this.courseid = item.id;
    },
    onCalce() {},
    back() {
      this.$emit("calce", true);
    }
  },
  components: {}
};
</script>

<style scoped lang="less">
.xunliana-wrap {
  background: #fff;
   .van-navbr-wrap {
    position: fixed;
    z-index: 99;
    width: 100vw;
    height: 54px;
    overflow: hidden;
    margin-top: 49px;
    background: #fff;
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
        span {
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
        bottom: 0;
        width: 52px;
        height: 3px;
        background: #0089ff;
      }
    }
  }
  .main {
    height: 94vh；
  }
}
</style>
