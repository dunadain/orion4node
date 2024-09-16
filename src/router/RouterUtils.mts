import { Server } from '../server/Server.mjs';
import { copyArray } from '../transport/protocol/utils.mjs';
import type { Context } from './RouterTypeDef.mjs';

export function encodeRouterPack(contextInfo: Context, body?: Buffer) {
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

export function decodeRouterPack(buffer: Buffer) {
    const context: Context = {
        clientId: buffer.readUInt32BE(),
        protoId: buffer.readUInt16BE(4),
        reqId: buffer.readUInt8(6),
        uid: buffer.toString('utf8', 8, 8 + buffer.readUInt8(7)),
        roleid: buffer.toString(
            'utf8',
            9 + buffer.readUInt8(7),
            9 + buffer.readUInt8(7) + buffer.readUInt8(8 + buffer.readUInt8(7))
        ),
        sId: buffer.readUInt32BE(9 + buffer.readUInt8(7) + buffer.readUInt8(8 + buffer.readUInt8(7))),
    };
    return { context, body: buffer.subarray(13 + buffer.readUInt8(7) + buffer.readUInt8(8 + buffer.readUInt8(7))) };
}

export function isUpperCase(char: string) {
    return char === char.toUpperCase();
}

const routeFunctions = new Map<number, (context: Context, data: unknown, server: Server) => Promise<unknown>>();

const httpHandlers = new Map<number, (data: unknown) => Promise<unknown>>();

export function protocol(protoId: number) {
    return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        routeFunctions.set(protoId, descriptor.value);
    };
}

export function httpProto(protoId: number) {
    return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        httpHandlers.set(protoId, descriptor.value);
    };
}

class RouterUtils {
    async handle(context: Context, data: unknown, server: Server) {
        const func = routeFunctions.get(context.protoId);
        if (!func) throw new Error(`no handler for protocol:${context.protoId.toString()}`);
        return await func.call(null, context, data, server);
    }

    async handleHttp(protoId: number, data: unknown) {
        const func = httpHandlers.get(protoId);
        if (!func) throw new Error(`no handler for protocol:${protoId.toString()}`);
        return await func.call(null, data);
    }
}

export const routerUtils = new RouterUtils();
