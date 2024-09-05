import { describe, expect, it } from '@jest/globals';
import { UWebSocketClient } from '../../src/transport/uws/UWebSocketClient.mjs';
import { PackType, encode } from '../../src/transport/protocol/PacketProcessor.mjs';
describe('test uwsclient methods', () => {
    let client;
    it('should throw an error if the message is invalid', () => {
        const buf = Buffer.from('hello');
        client = new UWebSocketClient({});
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
