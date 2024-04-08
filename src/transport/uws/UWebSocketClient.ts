import { WebSocket } from 'uWebSockets.js';
import { SocketClient } from '../SocketClient';
import { arrayUtils } from '../../utils/ArrayUtils';

export class UWebSocketClient implements SocketClient<WebSocket<unknown>> {
    id = 0;
    uuidForUser = '';

    socket!: WebSocket<unknown>;

    private buffer: ArrayBuffer[] = [];

    send<T>(msg: T) {
        //
    }

    onMessage(msg: ArrayBuffer) {
        //
    }

    onDrain() {
        if (this.buffer.length === 0) return;
        const bufferCopy = arrayUtils.clone(this.buffer);
        this.buffer.length = 0;
        for (const msg of bufferCopy) {
            this.flush(msg);
        }
    }

    private flush(msg: ArrayBuffer) {
        if (this.buffer.length > 0) {
            this.buffer.push(msg);
        } else {
            const state = this.socket.send(msg);
            if (state === 2) this.buffer.push(msg);
        }
    }
}