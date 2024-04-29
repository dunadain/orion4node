"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Component = void 0;
/**
 * Component lift cycle: init -> start -> dispose
 */
class Component {
    server;
    constructor(server) {
        this.server = server;
    }
    getComponent(classConstructor) {
        return this.server.getComponent(classConstructor);
    }
}
exports.Component = Component;
