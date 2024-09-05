import type { Context } from '../../../src/router/RouterTypeDef.mjs';
import { Server } from '../../../src/server/Server.mjs';
export declare class GameHandler {
    handle(context: Context, data: unknown, server: Server): Promise<{
        name: string;
    }>;
    gameUpdate(context: Context, data: unknown, server: Server): Promise<void>;
}
