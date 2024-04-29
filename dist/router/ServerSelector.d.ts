declare class ServerSelector {
    private routes;
    hasRoute(serverType: string): boolean;
    /**
     * add routing logic
     * @param serverType
     * @param route
     */
    addRoute(serverType: string, route: (uid: string) => Promise<string>): void;
    /**
     * return selected serverId
     * @param uid user id
     * @param serverType
     */
    selectServer(uid: string, serverType: string): Promise<string>;
}
export declare const serverSelector: ServerSelector;
export {};
