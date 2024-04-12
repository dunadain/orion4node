import { ComponentConstructor } from '../TypeDef';
import { Component } from '../component/Component';
import { logErr } from '../logger/Logger';

export class Server {
    constructor(public readonly addr: string, public readonly port: number) {}

    private components = new Map<new () => Component, Component>();

    /**
     * get component
     * @param classConstructor
     * @returns
     */
    getComponent<T extends Component>(
        classConstructor: ComponentConstructor<T>
    ): T | undefined {
        return this.components.get(classConstructor) as T;
    }

    addComponent<T extends Component>(
        classConstructor: ComponentConstructor<T>
    ) {
        const comp = new classConstructor(this);
        this.components.set(classConstructor, comp);
        return comp;
    }

    async start() {
        for (const pair of this.components) {
            const comp = pair[1];
            try {
                await comp.start?.call(comp);
            } catch (e) {
                logErr(e);
            }
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
