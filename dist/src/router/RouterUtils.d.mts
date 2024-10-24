/// <reference types="node" resolution-mode="require"/>
import { Server } from '../server/Server.mjs';
import type { Context } from './RouterTypeDef.mjs';
export declare function encodeRouterPack(contextInfo: Context, body?: Buffer): Uint8Array;
export declare function decodeRouterPack(buffer: Buffer): {
    context: {
        clientId: number;
        protoId: number;
        uid: string;
        roleid: string;
        sUuid: string;
        reqId: number;
    };
    body: Buffer;
};
export declare function isUpperCase(char: string): boolean;
export declare function protocol(protoId: number): (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function httpProto(protoId: number): (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => void;
declare class RouterUtils {
    handle(context: Context, data: unknown, server: Server): Promise<unknown>;
    handleHttp(protoId: number, data: unknown, server: Server): Promise<unknown>;
}
export declare const routerUtils: RouterUtils;
export {};
