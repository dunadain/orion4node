import { ComponentConstructor } from '../TypeDef';
import { Component } from '../component/Component';


export class Server {
    addr = '';
    port = 0;

    private components = new Map<new () => Component, Component>();

    getComponent<T extends Component>(classConstructor: ComponentConstructor<T>): T | undefined {
        return this.components.get(classConstructor) as T;
    }

    addComponent<T extends Component>(classConstructor: ComponentConstructor<T>) {
        const comp = new classConstructor(this);
        this.components.set(classConstructor, comp);
    }

    start() {
        //
    }
}