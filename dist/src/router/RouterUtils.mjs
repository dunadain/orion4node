import { Server } from '../server/Server.mjs';
import { copyArray } from '../transport/protocol/utils.mjs';
export function encodeRouterPack(contextInfo, body) {
    const uidBuf = Buffer.from(contextInfo.uid);
    const roleidBuf = Buffer.from(contextInfo.roleid);
    const uuidBuf = Buffer.from(contextInfo.sUuid);
    const len = 10 + uidBuf.length + roleidBuf.length + uuidBuf.length + (body ? body.length : 0);
    const buf = Buffer.alloc(len + 4);
    let offset = 0;
    buf.writeUInt32BE(len, offset);
    offset += 4;
    buf.writeUInt32BE(contextInfo.clientId, offset);
    offset += 4;
    buf.writeUInt16BE(contextInfo.protoId, offset);
    offset += 2;
    buf.writeUInt8(contextInfo.reqId, offset);
    offset += 1;
    buf.writeUInt8(uidBuf.length, offset);
    offset += 1;
    copyArray(buf, offset, uidBuf, 0, uidBuf.length);
    offset += uidBuf.length;
    buf.writeUInt8(roleidBuf.length, offset);
    offset += 1;
    copyArray(buf, offset, roleidBuf, 0, roleidBuf.length);
    offset += roleidBuf.length;
    buf.writeUInt8(uuidBuf.length, offset);
    offset += 1;
    copyArray(buf, offset, uuidBuf, 0, uuidBuf.length);
    offset += uuidBuf.length;
    if (body) {
        copyArray(buf, offset, body, 0, body.length);
    }
    return buf;
}
export function decodeRouterPack(buffer) {
    let offset = 0;
    const len = buffer.readUInt32BE(offset);
    offset += 4;
    if (len !== buffer.length - 4)
        throw new Error('invalid buffer length');
    const clientId = buffer.readUInt32BE(offset);
    offset += 4;
    const protoId = buffer.readUInt16BE(offset);
    offset += 2;
    const reqId = buffer.readUInt8(offset);
    offset += 1;
    const uidLen = buffer.readUInt8(offset);
    offset += 1;
    const uid = buffer.toString('utf8', offset, offset + uidLen);
    offset += uidLen;
    const roleidLen = buffer.readUInt8(offset);
    offset += 1;
    const roleid = buffer.toString('utf8', offset, offset + roleidLen);
    offset += roleidLen;
    const uuidLen = buffer.readUInt8(offset);
    offset += 1;
    const sUuid = buffer.toString('utf8', offset, offset + uuidLen);
    offset += uuidLen;
    const body = buffer.subarray(offset);
    return {
        context: {
            clientId,
            protoId,
            uid,
            roleid,
            sUuid,
            reqId,
        },
        body,
    };
}
export function isUpperCase(char) {
    return char === char.toUpperCase();
}
const routeFunctions = new Map();
const httpHandlers = new Map();
export function protocol(protoId) {
    return function (target, propertyKey, descriptor) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        routeFunctions.set(protoId, descriptor.value);
    };
}
export function httpProto(protoId) {
    return function (target, propertyKey, descriptor) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        httpHandlers.set(protoId, descriptor.value);
    };
}
class RouterUtils {
    async handle(context, data, server) {
        const func = routeFunctions.get(context.protoId);
        if (!func)
            throw new Error(`no handler for protocol:${context.protoId.toString()}`);
        return await func.call(null, context, data, server);
    }
    async handleHttp(protoId, data, server) {
        const func = httpHandlers.get(protoId);
        if (!func)
            throw new Error(`no handler for protocol:${protoId.toString()}`);
        return await func.call(null, data, server);
    }
}
export const routerUtils = new RouterUtils();
