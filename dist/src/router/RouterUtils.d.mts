/// <reference types="node" resolution-mode="require"/>
import { Server } from '../server/Server.mjs';
import type { Context } from './RouterTypeDef.mjs';
export declare function encodeRouterPack(contextInfo: Context, body?: Buffer): Buffer;
export declare function decodeRouterPack(buffer: Buffer): {
    context: Context;
    body: Buffer;
};
export declare function isUpperCase(char: string): boolean;
export declare function protocol(protoId: number): (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function httpProto(protoId: number): (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => void;
declare class RouterUtils {
    handle(context: Context, data: unknown, server: Server): Promise<unknown>;
    handleHttp(protoId: number, data: unknown): Promise<unknown>;
}
export declare const routerUtils: RouterUtils;
export {};
