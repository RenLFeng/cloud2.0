<template>
  <div class="repository-wrap">
    <div class="main">
      <BankeZiyuan :cfromCloud="cfromCloud" :cfromprogram="cfromprogram" :role="role" :cfromzy="cfromzy"></BankeZiyuan>
    </div>
  </div>
</template>

<script>
const BankeZiyuan = () => import("@/views/BankeZiyuan");
import { parseURL } from "@/util";
export default {
  props: {
    role: {
      default: 0
    },
    cfromprogram: {
      default: 'cloud'
    },
  },
  data() {
    return {
      cfromCloud:true,
      cfromzy:false,
      cfrompage: {}
    };
  },
  computed: {
  },
  created() {
    const UrlParams = parseURL(window.location.href);
  },
  mounted() {},
  watch: {},
  methods: {},
   destroyed: function() {
sessionStorage.removeItem("mediaxunlain");
  },
  components: { BankeZiyuan },
    beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$nextTick(() => {
        if(from.fullPath.indexOf('zuoyenew')>=0){
          vm.cfromCloud=false;
           vm.cfromzy=true;
        }
      });
    });
  }
};
</script>

<style scoped lang="less">
.repository-wrap {
  .main {
    .asdd{}
  }
}
</style>
