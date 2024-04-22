/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Component } from '../component/Component';
import * as path from 'node:path';
import * as fs from 'fs/promises';
import { existsSync } from 'node:fs';
import { addRpcCall } from '../rpc/RpcUtils';

/**
 * load handler files and remote files
 */
export class FileLoader extends Component {
    async init() {
        if (!require.main) return;
        const promises: Promise<unknown>[] = [];
        const handlerDir = path.join(require.main.path, 'handler');
        if (existsSync(handlerDir)) {
            const list = await fs.readdir(handlerDir);
            for (const fileName of list) {
                const filePath = path.join(handlerDir, fileName);
                promises.push(import(filePath));
            }
        }
        const remoteDir = path.join(require.main.path, 'remote');
        if (existsSync(remoteDir)) {
            const list = await fs.readdir(remoteDir);
            for (const fileName of list) {
                promises.push(
                    import(path.join(remoteDir, fileName)).then((m) => {
                        const prototype = m.default.prototype;
                        for (const key in prototype) {
                            if (typeof prototype[key] === 'function') {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                                addRpcCall(key, prototype[key]);
                            }
                        }
                    })
                );
            }
        }
        await Promise.all(promises);
    }
}
