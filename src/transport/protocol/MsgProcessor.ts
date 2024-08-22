/* eslint-disable @typescript-eslint/naming-convention */
import { copyArray } from './utils';

const MSG_FLAG_BYTES = 1;
const MSG_ROUTE_CODE_BYTES = 2;
// const MSG_ID_MAX_BYTES = 5;
// const MSG_ROUTE_LEN_BYTES = 1;

// const MSG_ROUTE_CODE_MAX = 0xffff;

// const MSG_COMPRESS_ROUTE_MASK = 0x1;
// const MSG_COMPRESS_GZIP_MASK = 0x1;
// const MSG_COMPRESS_GZIP_ENCODE_MASK = 1 << 3;
// const MSG_TYPE_MASK = 0x7;

export enum MsgType {
    REQUEST,
    RESPONSE,
    NOTIFY,
    PUSH,
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
export function encode(id: number, type: MsgType, route: number, msg?: Buffer) {
    // caculate message max length
    const idBytes = msgHasId(type) ? 1 : 0;
    let msgLen = MSG_FLAG_BYTES + idBytes;

    if (msgHasRoute(type)) {
        msgLen += MSG_ROUTE_CODE_BYTES;
    }

    if (msg) {
        msgLen += msg.length;
    }

    const buffer = Buffer.alloc(msgLen);
    let offset = 0;

    // add flag
    buffer.writeUInt8(type, offset);
    offset += MSG_FLAG_BYTES;

    // add message id
    if (msgHasId(type)) {
        buffer.writeUInt8(id, offset);
        ++offset;
    }

    // add route
    if (msgHasRoute(type)) {
        buffer.writeUInt16BE(route, offset);
        offset += MSG_ROUTE_CODE_BYTES;
    }

    // add body
    if (msg) {
        encodeMsgBody(msg, buffer, offset);
    }

    return buffer;
}

/**
 * Message protocol decode.
 *
 * @param  {Buffer|Uint8Array} buffer message bytes
 * @return {Object}            message object
 */
export function decode(buffer: Buffer) {
    const bytesLen = buffer.length;
    let offset = 0;
    const msgType = buffer.readUint8(offset);
    offset += MSG_FLAG_BYTES;
    let id = 0;
    if (msgHasId(msgType)) {
        id = buffer.readUint8(offset);
        offset += 1;
    }

    let route = 0;
    if (msgHasRoute(msgType)) {
        route = buffer.readUint16BE(offset);
        offset += MSG_ROUTE_CODE_BYTES;
    }

    const bodyLen = bytesLen - offset;
    const body = Buffer.alloc(bodyLen);
    copyArray(body, 0, buffer, offset, bodyLen);

    return {
        id: id,
        type: msgType,
        route: route,
        body: body,
    };
}

function msgHasId(type: MsgType) {
    return type === MsgType.REQUEST || type === MsgType.RESPONSE;
}

function msgHasRoute(type: MsgType) {
    return type === MsgType.REQUEST || type === MsgType.NOTIFY || type === MsgType.PUSH;
}

// function caculateMsgIdBytes(id: number) {
//     let len = 0;
//     do {
//         len += 1;
//         id >>= 7;
//     } while (id > 0);
//     return len;
// }

// function encodeMsgFlag(type: MsgType, buffer: Buffer, offset: number) {
//     buffer[offset] = type;

//     // if (compressGzip) {
//     //     buffer[offset] = buffer[offset] | MSG_COMPRESS_GZIP_ENCODE_MASK;
//     // }

//     return offset + MSG_FLAG_BYTES;
// }

// function encodeMsgId(id: number, buffer: Buffer, offset: number) {
//     do {
//         let tmp = id % 128;
//         const next = Math.floor(id / 128);

//         if (next !== 0) {
//             tmp = tmp + 128;
//         }
//         buffer[offset++] = tmp;

//         id = next;
//     } while (id !== 0);

//     return offset;
// }

// function encodeMsgRoute(_route: number, buffer: Buffer, offset: number) {
//     const route = _route;
//     if (route > MSG_ROUTE_CODE_MAX) {
//         throw new Error('route number is overflow');
//     }

//     buffer[offset++] = (route >> 8) & 0xff;
//     buffer[offset++] = route & 0xff;

//     return offset;
// }

function encodeMsgBody(msg: Buffer, buffer: Buffer, offset: number) {
    copyArray(buffer, offset, msg, 0, msg.length);
    return offset + msg.length;
}
