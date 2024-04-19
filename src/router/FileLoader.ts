import { Component } from '../component/Component';
import * as path from 'node:path';
import * as fs from 'fs/promises';
import { logErr } from '../logger/Logger';

export class FileLoader extends Component {
    async init() {
        if (!require.main) return;
        const handlerDir = path.join(require.main.path, 'handler');
        try {
            const list = await fs.readdir(handlerDir);
            const promises: Promise<unknown>[] = [];
            for (const fileName of list) {
                promises.push(import(path.join(handlerDir, fileName)));
            }
            await Promise.all(promises);
        } catch (e) {
            logErr(e);
        }
    }
}
