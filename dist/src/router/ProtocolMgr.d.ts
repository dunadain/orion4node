/// <reference types="node" />
import { MsgBodyDecoder, MsgBodyEncoder } from '../interfaces/defines';
declare class ProtocolMgr {
    private encoder;
    private decoder;
    getHandlerSubject(protocolId: number, uid: string): Promise<string>;
    encodeMsgBody(body: unknown, protoId: number): Buffer;
    decodeMsgBody(buf: Buffer, protoId: number): unknown;
    setEncoder(encoder: MsgBodyEncoder): void;
    setDecoder(decoder: MsgBodyDecoder): void;
}
export declare const protoMgr: ProtocolMgr;
export declare function register(clazz: any): void;
export {};
