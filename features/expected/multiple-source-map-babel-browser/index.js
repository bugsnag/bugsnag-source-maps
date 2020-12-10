"use strict";

var _a = _interopRequireDefault(require("./lib/a"));

var _b = _interopRequireDefault(require("./lib/b"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

console.log('hi from index');
var b = new _b["default"]();
var a = new _a["default"](b);
a.hello();
//# sourceMappingURL=index.js.map
