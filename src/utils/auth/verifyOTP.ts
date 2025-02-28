import { error, t } from "elysia";
import { authApi } from ".";
import type { JwtType } from "../types/jwt";
import type { SetType } from "../types/set";
import type { VerifyOTPRoute } from "march1-auth";
import type { AuthRateLimit } from "../types/rateLimit";
import type { RateLimiterMock } from "../rateLimiter/mock";
import type Redis from "ioredis";

export const verifyOTPBody = t.Object({
  phoneNumber: t.String(),
  code: t.String(),
});

type VerifyOTPOptions = {
  body: typeof verifyOTPBody.static;
  jwtAuth: JwtType;
  set: SetType;
  ip: string;
  verifyOTPRoute: VerifyOTPRoute;
  rateLimit: AuthRateLimit;
  redis: Redis | RateLimiterMock;
};

export async function verifyOTP({
  jwtAuth,
  body: { phoneNumber, code },
  set,
  ip,
  verifyOTPRoute,
  rateLimit,
  redis,
}: VerifyOTPOptions) {
  await rateLimit({ redis, ip, set, phoneNumber });
  const token = await jwtAuth.sign({ phoneNumber, code });
  const { data, error: apiError } = await verifyOTPRoute({ token });
  if (apiError) {
    set.status = "Bad Request";
    throw error(set.status, apiError.value.message);
  }
  return data;
}
