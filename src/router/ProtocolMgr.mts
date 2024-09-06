/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MsgBodyDecoder, MsgBodyEncoder } from '../interfaces/defines.mjs';
import { isUpperCase } from './RouterUtils.mjs';
import { serverSelector } from './ServerSelector.mjs';

const id2Server = new Map<number, string>();
class ProtocolMgr {
    private encoder: MsgBodyEncoder = {
        encode(body: unknown) {
            return Buffer.from(JSON.stringify(body));
        },
    };
    private decoder: MsgBodyDecoder = {
        decode(buf: Buffer) {
            return JSON.parse(buf.toString()) as unknown;
        },
    };
    async getHandlerSubject(protocolId: number, uid: string) {
        if (!id2Server.has(protocolId)) return '';
        const serverType = id2Server.get(protocolId);
        if (!serverType) return '';
        if (serverSelector.hasRoute(serverType)) {
            const serverId = await serverSelector.selectServer(uid, serverType);
            return 'handler.' + serverId.toString();
        }
        return 'handler.' + serverType;
    }

    encodeMsgBody(body: unknown, protoId: number) {
        return this.encoder.encode(body, protoId);
    }

    decodeMsgBody(buf: Buffer, protoId: number) {
        return this.decoder.decode(buf, protoId);
    }

    setEncoder(encoder: MsgBodyEncoder) {
        this.encoder = encoder;
    }

    setDecoder(decoder: MsgBodyDecoder) {
        this.decoder = decoder;
    }
}

export const protoMgr = new ProtocolMgr();

export function register(clazz: any) {
    for (const k in clazz) {
        if (typeof clazz[k] === 'number') {
            const id = clazz[k] as number;
            if (id2Server.has(id)) throw new Error(`protocol id:${String(id)} is duplicated!`);
            id2Server.set(id, getServer(k));
        }
    }
}

function getServer(key: string) {
    let i = 1;
    for (; i < key.length; ++i) {
        if (isUpperCase(key.charAt(i))) {
            break;
        }
    }
    return key.substring(0, i).toLowerCase();
}
