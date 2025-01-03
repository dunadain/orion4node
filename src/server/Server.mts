import { EventEmitter } from 'node:events';
import type { ComponentConstructor } from '../interfaces/defines.mjs';
import type { Component } from '../component/Component.mjs';
import { initLogger, logErr, logger } from '../logger/Logger.mjs';
import { v4 as uuidv4 } from 'uuid';

export class Server {
    readonly eventEmitter = new EventEmitter();
    private components = new Map<new () => Component, Component>();

    private _uuid: string;
    /**
     *
     * @param serverType
     * @param uuid 必须外面传进来不能自己生成，因为当你选服时候的uuid只能外面生成
     */
    constructor(public readonly serverType: string, uuid?: string) {
        this._uuid = uuid ?? uuidv4();
        initLogger(this.name);
    }

    get uuid() {
        return this._uuid;
    }

    get name() {
        return `${this.serverType}_${String(this.uuid)}`;
    }
    /**
     * get component
     * @param classConstructor
     * @returns
     */
    getComponent<T extends Component>(classConstructor: ComponentConstructor<T>): T | undefined {
        return this.components.get(classConstructor) as T;
    }

    addComponent<T extends Component>(classConstructor: ComponentConstructor<T>) {
        const comp = new classConstructor(this);
        this.components.set(classConstructor, comp);
        return comp;
    }

    async start() {
        for (const pair of this.components) {
            const comp = pair[1];
            try {
                await comp.init?.call(comp);
            } catch (e) {
                logErr(e);
            }
        }

        for (const pair of this.components) {
            const comp = pair[1];
            try {
                await comp.start?.call(comp);
            } catch (e) {
                logErr(e);
            }
        }

        process.on('SIGTERM', this.exit);
        process.on('SIGINT', this.exit);
    }

    /**
     * have to be tested under k8s
     */
    private exit = () => {
        this.shutdown()
            .then(() => {
                logger.info(`${this.name} is about to die peacefully...`);
                process.exit(0);
            })
            .catch((e: unknown) => {
                logErr(e);
                process.exit(1);
            });
    };

    /**
     * components will be disposed in the order they are added
     */
    async shutdown() {
        process.off('SIGTERM', this.exit);
        process.off('SIGINT', this.exit);

        let hasError = false;
        for (const [constructor, comp] of this.components) {
            if (typeof comp.dispose !== 'function') continue;
            try {
                await comp.dispose.call(comp);
            } catch (e) {
                hasError = true;
                logErr(e);
                logger.error(`component ${constructor.name} failed to dispose`);
            }
        }
        if (hasError) {
            throw new Error('some components failed to dispose');
        }
    }
}
