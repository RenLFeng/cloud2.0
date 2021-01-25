<template>
  <div>
    <mt-header :title="$mt('昵称')">
      <mt-button icon="back" @click="$back" slot="left">{{$mt('返回')}}</mt-button>

      <mt-button slot="right" :disabled="savedisable" @click="dosave">{{$mt('保存')}}</mt-button>
    </mt-header>

    <div class="textline tc">
      <input
        v-model="myname"
        :placeholder="$mt('填写您的个人昵称')"
        autocomplete="off"
        class="textinput fontnormal"
        @blur="$setInputScroll"
      />
      <div class="tl" style="margin-top:5px;">{{$mt('设置您的个人昵称')}}</div>
    </div>
  </div>
</template>

<script>
import { Indicator, Toast, MessageBox } from "mint-ui";
import commontools from "../commontools";
import nativecode from "@/nativecode";
export default {
  name: "MineNameSet",
  data() {
    return {
      myname: this.getUserName()
    };
  },
  computed: {
    savedisable() {
      var oname = this.getUserName();
      if (oname == this.myname) {
        return true;
      }
      if (!this.myname) {
        return true;
      }
      return false;
    }
  },
  methods: {
    getUserName: function() {
      var us = this.$store.getters.curuser;
      if (us && us.name) {
        return us.name;
      }
      return "";
    },
    dosave() {
      var url = "/api/api/userUpdateInfo";
      Indicator.open(this.$mt("保存中"));
      this.$http
        .post(url, {
          name: this.myname
        })
        .then(res => {
          Indicator.close();

          if (res.data.code == 0) {
            //! success
            var us = this.$store.getters.curuser;
            if (us) {
               console.log("userUpdateInfo", us);
              var usclone = commontools.clone(us);
              usclone.name = this.myname;
              this.$store.commit("setLoginUser", usclone);
              let curuser = {};
              let obj = {
                data: usclone
              };
              nativecode.jsFn("rename", obj);
              this.$back();
            }
          } else {
            Toast(res.data.msg);
          }
        })
        .catch(() => {
          Indicator.close();
        });
    }
  },
  created() {}
};
</script>

<style scoped>
.textline {
  margin: 20px;
}

.textinput {
  border: none;
  border-bottom: 1px solid #d3d3d3;

  width: 100%;
  background: transparent;
}
</style>