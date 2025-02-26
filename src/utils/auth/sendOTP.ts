import { error, t } from "elysia";
import { authApi } from ".";
import type { JwtType } from "../types/jwt";
import type { SetType } from "../types/set";
import type { SocketAddress } from "elysia/universal";
import type { Treaty } from "@elysiajs/eden";
import { sendOTPRateLimit } from "../rateLimiter/sendOTPRateLimit";
import { redis } from "../rateLimiter";

export const sendOTPBody = t.Object({
  phoneNumber: t.String(),
});

type SendOTPOptions = {
  body: typeof sendOTPBody.static;
  jwtAuth: JwtType;
  set: SetType;
  ip: SocketAddress;
  authApiFunction: (
    body: {
      token: string;
    },
    options?:
      | {
          headers?: Record<string, unknown> | undefined;
          query?: Record<string, unknown> | undefined;
          fetch?: RequestInit | undefined;
        }
      | undefined
  ) => Promise<
    Treaty.TreatyResponse<{
      200: {
        code: string;
      };
      422: {
        type: "validation";
        on: string;
        summary?: string;
        message?: string;
        found?: unknown;
        property?: string;
        expected?: string;
      };
    }>
  >;
};

export async function sendOTP({
  jwtAuth,
  set,
  body: { phoneNumber },
  ip,
  authApiFunction,
}: SendOTPOptions) {
  await sendOTPRateLimit({ redis, ip, set });
  const token = await jwtAuth.sign({ phoneNumber });
  const { data, error: apiError } = await authApiFunction({ token });
  if (apiError) {
    set.status = "Bad Request";
    throw error(set.status, apiError.value.message);
  }
  return data;
}
