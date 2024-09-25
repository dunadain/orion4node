class ServerSelector {
    private routes = new Map<string, (uid: string) => Promise<string>>();
    hasRoute(serverType: string) {
        return this.routes.has(serverType);
    }

    /**
     * add routing logic
     * @param serverType
     * @param route
     */
    addRoute(serverType: string, route: (uid: string) => Promise<string>) {
        this.routes.set(serverType, route);
    }
    /**
     * return selected serverId
     * @param uid user id
     * @param serverType
     */
    async selectServer(uid: string, serverType: string) {
        const route = this.routes.get(serverType);
        if (!route) throw new Error(`route not found for serverType:${serverType}`);
        return route(uid);
    }
}

export const serverSelector = new ServerSelector();
