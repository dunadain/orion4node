/// <reference types="node" />
import { Server } from '../server/Server';
import { Context } from './RouterTypeDef';
export declare function encodeRouterPack(contextInfo: Context, body?: Buffer): Buffer;
export declare function decodeRouterPack(buffer: Buffer): {
    context: Context;
    body: Buffer;
};
export declare function isUpperCase(char: string): boolean;
export declare function protocol(protoId: number): (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function handle(context: Context, data: unknown, server: Server): Promise<unknown>;
