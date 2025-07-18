import { type NatsConnection, type Payload, type PublishOptions, type RequestOptions } from 'nats';
import { Component } from '../component/Component.mjs';
export declare class NatsComponent extends Component {
    private _nc;
    get nc(): NatsConnection | undefined;
    /**
     * try 3 times, before consider it totally failed;
     * @param subject
     * @param payload
     * @returns
     */
    tryRequest(subject: string, payload?: Payload, opts?: RequestOptions): Promise<Uint8Array<ArrayBufferLike>>;
    publish(subject: string, payload?: Payload, options?: PublishOptions): void;
    init(): Promise<void>;
    private setupListeners;
    dispose(): Promise<void>;
}
