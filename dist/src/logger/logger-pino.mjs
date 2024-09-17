import { ecsFormat } from '@elastic/ecs-pino-format';
import { pino } from 'pino';
const isProduction = process.env.MODE === 'release';
export function getLogger(serverName) {
    return isProduction
        ? pino(ecsFormat(), 
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        pino.transport({
            target: 'pino/file',
            options: {
                mkdir: true,
                destination: `./logs/${serverName}.log`,
            },
            level: 'info',
        }))
        : pino({
            level: 'debug',
            transport: {
                targets: [
                    {
                        level: 'debug',
                        target: 'pino-pretty',
                        options: {
                            translateTime: 'SYS:standard',
                        },
                    },
                    {
                        level: 'debug',
                        target: 'pino-pretty',
                        options: {
                            mkdir: true,
                            colorize: false,
                            destination: `./logs/${serverName}.log`,
                            translateTime: 'SYS:standard',
                        },
                    },
                ],
            },
        });
}
