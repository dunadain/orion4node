/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isUpperCase } from './RouterUtils';

const id2Subject = new Map<number, string>();
class ProtocolMgr {
    getSubject(protocolId: number) {
        return id2Subject.get(protocolId);
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
        id2Subject.set(clazz[k], `${getServer(k)}.handler.${String(clazz[k])}`);
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
