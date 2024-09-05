import { Logger } from 'winston';
declare let logger: Logger;
declare function logErr(e: unknown): void;
declare function initLogger(serverName: string): void;
export { logger, logErr, initLogger };
