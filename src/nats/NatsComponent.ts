/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-base-to-string */
import { ConnectionOptions, DebugEvents, Events, NatsConnection, connect } from 'nats';
import { Component } from '../component/Component';
import { logErr, logger } from '../logger/Logger';
import * as fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { configPaths } from '../config/ConfigPaths';

export class NatsComponent extends Component {
    private _nc: NatsConnection | undefined;

    get nc() {
        return this._nc;
    }

    async init() {
        const connectionOption = await this.getConnectionOption();
        try {
            this._nc = await connect(connectionOption);
            logger.info(`${this.server.name} is connected to nats`);
            this.setupListeners().catch((reason: unknown) => {
                logErr(reason);
            });
        } catch (e) {
            logErr(e);
        }
    }

    private async setupListeners() {
        if (!this._nc) return;
        this._nc
            .closed()
            .then((e) => {
                if (e instanceof Error) logErr(e);
                logger.info(`${this.server.name} the connection closed`);
            })
            .catch(() => {
                // no rejection needed. nats resolves errors
            });

        for await (const s of this._nc.status()) {
            switch (s.type) {
                case Events.Disconnect:
                    logger.info(`${this.server.name} disconnected - ${s.data}`);
                    break;
                case Events.LDM:
                    logger.info(`${this.server.name} has been requested to reconnect`);
                    break;
                case Events.Update:
                    logger.info(`${this.server.name} received a cluster update - ${s.data}`);
                    break;
                case Events.Reconnect:
                    logger.info(`${this.server.name} reconnected - ${s.data}`);
                    break;
                case Events.Error:
                    logger.info(`${this.server.name} got a permissions error`);
                    break;
                case DebugEvents.Reconnecting:
                    logger.info(`${this.server.name} is attempting to reconnect`);
                    break;
                case DebugEvents.StaleConnection:
                    logger.info(`${this.server.name} has a stale connection`);
                    break;
                default:
                    logger.info(`${this.server.name} got an unknown status ${s.type}`);
                    break;
            }
        }
    }

    private async getConnectionOption() {
        const natsConfigPath = configPaths.nats;
        let exists = false;
        if (natsConfigPath) exists = existsSync(natsConfigPath);
        return exists ? (JSON.parse(await fs.readFile(natsConfigPath, 'utf8')) as ConnectionOptions) : undefined;
    }

    dispose(): void {
        if (!this._nc) return;
        this._nc.drain().catch((reason: unknown) => {
            logErr(reason);
        });
    }
}

export function natsOptionGetter(target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    Object.defineProperty(NatsComponent.prototype, 'getConnectionOption', { value: descriptor.value });
}
