/* eslint-disable @typescript-eslint/naming-convention */
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
const { combine, timestamp, printf } = format;
const isProduction = process.env.MODE === 'release';
const myFormat = printf(({ level, message, timestamp }) => {
    return `${String(timestamp)} ${level}: ${String(message)}`;
});
function getErrOpt(serverName) {
    return {
        level: 'error',
        dirname: 'logs',
        filename: `${serverName}-error-%DATE%.log`,
        maxSize: '5m',
        maxFiles: '90d',
        format: combine(timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }), myFormat),
    };
}
export function getLogger(serverName) {
    const logger = createLogger({
        transports: [
            new DailyRotateFile({
                level: isProduction ? 'info' : 'debug',
                dirname: 'logs',
                filename: `${serverName}-combined-%DATE%.log`,
                maxSize: '10m',
                maxFiles: '60d',
                // datePattern: "YYYY-MM-DD-HH-mm",
                format: combine(timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }), myFormat),
            }),
            new DailyRotateFile(getErrOpt(serverName)),
        ],
        handleExceptions: true,
        exceptionHandlers: [new DailyRotateFile(getErrOpt(serverName))],
    });
    if (!isProduction) {
        logger.add(new transports.Console({
            level: 'debug',
            format: combine(format.colorize({ all: true }), format.simple()),
            handleExceptions: true,
        }));
    }
    return logger;
}
// const logger = createLogger({
//     level: 'debug',
//     format: ecsFormat(),
//     transports: [
//         new transports.File({ filename: './logs/error.log', level: 'error' }),
//         new transports.File({ filename: './logs/combined.log' }),
//     ],
// });
