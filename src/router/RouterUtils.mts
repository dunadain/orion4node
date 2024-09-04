import { Server } from '../server/Server.mjs';
import { copyArray } from '../transport/protocol/utils.mjs';
import type { Context } from './RouterTypeDef.mjs';

export function encodeRouterPack(contextInfo: Context, body?: Buffer) {
    const uidBuf = Buffer.from(contextInfo.uid);
    const buf = Buffer.alloc(12 + uidBuf.length + (body ? body.length : 0));
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
    buf.writeUInt32BE(contextInfo.sId, offset);
    offset += 4;
    if (body) {
        copyArray(buf, offset, body, 0, body.length);
    }
    return buf;
}

export function decodeRouterPack(buffer: Buffer) {
    const context: Context = {
        clientId: buffer.readUInt32BE(),
        protoId: buffer.readUInt16BE(4),
        reqId: buffer.readUInt8(6),
        uid: buffer.toString('utf8', 8, 8 + buffer.readUInt8(7)),
        sId: buffer.readUInt32BE(8 + buffer.readUInt8(7)),
    };
    return { context, body: buffer.subarray(12 + buffer.readUInt8(7)) };
}

export function isUpperCase(char: string) {
    return char === char.toUpperCase();
}

const routeFunctions = new Map<number, (context: Context, data: unknown, server: Server) => Promise<unknown>>();

export function protocol(protoId: number) {
    return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        routeFunctions.set(protoId, descriptor.value);
    };
}

export async function handle(context: Context, data: unknown, server: Server) {
    const func = routeFunctions.get(context.protoId);
    if (!func) throw new Error(`no handler for protocol:${context.protoId.toString()}`);
    return await func.call(null, context, data, server);
}
