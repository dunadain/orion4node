"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatefulRouteSubscriber = void 0;
const RouteSubscriber_1 = require("./RouteSubscriber");
class StatefulRouteSubscriber extends RouteSubscriber_1.RouteSubscriber {
    async init() {
        this.subject = `handler.${this.server.uuid.toString()}`;
        this.opt = { queue: this.server.serverType };
    }
}
exports.StatefulRouteSubscriber = StatefulRouteSubscriber;
