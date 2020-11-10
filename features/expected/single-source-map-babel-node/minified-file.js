"use strict";

var _a = _interopRequireDefault(require("./lib/a"));

var _b = _interopRequireDefault(require("./lib/b"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log('hi from index');
const b = new _b.default();
const a = new _a.default(b);
a.hello();
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class A {
  constructor(b) {
    this.b = b;
  }

  hello() {
    this.b.hey();
    console.log('hello');
  }

}

exports.default = A;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class B {
  hey() {
    console.log('hey');
  }

}

exports.default = B;

//# sourceMappingURL=compiled.js.map
