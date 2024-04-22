const rpcCalls = new Map<string, (param: unknown) => Promise<unknown>>();
export function addRpcCall(funcName: string, func: (param: unknown) => Promise<unknown>) {
    rpcCalls.set(funcName, func);
}

export async function callRpc(funcName: string, param: unknown) {
    const rpcCall = rpcCalls.get(funcName);
    if (!rpcCall) throw new Error(`rpc call ${funcName} not found`);
    return await rpcCall(param);
}
