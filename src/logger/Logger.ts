/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/naming-convention */
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

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
    format: format.combine(
        format.timestamp({
            format() {
                return new Date().toLocaleString();
            },
        }),
        format.simple()
    ),
};

const logger = createLogger({
    transports: [
        new DailyRotateFile({
            level: isProduction ? 'info' : 'debug',
            dirname: 'logs',
            filename: 'combined-%DATE%.log',
            maxSize: '10m',
            maxFiles: '60d',
            // datePattern: "YYYY-MM-DD-HH-mm",
            format: format.combine(
                format.timestamp({
                    format() {
                        return new Date().toLocaleString();
                    },
                }),
                format.simple()
            ),
        }),
        new DailyRotateFile(errOption),
    ],
    handleExceptions: true,
    exceptionHandlers: [new DailyRotateFile(errOption)],
});

if (!isProduction) {
    logger.add(
        new transports.Console({
            level: 'debug',
            format: format.combine(format.colorize({ all: true }), format.simple()),
            handleExceptions: true,
        })
    );
}

function logErr(e: unknown) {
    if (typeof e === 'string') logger.error(e);
    else if (e instanceof Error) logger.error(e.stack);
}

export { logger, logErr };
