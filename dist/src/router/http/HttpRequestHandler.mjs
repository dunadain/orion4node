import { Component } from '../../component/Component.mjs';
import { logErr } from '../../logger/Logger.mjs';
import { routerUtils } from '../RouterUtils.mjs';
import { protoMgr } from '../ProtocolMgr.mjs';
export class HttpRequestHandler extends Component {
    async init() {
        this.server.eventEmitter.on('httpmessage', (msg) => {
            const protoId = msg.data.readUint16BE();
            const decodedData = protoMgr.decodeMsgBody(msg.data.subarray(2), protoId);
            routerUtils
                .handleHttp(protoId, decodedData)
                .then((responseData) => {
                const res = msg.res;
                res.writeHeader('Content-Type', 'application/octet-stream');
                const response = protoMgr.encodeMsgBody(responseData, protoId);
                res.write(response);
                res.end();
            })
                .catch((e) => {
                logErr(e);
            });
        });
    }
}
