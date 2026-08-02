import * as fs from "fs";
import * as path from "path";

export class LogWriter {
  private static readonly logDirectory = path.join(process.cwd(), "logs");

  public static write(message: string): void {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }

    const filePath = path.join(this.logDirectory, "execution.log");

    fs.appendFileSync(filePath, `${message}\n`);
  }
}