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
        this.flush();
    }

    private flush() {
        const len = this.buffer.length;
        if (len === 0) return;
        let i = 0;
        for (; i < len; ++i) {
            const msg = this.buffer[i];
            const state = this.socket.send(msg);
            if (state === 2) {
                break;
            }
        }
        if (i > 0) {
            if (i === len) this.buffer.length = 0;
            else this.buffer.splice(0, i);
        }
    }
}