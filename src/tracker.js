import extend from 'extend';
import {
    getEvent,
    getEventListenerMethod,
    getBoundingClientRect,
    stringify,
    getDomPath,
} from './utils'
import { compress, decompress, convertBytesToHex, encodeUTF8, decodeUTF8 } from './string_compress';

const DefaultOptions = {
    useClass: false,
    per: 0.01,
    events: ['click'],
};

class Tracker {
    constructor() {
        this._isInstall = false;
        this._options = {};
        this._sendData = {};
        this._api = "";
    }

    config(options = {}) {
        options = extend(true, {}, DefaultOptions, options);
        options.event = DefaultOptions.event;
        this._options = options;
        return this;
    }

    _captureEvents() {
        const self = this;
        const events = this._options.events;
        const eventMethodObj = getEventListenerMethod();
        for (let i = 0, j = events.length; i < j; i++) {
            let eventName = events[i];
            document.body[eventMethodObj.addMethod](eventMethodObj.prefix + eventName, function (event) {
                const eventFix = getEvent(event);
                if (!eventFix) {
                    return;
                }
                self._handleEvent(eventFix);
            }, false)
        }
    }

    _handleEvent(event) {
        const per = parseFloat(this._options.per);
        if (!this.hit(per)) {
            return;
        }
        const domPath = getDomPath(event.target, this._options.useClass);
        const rect = getBoundingClientRect(event.target);
        if (rect.width == 0 || rect.height == 0) {
            return;
        }
        let t = document.documentElement || document.body.parentNode;
        const scrollX = (t && typeof t.scrollLeft == 'number' ? t : document.body).scrollLeft;
        const scrollY = (t && typeof t.scrollTop == 'number' ? t : document.body).scrollTop;
        const pageX = event.pageX || event.clientX + scrollX;
        const pageY = event.pageY || event.clientY + scrollY;
        const url = location.href;
        const path = location.pathname;
        const data = {
            domPath: encodeURIComponent(domPath),
            trackingType: event.type,
            offsetX: ((pageX - rect.left - scrollX) / rect.width).toFixed(6),
            offsetY: ((pageY - rect.top - scrollY) / rect.height).toFixed(6),
            url: url,
            path: path,
            browser: this.browserInfo(),
        };
        let r = JSON.stringify(data);
        let rc = compress(encodeUTF8(r));
        let tx = convertBytesToHex(rc);
        // let b64 = base64.encode(rc);
        let src = decodeUTF8(decompress(rc));
        console.log(r, rc, src, tx);
        this.send({m:tx});
        this.send(data);
    }

    send(data = {}) {
        let dat = extend(true, {}, data, this._sendData);
        console.log('data', dat);
        const image = new Image(1, 1);
        image.onload = function () {
            image = null;
        };
        image.src = `${this._api}/?${stringify(dat)}`;
    }

    appendData(fn) {
        if (this._sendData)
            this._sendData = fn;

        return {};
    }

    hit(per = 0.01) {
        return Math.random() < per;
    }

    install() {
        if (this._isInstall) {
            return this;
        }
        this._captureEvents();
        this._isInstall = true;
        return this;
    }

    //浏览器信息
    browserInfo() {
        let u = navigator.userAgent;
        let self = {};
        let match = {
            //内核
            'Trident': u.indexOf('Trident') > 0 || u.indexOf('NET CLR') > 0,
            'Presto': u.indexOf('Presto') > 0,
            'WebKit': u.indexOf('AppleWebKit') > 0,
            'Gecko': u.indexOf('Gecko/') > 0,
            //浏览器
            'Safari': u.indexOf('Safari') > 0,
            'Chrome': u.indexOf('Chrome') > 0 || u.indexOf('CriOS') > 0,
            'IE': u.indexOf('MSIE') > 0 || u.indexOf('Trident') > 0,
            'Edge': u.indexOf('Edge') > 0,
            'Firefox': u.indexOf('Firefox') > 0,
            'Opera': u.indexOf('Opera') > 0 || u.indexOf('OPR') > 0,
            'Vivaldi': u.indexOf('Vivaldi') > 0,
            'UC': u.indexOf('UC') > 0 || u.indexOf(' UBrowser') > 0,
            'QQBrowser': u.indexOf('QQBrowser') > 0,
            'QQ': u.indexOf('QQ/') > 0,
            'Baidu': u.indexOf('Baidu') > 0 || u.indexOf('BIDUBrowser') > 0,
            'Maxthon': u.indexOf('Maxthon') > 0,
            'LBBROWSER': u.indexOf('LBBROWSER') > 0,
            '2345Explorer': u.indexOf('2345Explorer') > 0,
            'Sogou': u.indexOf('MetaSr') > 0 || u.indexOf('Sogou') > 0,
            'Wechat': u.indexOf('MicroMessenger') > 0,
            'Taobao': u.indexOf('AliApp(TB') > 0,
            'Alipay': u.indexOf('AliApp(AP') > 0,
            'Weibo': u.indexOf('Weibo') > 0,
            'Suning': u.indexOf('SNEBUY-APP') > 0,
            'iQiYi': u.indexOf('IqiyiApp') > 0,
            //操作系统平台
            'Windows': u.indexOf('Windows') > 0,
            'Linux': u.indexOf('Linux') > 0,
            'Mac': u.indexOf('Macintosh') > 0,
            'Android': u.indexOf('Android') > 0 || u.indexOf('Adr') > 0,
            'WP': u.indexOf('IEMobile') > 0,
            'BlackBerry': u.indexOf('BlackBerry') > 0 || u.indexOf('RIM') > 0 || u.indexOf('BB') > 0,
            'MeeGo': u.indexOf('MeeGo') > 0,
            'Symbian': u.indexOf('Symbian') > 0,
            'iOS': u.indexOf('like Mac OS X') > 0,
            //移动设备
            'Mobile': u.indexOf('Mobi') > 0 || u.indexOf('iPh') > 0 || u.indexOf('480') > 0,
            'Tablet': u.indexOf('Tablet') > 0 || u.indexOf('iPad') > 0 || u.indexOf('Nexus 7') > 0
        };
        if (match.Mobile) {
            match.Mobile = !(u.indexOf('iPad') > 0);
        }
        //基本信息
        let hash = {
            engine: ['WebKit', 'Trident', 'Gecko', 'Presto'],
            browser: ['Safari', 'Chrome', 'IE', 'Edge', 'Firefox', 'Opera', 'Vivaldi', 'UC', 'QQBrowser', 'QQ', 'Baidu', 'Maxthon', 'Sogou', 'LBBROWSER', '2345Explorer', 'Wechat', 'Taobao', 'Alipay', 'Weibo', 'Suning', 'iQiYi'],
            os: ['Windows', 'Linux', 'Mac', 'Android', 'iOS', 'WP', 'BlackBerry', 'MeeGo', 'Symbian'],
            device: ['Mobile', 'Tablet']
        };
        self.device = 'PC';
        self.language = (function () {
            let g = (navigator.browserLanguage || navigator.language);
            let arr = g.split('-');
            if (arr[1]) {
                arr[1] = arr[1].toUpperCase();
            }
            return arr.join('-');
        })();
        for (let s in hash) {
            for (let i = 0; i < hash[s].length; i++) {
                let value = hash[s][i];
                if (match[value]) {
                    self[s] = value;
                }
            }
        }
        //系统版本信息
        let osVersion = {
            'Windows': function () {
                let v = u.replace(/^.*Windows NT ([\d.]+);.*$/, '$1');
                let hash = {
                    '6.4': '10',
                    '6.3': '8.1',
                    '6.2': '8',
                    '6.1': '7',
                    '6.0': 'Vista',
                    '5.2': 'XP',
                    '5.1': 'XP',
                    '5.0': '2000'
                };
                return hash[v] || v;
            },
            'Android': function () {
                return u.replace(/^.*Android ([\d.]+);.*$/, '$1');
            },
            'iOS': function () {
                return u.replace(/^.*OS ([\d_]+) like.*$/, '$1').replace(/_/g, '.');
            },
            'Mac': function () {
                return u.replace(/^.*Mac OS X ([\d_]+).*$/, '$1').replace(/_/g, '.');
            }
        }
        self.osVersion = '';
        if (osVersion[self.os]) {
            self.osVersion = osVersion[self.os]();
        }
        //浏览器版本信息
        let version = {
            'Chrome': function () {
                return u.replace(/^.*Chrome\/([\d.]+).*$/, '$1');
            },
            'IE': function () {
                let v = u.replace(/^.*MSIE ([\d.]+).*$/, '$1');
                if (v == u) {
                    v = u.replace(/^.*rv:([\d.]+).*$/, '$1');
                }
                return v != u ? v : '';
            },
            'Edge': function () {
                return u.replace(/^.*Edge\/([\d.]+).*$/, '$1');
            },
            'Firefox': function () {
                return u.replace(/^.*Firefox\/([\d.]+).*$/, '$1');
            },
            'Safari': function () {
                return u.replace(/^.*Version\/([\d.]+).*$/, '$1');
            },
            'Opera': function () {
                return u.replace(/^.*Opera\/([\d.]+).*$/, '$1');
            },
            'Vivaldi': function () {
                return u.replace(/^.*Vivaldi\/([\d.]+).*$/, '$1');
            },
            'Maxthon': function () {
                return u.replace(/^.*Maxthon\/([\d.]+).*$/, '$1');
            },
            'QQBrowser': function () {
                return u.replace(/^.*QQBrowser\/([\d.]+).*$/, '$1');
            },
            'QQ': function () {
                return u.replace(/^.*QQ\/([\d.]+).*$/, '$1');
            },
            'Baidu': function () {
                return u.replace(/^.*BIDUBrowser[\s\/]([\d.]+).*$/, '$1');
            },
            'UC': function () {
                return u.replace(/^.*UC?Browser\/([\d.]+).*$/, '$1');
            },
            '2345Explorer': function () {
                return u.replace(/^.*2345Explorer\/([\d.]+).*$/, '$1');
            },
            'Wechat': function () {
                return u.replace(/^.*MicroMessenger\/([\d.]+).*$/, '$1');
            },
            'Taobao': function () {
                return u.replace(/^.*AliApp\(TB\/([\d.]+).*$/, '$1');
            },
            'Alipay': function () {
                return u.replace(/^.*AliApp\(AP\/([\d.]+).*$/, '$1');
            },
            'Weibo': function () {
                return u.replace(/^.*weibo__([\d.]+).*$/, '$1');
            },
            'Suning': function () {
                return u.replace(/^.*SNEBUY-APP([\d.]+).*$/, '$1');
            },
            'iQiYi': function () {
                return u.replace(/^.*IqiyiVersion\/([\d.]+).*$/, '$1');
            }
        };
        self.version = '';
        if (version[self.browser]) {
            self.version = version[self.browser]();
        }
        return self
    }
}

export default Tracker;