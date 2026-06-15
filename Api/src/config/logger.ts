import winston from "winston";
import "winston-daily-rotate-file";

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return stack
            ? `${timestamp} ${level}: ${message}\n${stack}`
            : `${timestamp} ${level}: ${message}`;
    })
);

export const logger = winston.createLogger({
    level: "info",
    format: logFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: "%DATE%-app.log",
            dirname: "logs",
            datePattern: "YYYY-MM-DD",
            maxSize: "20m",
            maxFiles: "14d",
            zippedArchive: true,
        }),
        new winston.transports.Console({
            level: "debug",
            format: consoleFormat,
            handleExceptions: true,
        }),
    ],
    exitOnError: false,
});