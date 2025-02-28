import { error, t } from "elysia";
import type { JwtType } from "../types/jwt";
import type { SetType } from "../types/set";
import type { SocketAddress } from "elysia/universal";
import type { SendOTPRoute } from "march1-auth";
import type Redis from "ioredis";
import type { RateLimiterMock } from "../rateLimiter/mock";
import type { AuthRateLimit } from "../types/rateLimit";

export const sendOTPBody = t.Object({
  phoneNumber: t.String(),
});

type SendOTPOptions = {
  body: typeof sendOTPBody.static;
  jwtAuth: JwtType;
  set: SetType;
  ip: string;
  sendOTPRoute: SendOTPRoute;
  rateLimit: AuthRateLimit;
  redis: Redis | RateLimiterMock;
};

export async function sendOTP({
  jwtAuth,
  set,
  body: { phoneNumber },
  ip,
  sendOTPRoute,
  rateLimit,
  redis,
}: SendOTPOptions) {
  await rateLimit({ redis, ip, set, phoneNumber });
  const token = await jwtAuth.sign({ phoneNumber });
  const { data, error: apiError } = await sendOTPRoute({ token });
  if (apiError) {
    set.status = "Bad Request";
    throw error(set.status, apiError.value.message);
  }
  return data;
}
