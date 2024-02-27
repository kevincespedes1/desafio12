import winston from 'winston';

const developmentLogger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console() 
    ]
});

const productionLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json() 
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/errors.log', level: 'error' }), 
        new winston.transports.File({ filename: 'logs/combined.log' }) 
    ]
});

export function addLogger(req, res, next) {
    req.logger = process.env.NODE_ENV === 'production' ? productionLogger : developmentLogger;
    next();
}
