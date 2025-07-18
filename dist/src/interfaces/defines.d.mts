export declare type ComponentConstructor<T> = new (...args: any[]) => T;
export declare type AbstractedConstructor<T = unknown> = abstract new (...args: any[]) => T;
export declare type Constructor<T> = new (...args: any[]) => T;
export interface MsgBodyEncoder {
    encode(body: unknown, protoId: number): Buffer;
}
export interface MsgBodyDecoder {
    decode(buf: Buffer, protoId: number): unknown;
}
