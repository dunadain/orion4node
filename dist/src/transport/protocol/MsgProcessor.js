"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = exports.encode = exports.MsgType = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const utils_1 = require("./utils");
const MSG_FLAG_BYTES = 1;
const MSG_ROUTE_CODE_BYTES = 2;
// const MSG_ID_MAX_BYTES = 5;
// const MSG_ROUTE_LEN_BYTES = 1;
const MSG_ROUTE_CODE_MAX = 0xffff;
// const MSG_COMPRESS_ROUTE_MASK = 0x1;
const MSG_COMPRESS_GZIP_MASK = 0x1;
const MSG_COMPRESS_GZIP_ENCODE_MASK = 1 << 3;
const MSG_TYPE_MASK = 0x7;
var MsgType;
(function (MsgType) {
    MsgType[MsgType["REQUEST"] = 0] = "REQUEST";
    MsgType[MsgType["NOTIFY"] = 1] = "NOTIFY";
    MsgType[MsgType["RESPONSE"] = 2] = "RESPONSE";
    MsgType[MsgType["PUSH"] = 3] = "PUSH";
})(MsgType || (exports.MsgType = MsgType = {}));
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
function encode(id, type, route, msg, compressGzip) {
    // caculate message max length
    const idBytes = msgHasId(type) ? caculateMsgIdBytes(id) : 0;
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
    offset = encodeMsgFlag(type, buffer, offset, !!compressGzip);
    // add message id
    if (msgHasId(type)) {
        offset = encodeMsgId(id, buffer, offset);
    }
    // add route
    if (msgHasRoute(type)) {
        offset = encodeMsgRoute(route, buffer, offset);
    }
    // add body
    if (msg) {
        encodeMsgBody(msg, buffer, offset);
    }
    return buffer;
}
exports.encode = encode;
/**
 * Message protocol decode.
 *
 * @param  {Buffer|Uint8Array} buffer message bytes
 * @return {Object}            message object
 */
function decode(buffer) {
    const bytes = Buffer.from(buffer);
    const bytesLen = bytes.length || bytes.byteLength;
    let offset = 0;
    let id = 0;
    let route = 0;
    // parse flag
    const flag = bytes[offset++];
    // const compressRoute = flag & MSG_COMPRESS_ROUTE_MASK;
    const type = (flag & MSG_TYPE_MASK);
    const compressGzip = (flag >> 3) & MSG_COMPRESS_GZIP_MASK;
    // parse id
    if (msgHasId(type)) {
        let m = 0;
        let i = 0;
        do {
            m = bytes[offset];
            id += (m & 0x7f) << (7 * i);
            offset++;
            i++;
        } while (m >= 128);
    }
    // parse route
    if (msgHasRoute(type)) {
        route = (bytes[offset++] << 8) | bytes[offset++];
    }
    // parse body
    const bodyLen = bytesLen - offset;
    const body = Buffer.alloc(bodyLen);
    (0, utils_1.copyArray)(body, 0, bytes, offset, bodyLen);
    return {
        id: id,
        type: type,
        route: route,
        body: body,
        compressGzip: compressGzip,
    };
}
exports.decode = decode;
function msgHasId(type) {
    return type === MsgType.REQUEST || type === MsgType.RESPONSE;
}
function msgHasRoute(type) {
    return type === MsgType.REQUEST || type === MsgType.NOTIFY || type === MsgType.PUSH;
}
function caculateMsgIdBytes(id) {
    let len = 0;
    do {
        len += 1;
        id >>= 7;
    } while (id > 0);
    return len;
}
function encodeMsgFlag(type, buffer, offset, compressGzip) {
    buffer[offset] = type;
    if (compressGzip) {
        buffer[offset] = buffer[offset] | MSG_COMPRESS_GZIP_ENCODE_MASK;
    }
    return offset + MSG_FLAG_BYTES;
}
function encodeMsgId(id, buffer, offset) {
    do {
        let tmp = id % 128;
        const next = Math.floor(id / 128);
        if (next !== 0) {
            tmp = tmp + 128;
        }
        buffer[offset++] = tmp;
        id = next;
    } while (id !== 0);
    return offset;
}
function encodeMsgRoute(_route, buffer, offset) {
    const route = _route;
    if (route > MSG_ROUTE_CODE_MAX) {
        throw new Error('route number is overflow');
    }
    buffer[offset++] = (route >> 8) & 0xff;
    buffer[offset++] = route & 0xff;
    return offset;
}
function encodeMsgBody(msg, buffer, offset) {
    (0, utils_1.copyArray)(buffer, offset, msg, 0, msg.length);
    return offset + msg.length;
}
