"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.protoMgr = void 0;
const RouterUtils_1 = require("./RouterUtils");
const ServerSelector_1 = require("./ServerSelector");
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
        if (ServerSelector_1.serverSelector.hasRoute(serverType)) {
            const serverId = await ServerSelector_1.serverSelector.selectServer(uid, serverType);
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
exports.protoMgr = new ProtocolMgr();
function register(clazz) {
    for (const k in clazz) {
        if (typeof clazz[k] === 'number') {
            const id = clazz[k];
            if (id2Server.has(id))
                throw new Error(`protocol id:${String(id)} is duplicated!`);
            id2Server.set(id, getServer(k));
        }
    }
}
exports.register = register;
function getServer(key) {
    let i = 1;
    for (; i < key.length; ++i) {
        if ((0, RouterUtils_1.isUpperCase)(key.charAt(i))) {
            break;
        }
    }
    return key.substring(0, i).toLowerCase();
}
