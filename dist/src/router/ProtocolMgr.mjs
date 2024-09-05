import { isUpperCase } from './RouterUtils.mjs';
import { serverSelector } from './ServerSelector.mjs';
const id2Server = new Map();
class ProtocolMgr {
    encoder = {
        encode(body) {
            return Buffer.from(JSON.stringify(body));
        },
    };
    decoder = {
        decode(buf) {
            return JSON.parse(buf.toString());
        },
    };
    async getHandlerSubject(protocolId, uid) {
        if (!id2Server.has(protocolId))
            return '';
        const serverType = id2Server.get(protocolId);
        if (!serverType)
            return '';
        if (serverSelector.hasRoute(serverType)) {
            const serverId = await serverSelector.selectServer(uid, serverType);
            return 'handler.' + serverId.toString();
        }
        return 'handler.' + serverType;
    }
    encodeMsgBody(body, protoId) {
        return this.encoder.encode(body, protoId);
    }
    decodeMsgBody(buf, protoId) {
        return this.decoder.decode(buf, protoId);
    }
    setEncoder(encoder) {
        this.encoder = encoder;
    }
    setDecoder(decoder) {
        this.decoder = decoder;
    }
}
export const protoMgr = new ProtocolMgr();
export function register(clazz) {
    for (const k in clazz) {
        if (typeof clazz[k] === 'number') {
            const id = clazz[k];
            if (id2Server.has(id))
                throw new Error(`protocol id:${String(id)} is duplicated!`);
            id2Server.set(id, getServer(k));
        }
    }
}
function getServer(key) {
    let i = 1;
    for (; i < key.length; ++i) {
        if (isUpperCase(key.charAt(i))) {
            break;
        }
    }
    return key.substring(0, i).toLowerCase();
}
