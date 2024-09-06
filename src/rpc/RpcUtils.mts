/* eslint-disable */
import type { Constructor } from '../index.mjs';

class RpcUtils {
    async callRpc(protoStr: string, param: Uint8Array) {
        const rpcProto = rpcProtoMap.get(protoStr);
        if (!rpcProto) throw new Error(`rpc call ${protoStr} not found`);
        let reqDecoded = (rpcProto.reqType as any).decode(param);
        let res = await rpcProto.call(reqDecoded);
        const structure = rpcProto.resType as any;
        const err = structure.verify(res);
        if (err) throw new Error(err);
        let msg = structure.create(res);
        return structure.encode(msg).finish() as Uint8Array;
    }
}

export const rpcUtils = new RpcUtils();

export async function callRpc(protoStr: string, param: unknown) {
    const rpcProto = rpcProtoMap.get(protoStr);
    if (!rpcProto) throw new Error(`rpc call ${protoStr} not found`);
    let reqDecoded = (rpcProto.reqType as any).decode(param as Uint8Array);
    let res = await rpcProto.call(reqDecoded);
    let msg = (rpcProto.resType as any).create(res);
    return (rpcProto.resType as any).encode(msg).finish();
}

const rpcProtoMap = new Map<
    string,
    { reqType: Constructor<unknown>; resType: Constructor<unknown>; call: (param: unknown) => Promise<unknown> }
>();

export function serveRpc<T1, T2>(rpcProto: string, reqType: Constructor<T1>, resType: Constructor<T2>) {
    return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
        // routeFunctions.set(protoId, descriptor.value);
        rpcProtoMap.set(rpcProto, {
            reqType: reqType,
            resType: resType,
            call: descriptor.value as (param: unknown) => Promise<unknown>,
        });
    };
}
