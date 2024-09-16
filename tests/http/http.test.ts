import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { Server } from '../../src/index.mts';
import { HttpServer } from '../../src/transport/http/HttpServer.mjs';
import { HttpRequestHandler } from '../../src/router/http/HttpRequestHandler.mjs';
import { loadHandlersAndRemotes } from '../../src/index.mjs';
import { fileURLToPath } from 'node:url';
import { HttpProto } from './http-proto.mjs';
import * as path from 'node:path';
import * as http from 'node:http';
import { copyArray } from '../../src/transport/protocol/utils.mts';

let server: Server;
const id1 = 1;
beforeAll(async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    server = new Server('http', id1);
    let http = server.addComponent(HttpServer);
    http.port = 9101;
    server.addComponent(HttpRequestHandler);
    loadHandlersAndRemotes(__dirname);

    try {
        await server.start();
    } catch (reason) {
        console.error(reason);
    }
});

afterAll(() => {
    server.shutdown();
});

describe('http test', () => {
    test('http response', async () => {
        const buf = Buffer.from(JSON.stringify({ name: 'Hello Game' }));
        const postData = Buffer.alloc(2 + buf.length);
        postData.writeUint16BE(HttpProto.Login);
        copyArray(postData, 2, buf, 0, buf.length);
        const reqPromise = new Promise((resolve, reject) => {
            const req = http.request(
                {
                    host: 'localhost',
                    port: 9101,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'Content-Length': Buffer.byteLength(postData),
                    },
                },
                (res) => {
                    let data = '';

                    res.on('data', (chunk) => {
                        data += chunk;
                    });

                    res.on('end', () => {
                        resolve({
                            status: res.statusCode,
                            data: JSON.parse(data),
                        });
                    });
                }
            );
            req.on('error', (e) => {
                reject(e);
            });
            req.write(postData);
            req.end();
        });
        const response: any = await reqPromise;
        expect(response.status).toBe(200);
        expect(response.data.name).toBe('Hello Login Hello Game');
    });
});
