import axios from 'axios'
import nativecode from "@/nativecode";
import {
  Indicator,
  Toast,
} from "mint-ui";
export const formateTime = (v, type) => {
  let date = new Date();
  if (v) {
    date = new Date(v);
  }
  var y = date.getFullYear() + '';
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m + '';
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d + '';

  var hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  var minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  var second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
  var milliSeconds = date.getMilliseconds();

  // var day = date.getDay();
  if (type == '2') {
    return m + '月' + d + '日';
  } else if (type == '/') {
    return y + '/' + m + '/' + d;
  } else if (type == '-') {
    return `${y}-${m}-${d} ${hour}:${minute}:${second}`
  } else if (type == 'cstr') {
    return '' + y + m + d + ' ' + hour + minute + second
  } else {
    return y + '年' + m + '月' + d + '日';
  }
}
export const Whatweek = (time) => {
  let date = new Date();
  if (time) {
    date = new Date(time);
  }

  var day = date.getDay();
  return timeWeekHummanread(day);
}
export const timeWeekHummanread = v => {
  let wobj = {
    1: '星期一',
    2: '星期二',
    3: '星期三',
    4: '星期四',
    5: '星期五',
    6: '星期六',
    0: '星期日'
  };
  if (wobj[v]) {
    return wobj[v];
  }
  return '';
}
export const getDate = (date, n) => {
  var base = new Date(date).getTime()
  var oneDay = 24 * 3600 * 1000;
  var date = [];
  var data = [Math.random() * 300];
  var time = new Date(base);

  let y = time.getFullYear();
  let m = time.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  let d = time.getDate();
  d = d < 10 ? ('0' + d) : d;

  date.push([y, m, d].join('/'));
  for (var i = 1; i < n; i++) {
    var now = new Date(base -= oneDay);

    let y = now.getFullYear();
    let m = now.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    let d = now.getDate();
    d = d < 10 ? ('0' + d) : d;

    date.push([y, m, d].join('/'));
    // date.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'));
    //data.push(Math.round((Math.random() - 0.5) * 20 + data[i - 1]));
  }
  var newdate = date.reverse()
  // console.log(newdate)
  return newdate;
}
//指定多少天以后的时间
export const getNextDate = (n) => {
  var date = new Date();
  date.setDate(date.getDate() - n);
  return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate()
}


//! cjy: 得到图表数据的日期; 需要占位符，不足0补0， 如 2019/12/01
export const getChartDate = (ndays, date) => {
  let enddate = date ? new Date(date) : new Date(); //!  new Date为本地时区 China Standard Time
  //console.log(enddate);
  let dates = [];
  let basetime = new Date(enddate).getTime();
  let oneday = 24 * 3600 * 1000;
  for (let i = 0; i <= ndays; i++) {
    let cur = new Date(basetime);
    //console.log(cur);
    basetime -= oneday;
    let m = cur.getMonth() + 1;
    let d = cur.getDate();
    let dayarray = [cur.getFullYear() + '', m < 10 ? '0' + m : '' + m,
      d < 10 ? '0' + d : '' + d
    ];
    dates.push(dayarray.join('/'));
  }
  return dates.reverse();
}

// cjy: 纠正移动设备上的拍照旋转文件
export const fixCaptureImage = (file, tofile = false) => {
  return new Promise((resolve, reject) => {
    // 获取图片
    console.log('fixCaptureImage');
    const img = new Image();
    let curl = window.URL.createObjectURL(file)
    console.log('买定离手', curl);
    let oparam = curl;
    let rejectres = null;
    if (tofile) {
      rejectres = file;
    }
    img.src = curl;
    img.onerror = () => reject(rejectres);
    let EXIF = require('exif-js');
    img.onload = () => {
      // 获取图片元数据（EXIF 变量是引入的 exif-js 库暴露的全局变量）
      EXIF.getData(img, function () {
        // 获取图片旋转标志位
        var orientation = EXIF.getTag(this, "Orientation");
        // 根据旋转角度，在画布上对图片进行旋转
        //! test
        console.log('fixLocalImage, orientation: 旋转角度 ' + orientation);
        if (img.width == 0 || img.height == 0) {
          return reject(rejectres);
        }

        //   orientation = 8;
        //! cjy: 因为手机端的拍照像素一般都很大， 这里限制最大值， 方便处理
        let maxwidth = 1920;
        let maxheight = 1080;
        //  maxwidth = maxheight = 200; //! test
        let cwidth = img.width;
        let cheight = img.height;
        if (cwidth > maxwidth) {
          cwidth = maxwidth;
          cheight = cwidth * img.height / img.width;
        }
        if (cheight > maxheight) {
          cheight = maxheight;
          cwidth = cheight * img.width / img.height;
        }

        // if (orientation === 3 || orientation === 6 || orientation === 8)
        {
          const canvas = document.createElement("canvas");

          if (tofile) {
            if (!canvas.toBlob) {
              //! 有些浏览器没有此函数; 例如目前windows使用的cef
              console.log('has no canvas.toBlob');
              return reject(rejectres);
            }
          }

          const ctx = canvas.getContext("2d");
          switch (orientation) {
            case 3: // 旋转180°
              canvas.width = cwidth;
              canvas.height = cheight;
              ctx.rotate((180 * Math.PI) / 180);
              // ctx.drawImage(img, -img.width, -img.height, img.width, img.height);
              ctx.drawImage(img, -cwidth, -cheight, cwidth, cheight);
              break;
            case 6: // 旋转90°
              canvas.width = cheight;
              canvas.height = cwidth;
              ctx.rotate((90 * Math.PI) / 180);
              //  ctx.drawImage(img, 0, -img.height, img.width, img.height);
              ctx.drawImage(img, 0, -canvas.width, canvas.height, canvas.width);
              break;
            case 8: // 旋转-90°
              canvas.width = cheight;
              canvas.height = cwidth;
              ctx.rotate((-90 * Math.PI) / 180);
              // ctx.drawImage(img, -img.width, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, -canvas.height, 0, canvas.height, canvas.width);
              break;
            default:
              canvas.width = cwidth;
              canvas.height = cheight;
              // ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, cwidth, cheight);
              ctx.drawImage(img, 0, 0, cwidth, cheight);
              break;
          }
          // 返回新图片
          if (tofile) {
            canvas.toBlob(file => {
              let cbf = file;
              if (rejectres.name) {
                // file.name = rejectres.name;
                let oldname = rejectres.name;
                let ii = oldname.lastIndexOf('.');
                if (ii > 0) {
                  oldname = oldname.substr(0, ii);
                }
                oldname += '.jpg'; //! 更改文件名后缀
                cbf = new File([file], oldname, {
                  type: 'image/jpeg'
                });
                //cbf.type = 'image/jpeg';
              }
              resolve(cbf)
            }, 'image/jpeg', 0.8)
          } else {
            let imgurl = canvas.toDataURL('image/jpeg', 0.8);
            return resolve(imgurl);
          }

          //canvas.toBlob(file => resolve(file), 'image/jpeg', 0.8)
        }
        // else {
        //   //  return resolve(oparam);
        //     return reject(null);
        // }
      });
    };
  });
}


//! cjy: 分析得分情况
export const parseChartScoreData = (ed, wa, days, enddate) => {
  //! 清空原数据
  ed.xAxis.data = [];
  for (let v of ed.series) {
    v.data = [];
  }

  let datearray = getChartDate(days, enddate);
  ed.xAxis.data = datearray;
  //! 首先对原数据进行按日期归类整理
  let scoredatas = {};
  for (let i = 0; i < wa.length; i++) {
    let cdate = wa[i].countdate;
    if (typeof scoredatas[cdate] == 'undefined') {
      scoredatas[cdate] = [];
    }
    scoredatas[cdate].push(wa[i]);
  }
  //console.log(scoredatas);
  for (let i = 0; i < datearray.length; i++) {
    let scoredata = null; {
      if (scoredatas[datearray[i]]) {
        scoredata = scoredatas[datearray[i]];
      }
    }

    if (!scoredata) {
      scoredata = [];
    }
    for (let v of ed.series) {
      let curdata = 0;
      let usescore = null;
      //console.log(v.matchuserid);
      if (v.matchuserid) {
        //for(let us of scoredata)
        for (let j = 0; j < scoredata.length; j++) {
          let us = scoredata[j];
          //  console.log(us);
          if (us.userid == v.matchuserid) {
            usescore = us;
            break;
          }
        }
      } else {
        if (scoredata.length) {
          usescore = scoredata[0];
        }
      }
      //console.log(usescore);
      if (usescore) {
        if (v.matchcol) {
          if (typeof usescore[v.matchcol] != 'undefined') {
            curdata = Number(usescore[v.matchcol]);
          }
        }
      }
      v.data.push(curdata);
    }
  }
}
export const pingceType = (v) => {
  switch (v) {
    case 1:
      return "判断题";
    case 2:
      return "多项选择题";
    case 3:
      return "单项选择题";
    case 4:
      return "主观题";
    case 5:
      return "写作题";
    case 6:
      return "抢答题";
    case 10:
      return "投票";
  }
}
// export const parseURL = (url, pro = false) => {
//   var str=pro?pro:'?';
//   var query = url && url.split(str)[1]
//   var queryArr = query && query.split('&')
//   var params = {}
//   queryArr &&
//     queryArr.forEach(function (item) {
//       var key = item.split('=')[0]
//       var value = item.split('=')[1]
//       params[key] = value
//     })
//   return params
// }
export const parseURL = (url) => {
  let splitstr = '#/';
  if (url.indexOf('/#/') > 0) {
    splitstr = '/#/';
  }
  var querys = url && url.split(splitstr)
  console.log('parseURL', querys);
  var params = {}
  for (let v of querys) {
    var query = v && v.split('?')[1]
    var queryArr = query && query.split('&')
    queryArr &&
      queryArr.forEach(function (item) {
        var key = item.split('=')[0]
        var value = item.split('=')[1]
        params[key] = value
      })
  }
  console.log('parseURL', params);
  return params
}
//！ cjy： require 方式为导入base64， 不推荐， 太占用资源
export const getFileTypeImg = (typein) => {
  if (typein.length > 6 && typein.lastIndexOf('.') > 0) {
    return typein; //! 已经是路径
  }
  var srcstr = '';
  let type = typein.toLocaleLowerCase();
  switch (type) {
    case 'account':
      srcstr += ("/assets/account_default.png");
      return srcstr;
    case 'banke':
      srcstr += ("/assets/banke_default.png");
      return srcstr;
    case 'zuoye':
      srcstr += ("/assets/zuoye_default.png");
      return srcstr;
    case 'file':
      srcstr += ("/assets/file_default.png");
      return srcstr;
    case 'txt':
      srcstr += ("/assets/file_icon/txt.svg");
      return srcstr;
    case 'rar':
      srcstr += ("/assets/file_icon/rar.svg");
      return srcstr;
    case 'xlsx':
      srcstr += ("/assets/file_icon/xlsx.svg");
      return srcstr;
    case 'docx':
      srcstr += ("/assets/file_icon/docx.svg");
      return srcstr;
    case 'ppt':
      srcstr += ("/assets/file_icon/ppt.svg");
      return srcstr;
    case 'pdf':
      srcstr += ("/assets/file_icon/pdf.svg");
      return srcstr;
    case 'it':
      srcstr += ("/assets/file_icon/IT.svg");
      return srcstr;
    case 'mp4':
      srcstr += ("/assets/file_icon/MP4.png");
      return srcstr;
    case 'mov':
      srcstr += ("/assets/file_icon/MP4.png");
      return srcstr;
    case 'avi':
      srcstr += ("/assets/file_icon/MP4.png");
      return srcstr;
    case 'mp3':
      srcstr += ("/assets/file_icon/MP3.png");
      return srcstr;
    case 'school':
      srcstr += ("/assets/school.png");
      return srcstr;
    case 'folder':
      srcstr += ("/assets/file_icon/folder.svg");
      return srcstr;
    case 'img':
      srcstr += ("/assets/file_icon/default_img.png");
      return srcstr;
    default:
      srcstr += ("/assets/file_default.png");
      break;
  }
  return srcstr;
}

export const defaultImg = (typein) => {
  let ipath = getFileTypeImg(typein);
  var srcstr = 'this.src="';
  srcstr += ipath;
  srcstr += '"';
  return srcstr;

}
export const getCollectionType = (v) => {
  switch (v) {
    case 1:
      return "资源";
    case 2:
      return "签到";
    case 3:
      return "作业";
    case 4:
      return "评测";
    case 100:
      return "板书";
    default:
      return "未知类型";
  }
}

export const getZYFileTypeIcon = (namein) => {
  return getFileTypeImg(getZYFileType(namein));
}

export const getZYFileType = (namein) => {
  let r = '';
  let name = namein || '';
  if (name.length > 6) {
    name = name.substr(name.length - 7);
  }
  if (name.indexOf('.') < 0) {
    return name;
  }
  name = name.toLocaleLowerCase();
  // console.log(name);
  if (name.includes('.rar') || name.includes('.zip')) {
    r = 'rar';
  } else if (name.includes('.doc') || name.includes('.docx') || name.includes('.rtf')) {
    r = 'docx';
  } else if (name.includes('.xlsx') || name.includes('.xls')) {
    r = 'xlsx';
  } else if (name.includes('.ppt') || name.includes('.pptx')) {
    r = 'ppt';
  } else if (name.includes('.pdf')) {
    r = 'pdf';
  } else if (name.includes('.txt')) {
    r = 'txt';
  } else if (name.includes('.mp4')) {
    r = 'mp4';
  } else if (name.includes('.mov')) {
    r = 'mp4';
  } else if (name.includes('.avi')) {
    r = 'mp4';
  } else if (name.includes('.mp3')) {
    r = 'mp3';
  }
  // console.log(r);
  return r;
}
export const CollectionFn = (itemfile, type, imgIcon, id, bankeid, vthis, title = null) => {
  Indicator.open(vthis.$mt('加载中') + "...");
  let info = {
    //  typeText: getFileType(type),
    type: type, //! 多语言考虑， 这里只存储int类型
    img: getFileTypeImg(imgIcon),
    time: formateTime('', '-'),
    itemfile: itemfile,
    bankeid: bankeid
  }


  // console.log(info)
  info = JSON.stringify(info);

  return new Promise((resolve, reject) => {
    axios
      .post("/api/userfav/add", {
        title: title ? title : itemfile.name,
        info: info,
        eventtype: type,
        eventid: id
      })
      .then(res => {
        Indicator.close();
        if (res.data.code == 0) {
          Toast(vthis.$mt('收藏成功'));
          return resolve(res);
        } else {
          Toast(vthis.$mt('收藏失败'));
          return reject(res);
        }

      })
      .catch(err => {
        Indicator.close();
        Toast(vthis.$mt('服务开小差了'));
        return reject(res);

      });
  });
}
export const sortFn = (property, sort) => {
  return function (a, b) {
    var value1 = a[property];
    var value2 = b[property];
    if (sort) {
      return value2 - value1;
    } else {
      return value1 - value2;
    }
  }
}

export const setInputScroll = () => {
  let fn = () => {
    return setTimeout(function () {
      var scrollHeight =
        document.documentElement.scrollTop || document.body.scrollTop || 0;
      window.scrollTo(0, Math.max(scrollHeight - 1, 0));
    }, 100);
  };
  if (process.env.NODE_ENV === 'production') {
    if (
      nativecode.platform == "miniprogram"
    ) {
      fn();
    }
  } else {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
      fn();
    }
  }
}
export const sortLikeWin = (name1, name2) => {
  const regexPunc = /[\s!！#$%&(（)）,，、.。;；？@[\]^_`{}~‘’“”《》￥【】+=·…]/
  const regexNum = /[0-9]/
  const regexEng = /[A-Za-z]/
  const regexCh = /[\u4E00-\u9FFF]/
  // 排序大小： 特殊字符 > 数字 > 字母 > 汉字
  // 如果第一个字符相等，再比较下一个字符
  let compareValue = false
  const minLength = Math.min(name1.length, name2.length)
  let i = 0
  do {
    const aIndex = name1.charAt(i)
    const bIndex = name2.charAt(i)
    const nameFirstType = [aIndex, bIndex].map((item) => {
      if (item.match(regexPunc)) {
        return 0
      }
      if (item.match(regexNum)) {
        return 1
      }
      if (item.match(regexEng)) {
        return 2
      }
      if (item.match(regexCh)) {
        return 3
      }
      return -1
    })
    // 如果第一个字符不相等
    if (aIndex !== bIndex) {
      if (nameFirstType[0] !== nameFirstType[1]) {
        compareValue = nameFirstType[0] - nameFirstType[1]
        break
      } else {
        // 中文需根据拼音顺序
        compareValue = aIndex.localeCompare(bIndex, 'zh')
        break
      }
    }
    if (i === minLength) {
      compareValue = name1.localeCompare(name2, 'zh')
      break
    }
    i += 1
  } while (i <= minLength)
  return compareValue
}
export const encodehtml = (s) => {
  s = s || "";
  s = s.replace(/&/g, "&amp;");
  s = s.replace(/</g, "&lt;");
  s = s.replace(/>/g, "&gt;");
  s = s.replace(/ /g, "&nbsp;");
  s = s.replace(/\\'/g, "&#39;");
  s = s.replace(/\\"/g, "&quot;");
  return s;
}
export const ispcBroswer = () => {
  let e = window.navigator.userAgent.toLowerCase(),
    t = 'ipad' == e.match(/ipad/i),
    i = 'iphone' == e.match(/iphone/i),
    r = 'midp' == e.match(/midp/i),
    n = 'rv:1.2.3.4' == e.match(/rv:1.2.3.4/i),
    a = 'ucweb' == e.match(/ucweb/i),
    o = 'android' == e.match(/android/i),
    s = 'windows ce' == e.match(/windows ce/i),
    l = 'windows mobile' == e.match(/windows mobile/i);
  // console.log('android',o);
  // console.log('iphone',i);
  // console.log('ipad',t);
  return !(t || i || r || n || a || o || s || l);
}
export const isMobile = () => {
  if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|SymbianOS|Windows Phone|Opera Mini/i.test(navigator.userAgent)){
    return true
  }
  return false
}
export const rtrim = (text) => {
  var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
  return text == null ?
    "" :
    (text + "").replace(rtrim, "");
}
export const signGetTypeDesc = (signnum, $mt) => {
  if (signnum == 2) {
    return $mt("位置签到");
  } else if (signnum == 1) {
    return $mt("WIFI签到");
  } else if (signnum == 99) {
    return $mt("已结束,不能签到");
  } else if (signnum == 100) {
    return $mt("教师设置");
  } else if (signnum == 101) {
    return $mt("教室签到");
  }
  return "";
}
export const signGetStateDesc = (signstate, rtres = 1, $mt = null) => {
  if (signstate == 1) {
    return rtres == 1 ? $mt("已签到") : "#00ff80";
  } else if (signstate == 2) {
    return rtres == 1 ? $mt("迟到") : "";
  } else if (signstate == 3) {
    return rtres == 1 ? $mt("超时") : "";
  } else if (signstate == 0) {
    return rtres == 1 ? $mt("未签到") : "#ff8900";
  }
  return "";
}
export const getDistance = (lat1, lng1, lat2, lng2) => {
  const PI = Math.PI
  const EARTH_RADIUS = 6378137.0
  // 求弧度
  function getRadian(d) {
    return d * PI / 180.0; //角度1? = π / 180
  }

  let radLat1 = getRadian(lat1);
  let radLat2 = getRadian(lat2);
  let a = radLat1 - radLat2;
  let b = getRadian(lng1) - getRadian(lng2);

  let dst = 2 * Math.asin((Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2))));
  dst = dst * EARTH_RADIUS;

  return dst;
}
export const unqitem = (arr) => {
  if (!arr.length) {
    return arr;
  }
  let obj = {};
  arr = arr.reduce((cur, next) => {
    obj[next.id] ? "" : (obj[next.id] = true && cur.push(next));
    return cur;
  }, []);
  return arr;
}
export const unqitem2 = (arr,typep=false) => {
  if (!arr.length) {
    return arr;
  }
  let tp=typep?typep:'id';
  let obj = {};
  arr = arr.reduce((cur, next) => {
    obj[next[tp]] ? "" : (obj[next[tp]] = true && cur.push(next));
    return cur;
  }, []);
  return arr;
}