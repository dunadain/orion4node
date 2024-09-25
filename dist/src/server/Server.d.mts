/// <reference types="node" resolution-mode="require"/>
import { EventEmitter } from 'node:events';
import type { ComponentConstructor } from '../interfaces/defines.mjs';
import type { Component } from '../component/Component.mjs';
export declare class Server {
    readonly serverType: string;
    readonly uuid: string;
    readonly eventEmitter: EventEmitter<[never]>;
    private components;
    /**
     *
     * @param serverType
     * @param uuid 必须外面传进来不能自己生成，因为当你选服时候的uuid只能外面生成
     */
    constructor(serverType: string, uuid: string);
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
    shutdown(): Promise<void>;
}
