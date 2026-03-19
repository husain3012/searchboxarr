import winston from "winston";
import { AppConfig } from "./types/prowlarr";

let logger: winston.Logger;

function safeStringify(obj: unknown): string {
  const seen = new WeakSet();
  return JSON.stringify(obj, (_key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "[Circular]";
      seen.add(value);
    }
    return value;
  });
}

export function createLogger(config: AppConfig): winston.Logger {
  logger = winston.createLogger({
    level: config.logging.level,
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.errors({ stack: true }),
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        let metaStr = "";
        if (Object.keys(meta).length) {
          try {
            metaStr = " " + safeStringify(meta);
          } catch {
            metaStr = " [unserializable meta]";
          }
        }
        return `${timestamp} [${level}] ${message}${metaStr}`;
      }),
    ),
    transports: [new winston.transports.Console()],
  });

  return logger;
}

export function getLogger(): winston.Logger {
  if (!logger) {
    logger = winston.createLogger({
      level: "info",
      format: winston.format.simple(),
      transports: [new winston.transports.Console()],
    });
  }
  return logger;
}
