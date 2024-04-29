"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callRpc = exports.addRpcCall = void 0;
const rpcCalls = new Map();
function addRpcCall(funcName, func) {
    rpcCalls.set(funcName, func);
}
exports.addRpcCall = addRpcCall;
async function callRpc(funcName, param) {
    const rpcCall = rpcCalls.get(funcName);
    if (!rpcCall)
        throw new Error(`rpc call ${funcName} not found`);
    return await rpcCall(param);
}
exports.callRpc = callRpc;
