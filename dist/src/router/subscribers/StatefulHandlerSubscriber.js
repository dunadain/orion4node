"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatefulHandlerSubscriber = void 0;
const RouteSubscriber_1 = require("./RouteSubscriber");
class StatefulHandlerSubscriber extends RouteSubscriber_1.RouteSubscriber {
    async init() {
        this.subject = `handler.${this.server.uuid.toString()}`;
        this.opt = { queue: this.server.serverType };
    }
}
exports.StatefulHandlerSubscriber = StatefulHandlerSubscriber;
