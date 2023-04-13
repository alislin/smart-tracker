/*!
* @your/father v1.0.6
*
* Copyright 2023, 小蝌蚪
*
*/
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var extend = _interopDefault(require('extend'));
var pako = _interopDefault(require('pako'));
var _typeof = _interopDefault(require('@babel/runtime/helpers/typeof'));
var _readOnlyError = _interopDefault(require('@babel/runtime/helpers/readOnlyError'));
var _classCallCheck = _interopDefault(require('@babel/runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('@babel/runtime/helpers/createClass'));

var getEvent = function getEvent(event) {
  event = event || window.event;
  if (!event) {
    return event;
  }
  if (!event.target) {
    event.target = event.srcElement;
  }
  if (!event.currentTarget) {
    event.currentTarget = event.srcElement;
  }
  return event;
};
var getEventListenerMethod = function getEventListenerMethod() {
  var addMethod = 'addEventListener',
    removeMethod = 'removeEventListener',
    prefix = '';
  if (!window.addEventListener) {
    addMethod = 'attachEvent';
    removeMethod = 'detachEvent';
    prefix = 'on';
  }
  return {
    addMethod: addMethod,
    removeMethod: removeMethod,
    prefix: prefix
  };
};
var getBoundingClientRect = function getBoundingClientRect(element) {
  var rect = element.getBoundingClientRect();
  var width = rect.width || rect.right - rect.left;
  var heigth = rect.heigth || rect.bottom - rect.top;
  return extend({}, rect, {
    width: width,
    heigth: heigth
  });
};
var stringify = function stringify(obj) {
  var params = [];
  for (var key in obj) {
    params.push("".concat(key, "=").concat(obj[key]));
  }
  return params.join('&');
};
function getDomPath(element) {
  var useClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (!(element instanceof HTMLElement)) {
    console.warn('input is not a HTML element!');
    return '';
  }
  var domPath = [];
  var elem = element;
  while (elem) {
    var domDesc = getDomDesc(elem, useClass);
    if (!domDesc) {
      break;
    }
    domPath.unshift(domDesc);
    if (querySelector(domPath.join('>')) === element || domDesc.indexOf('body') >= 0) {
      break;
    }
    domPath.shift();
    var children = elem.parentNode.children;
    if (children.length > 1) {
      for (var i = 0; i < children.length; i++) {
        if (children[i] === elem) {
          domDesc += ":nth-child(".concat(i + 1, ")");
          break;
        }
      }
    }
    domPath.unshift(domDesc);
    if (querySelector(domPath.join('>')) === element) {
      break;
    }
    elem = elem.parentNode;
  }
  return domPath.join('>');
}
function getDomDesc(element) {
  var useClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var domDesc = [];
  if (!element || !element.tagName) {
    return '';
  }
  if (element.id) {
    return "#".concat(element.id);
  }
  domDesc.push(element.tagName.toLowerCase());
  if (useClass) {
    var className = element.className;
    if (className && typeof className === 'string') {
      var classes = className.split(/\s+/);
      domDesc.push(".".concat(classes.join('.')));
    }
  }
  if (element.name) {
    domDesc.push("[name=".concat(element.name, "]"));
  }
  return domDesc.join('');
}
function querySelector(queryString) {
  return document.getElementById(queryString) || document.getElementsByName(queryString)[0] || document.querySelector(queryString);
}

/*eslint no-console: ["error", { allow: ["error", "info"] }] */

var convertHexToBytes = function convertHexToBytes(text) {
  var tmpHex,
    array = [];
  for (var i = 0; i < text.length; i += 2) {
    tmpHex = text.substring(i, i + 2);
    array.push(parseInt(tmpHex, 16));
  }
  return array;
};
var convertBytesToHex = function convertBytesToHex(byteArray) {
  var tmpHex,
    hex = '';
  for (var i = 0, il = byteArray.length; i < il; i++) {
    if (byteArray[i] < 0) {
      byteArray[i] = byteArray[i] + 256;
    }
    tmpHex = byteArray[i].toString(16);
    if (tmpHex.length === 1) {
      // add leading zero

      tmpHex = '0' + tmpHex;
    }
    hex += tmpHex;
  }
  return hex;
};
var bytesToHumanReadableSize = function bytesToHumanReadableSize(bytes) {
  var decimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
  if (bytes === 0) {
    return '0 Bytes';
  }
  var magnitude = 1024;
  var dm = decimals <= 0 || decimals === null || decimals === undefined ? 0 : decimals;
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  var i = Math.floor(Math.log(bytes) / Math.log(magnitude));
  return parseFloat((bytes / Math.pow(magnitude, i)).toFixed(dm)) + ' ' + sizes[i];
};
var roughSizeOf = function roughSizeOf(object) {
  var humanReadable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var objectList = [];
  var stack = [object];
  var bytes = 0;
  while (stack.length) {
    var value = stack.pop();
    if (typeof value === 'boolean') {
      bytes += 4;
    } else if (typeof value === 'string') {
      bytes += value.length * 2;
    } else if (typeof value === 'number') {
      bytes += 8;
    } else if (_typeof(value) === 'object' && objectList.indexOf(value) === -1) {
      objectList.push(value);
      for (var i in value) {
        stack.push(value[i]);
      }
    }
  }
  return humanReadable ? bytesToHumanReadableSize(bytes) : bytes;
};
var encodeUTF8 = function encodeUTF8(s) {
  var i = 0,
    bytes = new Uint8Array(s.length * 4);
  for (var ci = 0; ci !== s.length; ci++) {
    var c = s.charCodeAt(ci);
    if (c < 128) {
      bytes[i++] = c;
      continue;
    }
    if (c < 2048) {
      bytes[i++] = c >> 6 | 192;
    } else {
      if (c > 0xd7ff && c < 0xdc00) {
        if (++ci >= s.length) {
          throw new Error('UTF-8 encode: incomplete surrogate pair');
        }
        var c2 = s.charCodeAt(ci);
        if (c2 < 0xdc00 || c2 > 0xdfff) {
          throw new Error('UTF-8 encode: second surrogate character 0x' + c2.toString(16) + ' at index ' + ci + ' out of range');
        }
        c = 0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff);
        bytes[i++] = c >> 18 | 240;
        bytes[i++] = c >> 12 & 63 | 128;
      } else {
        bytes[i++] = c >> 12 | 224;
      }
      bytes[i++] = c >> 6 & 63 | 128;
    }
    bytes[i++] = c & 63 | 128;
  }
  return bytes.subarray(0, i);
};
var decodeUTF8 = function decodeUTF8(bytes) {
  var i = 0,
    s = '';
  while (i < bytes.length) {
    var c = bytes[i++];
    if (c > 127) {
      if (c > 191 && c < 224) {
        if (i >= bytes.length) {
          throw new Error('UTF-8 decode: incomplete 2-byte sequence');
        }
        c = (c & 31) << 6 | bytes[i++] & 63;
      } else if (c > 223 && c < 240) {
        if (i + 1 >= bytes.length) {
          throw new Error('UTF-8 decode: incomplete 3-byte sequence');
        }
        c = (c & 15) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63;
      } else if (c > 239 && c < 248) {
        if (i + 2 >= bytes.length) {
          throw new Error('UTF-8 decode: incomplete 4-byte sequence');
        }
        c = (c & 7) << 18 | (bytes[i++] & 63) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63;
      } else {
        throw new Error('UTF-8 decode: unknown multi-byte start 0x' + c.toString(16) + ' at index ' + (i - 1));
      }
    }
    if (c <= 0xffff) {
      s += String.fromCharCode(c);
    } else if (c <= 0x10ffff) {
      c -= 0x10000;
      s += String.fromCharCode(c >> 10 | 0xd800);
      s += String.fromCharCode(c & 0x3FF | 0xdc00);
    } else {
      throw new Error('UTF-8 decode: code point 0x' + c.toString(16) + ' exceeds UTF-16 reach');
    }
  }
  return s;
};
var compress = function compress(arr) {
  var compressedArrBytes = pako.deflate(arr, {
    level: 9
  });
  return compressedArrBytes;
};
var decompress = function decompress(bytes) {
  try {
    var decompressedArray = pako.inflate(bytes);
    return decompressedArray;
  } catch (err) {
    console.error(err);
  }
};
var stringToHash = function stringToHash(str) {
  var consoleInfo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var encoded = encodeUTF8(str.trim());
  var compressed = compress(encoded);
  var hexCompressed = convertBytesToHex(compressed);
  if (consoleInfo) {
    console.info("String:         ".concat(roughSizeOf(str)));
    console.info("Encoded:        ".concat(roughSizeOf(encoded)));
    console.info("Compressed:     ".concat(roughSizeOf(compressed)));
    console.info("hexCompressed:  ".concat(roughSizeOf(hexCompressed)));
  }
  return hexCompressed;
};
var hashToString = function hashToString(hash) {
  var consoleInfo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var deHexed = convertHexToBytes(hash);
  var decompressed = decompress(deHexed);
  var decoded = decodeUTF8(decompressed);
  if (consoleInfo) {
    console.info("deHexed:        ".concat(roughSizeOf(deHexed)));
    console.info("Decompressed:   ".concat(roughSizeOf(decompressed)));
    console.info("Decoded String: ".concat(roughSizeOf(decoded)));
  }
  return decoded;
};
var string_compress = {
  convertHexToBytes: convertHexToBytes,
  convertBytesToHex: convertBytesToHex,
  bytesToHumanReadableSize: bytesToHumanReadableSize,
  roughSizeOf: roughSizeOf,
  encodeUTF8: encodeUTF8,
  decodeUTF8: decodeUTF8,
  compress: compress,
  decompress: decompress,
  stringToHash: stringToHash,
  hashToString: hashToString
};
var string_compress_2 = string_compress.convertBytesToHex;
var string_compress_5 = string_compress.encodeUTF8;
var string_compress_6 = string_compress.decodeUTF8;
var string_compress_7 = string_compress.compress;
var string_compress_8 = string_compress.decompress;

var DefaultOptions = {
  useClass: false,
  per: 0.01,
  events: ['click']
};
var Tracker = /*#__PURE__*/function () {
  function Tracker() {
    _classCallCheck(this, Tracker);
    this._isInstall = false;
    this._options = {};
    this._sendData = {};
    this._api = "";
  }
  _createClass(Tracker, [{
    key: "config",
    value: function config() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      options = extend(true, {}, DefaultOptions, options);
      options.event = DefaultOptions.event;
      this._options = options;
      return this;
    }
  }, {
    key: "_captureEvents",
    value: function _captureEvents() {
      var self = this;
      var events = this._options.events;
      var eventMethodObj = getEventListenerMethod();
      for (var i = 0, j = events.length; i < j; i++) {
        var eventName = events[i];
        document.body[eventMethodObj.addMethod](eventMethodObj.prefix + eventName, function (event) {
          var eventFix = getEvent(event);
          if (!eventFix) {
            return;
          }
          self._handleEvent(eventFix);
        }, false);
      }
    }
  }, {
    key: "_handleEvent",
    value: function _handleEvent(event) {
      var per = parseFloat(this._options.per);
      if (!this.hit(per)) {
        return;
      }
      var domPath = getDomPath(event.target, this._options.useClass);
      var rect = getBoundingClientRect(event.target);
      if (rect.width == 0 || rect.height == 0) {
        return;
      }
      var t = document.documentElement || document.body.parentNode;
      var scrollX = (t && typeof t.scrollLeft == 'number' ? t : document.body).scrollLeft;
      var scrollY = (t && typeof t.scrollTop == 'number' ? t : document.body).scrollTop;
      var pageX = event.pageX || event.clientX + scrollX;
      var pageY = event.pageY || event.clientY + scrollY;
      var url = location.href;
      var path = location.pathname;
      var data = {
        domPath: encodeURIComponent(domPath),
        trackingType: event.type,
        offsetX: ((pageX - rect.left - scrollX) / rect.width).toFixed(6),
        offsetY: ((pageY - rect.top - scrollY) / rect.height).toFixed(6),
        url: url,
        path: path,
        browser: this.browserInfo()
      };
      var r = JSON.stringify(data);
      var rc = string_compress_7(string_compress_5(r));
      var tx = string_compress_2(rc);
      // let b64 = base64.encode(rc);
      var src = string_compress_6(string_compress_8(rc));
      console.log(r, rc, src, tx);
      this.send({
        m: tx
      });
      this.send(data);
    }
  }, {
    key: "send",
    value: function send() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var dat = extend(true, {}, data, this._sendData);
      console.log('data', dat);
      var image = new Image(1, 1);
      image.onload = function () {
        _readOnlyError("image");
      };
      image.src = "".concat(this._api, "/?").concat(stringify(dat));
    }
  }, {
    key: "appendData",
    value: function appendData(fn) {
      if (this._sendData) this._sendData = fn;
      return {};
    }
  }, {
    key: "hit",
    value: function hit() {
      var per = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0.01;
      return Math.random() < per;
    }
  }, {
    key: "install",
    value: function install() {
      if (this._isInstall) {
        return this;
      }
      this._captureEvents();
      this._isInstall = true;
      return this;
    }

    //浏览器信息
  }, {
    key: "browserInfo",
    value: function browserInfo() {
      var u = navigator.userAgent;
      var self = {};
      var match = {
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
      var hash = {
        engine: ['WebKit', 'Trident', 'Gecko', 'Presto'],
        browser: ['Safari', 'Chrome', 'IE', 'Edge', 'Firefox', 'Opera', 'Vivaldi', 'UC', 'QQBrowser', 'QQ', 'Baidu', 'Maxthon', 'Sogou', 'LBBROWSER', '2345Explorer', 'Wechat', 'Taobao', 'Alipay', 'Weibo', 'Suning', 'iQiYi'],
        os: ['Windows', 'Linux', 'Mac', 'Android', 'iOS', 'WP', 'BlackBerry', 'MeeGo', 'Symbian'],
        device: ['Mobile', 'Tablet']
      };
      self.device = 'PC';
      self.language = function () {
        var g = navigator.browserLanguage || navigator.language;
        var arr = g.split('-');
        if (arr[1]) {
          arr[1] = arr[1].toUpperCase();
        }
        return arr.join('-');
      }();
      for (var s in hash) {
        for (var i = 0; i < hash[s].length; i++) {
          var value = hash[s][i];
          if (match[value]) {
            self[s] = value;
          }
        }
      }
      //系统版本信息
      var osVersion = {
        'Windows': function Windows() {
          var v = u.replace(/^.*Windows NT ([\d.]+);.*$/, '$1');
          var hash = {
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
        'Android': function Android() {
          return u.replace(/^.*Android ([\d.]+);.*$/, '$1');
        },
        'iOS': function iOS() {
          return u.replace(/^.*OS ([\d_]+) like.*$/, '$1').replace(/_/g, '.');
        },
        'Mac': function Mac() {
          return u.replace(/^.*Mac OS X ([\d_]+).*$/, '$1').replace(/_/g, '.');
        }
      };
      self.osVersion = '';
      if (osVersion[self.os]) {
        self.osVersion = osVersion[self.os]();
      }
      //浏览器版本信息
      var version = {
        'Chrome': function Chrome() {
          return u.replace(/^.*Chrome\/([\d.]+).*$/, '$1');
        },
        'IE': function IE() {
          var v = u.replace(/^.*MSIE ([\d.]+).*$/, '$1');
          if (v == u) {
            v = u.replace(/^.*rv:([\d.]+).*$/, '$1');
          }
          return v != u ? v : '';
        },
        'Edge': function Edge() {
          return u.replace(/^.*Edge\/([\d.]+).*$/, '$1');
        },
        'Firefox': function Firefox() {
          return u.replace(/^.*Firefox\/([\d.]+).*$/, '$1');
        },
        'Safari': function Safari() {
          return u.replace(/^.*Version\/([\d.]+).*$/, '$1');
        },
        'Opera': function Opera() {
          return u.replace(/^.*Opera\/([\d.]+).*$/, '$1');
        },
        'Vivaldi': function Vivaldi() {
          return u.replace(/^.*Vivaldi\/([\d.]+).*$/, '$1');
        },
        'Maxthon': function Maxthon() {
          return u.replace(/^.*Maxthon\/([\d.]+).*$/, '$1');
        },
        'QQBrowser': function QQBrowser() {
          return u.replace(/^.*QQBrowser\/([\d.]+).*$/, '$1');
        },
        'QQ': function QQ() {
          return u.replace(/^.*QQ\/([\d.]+).*$/, '$1');
        },
        'Baidu': function Baidu() {
          return u.replace(/^.*BIDUBrowser[\s\/]([\d.]+).*$/, '$1');
        },
        'UC': function UC() {
          return u.replace(/^.*UC?Browser\/([\d.]+).*$/, '$1');
        },
        '2345Explorer': function Explorer() {
          return u.replace(/^.*2345Explorer\/([\d.]+).*$/, '$1');
        },
        'Wechat': function Wechat() {
          return u.replace(/^.*MicroMessenger\/([\d.]+).*$/, '$1');
        },
        'Taobao': function Taobao() {
          return u.replace(/^.*AliApp\(TB\/([\d.]+).*$/, '$1');
        },
        'Alipay': function Alipay() {
          return u.replace(/^.*AliApp\(AP\/([\d.]+).*$/, '$1');
        },
        'Weibo': function Weibo() {
          return u.replace(/^.*weibo__([\d.]+).*$/, '$1');
        },
        'Suning': function Suning() {
          return u.replace(/^.*SNEBUY-APP([\d.]+).*$/, '$1');
        },
        'iQiYi': function iQiYi() {
          return u.replace(/^.*IqiyiVersion\/([\d.]+).*$/, '$1');
        }
      };
      self.version = '';
      if (version[self.browser]) {
        self.version = version[self.browser]();
      }
      return self;
    }
  }]);
  return Tracker;
}();

var tracker = new Tracker();

module.exports = tracker;
//# sourceMappingURL=index.js.map
