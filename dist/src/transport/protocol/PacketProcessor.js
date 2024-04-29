"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = exports.encode = exports.PackType = void 0;
const utils_1 = require("./utils");
/* eslint-disable @typescript-eslint/naming-convention */
const PKG_HEAD_BYTES = 4;
var PackType;
(function (PackType) {
    PackType[PackType["HANDSHAKE"] = 0] = "HANDSHAKE";
    PackType[PackType["HANDSHAKE_ACK"] = 1] = "HANDSHAKE_ACK";
    PackType[PackType["HEARTBEAT"] = 2] = "HEARTBEAT";
    PackType[PackType["DATA"] = 3] = "DATA";
    PackType[PackType["KICK"] = 4] = "KICK";
    PackType[PackType["ERROR"] = 5] = "ERROR";
})(PackType || (exports.PackType = PackType = {}));
function isValidType(type) {
    switch (type) {
        case PackType.HANDSHAKE:
        case PackType.HANDSHAKE_ACK:
        case PackType.HEARTBEAT:
        case PackType.DATA:
        case PackType.KICK:
        case PackType.ERROR:
            return true;
        default:
            return false;
    }
}
/**
 * packet protocol encode.
 *
 * Pinus packet format:
 * +------+-------------+------------------+
 * | type | body length |       body       |
 * +------+-------------+------------------+
 *
 * Head: 4bytes
 *   0: packet type,
 *      1 - handshake,
 *      2 - handshake ack,
 *      3 - heartbeat,
 *      4 - data
 *      5 - kick
 *   1 - 3: big-endian body length
 * Body: body length bytes
 *
 * @param  {PackType}    type   packet type
 * @param  {Buffer} body   body content in bytes
 * @return {Buffer}        new byte array that contains encode result
 */
function encode(type, body) {
    const length = body ? body.length : 0;
    const buffer = Buffer.alloc(PKG_HEAD_BYTES + length);
    let index = 0;
    buffer[index++] = type & 0xff;
    buffer[index++] = (length >> 16) & 0xff;
    buffer[index++] = (length >> 8) & 0xff;
    buffer[index++] = length & 0xff;
    if (body) {
        (0, utils_1.copyArray)(buffer, index, body, 0, length);
    }
    return buffer;
}
exports.encode = encode;
/**
 * packet protocol decode.
 * See encode for packet format.
 *
 * @param  {Buffer} buffer byte array containing packet content
 * @return {Object}           {type: packet type, buffer: body byte array}
 */
function decode(buffer, out) {
    let offset = 0;
    const bytes = Buffer.from(buffer);
    let length = 0;
    if (!out)
        out = [];
    while (offset < bytes.length) {
        const type = bytes[offset++];
        length = ((bytes[offset++] << 16) | (bytes[offset++] << 8) | bytes[offset++]) >>> 0;
        if (!isValidType(type) || length > bytes.length) {
            throw new Error('invalid data'); // return invalid type, then disconnect!
        }
        const body = length ? Buffer.alloc(length) : undefined;
        if (body) {
            (0, utils_1.copyArray)(body, 0, bytes, offset, length);
        }
        offset += length;
        out.push({ type, body });
    }
    return out;
}
exports.decode = decode;
