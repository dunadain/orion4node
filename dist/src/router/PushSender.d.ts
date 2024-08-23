import { NatsConnection } from 'nats';
import { Component } from '../component/Component';
import { Context } from './RouterTypeDef';
export declare class PushSender extends Component {
    private _nc;
    /**
     * Sends a push message.
     *
     * @param context - The context object containing the following fields:
     *   - id: The client ID.
     *   - protoId: The protocol ID.
     *   - sId: The server ID.
     * @param msg - The message to be sent.
     */
    send(context: Context, msg: unknown): void;
    get nc(): NatsConnection;
}
