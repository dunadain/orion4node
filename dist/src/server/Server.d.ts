/// <reference types="node" />
import { EventEmitter } from 'node:events';
import type { ComponentConstructor } from '../interfaces/defines';
import type { Component } from '../component/Component';
export declare class Server {
    readonly serverType: string;
    readonly uuid: number;
    readonly eventEmitter: EventEmitter<[never]>;
    private components;
    constructor(serverType: string, uuid: number);
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
