import { copyArray } from './utils';

/* eslint-disable @typescript-eslint/naming-convention */
const PKG_HEAD_BYTES = 4;

export enum PackType {
    TYPE_HANDSHAKE = 1,
    TYPE_HANDSHAKE_ACK,
    TYPE_HEARTBEAT,
    TYPE_DATA,
    TYPE_KICK
}

function isValidType(type: PackType): boolean {
    return type >= PackType.TYPE_HANDSHAKE && type <= PackType.TYPE_KICK;
}

/**
 * Package protocol encode.
 *
 * Pinus package format:
 * +------+-------------+------------------+
 * | type | body length |       body       |
 * +------+-------------+------------------+
 *
 * Head: 4bytes
 *   0: package type,
 *      1 - handshake,
 *      2 - handshake ack,
 *      3 - heartbeat,
 *      4 - data
 *      5 - kick
 *   1 - 3: big-endian body length
 * Body: body length bytes
 *
 * @param  {PackType}    type   package type
 * @param  {Buffer} body   body content in bytes
 * @return {Buffer}        new byte array that contains encode result
 */
export function encode(type: PackType, body?: Buffer) {
    const length = body ? body.length : 0;
    const buffer = Buffer.alloc(PKG_HEAD_BYTES + length);
    let index = 0;
    buffer[index++] = type & 0xff;
    buffer[index++] = (length >> 16) & 0xff;
    buffer[index++] = (length >> 8) & 0xff;
    buffer[index++] = length & 0xff;
    if (body) {
        copyArray(buffer, index, body, 0, length);
    }
    return buffer;
}

/**
 * Package protocol decode.
 * See encode for package format.
 *
 * @param  {Buffer} buffer byte array containing package content
 * @return {Object}           {type: package type, buffer: body byte array}
 */
export function decode(buffer: Buffer, out?: { type: PackType, body: Buffer | undefined }[]) {
    let offset = 0;
    const bytes = Buffer.from(buffer);
    let length = 0;
    if (!out) out = [];
    while (offset < bytes.length) {
        const type = bytes[offset++];
        length = ((bytes[offset++]) << 16 | (bytes[offset++]) << 8 | bytes[offset++]) >>> 0;
        if (!isValidType(type) || length > bytes.length) {
            throw new Error('invalid data'); // return invalid type, then disconnect!
        }
        const body = length ? Buffer.alloc(length) : undefined;
        if (body) {
            copyArray(body, 0, bytes, offset, length);
        }
        offset += length;
        out.push({ type, body });
    }
    return out;
}