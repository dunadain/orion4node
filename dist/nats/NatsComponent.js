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
exports.natsOptionGetter = exports.NatsComponent = void 0;
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-base-to-string */
const nats_1 = require("nats");
const Component_1 = require("../component/Component");
const Logger_1 = require("../logger/Logger");
const fs = __importStar(require("node:fs/promises"));
const node_fs_1 = require("node:fs");
const ConfigPaths_1 = require("../config/ConfigPaths");
class NatsComponent extends Component_1.Component {
    _nc;
    get nc() {
        return this._nc;
    }
    /**
     * try 3 times, before consider it totally failed;
     * @param subject
     * @param payload
     * @returns
     */
    async tryRequest(subject, payload, opts) {
        if (!this.nc)
            throw new Error('nats connection is not ready');
        for (let i = 0; i < 3; ++i) {
            try {
                const rep = await this.nc.request(subject, payload, opts);
                return rep.data;
            }
            catch (e) {
                const nErr = e;
                if (nErr.code === nats_1.ErrorCode.NoResponders) {
                    throw e;
                }
            }
        }
        throw new Error(`request ${subject} timeout`);
    }
    publish(subject, payload, options) {
        try {
            this.nc?.publish(subject, payload, options);
        }
        catch (e) {
            (0, Logger_1.logErr)(e);
        }
    }
    async init() {
        const connectionOption = await this.getConnectionOption();
        this._nc = await (0, nats_1.connect)(connectionOption);
        Logger_1.logger.info(`${this.server.name} is connected to nats`);
        this.setupListeners().catch((reason) => {
            (0, Logger_1.logErr)(reason);
        });
    }
    async setupListeners() {
        if (!this._nc)
            return;
        this._nc
            .closed()
            .then((e) => {
            (0, Logger_1.logErr)(e);
            Logger_1.logger.info(`${this.server.name} the nats connection is closed`);
        })
            .catch(() => {
            // no rejection needed. nats resolves errors
        });
        for await (const s of this._nc.status()) {
            switch (s.type) {
                case nats_1.Events.Disconnect:
                    Logger_1.logger.info(`${this.server.name} disconnected - ${s.data}`);
                    break;
                case nats_1.Events.LDM:
                    Logger_1.logger.info(`${this.server.name} has been requested to reconnect`);
                    break;
                case nats_1.Events.Update:
                    Logger_1.logger.info(`${this.server.name} received a cluster update - ${s.data}`);
                    break;
                case nats_1.Events.Reconnect:
                    Logger_1.logger.info(`${this.server.name} reconnected - ${s.data}`);
                    break;
                case nats_1.Events.Error:
                    Logger_1.logger.info(`${this.server.name} got a permissions error`);
                    break;
                case nats_1.DebugEvents.Reconnecting:
                    Logger_1.logger.info(`${this.server.name} is attempting to reconnect`);
                    break;
                case nats_1.DebugEvents.StaleConnection:
                    Logger_1.logger.info(`${this.server.name} has a stale connection`);
                    break;
                default:
                    Logger_1.logger.info(`${this.server.name} got an unknown status ${s.type}`);
                    break;
            }
        }
    }
    async getConnectionOption() {
        const natsConfigPath = ConfigPaths_1.configPaths.nats;
        let exists = false;
        if (natsConfigPath)
            exists = (0, node_fs_1.existsSync)(natsConfigPath);
        return exists ? JSON.parse(await fs.readFile(natsConfigPath, 'utf8')) : undefined;
    }
    async dispose() {
        if (!this._nc)
            return;
        await this._nc.drain();
    }
}
exports.NatsComponent = NatsComponent;
function natsOptionGetter(target, propertyKey, descriptor) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    Object.defineProperty(NatsComponent.prototype, 'getConnectionOption', { value: descriptor.value });
}
exports.natsOptionGetter = natsOptionGetter;
