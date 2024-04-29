import { Context } from '../../../src/router/RouterTypeDef';
import { Server } from '../../../src/server/Server';
export declare class TestHandler {
    handle(context: Context, data: unknown, server: Server): Promise<number>;
}
