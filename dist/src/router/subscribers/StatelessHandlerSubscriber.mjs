import { RouteSubscriber } from './RouteSubscriber.mjs';
export class StatelessHandlerSubscriber extends RouteSubscriber {
    async init() {
        this.subject = `handler.${this.server.serverType}`;
        this.opt = { queue: this.server.serverType };
    }
}
