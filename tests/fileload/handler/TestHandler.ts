import type { Context } from '../../../src/router/RouterTypeDef';
import { protocol } from '../../../src/router/RouterUtils';
import { Server } from '../../../src/server/Server';
import { Proto } from '../../utils/Proto';

export class TestHandler {
    @protocol(Proto.GameLogin)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async handle(context: Context, data: unknown, server: Server) {
        return 1000;
    }
}
