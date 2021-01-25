    //  console.log("main.js i18n url:" + window.location.href);
    //  console.log('navigator.language', navigator.language);
    const appid = "20200917000567752";
    const key = "hW4aWKBwjw8dLsAtGV8f";
    let zdylang = null;
/**
 * @ ArrLangs 待翻译语言系
 * @param {Array} ArrLangs 
 * @ ArrTexts 待翻译文本
 * @param {Array} ArrTexts 
 * @ path 合并自定义语言path
 * @param {String} path 
 * @ cb 翻译完成回调
 * @param {Object} cb 
 */
    function TextTransLate(ArrLangs, ArrTexts,path, cb = null) {
        this.appid = appid;
        this.key = key;
        this.LangPackage = [];
        this.DefaultFYLangs = [];
        this.haslocalmsg = false;
        this.speed = 1500;
        this.initData = {};
        this.loaderrnum = 1;
        this.cb = cb;
        this.path=path;
        // this.i18n = i18n;
        this.texts = ArrTexts;
        this.defaultlangs = ArrLangs;
        this.init = function () {
            console.log('init 翻译texts', this.texts);
            for (let v of this.defaultlangs) {
                this.texts.push(v.name);
            }
            this.texts = [...new Set(this.texts)];
            console.log('init 翻译语言', this.defaultlangs);
            const FanyiLangs = () => {
                let temp = [];
                for (let v of this.defaultlangs) {
                    if (v.type == 'indonesian' || v.type == 'zh') {
                        continue;
                    }
                    temp.push(v.type);
                }
                return temp;
            }
            const TextPackage = () => {
                let index = 0;
                let temparr = [];
                let tempstr = '';
                for (let i = 0; i < this.texts.length; i++) {
                    let v = this.texts[i];
                    v = v.replace(/%s/, '0');
                    tempstr += v + '\n';
                    temparr[index] = tempstr;
                    if (tempstr.length >= 800) {
                        index++;
                        tempstr = '';
                    }
                }
                return temparr;
            }
            this.LangPackage = TextPackage();
            this.DefaultFYLangs = FanyiLangs();
            this.initDataFn();
            this.initTranslateFn();
        }
        TextTransLate.prototype.initDataFn = () => {
            let localmessages = sessionStorage.getItem('loadfanyimessages') || '';
            let tempcurData = {};
            tempcurData.LPIndex = 0;
            tempcurData.LTIndex = 0;
            tempcurData.tempMessages = {};
            tempcurData.from = "zh";
            tempcurData.Urlhaslang = '';
            let UrlParams = this.parseURL(window.location.href);
            if (UrlParams.lang) {
                console.log('Urlhaslang', UrlParams.lang);
                tempcurData.Urlhaslang = UrlParams.lang;
                this.DefaultFYLangs.unshift(UrlParams.lang);
                this.DefaultFYLangs = [...new Set(this.DefaultFYLangs)];
                console.log('UrlParams Urlhaslang DefaultFYLangs', this.DefaultFYLangs);
            }
            for (let v of this.DefaultFYLangs) {
                tempcurData.tempMessages[v] = {};
            }
            //   tempcurData.tempMessages['indonesian'] = {
            //       ...indonesian
            //   };
            if (localmessages) {
                localmessages = JSON.parse(localmessages);
                this.haslocalmsg = true;
                tempcurData.tempMessages = {
                    ...tempcurData.tempMessages,
                    ...localmessages
                }
            }
            return this.initData = {
                ...tempcurData
            };
        }
        TextTransLate.prototype.updatemessage = (lang) => {
            if (zdylang) {
                this.initData.tempMessages[lang] = {
                    ...this.initData.tempMessages[lang],
                    ...zdylang[lang]
                };
                // this.downloadfile(JSON.stringify(this.initData.tempMessages[lang]), `lang_${lang}.json`);
            } else {
                $.ajax({
                    url: `./${this.path}zdylangs.json`,
                    type: "get",
                    success: (res) => {
                        zdylang = JSON.parse(res);
                        console.log('自定义 langs', zdylang);
                        this.initData.tempMessages[lang] = {
                            ...this.initData.tempMessages[lang],
                            ...zdylang[lang]
                        };
                        // this.downloadfile(JSON.stringify(this.initData.tempMessages[lang]), `lang_${lang}.json`);
                    }
                })
            }
        }
        TextTransLate.prototype.initTranslateFn = () => {
            let translatLangFn = () => {
                var salt = new Date().getTime();
                var query = this.LangPackage[this.initData.LPIndex];
                var str1 = this.appid + query + salt + this.key;
                var sign = MD5(str1);
                $.ajax({
                    url: "https://api.fanyi.baidu.com/api/trans/vip/translate",
                    type: "get",
                    dataType: "jsonp",
                    data: {
                        q: query,
                        appid: this.appid,
                        salt: salt,
                        from: this.initData.from,
                        to: this.DefaultFYLangs[this.initData.LTIndex],
                        sign: sign
                    },
                    success: data => {
                        console.log(`翻译成功: DefaultFYLangs Index==${this.initData.LTIndex} ++++  this.LangPackage Index===${this.initData.LPIndex}`, data);
                        let lang = data.to;
                        let trans_result = data.trans_result;
                        for (let v of trans_result) {
                            let dst = v.dst;
                            dst = dst.replace(/0/,'%s');
                            let src = v.src;
                            src =src.replace(/0/,'%s');
                            this.initData.tempMessages[lang][src] = dst;
                        }
                        console.log("messages", this.initData.tempMessages);
                        if (this.initData.LPIndex < this.LangPackage.length - 1) {
                            setTimeout(() => {
                                this.initData.LPIndex++;
                                translatLangFn();
                            }, this.speed);
                            return;
                        }
                        if (this.initData.LPIndex == this.LangPackage.length - 1) {
                            console.log('更新',);
                            this.updatemessage(lang);
                        }
                        if (this.initData.LPIndex == this.LangPackage.length - 1) {
                            if (this.initData.LTIndex < this.DefaultFYLangs.length - 1) {
                                setTimeout(() => {
                                    this.initData.LPIndex = 0;
                                    this.initData.LTIndex++;
                                    this.initTranslateFn();
                                }, this.speed);
                                return;
                            }
                        }
                        if (this.initData.LPIndex == this.LangPackage.length - 1 && this.initData.LTIndex == this.DefaultFYLangs.length - 1) {
                            this.initData.LPIndex = 0;
                            this.initData.LTIndex = 0;
                            this.speed = 1500;
                            console.log('fanyi allend', this.initData.tempMessages);
                            sessionStorage.setItem('fanyiAllend', JSON.stringify(true));
                            // for (let key in this.initData.tempMessages) {
                            //     console.log(JSON.stringify(this.initData.tempMessages[key]));
                            // }
                            if (this.cb) {
                                cb(this.initData.tempMessages);
                            }
                        }
                    },
                    error: err => {
                        console.log("翻译失败：：" + this.loaderrnum, err);
                        if (this.loaderrnum == 2) {
                            if (this.cb) {
                                cb();
                            }
                        }
                        if (this.loaderrnum < 2) {
                            setTimeout(() => {
                                this.speed = 1500;
                                this.loaderrnum++;
                                this.initDataFn();
                                console.log("尝试第二次 翻译", this.initData.tempMessages);
                                console.log('尝试第二次 翻译 翻译语言', this.defaultlangs);
                                console.log('尝试第二次 翻译 翻译texts', this.texts);
                                this.initTranslateFn();
                            }, this.speed)
                        }
                    }
                });
            };
            translatLangFn();


            //   let initTranslateFn = () => {
            //       let translatLangFn = () => {
            //           let tempdata = LangPackage[initData.LPIndex].split('\n');
            //           let mydata = {};
            //           mydata.trans_result = [];
            //           let data = mydata;
            //           data.code = -1;
            //           data.to = DefaultLangs[initData.LTIndex];
            //           let text = lagelists.filter(v => v.type == data.to);
            //           for (let v of tempdata) {
            //               data.trans_result.push({
            //                   src: v,
            //                   dst: `${v}===>{${text[0].name}}`
            //               })
            //           }
            //           setTimeout(() => {
            //               if (data.code == 0) {
            //                   console.log(`翻译成功: DefaultLangs Index==${initData.LTIndex} ++++  LangPackage Index===${initData.LPIndex}`, data);
            //                   let lang = data.to;
            //                   let trans_result = data.trans_result;
            //                   for (let v of trans_result) {
            //                       let dst = v.dst;
            //                       let src = v.src;
            //                       initData.tempMessages[lang][src] = dst;
            //                   }
            //                   console.log("messages", initData.tempMessages);
            //                   if (initData.LPIndex < LangPackage.length - 1) {
            //                       setTimeout(() => {
            //                           initData.LPIndex++;
            //                           translatLangFn();
            //                       }, speed);
            //                       return;
            //                   }
            //                   if (initData.LPIndex == LangPackage.length - 1) {
            //                       updatemessage();
            //                   }
            //                   if (initData.LPIndex == LangPackage.length - 1) {
            //                       if (initData.LTIndex < DefaultLangs.length - 1) {
            //                           setTimeout(() => {
            //                               initData.LPIndex = 0;
            //                               initData.LTIndex++;
            //                               initTranslateFn();
            //                           }, speed);
            //                           return;
            //                       }
            //                   }
            //                   if (initData.LPIndex == LangPackage.length - 1 && initData.LTIndex == DefaultLangs.length - 1) {
            //                       initData.LPIndex = 0;
            //                       initData.LTIndex = 0;
            //                       speed = 1200;
            //                       console.log('fanyi allend', initData.tempMessages);
            //                   }
            //               } else {
            //                   if (loaderrnum < 1) {
            //                       console.log("翻译失败 loaderrnum", initData.tempMessages);
            //                       initData.LPIndex = 0;
            //                       initData.LTIndex = 0;
            //                       if (localmessages) {
            //                           localmessages = JSON.stringify(localmessages);
            //                       }
            //                       speed = 1200;
            //                       loaderrnum++;
            //                       initDataFn();
            //                       initTranslateFn();
            //                   }
            //               }
            //           }, speed)
            //       }
            //       translatLangFn();
            //   }
            //   if (!localStorage.getItem('fanyimessages')) {
            //       initTranslateFn();
            //   } else {
            //       let localmsg = JSON.parse(localStorage.getItem('fanyimessages'));
            //       initData.tempMessages = localmsg;
            //       updatemessage();
            //   }
        }
        TextTransLate.prototype.downloadfile = (content, filename) => {
            var elelink = document.createElement('a');
            elelink.download = filename;
            elelink.style.display = 'none';
            var blob = new Blob([content]);
            elelink.href = URL.createObjectURL(blob);
            document.body.appendChild(elelink);
            elelink.click();
            document.body.removeChild(elelink);
        }
        TextTransLate.prototype.parseURL = (url) => {
            var query = url && url.split('?')[1]
            var queryArr = query && query.split('&')
            var params = {}
            queryArr &&
                queryArr.forEach(function (item) {
                    var key = item.split('=')[0]
                    var value = item.split('=')[1]
                    params[key] = value
                })
            return params
        }
    }