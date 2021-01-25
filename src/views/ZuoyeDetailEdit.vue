<template>
  <div class="container">
    <div v-if="readonly">
      <p class="zdetailrl">{{zdetail.ztext}}</p>
      <div v-if="hasattach">
        <div class="attachdesc" v-if="!showZdetail">{{$mt('附件')}}</div>
        <div class="listc">
          <FileAttachList :localfiles="zdetail.localfiles" :isupload="!readonly"></FileAttachList>
        </div>
      </div>
    </div>

    <div v-else style="height:100%;">
      <textarea
        v-model="zdetail.ztext"
        :placeholder="$mt('请输入详情')"
        rows="8"
        class="zdetail"
        :disabled="isScore"
        @input="textChange($event.target.value)"
        @blur="$setInputScroll"
      ></textarea>

      <div class="attachdesc colora font16">{{Enclosure}}</div>
      <div class="listc">
        <FileAttachList
          :urlinfo="urlinfo"
          :localfiles="zdetail.localfiles"
          :isupload="!isScore"
          @fileChange="onfileChange"
        ></FileAttachList>
      </div>
    </div>
  </div>
</template>
<script>
import FileAttachList from "./components/FileAttachList";
export default {
  name: "ZuoyeDetailEdit",
  data() {
    return {
      urlinfo: {
        urlupload: "/api/api/zuoyefileupload",
        urldel: "/api/api/zuoyefiledelete"
      },
    };
  },
  props: {
    zdetail: {
      default() {
        return {
          ztext: "",
          localfiles: []
        };
      }
    },
    readonly: {
      default() {
        return false;
      },
      required: false
    },
    showZdetail: {
      default: false
    },
    isScore: {
      default: false
    },
  },
  watch: {},
  computed: {
    Enclosure() {
      return `${this.$mt('添加附件(%sM以内)',[300])}`;
    },
    savedisable() {
      if (this.zdetail.ztext.length) {
        return false;
      }
      return true;
    },
    hasattach() {
      if (this.zdetail.localfiles.length) {
        return true;
      }
      return false;
    },
  },
  created(){
 
  },
  methods: {
    textChange(e) {
      this.$emit("textChange", true);
    },
    onfileChange(v) {
      this.$emit("textChange", true);
    }
  },
  components: {
    FileAttachList,
  }
};
</script>

<style scoped>
.container {
  overflow: scroll;
  height: 100%;
}

.zdetail {
  /* old:300px */
  max-height: 300px;
  height: 40%;
  padding: 10px;
  font-size: 18px;
  width: 100%;
}
.zdetailrl {
  padding: 10px;
  font-size: 18px;
  width: 100%;
}
.attachdesc {
  padding: 5px 10px;
  font-size: 16px;
  border-bottom: 1px solid #eaeaea;
  border-top: 1px solid #eaeaea;
  text-align: center;
  margin: 10px 0;
}
.listc {
  margin: 10px;
  overflow: visible;
}

.bottommargin {
  height: 100px;
}

[disabled="disabled"] {
  background: #fff;
}

</style>