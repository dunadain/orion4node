import { Context } from '../../../src/router/RouterTypeDef';
import { Server } from '../../../src/server/Server';
export declare class GameHandler {
    handle(context: Context, data: unknown, server: Server): Promise<{
        name: string;
    }>;
    gameUpdate(context: Context, data: unknown, server: Server): Promise<void>;
}
