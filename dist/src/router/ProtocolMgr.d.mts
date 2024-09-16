/// <reference types="node" resolution-mode="require"/>
import type { MsgBodyDecoder, MsgBodyEncoder } from '../interfaces/defines.mjs';
declare class ProtocolMgr {
    private encoder;
    private decoder;
    /**
     * @deprecated
     */
    getHandlerSubject(protocolId: number, uid: string): Promise<string>;
    encodeMsgBody(body: unknown, protoId: number): Buffer;
    decodeMsgBody(buf: Buffer, protoId: number): unknown;
    setEncoder(encoder: MsgBodyEncoder): void;
    setDecoder(decoder: MsgBodyDecoder): void;
}
export declare const protoMgr: ProtocolMgr;
/**
 * @deprecated
 */
export declare function register(clazz: any): void;
export {};
