"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileLoader = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const Component_1 = require("../component/Component");
const path = __importStar(require("node:path"));
const fs = __importStar(require("fs/promises"));
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
                    promises.push(import(filePath));
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
                    promises.push(import(path.join(remoteDir, fileName)).then((m) => {
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
