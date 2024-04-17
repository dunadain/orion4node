/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-base-to-string */
import { DebugEvents, Events, NatsConnection, connect } from 'nats';
import { Component } from './Component';
import { logErr, logger } from '../logger/Logger';

export class NatsComponent extends Component {
    private _nc: NatsConnection | undefined;

    get nc() {
        return this._nc;
    }

    async start() {
        try {
            this._nc = await connect();
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

    dispose(): void {
        if (!this._nc) return;
        this._nc.drain().catch((reason: unknown) => {
            logErr(reason);
        });
    }
}