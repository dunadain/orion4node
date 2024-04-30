"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Greeter = void 0;
class Greeter {
    async sayHello(req) {
        return { message: `Hello, ${req.name}` };
    }
    async bar() {
        return {};
    }
}
exports.Greeter = Greeter;
