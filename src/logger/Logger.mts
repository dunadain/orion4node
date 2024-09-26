import type { Logger } from 'pino';
import { getLogger } from './logger-pino.mjs';

let logger: Logger;

function logErr(e: unknown) {
    if (typeof e === 'string') logger.error(e);
    else if (e instanceof Error) {
        logger.error(e.message);
        if (e.stack) logger.error(e.stack);
    }
}

function initLogger(serverName: string) {
    logger = getLogger(serverName);
}

export { logger, logErr, initLogger };
