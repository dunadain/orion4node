import { EventEmitter } from 'node:events';
import type { ComponentConstructor } from '../interfaces/defines.mjs';
import type { Component } from '../component/Component.mjs';
export declare class Server {
    readonly serverType: string;
    readonly eventEmitter: EventEmitter<[never]>;
    private components;
    private _uuid;
    /**
     *
     * @param serverType
     * @param uuid 必须外面传进来不能自己生成，因为当你选服时候的uuid只能外面生成
     */
    constructor(serverType: string, uuid?: string);
    get uuid(): string;
    get name(): string;
    /**
     * get component
     * @param classConstructor
     * @returns
     */
    getComponent<T extends Component>(classConstructor: ComponentConstructor<T>): T | undefined;
    addComponent<T extends Component>(classConstructor: ComponentConstructor<T>): T;
    start(): Promise<void>;
    /**
     * have to be tested under k8s
     */
    private exit;
    /**
     * components will be disposed in the order they are added
     */
    shutdown(): Promise<void>;
}
