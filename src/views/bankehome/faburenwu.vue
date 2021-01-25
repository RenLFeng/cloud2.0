<template>
  <div class="faburenwu-wrap">
    <mt-header :title="$mt('发布任务')" class="mint-header-f">
      <mt-button icon="back" slot="left" @click="back()">{{$mt('返回')}}</mt-button>
    </mt-header>
    <div class="main main-f overflow-scroll">
      <p class="tit color9" >{{$mt('请选择一个课程')}}</p>
      <div v-for="(v,i) in courses" :key="i" class="citem" @click="courseClick(v)">
        <div>
          <img class="itemavatar" :src="v.avatar" :onerror="$defaultImg('banke')" />
          <span class="font18 name">{{v.name}}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import nativecode from "@/nativecode";
export default {
  props: {},
  data() {
    return {
      courses: [],
      courseid: 0
    };
  },
  computed: {
    isAPP() {
      if (
        nativecode.platform == "exsoftandroid" ||
        nativecode.platform == "exsoftios"
      ) {
        return true;
      }
      return false;
    },
    canShow() {
      if (this.user.role >= 10) {
        return true;
      }
      return false;
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
            this.courses = res.data.data;
          }
        })
        .catch(err => {});
    },
    courseClick(item) {
      this.courseid = item.id;
      let tourl = "/coursehome/" + item.id;
      this.$store.commit("setRouterForward", true);
      this.$router.push(tourl);
       this.$store.commit("SET_FABURENWU_CLICK", true);
      this.$store.commit("SET_ZYNEW_BACK_STATE", 3);
    },
    onCalce() {},
    back() {
      this.$store.commit("SET_FABURENWU_CLICK", false);
      this.$emit("calce", true);
    }
  },
  components: {}
};
</script>

<style scoped lang="less">
.faburenwu-wrap {
  background: #fff;
  .main {
    height: 94vh;
    .tit{
      padding: 10px;
      background: #f0f0f0;
    }
    .citem {
      border-bottom: 1px solid #f0f0f0;
      padding: 10px;
      .itemavatar {
        width: 60px;
        height: 60px;
      }
      .name {
        padding-left: 10px;
      }
    }
  }
}
</style>
