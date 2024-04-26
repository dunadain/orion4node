/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isUpperCase } from './RouterUtils';
import { serverSelector } from './ServerSelector';

const id2Server = new Map<number, string>();
class ProtocolMgr {
    async getHandlerSubject(protocolId: number, uid: string) {
        if (!id2Server.has(protocolId)) return '';
        const serverType = id2Server.get(protocolId);
        if (!serverType) return '';
        if (serverSelector.hasRoute(serverType)) {
            const serverId = await serverSelector.selectServer(uid, serverType);
            return 'handler.' + serverId;
        }
        return 'handler.' + serverType;
    }

    encodeMsgBody(body: unknown, protoId?: number) {
        return Buffer.from(JSON.stringify(body));
    }

    decodeMsgBody(buf: Buffer, protoId?: number) {
        return JSON.parse(buf.toString()) as unknown;
    }
}

export const protoMgr = new ProtocolMgr();

export function protocolIds(clazz: any) {
    for (const k in clazz) {
        const id = clazz[k] as number;
        if (id2Server.has(id)) throw new Error(`protocol id:${String(id)} is duplicated!`);
        id2Server.set(id, getServer(k));
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
