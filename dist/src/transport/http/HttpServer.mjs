import { App } from 'uWebSockets.js';
import { Component } from '../../component/Component.mjs';
import { logger } from '../../index.mjs';
export class HttpServer extends Component {
    addr = '';
    port = 0;
    sslCertPath = '';
    sslKeyPath = '';
    app;
    async init() {
        const host = this.addr ? this.addr : 'localhost';
        const app = App({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            key_file_name: this.sslKeyPath,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            cert_file_name: this.sslCertPath,
        });
        this.app = app;
        app.post('/*', (res) => {
            const buffer = [];
            res.onData((chunk, isLast) => {
                buffer.push(new Uint8Array(chunk));
                if (isLast) {
                    const data = Buffer.concat(buffer);
                    this.server.eventEmitter.emit('httpmessage', { res, data });
                }
            });
            res.onAborted(() => {
                logger.error('Request aborted');
            });
        });
        app.listen(host, this.port, (token) => {
            if (token) {
                logger.info(`Http listening to ${host + ':' + this.port.toString()}`);
            }
            else {
                logger.error(`Http failed to listen to ${host + ':' + this.port.toString()}`);
            }
        });
    }
    async dispose() {
        this.app?.close();
    }
}
