"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protocolIds = exports.protoMgr = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
const RouterUtils_1 = require("./RouterUtils");
const ServerSelector_1 = require("./ServerSelector");
const id2Server = new Map();
class ProtocolMgr {
    async getHandlerSubject(protocolId, uid) {
        if (!id2Server.has(protocolId))
            return '';
        const serverType = id2Server.get(protocolId);
        if (!serverType)
            return '';
        if (ServerSelector_1.serverSelector.hasRoute(serverType)) {
            const serverId = await ServerSelector_1.serverSelector.selectServer(uid, serverType);
            return 'handler.' + serverId;
        }
        return 'handler.' + serverType;
    }
    encodeMsgBody(body, protoId) {
        return Buffer.from(JSON.stringify(body));
    }
    decodeMsgBody(buf, protoId) {
        return JSON.parse(buf.toString());
    }
}
exports.protoMgr = new ProtocolMgr();
function protocolIds(clazz) {
    for (const k in clazz) {
        const id = clazz[k];
        if (id2Server.has(id))
            throw new Error(`protocol id:${String(id)} is duplicated!`);
        id2Server.set(id, getServer(k));
    }
}
exports.protocolIds = protocolIds;
function getServer(key) {
    let i = 1;
    for (; i < key.length; ++i) {
        if ((0, RouterUtils_1.isUpperCase)(key.charAt(i))) {
            break;
        }
    }
    return key.substring(0, i).toLowerCase();
}
