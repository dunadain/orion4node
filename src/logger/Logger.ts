/* eslint-disable @typescript-eslint/naming-convention */
import { Logger, createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
const { combine, timestamp, label, printf } = format;

// const logger = createLogger({
//     level: 'debug',
//     format: ecsFormat(),
//     transports: [
//         new transports.File({ filename: './logs/error.log', level: 'error' }),
//         new transports.File({ filename: './logs/combined.log' }),
//     ],
// });
const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${String(timestamp)} ${level}: ${String(message)}`;
});
const isProduction = process.env.NODE_ENV === 'production';

function getErrOpt(serverName: string) {
    return {
        level: 'error',
        dirname: 'logs',
        filename: `${serverName}-error-%DATE%.log`,
        maxSize: '5m',
        maxFiles: '90d',
        format: combine(
            timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }),
            myFormat
        ),
    };
}

let logger: Logger;

function logErr(e: unknown) {
    if (typeof e === 'string') logger.error(e);
    else if (e instanceof Error) logger.error(e.stack);
}

function initLogger(serverName: string) {
    logger = createLogger({
        transports: [
            new DailyRotateFile({
                level: isProduction ? 'info' : 'debug',
                dirname: 'logs',
                filename: `${serverName}-combined-%DATE%.log`,
                maxSize: '10m',
                maxFiles: '60d',
                // datePattern: "YYYY-MM-DD-HH-mm",
                format: combine(
                    timestamp({
                        format: 'YYYY-MM-DD HH:mm:ss',
                    }),
                    myFormat
                ),
            }),
            new DailyRotateFile(getErrOpt(serverName)),
        ],
        handleExceptions: true,
        exceptionHandlers: [new DailyRotateFile(getErrOpt(serverName))],
    });

    if (!isProduction) {
        logger.add(
            new transports.Console({
                level: 'debug',
                format: combine(format.colorize({ all: true }), format.simple()),
                handleExceptions: true,
            })
        );
    }
}

export { logger, logErr, initLogger };
