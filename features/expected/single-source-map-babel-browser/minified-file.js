"use strict";

var _a = _interopRequireDefault(require("./lib/a"));

var _b = _interopRequireDefault(require("./lib/b"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

console.log('hi from index');
var b = new _b["default"]();
var a = new _a["default"](b);
a.hello();
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var A = /*#__PURE__*/function () {
  function A(b) {
    _classCallCheck(this, A);

    this.b = b;
  }

  _createClass(A, [{
    key: "hello",
    value: function hello() {
      this.b.hey();
      console.log('hello');
    }
  }]);

  return A;
}();

exports["default"] = A;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var B = /*#__PURE__*/function () {
  function B() {
    _classCallCheck(this, B);
  }

  _createClass(B, [{
    key: "hey",
    value: function hey() {
      console.log('hey');
    }
  }]);

  return B;
}();

exports["default"] = B;

//# sourceMappingURL=compiled.js.map
