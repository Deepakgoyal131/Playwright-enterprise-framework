import { ErrorHandler, ErrorType } from "../core/errors";
import type { AuthenticationConfig } from "../../configs/types/FrameworkConfig.types";
import type { AuthUser } from "./types/Auth.types";

export function resolveAuthUser(
  role: string,
  config: AuthenticationConfig,
  environment: NodeJS.ProcessEnv = process.env,
): AuthUser {
  const roleConfig = config.users[role];
  if (!roleConfig) {
    ErrorHandler.handle(
      ErrorType.FRAMEWORK,
      "resolveAuthUser",
      `No authentication environment mapping is configured for role '${role}'.`,
      new Error("Unknown authentication role."),
    );
  }

  const username = environment[roleConfig.usernameEnv]?.trim();
  const password = environment[roleConfig.passwordEnv];
  if (!username || password === undefined || password.length === 0) {
    ErrorHandler.handle(
      ErrorType.FRAMEWORK,
      "resolveAuthUser",
      `Credentials are missing for authentication role '${role}'. Configure the mapped environment variables.`,
      new Error("Required authentication credentials are not available."),
    );
  }

  const id = roleConfig.userIdEnv
    ? environment[roleConfig.userIdEnv]?.trim()
    : username;
  if (!id) {
    ErrorHandler.handle(
      ErrorType.FRAMEWORK,
      "resolveAuthUser",
      `A user identifier is missing for authentication role '${role}'.`,
      new Error("Required authentication user identifier is not available."),
    );
  }

  return {
    id,
    role,
    credentials: { username, password },
  };
}
