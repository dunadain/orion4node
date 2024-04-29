/// <reference types="node" />
import { EventEmitter } from 'node:events';
import { ComponentConstructor } from '../interfaces/defines';
import { Component } from '../component/Component';
export declare class Server {
    readonly addr: string;
    readonly port: number;
    readonly serverType: string;
    readonly uuid: string;
    readonly eventEmitter: EventEmitter<[never]>;
    private components;
    constructor(addr: string, port: number, serverType: string, uuid: string);
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
