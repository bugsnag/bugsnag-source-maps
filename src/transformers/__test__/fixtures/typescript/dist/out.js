var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define("lib/a", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function a() {
        console.log('hi from a');
    }
    exports.default = a;
});
define("index", ["require", "exports", "lib/a"], function (require, exports, a_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    a_1 = __importDefault(a_1);
    a_1.default();
});
//# sourceMappingURL=out.js.map