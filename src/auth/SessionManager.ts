import { createHash, randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import type { BrowserContext } from "@playwright/test";
import { ErrorHandler, ErrorType } from "../core/errors";
import { Logger } from "../core/logger";
import type {
  AuthSessionRecord,
  AuthSessionLookup,
  AuthUser,
  StoredAuthSession,
} from "./types/Auth.types";

type StorageState = Awaited<ReturnType<BrowserContext["storageState"]>>;

export class SessionManager {
  public constructor(
    private readonly directory: string,
    private readonly expirationSkewSeconds: number,
  ) {}

  public load(user: AuthUser): AuthSessionLookup {
    const paths = this.getPaths(user);
    if (!fs.existsSync(paths.metadataPath) && !fs.existsSync(paths.statePath)) {
      return { status: "missing" };
    }

    try {
      const metadata: unknown = JSON.parse(
        fs.readFileSync(paths.metadataPath, "utf8"),
      );
      const state: unknown = JSON.parse(
        fs.readFileSync(paths.statePath, "utf8"),
      );
      if (
        isSessionRecord(metadata) &&
        isStorageState(state) &&
        metadata.role === user.role &&
        metadata.userKey === paths.userKey
      ) {
        if (!this.isFresh(metadata, state)) {
          return { status: "expired" };
        }
        return {
          status: "valid",
          session: {
            record: metadata,
            storageState: state,
            storageStatePath: paths.statePath,
          },
        };
      }
    } catch {
      return { status: "invalid" };
    }

    return { status: "invalid" };
  }

  public async save(
    user: AuthUser,
    headers: Record<string, string>,
    storageState: StorageState,
    expiresAt: number,
  ): Promise<string> {
    const paths = this.getPaths(user);
    const record: AuthSessionRecord = {
      version: 1,
      role: user.role,
      userKey: paths.userKey,
      savedAt: Date.now(),
      expiresAt,
      headers,
    };

    try {
      fs.mkdirSync(path.resolve(this.directory), {
        recursive: true,
        mode: 0o700,
      });
      this.writeSecureFile(paths.statePath, storageState);
      this.writeSecureFile(paths.metadataPath, record);
      return paths.statePath;
    } catch (error) {
      this.remove(user);
      ErrorHandler.handle(
        ErrorType.FRAMEWORK,
        "SessionManager.save",
        "Could not securely persist the authentication session.",
        new Error("Session persistence failed."),
      );
    }
  }

  public remove(user: AuthUser): void {
    const paths = this.getPaths(user);
    for (const filePath of [paths.metadataPath, paths.statePath]) {
      try {
        fs.rmSync(filePath, { force: true });
      } catch {
        Logger.warn("Could not remove a stale authentication session file.");
      }
    }
  }

  public isFresh(
    record: AuthSessionRecord,
    storageState: StorageState,
    now = Date.now(),
  ): boolean {
    const cutoff = now + this.expirationSkewSeconds * 1000;
    if (!Number.isFinite(record.expiresAt) || record.expiresAt <= cutoff) {
      return false;
    }

    const expiringCookies = storageState.cookies.filter(
      (cookie) => cookie.expires > 0,
    );
    return !expiringCookies.some((cookie) => cookie.expires * 1000 <= cutoff);
  }

  private getPaths(user: AuthUser): {
    userKey: string;
    statePath: string;
    metadataPath: string;
  } {
    const userKey = createHash("sha256")
      .update(`${user.role}\u0000${user.id}`)
      .digest("hex");
    const basePath = path.resolve(this.directory, userKey);
    return {
      userKey,
      statePath: `${basePath}.storageState.json`,
      metadataPath: `${basePath}.session.json`,
    };
  }

  private writeSecureFile(filePath: string, value: unknown): void {
    const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
    fs.writeFileSync(temporaryPath, JSON.stringify(value), {
      encoding: "utf8",
      mode: 0o600,
    });
    fs.renameSync(temporaryPath, filePath);
    try {
      fs.chmodSync(filePath, 0o600);
    } catch {
      Logger.warn("Could not apply restrictive permissions to a session file.");
    }
  }
}

function isSessionRecord(value: unknown): value is AuthSessionRecord {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Partial<AuthSessionRecord>;
  return (
    record.version === 1 &&
    typeof record.role === "string" &&
    typeof record.userKey === "string" &&
    typeof record.savedAt === "number" &&
    typeof record.expiresAt === "number" &&
    !!record.headers &&
    typeof record.headers === "object" &&
    Object.values(record.headers).every((header) => typeof header === "string")
  );
}

function isStorageState(value: unknown): value is StorageState {
  if (!value || typeof value !== "object") {
    return false;
  }
  const state = value as Partial<StorageState>;
  return Array.isArray(state.cookies) && Array.isArray(state.origins);
}
