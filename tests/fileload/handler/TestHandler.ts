import type { Context } from '../../../src/router/RouterTypeDef.mjs';
import { protocol } from '../../../src/router/RouterUtils.mjs';
import { Server } from '../../../src/server/Server.mjs';
import { Proto } from '../../utils/Proto.mjs';

export class TestHandler {
    @protocol(Proto.GameLogin)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async handle(context: Context, data: unknown, server: Server) {
        return 1000;
    }
}
