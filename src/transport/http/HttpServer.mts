import { App } from 'uWebSockets.js';
import { Component } from '../../component/Component.mjs';
import { logger } from '../../index.mjs';

export class HttpServer extends Component {
    public addr = '';
    public port = 0;
    public sslCertPath = '';
    public sslKeyPath = '';

    async init() {
        const host = this.addr ? this.addr : 'localhost';
        const app = App({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            key_file_name: this.sslKeyPath,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            cert_file_name: this.sslCertPath,
        });

        app.post('/*', (res) => {
            const buffer: Buffer[] = [];

            res.onData((chunk, isLast) => {
                buffer.push(Buffer.from(chunk));
                if (isLast) {
                    const data = Buffer.concat(buffer);
                    logger.debug(`Received data: ${data.toString()}`);
                    res.end('Binary data received');
                }
            });

            res.onAborted(() => {
                logger.error('Request aborted');
            });
        });

        app.listen(host, this.port, (token) => {
            if (token) {
                logger.info(`Listening to ${this.addr + ':' + this.port.toString()}`);
            } else {
                logger.error(`Failed to listen to ${this.addr + ':' + this.port.toString()}`);
            }
        });
    }
}
