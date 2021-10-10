import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    format: format.combine(format.timestamp(), format.json()),
    transports: [
        new transports.Console({}),
        new transports.File({ filename: '/file.log' })
    ],
    exceptionHandlers: [
        new transports.Console({}),
        new transports.File({ filename: '/exceptions.log' })
    ],
    // rejectionHandlers: [
    //     new transports.Console({}),
    //     new transports.File({ filename: '/rejections.log' })
    // ]
});

export default logger;

const beautifyError = (e: any) => e instanceof Error ? { error: e.message, message: e.stack } : typeof e === 'string' ? e : JSON.stringify(e);

export { beautifyError };