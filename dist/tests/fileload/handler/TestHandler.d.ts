import type { Context } from '../../../src/router/RouterTypeDef.mjs';
import { Server } from '../../../src/server/Server.mjs';
export declare class TestHandler {
    handle(context: Context, data: unknown, server: Server): Promise<number>;
}
