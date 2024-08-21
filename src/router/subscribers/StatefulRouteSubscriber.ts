import { RouteSubscriber } from './RouteSubscriber';

export class StatefulRouteSubscriber extends RouteSubscriber {
    async init() {
        this.subject = `handler.${this.server.uuid.toString()}.>`;
        this.opt = { queue: this.server.serverType };
    }
}
