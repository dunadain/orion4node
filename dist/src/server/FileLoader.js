"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileLoader = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const Component_1 = require("../component/Component");
const path = require("node:path");
const fs = require("fs/promises");
const node_fs_1 = require("node:fs");
const RpcUtils_1 = require("../rpc/RpcUtils");
const Logger_1 = require("../logger/Logger");
/**
 * load handler files and rpc files
 */
class FileLoader extends Component_1.Component {
    async init() {
        if (!require.main)
            return;
        const handlerDir = path.join(require.main.path, 'handler');
        let handlerPromise = Promise.resolve();
        let rpcPromise = Promise.resolve();
        if ((0, node_fs_1.existsSync)(handlerDir)) {
            handlerPromise = fs
                .readdir(handlerDir)
                .then((list) => {
                const promises = [];
                for (const fileName of list) {
                    const filePath = path.join(handlerDir, fileName);
                    promises.push(Promise.resolve(`${filePath}`).then(s => require(s)));
                }
                return Promise.all(promises);
            })
                .catch((e) => {
                (0, Logger_1.logErr)(e);
            });
        }
        const remoteDir = path.join(require.main.path, 'remote');
        if ((0, node_fs_1.existsSync)(remoteDir)) {
            rpcPromise = fs
                .readdir(remoteDir)
                .then((list) => {
                const promises = [];
                for (const fileName of list) {
                    promises.push(Promise.resolve(`${path.join(remoteDir, fileName)}`).then(s => require(s)).then((m) => {
                        for (const className in m) {
                            const prototype = m[className].prototype;
                            const propNames = Object.getOwnPropertyNames(prototype);
                            for (const key of propNames) {
                                if (key === 'constructor')
                                    continue;
                                if (typeof prototype[key] === 'function') {
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                                    (0, RpcUtils_1.addRpcCall)(`${className}.${key}`, prototype[key]);
                                }
                            }
                        }
                    }));
                }
                return Promise.all(promises);
            })
                .catch((e) => {
                (0, Logger_1.logErr)(e);
            });
        }
        await Promise.all([handlerPromise, rpcPromise]);
    }
}
exports.FileLoader = FileLoader;
