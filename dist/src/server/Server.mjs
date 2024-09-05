import { EventEmitter } from 'node:events';
import { initLogger, logErr, logger } from '../logger/Logger.mjs';
export class Server {
    serverType;
    uuid;
    eventEmitter = new EventEmitter();
    components = new Map();
    constructor(serverType, uuid) {
        this.serverType = serverType;
        this.uuid = uuid;
        initLogger(this.name);
    }
    get name() {
        return `${this.serverType}-${String(this.uuid)}`;
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
                logErr(e);
            }
        }
        for (const pair of this.components) {
            const comp = pair[1];
            try {
                await comp.start?.call(comp);
            }
            catch (e) {
                logErr(e);
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
            logger.info(`${this.name} is about to die peacefully...`);
            process.exit(0);
        })
            .catch(() => {
            logErr(`${this.name} was killed`);
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
                logErr(e);
                return Promise.resolve(e);
            }));
        }
        const results = await Promise.all(promises);
        if (results.some((r) => r instanceof Error)) {
            throw new Error('some components failed to dispose');
        }
    }
}
