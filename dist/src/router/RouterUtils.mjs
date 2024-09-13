import { Server } from '../server/Server.mjs';
import { copyArray } from '../transport/protocol/utils.mjs';
export function encodeRouterPack(contextInfo, body) {
    const uidBuf = Buffer.from(contextInfo.uid);
    const roleidBuf = Buffer.from(contextInfo.roleid);
    const buf = Buffer.alloc(13 + uidBuf.length + roleidBuf.length + (body ? body.length : 0));
    let offset = 0;
    buf.writeUInt32BE(contextInfo.clientId);
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
    buf.writeUInt32BE(contextInfo.sId, offset);
    offset += 4;
    if (body) {
        copyArray(buf, offset, body, 0, body.length);
    }
    return buf;
}
export function decodeRouterPack(buffer) {
    const context = {
        clientId: buffer.readUInt32BE(),
        protoId: buffer.readUInt16BE(4),
        reqId: buffer.readUInt8(6),
        uid: buffer.toString('utf8', 8, 8 + buffer.readUInt8(7)),
        roleid: buffer.toString('utf8', 9 + buffer.readUInt8(7), 9 + buffer.readUInt8(7) + buffer.readUInt8(8 + buffer.readUInt8(7))),
        sId: buffer.readUInt32BE(9 + buffer.readUInt8(7) + buffer.readUInt8(8 + buffer.readUInt8(7))),
    };
    return { context, body: buffer.subarray(13 + buffer.readUInt8(7) + buffer.readUInt8(8 + buffer.readUInt8(7))) };
}
export function isUpperCase(char) {
    return char === char.toUpperCase();
}
const routeFunctions = new Map();
export function protocol(protoId) {
    return function (target, propertyKey, descriptor) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        routeFunctions.set(protoId, descriptor.value);
    };
}
class RouterUtils {
    async handle(context, data, server) {
        const func = routeFunctions.get(context.protoId);
        if (!func)
            throw new Error(`no handler for protocol:${context.protoId.toString()}`);
        return await func.call(null, context, data, server);
    }
}
export const routerUtils = new RouterUtils();
