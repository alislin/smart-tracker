import extend from 'extend';
import base64 from './base64';
import {
    getEvent,
    getEventListenerMethod,
    getBoundingClientRect,
    stringify,
    getDomPath,
} from './utils'
import { browserInfo } from './browerInfo';

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
        this._id = this.loadId();
        this.onload();
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
        const data = {
            domPath: encodeURIComponent(domPath),
            trackingType: event.type,
            offsetX: ((pageX - rect.left - scrollX) / rect.width).toFixed(6),
            offsetY: ((pageY - rect.top - scrollY) / rect.height).toFixed(6),
        };
        this.send(data);
    }

    send(data = {}, type = "p") {
        let dat = extend(true, {}, data, this._sendData);
        dat = extend(true, {}, dat, { sid: this._id });
        let dat_str = JSON.stringify(dat);
        let dat_encode_str = base64.encode(dat_str);
        // console.log(dat_str);
        // console.log('data', dat);
        const image = new Image(1, 1);
        image.onload = function () {
            image = null;
        };

        let api = this._options.api;
        if (!api || api == "undefined") api = "";

        let data_send = {};
        if (type == "i") {
            // 页面初始化
            data_send = { i: dat_encode_str };
        }
        else if(type=="o"){
            // 页面关闭
            data_send = { o: dat_encode_str };
        }
        else if(type=="r"){
            // 路由切换
            data_send = { r: dat_encode_str };
        }
        else{
            // 页面点击
            data_send = { p: dat_encode_str };
        }

        image.src = `${api}/?${stringify(data_send)}`;
    }

    appendData(dat) {
        if (this._sendData)
            this._sendData = dat;

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

    appendBaseInfo() {
        const url = location.href;
        const path = location.pathname;
        const data = {
            url: url,
            path: path,
            browser: browserInfo(),
        };
        return data;
    }

    loadId() {
        let k = localStorage.getItem("smart-id");
        if (!k || k == "undefined" || k == "" || k == null) k = this.saveId();
        return k;
    }

    saveId() {
        let k = this.genId();
        localStorage.setItem("smart-id", k);
        return k;
    }

    genId() {
        const c = "abcdefghijklmn0123456789";
        let key = "";
        for (let i = 0; i < 16; i++) {
            const j = Math.round(Math.random() * c.length);
            key += c.charAt(j);
        }
        return key;
    }

    onload() {
        window.addEventListener("load", e => {
            this.send(this.appendBaseInfo(),"i");
        })
    }

    unload(){
        window.addEventListener("unload", e => {
            this.send(this.appendBaseInfo(),"o");
        })
    }

}

export default Tracker;