import { Server } from '../server/Server.mjs';
/**
 * Component lift cycle: init -> start -> dispose
 */
export class Component {
    server;
    constructor(server) {
        this.server = server;
    }
    getComponent(classConstructor) {
        return this.server.getComponent(classConstructor);
    }
}
