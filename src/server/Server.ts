import { EventEmitter } from 'node:events';
import { ComponentConstructor } from '../TypeDef';
import { Component } from '../component/Component';
import { logErr } from '../logger/Logger';
import * as path from 'node:path';
import * as fs from 'fs/promises';

export class Server {
    readonly eventEmitter = new EventEmitter();
    private components = new Map<new () => Component, Component>();
    constructor(
        public readonly addr: string,
        public readonly port: number,
        public readonly serverType: string,
        public readonly uuid: string
    ) {}

    get name() {
        return `${this.serverType}-${this.uuid}`;
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
        await this.loadHandlers();
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
    }

    private async loadHandlers() {
        if (!require.main) return;
        const handlerDir = path.join(require.main.path, 'handler');
        try {
            const list = await fs.readdir(handlerDir);
            const promises: Promise<unknown>[] = [];
            for (const fileName of list) {
                promises.push(import(path.join(handlerDir, fileName)));
            }
            await Promise.all(promises);
        } catch (e) {
            logErr(e);
        }
    }

    shutdown() {
        for (const pair of this.components) {
            const comp = pair[1];
            try {
                comp.dispose?.call(comp);
            } catch (e) {
                logErr(e);
            }
        }
    }
}
