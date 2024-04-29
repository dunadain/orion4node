"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handle = exports.protocol = exports.isUpperCase = exports.decodeRouterPack = exports.encodeRouterPack = void 0;
const utils_1 = require("../transport/protocol/utils");
function encodeRouterPack(contextInfo, body) {
    const str = JSON.stringify(contextInfo);
    const contextBuf = Buffer.from(str);
    let len = 2; // context buffer length
    len += contextBuf.length; // context buffer
    if (body) {
        len += 4; // body length;
        len += body.length; // body
    }
    const buf = Buffer.alloc(len);
    let offset = buf.writeUInt16BE(contextBuf.length);
    (0, utils_1.copyArray)(buf, offset, contextBuf, 0, contextBuf.length);
    if (body) {
        offset += contextBuf.length;
        offset = buf.writeUInt32BE(body.length, offset);
        (0, utils_1.copyArray)(buf, offset, body, 0, body.length);
    }
    return buf;
}
exports.encodeRouterPack = encodeRouterPack;
function decodeRouterPack(buffer) {
    let offset = 0;
    const contextLen = buffer.readUint16BE(offset);
    offset += 2;
    const sBuf = Buffer.alloc(contextLen);
    (0, utils_1.copyArray)(sBuf, 0, buffer, offset, contextLen);
    offset += contextLen;
    let bBuf;
    if (offset < buffer.length) {
        const bodyLen = buffer.readUInt32BE(offset);
        offset += 4;
        bBuf = Buffer.alloc(bodyLen);
        (0, utils_1.copyArray)(bBuf, 0, buffer, offset, bodyLen);
    }
    return {
        context: JSON.parse(sBuf.toString()),
        body: bBuf,
    };
}
exports.decodeRouterPack = decodeRouterPack;
function isUpperCase(char) {
    return char === char.toUpperCase();
}
exports.isUpperCase = isUpperCase;
const routeFunctions = new Map();
function protocol(protoId) {
    return function (target, propertyKey, descriptor) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        routeFunctions.set(protoId, descriptor.value);
    };
}
exports.protocol = protocol;
async function handle(context, data, server) {
    const func = routeFunctions.get(context.protoId);
    if (!func)
        throw new Error(`no handler for protocol:${context.protoId.toString()}`);
    return await func.call(null, context, data, server);
}
exports.handle = handle;
