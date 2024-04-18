/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '../component/Component';
import { isUpperCase } from './RouterUtils';

export class ProtocolMgr extends Component {
    protected id2Subject = new Map<number, string>();
    setProtocol(proto: any) {
        for (const k in proto) {
            this.id2Subject.set(proto[k], `${this.getServer(k)}.${String(proto[k])}`);
        }
    }

    private getServer(key: string) {
        let i = 1;
        for (; i < key.length; ++i) {
            if (isUpperCase(key.charAt(i))) {
                break;
            }
        }
        return key.substring(0, i).toLowerCase();
    }

    getSubject(protocolId: number) {
        return this.id2Subject.get(protocolId);
    }

    encodeMsgBody(body: unknown) {
        return Buffer.from(JSON.stringify(body));
    }

    decodeMsgBody(buf: Buffer) {
        return JSON.parse(buf.toString()) as unknown;
    }
}
