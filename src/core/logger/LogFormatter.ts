import { LogLevel } from "./LogLevel";

export class LogFormatter {
  public static format(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();

    return `${timestamp} | ${level.padEnd(5)} | ${message}`;
  }
}