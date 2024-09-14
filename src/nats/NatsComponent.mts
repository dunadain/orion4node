/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-base-to-string */
import {
    DebugEvents,
    ErrorCode,
    Events,
    type NatsConnection,
    NatsError,
    type Payload,
    type PublishOptions,
    type RequestOptions,
    connect,
} from 'nats';
import { Component } from '../component/Component.mjs';
import { logErr, logger } from '../logger/Logger.mjs';

export class NatsComponent extends Component {
    private _nc: NatsConnection | undefined;

    get nc() {
        return this._nc;
    }

    /**
     * try 3 times, before consider it totally failed;
     * @param subject
     * @param payload
     * @returns
     */
    async tryRequest(subject: string, payload?: Payload, opts?: RequestOptions) {
        if (!this.nc) throw new Error('nats connection is not ready');
        for (let i = 0; i < 3; ++i) {
            try {
                const rep = await this.nc.request(subject, payload, opts);
                return rep.data;
            } catch (e: unknown) {
                const nErr = e as NatsError;
                if ((nErr.code as ErrorCode) === ErrorCode.NoResponders) {
                    throw e;
                }
            }
        }
        throw new Error(`request ${subject} timeout`);
    }

    publish(subject: string, payload?: Payload, options?: PublishOptions) {
        try {
            this.nc?.publish(subject, payload, options);
        } catch (e: unknown) {
            logErr(e);
        }
    }

    async init() {
        const servers = process.env.NATS_URL ?? 'nats://localhost:4222';

        this._nc = await connect({
            servers: servers.split(','),
        });
        logger.info(`${this.server.name} is connected to nats`);
        this.setupListeners().catch((reason: unknown) => {
            logErr(reason);
        });
    }

    private async setupListeners() {
        if (!this._nc) return;
        this._nc
            .closed()
            .then((e) => {
                logErr(e);
                logger.info(`${this.server.name} the nats connection is closed`);
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

    async dispose() {
        if (!this._nc) return;
        await this._nc.drain();
    }
}
