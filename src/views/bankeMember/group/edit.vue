<template>
  <div class="group-edit-worp">
    <mt-header :title="title" class="mint-header-f">
      <mt-button slot="left" @click="gobacks" v-if="canedit">{{$mt('取消') }}</mt-button>
      <mt-button slot="left" @click="gobacks" v-else>返回</mt-button>
      <mt-button slot="right" @click="savesubgroup" v-if="canedit">{{$mt('确认')}}</mt-button>
    </mt-header>
    <div class="main main-f">
      <div>
        <P class="name-tit">方案名称</P>
        <mt-field v-model="groupName" :disabled="!canedit" class="name"></mt-field>
        <!-- <p class="name">{{EditItemObj.name}}</p> -->
      </div>
      <div class="Explain">
        <p>连接到大屏时，按小组名分配小组大屏。</p>
        <p>共{{allMemBers.length}}人，划分为{{tempData.length}}个小组</p>
      </div>
      <div class="group-list-main">
        <GroupList
          :items="tempData"
          :canedit="canedit"
          @changeFn="onChangeFn"
          @delectFn="ondelectFn"
          @addMembersFn="onaddMembersFn"
          @delectMemberFn="ondelectMemberFn"
          :allMemBers="allMemBers"
          :isteacher="isteacher"
        />
      </div>
    </div>
    <div class="button-worp" v-if="canedit">
      <mt-button
        class="button-auto-87"
        @click="addGroup"
      >添加新组 ({{allMemBers.length-count}} 名成员未分配小组)</mt-button>
    </div>
    <mt-popup
      v-model="popuoMembersList"
      position="right"
      class="mint-popup"
      :modal="false"
      style="background:#f0f0f0;"
      v-if="canedit"
    >
      <MembersList
        :allMemBers="allMemBers"
        :tempData="tempData"
        :addMembersItem="addMembersItem"
        @hideMemberpageFn="hideMemberpage"
        @addMemberFn="onaddMemberFn"
      />
    </mt-popup>
  </div>
</template>

<script>
import { Indicator, Toast, MessageBox } from "mint-ui";
import GroupList from "./groupList";
import MembersList from "./memberslist";
export default {
  name: "",
  props: {
    EditItem: {
      default() {
        return {};
      }
    },
    allMemBers: {
      default() {
        return [];
      }
    },
    isteacher: {
      default: true
    },
    canedit: {
      default() {
        return true;
      }
    }
  },
  watch: {
    EditItem: function(newValue, oldValue) {
      this.EditItemObj = newValue;
      this.querysubgroup();
    }
  },
  components: {
    GroupList,
    MembersList
  },
  data() {
    return {
      changeState: false,
      EditItemObj: {}, //分组item
      tempData: [], //小组list
      popuoMembersList: false,
      count: 0,
      addMembersItem: {},
      addMembersItem2: {},
      groupName: "",
      groupnameindex: 1,

      deletegroupIds: []
    };
  },
  computed: {
    noMember() {
      let nub = 0;
      nub =
        this.allMemBers.length - this.count
          ? this.allMemBers.length - this.count
          : 0;
      return nub;
    },
    title() {
      if (this.canedit) {
        return "编辑分组方案";
      }
      return "分组方案";
    }
  },
  methods: {
    //查询小组
    querysubgroup() {
      this.$http
        .post("/api/group/querysubgroup", {
          groupid: this.EditItemObj.id,
          order: "asc",
          page: 0,
          pagesize: 50
        })
        .then(res => {
          if (res.data.code == "0") {
            this.EditSelect = false;
            this.popuoEdit = true;
            this.tempData = res.data.data;
            this.groupName = this.EditItemObj.name;
            for (let v of this.tempData) {
              v.files = [];
              v.members = JSON.parse(v.members);
              for (let i of v.members) {
                let bfound = false;
                for (let item of this.allMemBers) {
                  if (i == item.memberuserid) {
                    v.files.push({
                      id: i,
                      img: item.avatar,
                      name: item.name
                    });
                    item.isTrue = true;
                    item.groupName = v.name;
                    this.count++;
                    bfound = true;
                    break;
                  }
                }
                if (!bfound) {
                  //! 已不在班课中
                  v.files.push({
                    id: i,
                    img: "",
                    name: "未知成员"
                  });
                }
              }
            }

            console.log(" this.subgroupData", this.tempData);
          } else {
          }
          Indicator.close();
        })
        .catch(error => {
          Indicator.close();
        });
    },
    //确定提交编辑
    savesubgroup() {
      if (this.groupName != this.EditItemObj.name) {
        this.changeState = true;
      }
      if (!this.groupName) {
        Toast("请输入分组名");
        return;
      }
      if (!this.changeState) {
        this.$alert({
          msg: "你没有修改的信息"
        });
        return;
      }
      this.$confirm({
        msg: "您确定要修改信息吗",
        docb: () => {
          let obj = [];
          for (let v of this.tempData) {
            if (v.id) {
              obj.push({
                id: v.id,
                groupid: v.groupid,
                name: v.name,
                membersnum: v.membersnum,
                members: JSON.stringify(v.members)
              });
            } else {
              obj.push({
                groupid: v.groupid,
                name: v.name,
                membersnum: v.membersnum,
                members: JSON.stringify(v.members)
              });
            }
          }
          this.$http
            .post("/api/group/savesubgroup", {
              subgroups: [...obj]
            })
            .then(res => {
              if (res.data.code == "0") {
                // Toast("成功");
                this.changeState = false;
                // this.querysubgroup();
                if (this.groupName != this.EditItemObj.name && this.groupName) {
                  this.EditItemObj.name = this.groupName;
                }
                if (this.deletegroupIds.length) {
                  this.deletegroup();
                }
                this.$emit("editBack", { state: false, type: 1 });
                this.$emit("setsubgroupmnum", {
                  id: this.EditItem.id,
                  bankeid: this.EditItem.bankeid,
                  subgroupmnum: this.tempData.length,
                  subgroupnum: this.count,
                  name: this.EditItemObj.name
                });
                this.count = 0;
              } else {
                Toast("失败");
              }
            })
            .catch(err => {
              Toast("异常11");
            });
        }
      });
    },

    //取消编辑
    gobacks() {
      if (!this.canedit) {
        this.$emit("editBack", { state: false, type: 0 });
        return;
      }

      if (this.groupName != this.EditItemObj.name) {
        this.changeState = true;
      }
      if (this.changeState) {
        console.log("您有未保存的信息", this.tempData);
        this.$confirm({
          msg: "你有未保存的修改,是否退出",
          docb: () => {
            this.changeState = false;
            this.tempData = [];
            this.count = 0;
            for (let item of this.allMemBers) {
              item.isTrue = false;
              item.groupName = "";
            }
            this.groupName = this.EditItemObj.name;
            this.$emit("editBack", { state: false, type: 1 });
          }
        });
      } else {
        this.count = 0;
        for (let item of this.allMemBers) {
          item.isTrue = false;
          item.groupName = "";
        }
        this.$emit("editBack", { state: false, type: 1 });
      }
    },
    //添加成员btn
    onaddMembersFn(item) {
      this.addMembersItem = item;
      this.len = item.files ? item.files.length : 0;
      this.popuoMembersList = true;
      console.log("添加成员", this.addMembersItem);
    },
    //改名
    onChangeFn(obj) {
      this.changeState = obj.changeState;
      this.tempData = obj.groupLists;
    },
    //添加新组
    addGroup() {
      this.changeState = true;
      let gname = "分组";
      gname += this.tempData.length + 1 + "";
      let obj = {
        groupid: this.EditItemObj.id,
        name: gname,
        membersnum: 0,
        members: "[]"
      };
      // Toast("成功");
      obj.members = JSON.parse(obj.members);
      obj.files = [];
      this.tempData.push(obj);
      // this.$http
      //   .post("/api/group/savesubgroup", {
      //     subgroups: [obj]
      //   })
      //   .then(res => {
      //     if (res.data.code == "0") {
      //       Toast("成功");
      //       obj.members = JSON.parse(obj.members);
      //       obj.files=[];
      //       this.tempData.push(obj);
      //       // this.querysubgroup();
      //     } else {
      //       Toast("失败");
      //     }
      //   })
      //   .catch(err => {
      //     Toast("异常");
      //   });
    },
    //页面删除小组
    ondelectFn(index) {
      let item = this.tempData[index];
      console.log("删除小组", item);
      this.$confirm({
        msg: "您确定要删除吗",
        docb: () => {
          this.changeState = true;
          if (item.id) {
            this.deletegroupIds.push(item.id);
          }
          this.ondelectgroupMemberFn(item);
          this.tempData.splice(index, 1);
        }
      });
    },
    //实际删除小组
    deletegroup() {
      for (let v of this.deletegroupIds) {
        this.$http
          .post("/api/group/deletegroup", {
            subgroupid: v
          })
          .then(res => {
            if (res.data.code == 0) {
            } else {
            }
            console.log(res);
          })
          .catch(() => {});
      }
    },
    //删除成员
    ondelectMemberFn(v) {
      for (let item of this.allMemBers) {
        if (item.memberuserid == this.tempData[v.gindex].members[v.i]) {
          item.isTrue = false;
          item.groupName = "";
        }
      }
      this.changeState = true;
      this.tempData[v.gindex].files.splice(v.i, 1);
      this.tempData[v.gindex].members.splice(v.i, 1);
      this.tempData[v.gindex].membersnum--;
      this.addMembersItem = "";
      this.count--;
      console.log(this.tempData);
      console.log(this.allMemBers);
    },
    //删除小组成员
    ondelectgroupMemberFn(v) {
      if (v.members.length) {
        for (let id of v.members) {
          this.count--;
          v.membersnum--;
          for (let v of this.allMemBers) {
            if (v.memberuserid == id) {
              v.isTrue = false;
              v.groupName = "";
            }
          }
        }
        v.files = [];
        v.members = [];
        this.addMembersItem = "";
        // this.count= this.count-v.members.length;
      }
    },
    //添加成员
    onaddMemberFn(v) {
      console.log(v);
      this.count = 0;
      this.tempData = [];
      for (let item of v) {
        this.tempData.push(item);
      }
      for (let item of this.allMemBers) {
        for (let v of this.addMembersItem.members) {
          if (item.memberuserid == v) {
            item.isTrue = true;
            item.groupName = this.addMembersItem.name;
          }
        }
      }
      for (let v of this.tempData) {
        for (let i of v.members) {
          for (let item of this.allMemBers) {
            if (i == item.memberuserid) {
              this.count++;
            }
          }
        }
      }
      this.popuoMembersList = false;
      this.changeState = true;
    },

    hideMemberpage(v) {
      // for (let item of this.allMemBers) {
      //   for (let v of this.addMembersItem.members) {
      //     if (item.memberuserid == v) {
      //       item.isTrue = true;
      //       item.groupName = this.addMembersItem.name;
      //     }
      //   }
      // }
      if (v.state) {
        for (let i = 0; i < this.tempData.length; i++) {
          let item = this.tempData[i];
          if (item.id == this.addMembersItem.id) {
            for (let j = this.addMembersItem.files.length; j >= this.len; j--) {
              this.tempData[i].files.splice(j, 1);
              this.tempData[i].members.splice(j, 1);
              this.tempData[i].membersnum = this.tempData[i].members.length;
            }
          }
        }
      }
      this.popuoMembersList = v.popup;
    }
  }
};
</script>

<style lang='less' scoped>
.group-edit-worp {
  height: 100%;
  .main {
    height: 86%;
    overflow: scroll;
    .name-tit {
      padding: 10px;
    }
    .name {
      padding: 0px 10px 0px 10px;
      background: #fff;
    }

    .Explain {
      padding: 10px;
    }
  }
  .button-worp {
    position: fixed;
    width: 100%;
    left: 50%;
    bottom: 0;
    transform: translate(-50%, 0);
    background: #f0f0f0;
    padding: 10px 0;
    .mint-button {
      background: #fff;
      border: 1px solid #0089ff;
      border-radius: 20px;
      color: #0089ff;
    }
  }
}
</style>
