export declare function addRpcCall(funcName: string, func: (param: unknown) => Promise<unknown>): void;
export declare function callRpc(funcName: string, param: unknown): Promise<unknown>;
