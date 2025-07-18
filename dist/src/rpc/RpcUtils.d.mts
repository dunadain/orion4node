import type { Constructor } from '../index.mjs';
declare class RpcUtils {
    callRpc(protoStr: string, param: Uint8Array): Promise<Uint8Array<ArrayBufferLike>>;
}
export declare const rpcUtils: RpcUtils;
export declare function callRpc(protoStr: string, param: unknown): Promise<any>;
export declare function serveRpc<T1, T2>(rpcProto: string, reqType: Constructor<T1>, resType: Constructor<T2>): (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => void;
export {};
