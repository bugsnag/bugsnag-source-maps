var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define("src/lib/a", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function hello() {
        console.log('hello from a');
    }
    exports.default = hello;
});
define("src/lib/b", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = (function () { console.log('hey from b'); });
});
define("src/index", ["require", "exports", "src/lib/a", "src/lib/b"], function (require, exports, a_1, b_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    a_1 = __importDefault(a_1);
    b_1 = __importDefault(b_1);
    console.log('hi from index');
    a_1.default();
    b_1.default();
});
//# sourceMappingURL=out.js.map
