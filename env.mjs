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

export class LogWithCounter {
  #howManyTimesNumberIsStartAgain = 0;
  #counter = 1;
  #launchTimeCounter = 1;
  #firstTimeLog = false;
  #zeroHasBeenProcessed = false;
  static logger = makeLogger();

  constructor({ firstTimeLog = false, launchTimeCounter = 1 }) {
    this.#firstTimeLog = firstTimeLog;
    this.#launchTimeCounter = launchTimeCounter;
    this.version = process.env.npm_package_version;
  }

  info(message) {
    if (this.#boolCheckCounterAndTimeLog()) {
      LogWithCounter.logger.info(
        `Version: ${this.version}, logCount: ${this.#counter}, Message: ${message}`
      );
    }

    this.#updateCounterAndCheckTwisted();
  }

  warn(message) {
    if (this.#boolCheckCounterAndTimeLog()) {
      LogWithCounter.logger.warn(
        `Version: ${this.version}, logCount: ${this.#counter},  WarnMessage: ${message}`
      );
    }

    this.#updateCounterAndCheckTwisted();
  }

  error(message) {
    if (this.#boolCheckCounterAndTimeLog()) {
      LogWithCounter.logger.error(
        `Version: ${this.version}, logCount: ${this.#counter},  ErrorMessage: ${message}`
      );
    }

    this.#updateCounterAndCheckTwisted();
  }

  #boolCheckCounterAndTimeLog() {
    if (this.#firstTimeLog === true) {
      this.#firstTimeLog = false;
      return true;
    } else if (this.#counter === 0 && this.#zeroHasBeenProcessed === false) {
      this.#zeroHasBeenProcessed = true;
      return false;
    }
    return this.#counter % this.#launchTimeCounter === 0;
  }

  #updateCounterAndCheckTwisted() {
    ++this.#counter;

    if (this.counter === Number.MAX_VALUE) {
      ++this.howManyTimesNumberIsStartAgain;
      this.#counter = 0;
    }
  }
}

export class ExtendedVersionLogger {
  static version = process.env.npm_package_version;
  static logger = makeLogger();

  static info(message) {
    ExtendedVersionLogger.logger.info(`Version: ${this.version},  Message: ${message}`);
  }

  static warn(message) {
    ExtendedVersionLogger.logger.warn(`Version: ${this.version},  WarnMessage: ${message}`);
  }

  static error(message) {
    ExtendedVersionLogger.logger.error(`Version: ${this.version},  ErrorMessage: ${message}`);
  }
}
