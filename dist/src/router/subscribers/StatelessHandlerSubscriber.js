"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatelessHandlerSubscriber = void 0;
const RouteSubscriber_1 = require("./RouteSubscriber");
class StatelessHandlerSubscriber extends RouteSubscriber_1.RouteSubscriber {
    async init() {
        this.subject = `handler.${this.server.serverType}`;
        this.opt = { queue: this.server.serverType };
    }
}
exports.StatelessHandlerSubscriber = StatelessHandlerSubscriber;
