"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatelessRouteSubscriber = void 0;
const RouteSubscriber_1 = require("./RouteSubscriber");
class StatelessRouteSubscriber extends RouteSubscriber_1.RouteSubscriber {
    async init() {
        this.subject = `handler.${this.server.serverType}`;
        this.opt = { queue: this.server.serverType };
    }
}
exports.StatelessRouteSubscriber = StatelessRouteSubscriber;
