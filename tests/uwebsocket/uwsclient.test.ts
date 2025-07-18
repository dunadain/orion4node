import { describe, expect, it } from '@jest/globals';
import { UWebSocketClient } from '../../src/transport/uws/UWebSocketClient.mjs';
import { PackType, encode } from '../../src/transport/protocol/PacketProcessor.mjs';
import type { EventEmitter } from 'winston-daily-rotate-file';

describe('test uwsclient methods', () => {
    let client: UWebSocketClient;
    it('should throw an error if the message is invalid', () => {
        const buf = Buffer.from('hello');
        client = new UWebSocketClient({} as EventEmitter);
        expect(() => {
            client.onMessage(buf.buffer);
        }).toThrow('invalid data');
    });

    it('should throw an error if the type is invalid', () => {
        expect(() => {
            client.onMessage(encode(PackType.ERROR));
        }).toThrow(`invalid package type: ${PackType.ERROR.toString()}`);
    });
});
