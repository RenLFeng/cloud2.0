<template>
  <div class="item class-banke-list">
    <div class="item" :class="classitem.ordernum?'act':''">
      <div class="reddot-Tips-wrap" :class="classitem.eventmsgs && homeEventmsgs?'reddot-Tips':''">
        <img class="itemavatar" :src="classitem.avatar" :onerror="$defaultImg('banke')" />
      </div>
      <div class="itempart">
        <div class="wrap">
          <div class="itemtitle ellipse">
            <span class="maxlong maxlong8 color0">
              <span v-if="classitem.inclass" class="inclass">{{$mt('正在上课')}}</span>
              {{titname}}
              <!-- <span
                v-if="!end"
                class="settop font-xxs tc colora"
                @click.stop="showMenu(classitem)"
              >{{classitem.ordernum?'取消置顶':'置顶'}}</span>-->
            </span>
            <span class="membernum fonttiny fr color9" v-if="end">{{classitem.membernum}}{{$mt('人')}}</span>
          </div>
          <div class="font-xs ellipse">
            <span class="maxlong color0 font-xxs">{{$mt('教师')}}：{{classitem.username}}</span>
            <span class="font-xxs" v-if="showJoinClass">{{classitem.name}}</span>
            <span class="class-nmuber font-xs fr" v-if="end">{{$mt('班课号')}}:{{classitem.id}}</span>
          </div>

          <div
            v-if="classitem.courseid ||classitem.courseid==0 "
            class="font-xs ellipse font-xxs"
            :class="{'Notice':classitem.info}"
          >{{$mt('公告')}}: {{classitem.info?classitem.info:$mt('暂无公告')}}</div>
        </div>
      </div>
      <span class="go" v-if="!end && showEditicon">
        <i
          class="iconfont"
          :class="{'iconjiantou1':!isCreate,'iconjiantou':isCreate}"
          @click.stop="showMenu(classitem)"
          v-if="canShowIcon"
        ></i>
        <i
          v-if="selection"
          class="iconfont iconok- position-r selection"
          :class="classitem.isAct?'act':''"
          @click.stop="seleitem(classitem)"
        ></i>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: "BankeSimple",
  props: {
    classitem: {
      type: Object,
      default() {
        return {
          name: "",
          avatar: "",
          coursename: ""
        };
      }
    },
    showEditicon:{
      default: true
    },
    end: {
      default: false
    },
    homeEventmsgs: {
      default: false
    },
    isCreate: {
      default: true
    },
    selection: {
      default: false
    },
    cfrom: {
      default: ''
    }
  },
  data() {
    return {};
  },
  computed: {
    canShowIcon(){
      if(this.cfrom=='big' || this.selection){
        return false
      }
      return true;
    },
    showJoinClass() {
      if (!this.end && !this.isCreate && this.classitem.courseid) {
        return true;
      } else {
        return false;
      }
    },
    titname() {
      if (this.isCreate) {
        return this.classitem.name;
      } else {
        if (!this.classitem.courseid) {
          return this.classitem.name;
        } else {
          return this.classitem.coursename;
        }
      }
    },
    defaultimg() {
      var srcstr = 'this.src="';
      srcstr += "/assets/banke_default.png";
      srcstr += '"';
      return srcstr;
    },
    hasnotice() {
      return true;
    }
  },
  methods: {
    showMenu(item) {
      if (!this.isCreate) {
        this.$emit("showMenu", item);
      } else {
        this.$emit("gocourse", item);
      }
    },
    seleitem(item) {
      item.isAct = !item.isAct;
      this.$emit("selectionClick", item);
    }
  }
};
</script>
<style lang="less" scoped>
.class-banke-list {
  .item {
    position: relative;
    border-top: 1px solid #f0f0f0;
    padding: 18px 31px 18px 80px;
    background: #fff;
    border-radius: 0.26667rem;
    .reddot-Tips-wrap {
      position: absolute;
      width: 55px;
      left: 10px;
      top: 50%;
      transform: translate(0, -50%);
      background-color: white;
      .itemavatar {
        width: 100%;
        border-radius: 3px;
        object-fit: cover;
      }
    }

    .itempart {
      width: 100%;
      .wrap {
        > div {
          .class-nmuber {
            margin-left: 10px;
          }
        }
        .itemtitle {
          font-size: 18px;
          .settop {
            display: inline-block;
            width: 34px;
            height: 18px;
            background: rgba(255, 255, 255, 1);
            border: 1px solid rgba(170, 170, 170, 1);
            border-radius: 4px;
            line-height: 18px;
          }
          .membernum {
          }
        }
        .inclass {
          color: white;
          border-radius: 3px;
          background-color: #0089ff;
          font-size: 16px;
          padding: 2px 5px;
          height: 25px;
          display: inline-block;
        }
        .Notice {
          color: #ff8900;
        }
      }
    }
    .go {
      position: absolute;
      right: 7px;
      top: 50%;
      transform: translate(0, -50%);
      color: #aaaaaa;
      .iconfont {
        font-size: 30px;
      }
      .selection.act {
        color: #ff8900;
      }
    }
    &.act {
      background: #f7f5f5;
    }
  }
}
</style>
<style scoped>
</style>