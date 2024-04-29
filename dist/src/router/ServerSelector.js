"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverSelector = void 0;
class ServerSelector {
    routes = new Map();
    hasRoute(serverType) {
        return this.routes.has(serverType);
    }
    /**
     * add routing logic
     * @param serverType
     * @param route
     */
    addRoute(serverType, route) {
        this.routes.set(serverType, route);
    }
    /**
     * return selected serverId
     * @param uid user id
     * @param serverType
     */
    async selectServer(uid, serverType) {
        const route = this.routes.get(serverType);
        if (!route)
            throw new Error(`route not found for serverType:${serverType}`);
        return route(uid);
    }
}
exports.serverSelector = new ServerSelector();
