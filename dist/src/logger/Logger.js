"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logErr = exports.logger = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/naming-convention */
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
// const logger = createLogger({
//     level: 'debug',
//     format: ecsFormat(),
//     transports: [
//         new transports.File({ filename: './logs/error.log', level: 'error' }),
//         new transports.File({ filename: './logs/combined.log' }),
//     ],
// });
const isProduction = process.env.NODE_ENV === 'production';
const errOption = {
    level: 'error',
    dirname: 'logs',
    filename: 'error-%DATE%.log',
    maxSize: '5m',
    maxFiles: '90d',
    format: winston_1.format.combine(winston_1.format.timestamp({
        format() {
            return new Date().toLocaleString();
        },
    }), winston_1.format.simple()),
};
const logger = (0, winston_1.createLogger)({
    transports: [
        new winston_daily_rotate_file_1.default({
            level: isProduction ? 'info' : 'debug',
            dirname: 'logs',
            filename: 'combined-%DATE%.log',
            maxSize: '10m',
            maxFiles: '60d',
            // datePattern: "YYYY-MM-DD-HH-mm",
            format: winston_1.format.combine(winston_1.format.timestamp({
                format() {
                    return new Date().toLocaleString();
                },
            }), winston_1.format.simple()),
        }),
        new winston_daily_rotate_file_1.default(errOption),
    ],
    handleExceptions: true,
    exceptionHandlers: [new winston_daily_rotate_file_1.default(errOption)],
});
exports.logger = logger;
if (!isProduction) {
    logger.add(new winston_1.transports.Console({
        level: 'debug',
        format: winston_1.format.combine(winston_1.format.colorize({ all: true }), winston_1.format.simple()),
        handleExceptions: true,
    }));
}
function logErr(e) {
    if (typeof e === 'string')
        logger.error(e);
    else if (e instanceof Error)
        logger.error(e.stack);
}
exports.logErr = logErr;
