/* eslint-disable @typescript-eslint/no-unused-vars */
import { Context } from '../../../src/router/RouterTypeDef';
import { protocol } from '../../../src/router/RouterUtils';
import { Server } from '../../../src/server/Server';
import { Proto } from '../../utils/Proto';

export class GameHandler {
    @protocol(Proto.GameLogin)
    async handle(context: Context, data: unknown, server: Server) {
        return { name: 'Hello Game' };
    }
}
