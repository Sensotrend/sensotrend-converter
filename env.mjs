import winstonModule from 'winston';

const { createLogger, format, transports } = winstonModule;

const { combine, timestamp, label } = format;

export default function makeLogger() {
  const alignedWithColorsAndTime = format.combine(
    format.colorize(),
    format.timestamp(),
    format.align(),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  );

  const level = process.env.LOGGING_LEVEL ? process.env.LOGGING_LEVEL : 'info';

  const logger = createLogger({
    level,
    format: combine(label({ label: 'right meow!' }), timestamp(), alignedWithColorsAndTime),
    transports: [new transports.Console()],
  });

  return logger;
}
