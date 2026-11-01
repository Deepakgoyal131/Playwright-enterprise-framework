import type { BrowserContext } from "@playwright/test";
import type {
  APIAuthenticationConfig,
  AuthenticationConfig,
} from "../../../configs/types/FrameworkConfig.types";

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthUser<Role extends string = string> {
  id: string;
  role: Role;
  credentials: AuthCredentials;
}

export interface AuthStrategyResult {
  headers?: Record<string, string>;
  expiresAt?: number;
}

export interface AuthStrategy {
  authenticate(
    user: AuthUser,
    context: BrowserContext,
  ): Promise<AuthStrategyResult>;
  validateSession?(
    user: AuthUser,
    context: BrowserContext,
    headers: Readonly<Record<string, string>>,
  ): Promise<boolean>;
}

export interface AuthSession {
  user: AuthUser;
  context: BrowserContext;
  headers: Readonly<Record<string, string>>;
  storageStatePath: string;
  storageState: Awaited<ReturnType<BrowserContext["storageState"]>>;
}

export interface AuthSessionRecord {
  version: 1;
  role: string;
  userKey: string;
  savedAt: number;
  expiresAt: number;
  headers: Record<string, string>;
}

export interface StoredAuthSession {
  record: AuthSessionRecord;
  storageState: Awaited<ReturnType<BrowserContext["storageState"]>>;
  storageStatePath: string;
}

export type AuthSessionLookup =
  | { status: "missing" }
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "valid"; session: StoredAuthSession };

export type AuthManagerConfiguration = AuthenticationConfig;
export type AuthConfig = AuthenticationConfig;
export type ApiAuthConfiguration = APIAuthenticationConfig;

export interface AuthEnvironment {
  [key: string]: string | undefined;
}
