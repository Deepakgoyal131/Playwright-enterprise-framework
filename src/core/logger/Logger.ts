import { LogFormatter } from "./LogFormatter";
import { LogLevel } from "./LogLevel";
import { LogWriter } from "./LogWriter";

export class Logger {

  private static log(level: LogLevel, message: string): void {
    const formatted = LogFormatter.format(level, message);

    console.log(formatted);

    LogWriter.write(formatted);
  }

  public static info(message: string): void {
    this.log(LogLevel.INFO, message);
  }

  public static warn(message: string): void {
    this.log(LogLevel.WARN, message);
  }

  public static error(message: string): void {
    this.log(LogLevel.ERROR, message);
  }

  public static debug(message: string): void {
    this.log(LogLevel.DEBUG, message);
  }
}