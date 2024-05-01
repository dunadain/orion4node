"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const node_events_1 = require("node:events");
const Logger_1 = require("../logger/Logger");
class Server {
    addr;
    port;
    serverType;
    uuid;
    eventEmitter = new node_events_1.EventEmitter();
    components = new Map();
    constructor(addr, port, serverType, uuid) {
        this.addr = addr;
        this.port = port;
        this.serverType = serverType;
        this.uuid = uuid;
        (0, Logger_1.initLogger)(this.name);
    }
    get name() {
        return `${this.serverType}-${this.uuid}`;
    }
    /**
     * get component
     * @param classConstructor
     * @returns
     */
    getComponent(classConstructor) {
        return this.components.get(classConstructor);
    }
    addComponent(classConstructor) {
        const comp = new classConstructor(this);
        this.components.set(classConstructor, comp);
        return comp;
    }
    async start() {
        for (const pair of this.components) {
            const comp = pair[1];
            try {
                await comp.init?.call(comp);
            }
            catch (e) {
                (0, Logger_1.logErr)(e);
            }
        }
        for (const pair of this.components) {
            const comp = pair[1];
            try {
                await comp.start?.call(comp);
            }
            catch (e) {
                (0, Logger_1.logErr)(e);
            }
        }
        process.on('SIGTERM', this.exit);
        process.on('SIGINT', this.exit);
    }
    /**
     * have to be tested under k8s
     */
    exit = () => {
        this.shutdown()
            .then(() => {
            Logger_1.logger.info(`${this.name} is about to die peacefully...`);
            process.exit(0);
        })
            .catch(() => {
            (0, Logger_1.logErr)(`${this.name} was killed`);
            process.exit(1);
        });
    };
    async shutdown() {
        process.off('SIGTERM', this.exit);
        process.off('SIGINT', this.exit);
        const promises = [];
        for (const pair of this.components) {
            const comp = pair[1];
            if (typeof comp.dispose !== 'function')
                continue;
            promises.push(comp.dispose.call(comp).catch((e) => {
                (0, Logger_1.logErr)(e);
                return Promise.resolve(e);
            }));
        }
        const results = await Promise.all(promises);
        if (results.some((r) => r instanceof Error)) {
            throw new Error('some components failed to dispose');
        }
    }
}
exports.Server = Server;
