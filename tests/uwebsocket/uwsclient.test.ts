import { describe, expect, it } from '@jest/globals';
import { UWebSocketClient } from '../../src/transport/uws/UWebSocketClient';
import { EventEmitter } from 'winston-daily-rotate-file';
import { PackType, encode } from '../../src/transport/protocol/PacketProcessor';

describe('test uwsclient methods', () => {
    let client: UWebSocketClient;
    it('should throw an error if the message is invalid', () => {
        const buf = Buffer.from('hello');
        client = new UWebSocketClient({} as EventEmitter);
        expect(() => {
            client.onMessage(buf.buffer);
        }).toThrowError('invalid data');
    });

    it('should throw an error if the type is invalid', () => {
        expect(() => {
            client.onMessage(encode(PackType.ERROR));
        }).toThrowError(`invalid package type: ${PackType.ERROR.toString()}`);
    });
});
