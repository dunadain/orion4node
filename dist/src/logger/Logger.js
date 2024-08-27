"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initLogger = exports.logErr = exports.logger = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const winston_1 = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const { combine, timestamp, label, printf } = winston_1.format;
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
let logger;
function logErr(e) {
    if (typeof e === 'string')
        logger.error(e);
    else if (e instanceof Error)
        logger.error(e.stack);
}
exports.logErr = logErr;
function initLogger(serverName) {
    exports.logger = logger = (0, winston_1.createLogger)({
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
        logger.add(new winston_1.transports.Console({
            level: 'debug',
            format: combine(winston_1.format.colorize({ all: true }), winston_1.format.simple()),
            handleExceptions: true,
        }));
    }
}
exports.initLogger = initLogger;
