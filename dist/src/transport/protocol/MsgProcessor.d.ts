/// <reference types="node" />
export declare enum MsgType {
    REQUEST = 0,
    NOTIFY = 1,
    RESPONSE = 2,
    PUSH = 3
}
/**
 * Message protocol encode.
 *
 * @param  {Number} id            message id
 * @param  {Number} type          message type
 * @param  {Number} route         route code
 * @param  {Buffer} msg           message body bytes
 * @param  compressGzip always false
 * @return {Buffer}               encode result
 */
export declare function encode(id: number, type: MsgType, route: number, msg?: Buffer, compressGzip?: boolean): Buffer;
/**
 * Message protocol decode.
 *
 * @param  {Buffer|Uint8Array} buffer message bytes
 * @return {Object}            message object
 */
export declare function decode(buffer: Buffer): {
    id: number;
    type: MsgType;
    route: number;
    body: Buffer;
    compressGzip: number;
};
