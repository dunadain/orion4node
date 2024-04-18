import { Server } from '../server/Server';
import { copyArray } from '../transport/protocol/utils';
import { Session } from './RouterTypeDef';

export function encodeRouterPack(sessionInfo: unknown, body?: Buffer) {
    const str = JSON.stringify(sessionInfo);
    const sessionBuf = Buffer.from(str);
    let len = 2; // session buffer length
    len += sessionBuf.length; // session buffer
    if (body) {
        len += 4; // body length;
        len += body.length; // body
    }
    const buf = Buffer.alloc(len);
    let offset = buf.writeUInt16BE(sessionBuf.length);
    copyArray(buf, offset, sessionBuf, 0, sessionBuf.length);
    if (body) {
        offset += sessionBuf.length;
        offset = buf.writeUInt32BE(body.length, offset);
        copyArray(buf, offset, body, 0, body.length);
    }
    return buf;
}

export function decodeRouterPack(buffer: Buffer) {
    let offset = 0;
    const sessionLen = buffer.readUint16BE(offset);
    offset += 2;
    const sBuf = Buffer.alloc(sessionLen);
    copyArray(sBuf, 0, buffer, offset, sessionLen);
    offset += sessionLen;
    let bBuf: Buffer | undefined;
    if (offset < buffer.length) {
        const bodyLen = buffer.readUInt32BE(offset);
        offset += 4;
        bBuf = Buffer.alloc(bodyLen);
        copyArray(bBuf, 0, buffer, offset, bodyLen);
    }

    return {
        session: JSON.parse(sBuf.toString()) as Session,
        body: bBuf,
    };
}

export function isUpperCase(char: string) {
    return char === char.toUpperCase();
}

export const routeFunctions = new Map<string, (session: Session, data: unknown, server: Server) => Promise<unknown>>();

export function route(routeKey: number) {
    return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        routeFunctions.set(routeKey.toString(), descriptor.value);
    };
}
