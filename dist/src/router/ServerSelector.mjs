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
export const serverSelector = new ServerSelector();
