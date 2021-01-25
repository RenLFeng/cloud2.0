<template>
  <div class="my-medai-wrap">
    <mt-header :title="filename">
      <mt-button icon="back" slot="left" @click="goBacks">{{$mt('返回')}}</mt-button>
    </mt-header>
    <div class="main">
      <div>
        <ul class="dyg" style="float:left">
          <li v-for="(v,i) in audios" :key="i" @click="selectpaly(v,true)">{{$mt('音轨')}}{{i+1}}</li>
        </ul>
        <ul class="dyg" style="float:right">
          <li v-for="(v,i) in audios" :key="i" @click="selectpaly(v,false)">{{$mt('字幕')}}{{i+1}}</li>
        </ul>
      </div>

      <div class="audio-wrap position-c" v-if="AudioInfo.type=='audio'">
        <audio id="audio" :src="AudioInfo.filepath" ref="mediaobj"></audio>
        <div class="clearfix control-ui">
          <i class="iconfont fl" :class="canplaymedia ?'iconbofang':'iconzanting'" @click="play()"></i>
          <div class="fl progress-wrap" ref="prgs" @click="progressFn($event)">
            <p class="progress">
              <span class="progressing" v-bind:style="{ width: progressBar + '%' }"></span>
            </p>
          </div>
          <span class="time-font fr">{{cTime}}</span>
        </div>
      </div>
      <div class="video-warp" v-if="AudioInfo.type=='video'">
        <div class="video-box position-c">
          <video
            class
            :src="AudioInfo.filepath"
            id="video"
            ref="mediaobj"
            x5-playsinline
            playsinline
            webkit-playsinline="true"
            preload="true"
          >{{$mt('不支持视频播放')}}</video>
          <div class="showsrt">
            <p>{{showcursrt}}</p>
          </div>
        </div>
        <div class="position-b controls">
          <div class="progress-wrap">
            <span class="time-font fl">{{cTime}}</span>
            <p
              class="progress"
              ref="prgs"
              @click="progressFn($event)"
              :style="{background:curcolor}"
            >
              <span
                class="progressing"
                v-bind:style="{ width: progressBar + '%',background:curcolor }"
              ></span>
            </p>
            <span class="time-font fr">{{dTime}}</span>
          </div>
          <div class="tc">
            <i
              class="iconfont contbtn"
              :class="canplaymedia ?'iconbofang':'iconzanting'"
              @click="play()"
            ></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Srt from "@/srt";
import { Progress } from "mint-ui";
import { parseURL } from "@/util";
export default {
  name: "Audio",
  props: {
    AudioInfo: {
      default() {
        return {};
      }
    }
  },
  watch: {},
  data() {
    return {
      ll: 50,
      canplaymedia: true,
      cTime: null,
      dTime: null,
      progressBar: 0,
      playfirst: false,

      myAudio: null,
      playnum: 0,
      cancount: true,
      curaudioobj: {},
      palyaudioobj: null,
      audios: [],
      cursrtline: [],
      tempsrts: {},
      showcursrt: "",
      initendtime: 0,
      srtindex: 0,
      palyend: false,

      curstates: true,
      selectid: 0,
      autoplay: true
    };
  },
  computed: {
    // showcursrt(){
    //   return this.cursrtline[this.srtindex].subtitle
    // },
    curcolor() {
      let planum = JSON.parse(JSON.stringify(this.playnum));
      if (planum >= 5) {
        planum = 5;
      }
      let colors = ["#ebf6ff", "#8dcbff", "#65b9ff", "#279dff", "#006fcc"];
      if (!planum) return "#fff";
      for (let key in colors) {
        if (key == planum) {
          return colors[key - 1];
        }
      }
      return "#006fcc";
    },
    filename() {
      if (this.AudioInfo.filename) {
        return this.AudioInfo.filename;
      }
      if(this.AudioInfo.type == "video"){
        return this.$mt('视频');
      }
      return this.$mt('音频');
    }
  },
  created() {},
  mounted() {
    console.log("audio mounted", this.AudioInfo);
    this.playfirst = true;
    this.canplaymedia = true;
    if (this.AudioInfo.type == "video" && this.AudioInfo.audios.length) {
      this.playnum = this.AudioInfo.viewnum;
      this.audios = this.AudioInfo.audios;
      this.curaudioobj = this.AudioInfo.audios[0];
      this.selectid = this.curaudioobj.id;
      this.intloadsrt();
      return;
    }
    this.addEventListeners();
    this.doplayfirst();
  },
  methods: {
    addEventListeners: function() {
      const self = this;
      self.$refs.mediaobj.addEventListener("timeupdate", self._currentTime);
      self.$refs.mediaobj.addEventListener("canplay", self._durationTime);
      self.$refs.mediaobj.addEventListener("ended", self.endedFn);
    },
    removeEventListeners: function() {
      const self = this;
      self.$refs.mediaobj.removeEventListener("timeupdate", self._currentTime);
      self.$refs.mediaobj.removeEventListener("canplay", self._durationTime);
      self.$refs.mediaobj.addEventListener("ended", self.endedFn);
      this.stoppaly();
    },

    _currentTime: function() {
      const self = this;
      self.cTime = this.toMs(self.$refs.mediaobj.currentTime);
      self.progressBar =
        (self.$refs.mediaobj.currentTime / self.$refs.mediaobj.duration) * 100;
      // console.log(" self.cTime", self.$refs.mediaobj.currentTime);
      if (this.AudioInfo.type == "video" && this.AudioInfo.audios.length) {
        if (self.$refs.mediaobj.currentTime > this.initendtime) {
          // console.log("initendtime======", this.initendtime);
          // console.log("currentTime>>>>>>", self.$refs.mediaobj.currentTime);
          this.srtindex++;
          this.initcursrt();
        }
      }
    },
    _durationTime: function() {
      const self = this;
      self.dTime = this.toMs(self.$refs.mediaobj.duration);
    },
    doplayfirst() {
      if (this.canplaymedia && this.playfirst) {
        if (this.AudioInfo.type == "video") {
          if (this.AudioInfo.audios.length) {
            this.srtindex = 0;
            this.initcursrt();
          }
          this.initplayvideo();
        } else {
          this.$refs.mediaobj.play();
          this.canplaymedia = false;
        }
        this.playfirst = false; //! 仅自动播放一次，避免循环播放
      }
    },
    initplayvideo(time = 0) {
      this.$refs.mediaobj.load();
      if (!this.autoplay) {
        this.$refs.mediaobj.play();
      }
      if (this.AudioInfo.audios.length) {
        this.$refs.mediaobj.muted = true;
        this.playaudio(this.curaudioobj.audiopath, time);
      }
    },
    playaudio(audiopath, time = 0) {
      this.palyaudioobj = new Audio();
      this.palyaudioobj.src = audiopath;
      if (time) {
        console.log("selectpaly", time);
        setTimeout(() => {
          this.palyaudioobj.currentTime = time;
        }, 10);
        console.log(
          "selectpaly this.palyaudioobj.currentTime",
          this.palyaudioobj.currentTime
        );
      }
      this.palyaudioobj.play();
      console.log("curaudioobj", this.curaudioobj.audiopath);
    },
    selectpaly(v, state) {
      this.curstates = state;
      if (this.curstates) {
        this.selectid = v.id;
        let curtime = this.$refs.mediaobj.currentTime;
        // let curtime = this.palyaudioobj.currentTime;
        this.stoppaly();
        this.playaudio(v.audiopath, curtime);
      } else {
        this.selectid = v.id;
        let id = v.id;
        if (this.tempsrts[id]) {
          this.cursrtline = this.tempsrts[id];
          this.showcursrt = this.cursrtline[this.srtindex].subtitle;
        } else {
          this.loadsrt(v.srtpath);
        }
      }
    },
    play() {
      this.autoplay = true;
      if (this.canplaymedia) {
        if (this.palyend) {
          this.stoppaly();
          this.srtindex = 0;
          this.initcursrt();
          this.initplayvideo();
          this.canplaymedia = false;
          this.palyend = false;
          return;
        }
        this.$refs.mediaobj.play();
        this.canplaymedia = false;
        if (this.palyaudioobj != null) {
          this.palyaudioobj.play();
        }
      } else {
        this.$refs.mediaobj.pause();
        this.canplaymedia = true;
        if (this.palyaudioobj != null) {
          this.palyaudioobj.pause();
        }
      }
    },
    progressFn(e) {
      const self = this;
      let preTime = self.$refs.mediaobj.currentTime;
      var e = e || e.window.event;
      var x = e.offsetX;
      var w = self.$refs.prgs.offsetWidth;
      var p = x / w;
      self.progressBar = p * 100;
      self.$refs.mediaobj.currentTime = self.$refs.mediaobj.duration * p;

      if (self.$refs.mediaobj.duration * p > preTime) {
        this.cancount = false;
      }
      if (this.palyaudioobj != null) {
        this.palyaudioobj.currentTime = self.$refs.mediaobj.currentTime;
        for (let i = 0; i < this.cursrtline.length; i++) {
          let v = this.cursrtline[i];
          if (v.startsec > self.$refs.mediaobj.currentTime) {
            this.srtindex = i;
            this.initcursrt();
            return;
          }
        }
      }
      console.log(
        self.$refs.mediaobj.currentTime,
        "======",
        self.$refs.mediaobj.duration
      );
    },
    endedFn() {
      if (this.AudioInfo.type == "video") {
        if (this.AudioInfo.audios.length) {
          this.palyend = true;
        }
      }
      if (this.AudioInfo.type == "audio") {
        this.progressBar = 0;
        this.$refs.mediaobj.currentTime = 0;
      }
      if (this.cancount) {
        this.playnum++;
        if (this.AudioInfo.cb) {
          this.AudioInfo.cb();
        }
      }
      this.canplaymedia = true;
    },
    toMs(time) {
      var m = Math.floor(time / 60);
      m = m > 9 ? m : "0" + m;
      var s = Math.floor(time % 60);
      s = s > 9 ? s : "0" + s;
      return m + ":" + s;
    },
    goBacks() {
      this.removeEventListeners();
      //  this.$back();
      this.$emit("Backs", {});
    },
    intloadsrt() {
      if (this.tempsrts[this.curaudioobj.id]) {
        this.cursrtline = this.tempsrts[this.curaudioobj.id];
        this.initcursrt();
        this.initplayvideo();
        console.log(" hhhhccc  tempsrts", this.tempsrts);
      } else {
        this.$http
          .get(this.curaudioobj.srtpath)
          .then(res => {
            let vsrt = new Srt(res.data);
            for (let i = 0; i < vsrt.lines.length; i++) {
              let v = vsrt.lines[i];
            }
            this.cursrtline = vsrt.lines;
            this.initcursrt();
            if (!this.tempsrts[this.curaudioobj.id]) {
              this.tempsrts[this.curaudioobj.id] = this.cursrtline;
            }

            if (this.canplaymedia && this.playfirst) {
              this.addEventListeners();
              if (!this.autoplay) {
                this.canplaymedia = false;
              }
              this.playfirst = false;
            }
            this.initplayvideo();
            console.log("tempsrts", this.tempsrts);
          })
          .catch(err => {});
      }
    },
    loadsrt(srtpath) {
      this.$http
        .get(srtpath)
        .then(res => {
          let vsrt = new Srt(res.data);
          this.cursrtline = vsrt.lines;
          this.showcursrt = this.cursrtline[this.srtindex].subtitle;
        })
        .catch(err => {});
    },
    initcursrt() {
      this.initendtime = this.cursrtline[this.srtindex].endsec;
      this.showcursrt = this.cursrtline[this.srtindex].subtitle;
    },
    stoppaly() {
      if (this.palyaudioobj != null) {
        this.palyaudioobj.pause();
        this.palyaudioobj = null;
      }
    }
  },
  components: {
    [Progress.name]: Progress
  },
  destroyed() {}
};
</script>

<style scoped lang="less">
.my-medai-wrap {
  .main {
    width: 100%;
    height: 93vh;
    min-height: 93vh;
    background: rgba(0, 0, 0, 1);
    .dyg {
      color: #fff;
    }
    .audio-wrap {
      width: 90%;
      .control-ui {
        background: #fff;
        height: 50px;
        line-height: 50px;
        border-radius: 13px;
        padding: 0 10px;
        > i {
          font-size: 38px;
          color: #0089ff;
        }
        .progress-wrap {
          width: 64%;
          position: absolute;
          top: 50%;
          left: 49%;
          -webkit-transform: translate(0, -50%);
          transform: translate(-50%, -50%);
          .progress {
            position: absolute;
            width: 100%;
            height: 5px;
            left: 0;
            top: 0;
            background: #ccc;
            border-radius: 20px;
            .progressing {
              position: absolute;
              // width:50%;
              left: 0;
              height: 5px;
              background: #0089ff;
            }
          }
        }
        .time-font {
          font-size: 16px;
        }
      }
    }
    .video-warp {
      height: 100%;
      width: 100%;
      .video-box {
        width: 100%;
      }
      #video {
        width: 100%;
        height: 211px;
      }
      .controls {
        width: 100%;
        height: 130px;
        bottom: 0;
        display: flex;
        flex-direction: column;
        padding: 0 10px;
        .progress-wrap {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          height: 50px;
          .progress {
            position: relative;
            width: 75%;
            height: 8px;
            margin: 0 auto;
            background: #ebf6ff;
            border-radius: 30px;
            .progressing {
              position: absolute;
              left: 0;
              height: 100%;
              background: #0089ff;
              border-radius: 30px;
              &::before {
                content: "";
                position: absolute;
                width: 100%;
                height: 100%;
                left: 0;
                background: #0000004f;
                border-radius: 30px;
              }
              &::after {
                content: "";
                position: absolute;
                width: 26px;
                height: 26px;
                background: #0089ff;
                border-radius: 26px;
                right: -10px;
                top: 50%;
                margin-top: -13px;
              }
            }
          }
          .time-font {
            font-size: 14px;
            color: #fff;
          }
        }
        .contbtn {
          font-size: 63px;
          color: #fff;
        }
      }
    }
  }
  .dyg {
    font-size: 18px;
  }
  .showsrt {
    color: #fff;
    font-size: 18px;
    text-align: center;
    padding-top: 10px;
  }
  video::-webkit-media-controls {
    display: none !important;
  }
}
</style>
