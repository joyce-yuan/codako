import winston from "winston";

export const logger = winston.createLogger({
  defaultMeta: {
    service: "codako",
    environment: process.env.NODE_ENV,
  },
  level: process.env.LOG_LEVEL || "info",
  exitOnError: false,
  format:
    process.env.NODE_ENV === "production"
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize({
            all: true,
          }),
          winston.format.label({
            label: "[LOGGER]",
          }),
          winston.format.timestamp({
            format: "YY-MM-DD HH:mm:ss",
          }),
          winston.format.printf(
            (info) => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`,
          ),
        ),
  transports: [new winston.transports.Console()],
});

export const interceptConsole = () => {
  console.log = function (...args: any[]) {
    const message = args
      .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
      .join(" ");
    logger.info(message);
  };
  console.info = function (...args: any[]) {
    const message = args
      .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
      .join(" ");
    logger.info(message);
  };
  console.warn = function (...args: any[]) {
    const message = args
      .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
      .join(" ");
    logger.warn(message);
  };
  console.error = function (...args: any[]) {
    const message = args
      .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
      .join(" ");
    logger.error(message);
  };
};
