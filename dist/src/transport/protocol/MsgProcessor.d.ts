/// <reference types="node" />
export declare enum MsgType {
    REQUEST = 0,
    RESPONSE = 1,
    NOTIFY = 2,
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
export declare function encode(id: number, type: MsgType, route: number, msg?: Buffer): Buffer;
/**
 * Message protocol decode.
 *
 * @param  {Buffer|Uint8Array} buffer message bytes
 * @return {Object}            message object
 */
export declare function decode(buffer: Buffer): {
    id: number;
    type: number;
    route: number;
    body: Buffer;
};
