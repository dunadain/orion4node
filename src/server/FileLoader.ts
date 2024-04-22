import { Component } from '../component/Component';
import * as path from 'node:path';
import * as fs from 'fs/promises';

/**
 * load handler files and remote files
 */
export class FileLoader extends Component {
    async init() {
        if (!require.main) return;
        const handlerDir = path.join(require.main.path, 'handler');
        const list = await fs.readdir(handlerDir);
        const promises: Promise<unknown>[] = [];
        for (const fileName of list) {
            promises.push(import(path.join(handlerDir, fileName)));
        }
        await Promise.all(promises);
    }
}
