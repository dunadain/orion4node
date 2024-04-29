/// <reference types="node" />
declare class ProtocolMgr {
    getHandlerSubject(protocolId: number, uid: string): Promise<string>;
    encodeMsgBody(body: unknown, protoId?: number): Buffer;
    decodeMsgBody(buf: Buffer, protoId?: number): unknown;
}
export declare const protoMgr: ProtocolMgr;
export declare function protocolIds(clazz: any): void;
export {};
