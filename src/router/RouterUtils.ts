import { Server } from '../server/Server';
import { copyArray } from '../transport/protocol/utils';
import { Context } from './RouterTypeDef';

export function encodeRouterPack(contextInfo: Context, body?: Buffer) {
    const uidBuf = Buffer.from(contextInfo.uid);
    const buf = Buffer.alloc(4 + 2 + uidBuf.length + 4 + (body ? body.length : 0));
    // const str = JSON.stringify(contextInfo);
    // const contextBuf = Buffer.from(str);
    // let len = 2; // context buffer length
    // len += contextBuf.length; // context buffer
    // if (body) {
    //     len += 4; // body length;
    //     len += body.length; // body
    // }
    // const buf = Buffer.alloc(len);
    // let offset = buf.writeUInt16BE(contextBuf.length);
    // copyArray(buf, offset, contextBuf, 0, contextBuf.length);
    // if (body) {
    //     offset += contextBuf.length;
    //     offset = buf.writeUInt32BE(body.length, offset);
    //     copyArray(buf, offset, body, 0, body.length);
    // }
    // return buf;
}

export function decodeRouterPack(buffer: Buffer) {
    let offset = 0;
    const contextLen = buffer.readUint16BE(offset);
    offset += 2;
    const sBuf = Buffer.alloc(contextLen);
    copyArray(sBuf, 0, buffer, offset, contextLen);
    offset += contextLen;
    let bBuf: Buffer | undefined;
    if (offset < buffer.length) {
        const bodyLen = buffer.readUInt32BE(offset);
        offset += 4;
        bBuf = Buffer.alloc(bodyLen);
        copyArray(bBuf, 0, buffer, offset, bodyLen);
    }

    return {
        context: JSON.parse(sBuf.toString()) as Context,
        body: bBuf,
    };
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
