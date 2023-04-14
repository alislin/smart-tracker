/*!
* smart-tracker v1.0.6
*
* Copyright 2023, aidee
*
*/
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _typeof = _interopDefault(require('@babel/runtime/helpers/typeof'));
var extend = _interopDefault(require('extend'));
var _readOnlyError = _interopDefault(require('@babel/runtime/helpers/readOnlyError'));
var _classCallCheck = _interopDefault(require('@babel/runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('@babel/runtime/helpers/createClass'));

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var base64 = createCommonjsModule(function (module, exports) {
  (function (root) {
    // Detect free variables `exports`.
    var freeExports = exports;

    // Detect free variable `module`.
    var freeModule = module && module.exports == freeExports && module;

    // Detect free variable `global`, from Node.js or Browserified code, and use
    // it as `root`.
    var freeGlobal = _typeof(commonjsGlobal) == 'object' && commonjsGlobal;
    if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
      root = freeGlobal;
    }

    /*--------------------------------------------------------------------------*/

    var InvalidCharacterError = function InvalidCharacterError(message) {
      this.message = message;
    };
    InvalidCharacterError.prototype = new Error();
    InvalidCharacterError.prototype.name = 'InvalidCharacterError';
    var error = function error(message) {
      // Note: the error messages used throughout this file match those used by
      // the native `atob`/`btoa` implementation in Chromium.
      throw new InvalidCharacterError(message);
    };
    var TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    // http://whatwg.org/html/common-microsyntaxes.html#space-character
    var REGEX_SPACE_CHARACTERS = /<%= spaceCharacters %>/g;

    // `decode` is designed to be fully compatible with `atob` as described in the
    // HTML Standard. http://whatwg.org/html/webappapis.html#dom-windowbase64-atob
    // The optimized base64-decoding algorithm used is based on @atk’s excellent
    // implementation. https://gist.github.com/atk/1020396
    var decode = function decode(input) {
      input = String(input).replace(REGEX_SPACE_CHARACTERS, '');
      var length = input.length;
      if (length % 4 == 0) {
        input = input.replace(/==?$/, '');
        length = input.length;
      }
      if (length % 4 == 1 ||
      // http://whatwg.org/C#alphanumeric-ascii-characters
      /[^+a-zA-Z0-9/]/.test(input)) {
        error('Invalid character: the string to be decoded is not correctly encoded.');
      }
      var bitCounter = 0;
      var bitStorage;
      var buffer;
      var output = '';
      var position = -1;
      while (++position < length) {
        buffer = TABLE.indexOf(input.charAt(position));
        bitStorage = bitCounter % 4 ? bitStorage * 64 + buffer : buffer;
        // Unless this is the first of a group of 4 characters…
        if (bitCounter++ % 4) {
          // …convert the first 8 bits to a single ASCII character.
          output += String.fromCharCode(0xFF & bitStorage >> (-2 * bitCounter & 6));
        }
      }
      return output;
    };

    // `encode` is designed to be fully compatible with `btoa` as described in the
    // HTML Standard: http://whatwg.org/html/webappapis.html#dom-windowbase64-btoa
    var encode = function encode(input) {
      input = String(input);
      if (/[^\0-\xFF]/.test(input)) {
        // Note: no need to special-case astral symbols here, as surrogates are
        // matched, and the input is supposed to only contain ASCII anyway.
        error('The string to be encoded contains characters outside of the ' + 'Latin1 range.');
      }
      var padding = input.length % 3;
      var output = '';
      var position = -1;
      var a;
      var b;
      var c;
      var buffer;
      // Make sure any padding is handled outside of the loop.
      var length = input.length - padding;
      while (++position < length) {
        // Read three bytes, i.e. 24 bits.
        a = input.charCodeAt(position) << 16;
        b = input.charCodeAt(++position) << 8;
        c = input.charCodeAt(++position);
        buffer = a + b + c;
        // Turn the 24 bits into four chunks of 6 bits each, and append the
        // matching character for each of them to the output.
        output += TABLE.charAt(buffer >> 18 & 0x3F) + TABLE.charAt(buffer >> 12 & 0x3F) + TABLE.charAt(buffer >> 6 & 0x3F) + TABLE.charAt(buffer & 0x3F);
      }
      if (padding == 2) {
        a = input.charCodeAt(position) << 8;
        b = input.charCodeAt(++position);
        buffer = a + b;
        output += TABLE.charAt(buffer >> 10) + TABLE.charAt(buffer >> 4 & 0x3F) + TABLE.charAt(buffer << 2 & 0x3F) + '=';
      } else if (padding == 1) {
        buffer = input.charCodeAt(position);
        output += TABLE.charAt(buffer >> 2) + TABLE.charAt(buffer << 4 & 0x3F) + '==';
      }
      return output;
    };
    var base64 = {
      'encode': encode,
      'decode': decode,
      'version': '<%= version %>'
    };

    // Some AMD build optimizers, like r.js, check for specific condition patterns
    // like the following:
    if (freeExports && !freeExports.nodeType) {
      if (freeModule) {
        // in Node.js or RingoJS v0.8.0+
        freeModule.exports = base64;
      } else {
        // in Narwhal or RingoJS v0.7.0-
        for (var key in base64) {
          base64.hasOwnProperty(key) && (freeExports[key] = base64[key]);
        }
      }
    } else {
      // in Rhino or a web browser
      root.base64 = base64;
    }
  })(commonjsGlobal);
});

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

//浏览器信息
function browserInfo() {
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
    this._id = this.loadId();
    this.onload();
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
      var data = {
        domPath: encodeURIComponent(domPath),
        trackingType: event.type,
        offsetX: ((pageX - rect.left - scrollX) / rect.width).toFixed(6),
        offsetY: ((pageY - rect.top - scrollY) / rect.height).toFixed(6)
      };
      this.send(data);
    }
  }, {
    key: "send",
    value: function send() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "p";
      var dat = extend(true, {}, data, this._sendData);
      dat = extend(true, {}, dat, {
        sid: this._id
      });
      var dat_str = JSON.stringify(dat);
      var dat_encode_str = base64.encode(dat_str);
      // console.log(dat_str);
      // console.log('data', dat);
      var image = new Image(1, 1);
      image.onload = function () {
        _readOnlyError("image");
      };
      var api = this._options.api;
      if (!api || api == "undefined") api = "";
      var data_send = {};
      if (type == "i") {
        // 页面初始化
        data_send = {
          i: dat_encode_str
        };
      } else if (type == "o") {
        // 页面关闭
        data_send = {
          o: dat_encode_str
        };
      } else if (type == "r") {
        // 路由切换
        data_send = {
          r: dat_encode_str
        };
      } else {
        // 页面点击
        data_send = {
          p: dat_encode_str
        };
      }
      image.src = "".concat(api, "/?").concat(stringify(data_send));
    }
  }, {
    key: "appendData",
    value: function appendData(dat) {
      if (this._sendData) this._sendData = dat;
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
  }, {
    key: "appendBaseInfo",
    value: function appendBaseInfo() {
      var url = location.href;
      var path = location.pathname;
      var data = {
        url: url,
        path: path,
        browser: browserInfo()
      };
      return data;
    }
  }, {
    key: "loadId",
    value: function loadId() {
      var k = localStorage.getItem("smart-id");
      if (!k || k == "undefined" || k == "" || k == null) k = this.saveId();
      return k;
    }
  }, {
    key: "saveId",
    value: function saveId() {
      var k = this.genId();
      localStorage.setItem("smart-id", k);
      return k;
    }
  }, {
    key: "genId",
    value: function genId() {
      var c = "abcdefghijklmn0123456789";
      var key = "";
      for (var i = 0; i < 16; i++) {
        var j = Math.round(Math.random() * c.length);
        key += c.charAt(j);
      }
      return key;
    }
  }, {
    key: "onload",
    value: function onload() {
      var _this = this;
      window.addEventListener("load", function (e) {
        _this.send(_this.appendBaseInfo(), "i");
      });
    }
  }, {
    key: "unload",
    value: function unload() {
      var _this2 = this;
      window.addEventListener("unload", function (e) {
        _this2.send(_this2.appendBaseInfo(), "o");
      });
    }
  }]);
  return Tracker;
}();

var tracker = new Tracker();

module.exports = tracker;
//# sourceMappingURL=index.js.map
