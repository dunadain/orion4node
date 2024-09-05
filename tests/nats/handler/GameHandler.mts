/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Context } from '../../../src/router/RouterTypeDef.mjs';
import { protocol } from '../../../src/router/RouterUtils.mjs';
import { Server } from '../../../src/server/Server.mjs';
import { Proto } from '../../utils/Proto.mjs';

export class GameHandler {
    @protocol(Proto.GameLogin)
    async handle(context: Context, data: unknown, server: Server) {
        return { name: 'Hello Game' };
    }

    @protocol(Proto.GameUpdate)
    async gameUpdate(context: Context, data: unknown, server: Server) {
        console.log('game update');
    }
}
