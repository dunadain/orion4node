import { RouteSubscriber } from './RouteSubscriber';

export class StatelessRouteSubscriber extends RouteSubscriber {
    async init() {
        this.subject = `handler.${this.server.serverType}`;
        this.opt = { queue: this.server.serverType };
    }
}
