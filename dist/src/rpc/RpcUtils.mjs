class RpcUtils {
    async callRpc(protoStr, param) {
        const rpcProto = rpcProtoMap.get(protoStr);
        if (!rpcProto)
            throw new Error(`rpc call ${protoStr} not found`);
        let reqDecoded = rpcProto.reqType.decode(param);
        let res = await rpcProto.call(reqDecoded);
        const structure = rpcProto.resType;
        const err = structure.verify(res);
        if (err)
            throw new Error(err);
        let msg = structure.create(res);
        return structure.encode(msg).finish();
    }
}
export const rpcUtils = new RpcUtils();
export async function callRpc(protoStr, param) {
    const rpcProto = rpcProtoMap.get(protoStr);
    if (!rpcProto)
        throw new Error(`rpc call ${protoStr} not found`);
    let reqDecoded = rpcProto.reqType.decode(param);
    let res = await rpcProto.call(reqDecoded);
    let msg = rpcProto.resType.create(res);
    return rpcProto.resType.encode(msg).finish();
}
const rpcProtoMap = new Map();
export function serveRpc(rpcProto, reqType, resType) {
    return function (target, propertyKey, descriptor) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        // routeFunctions.set(protoId, descriptor.value);
        rpcProtoMap.set(rpcProto, {
            reqType: reqType,
            resType: resType,
            call: descriptor.value,
        });
    };
}
