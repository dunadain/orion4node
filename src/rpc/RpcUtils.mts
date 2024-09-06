class RpcUtils {
    async callRpc(protoStr: string, param: Uint8Array) {
        /* eslint-disable */
        const rpcProto = rpcProtoMap.get(protoStr);
        if (!rpcProto) throw new Error(`rpc call ${protoStr} not found`);
        const reqDecoded = (rpcProto.reqType as any).decode(param);
        const res = await rpcProto.call(reqDecoded);
        const structure = rpcProto.resType as any;
        const msg = structure.create(res);
        return structure.encode(msg).finish() as Uint8Array;
    }
}

export const rpcUtils = new RpcUtils();

const rpcProtoMap = new Map<
    string,
    { reqType: unknown; resType: unknown; call: (param: unknown) => Promise<unknown> }
>();

export function serveRpc(rpcProto: string, reqType: unknown, resType: unknown) {
    return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
        // routeFunctions.set(protoId, descriptor.value);
        rpcProtoMap.set(rpcProto, {
            reqType: reqType,
            resType: resType,
            call: descriptor.value as (param: unknown) => Promise<unknown>,
        });
    };
}
