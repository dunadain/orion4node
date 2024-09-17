import { getLogger } from './logger-pino.mjs';
let logger;
function logErr(e) {
    if (typeof e === 'string')
        logger.error(e);
    else if (e instanceof Error)
        logger.error(e.stack);
}
function initLogger(serverName) {
    logger = getLogger(serverName);
}
export { logger, logErr, initLogger };
