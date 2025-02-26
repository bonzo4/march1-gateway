import { error } from "elysia";
import {
  SEND_OTP_RATE_LIMIT_MAX_REQUESTS,
  SEND_OTP_RATE_LIMIT_WINDOW,
} from "../constants/rateLimits";
import type Redis from "ioredis";
import type { SocketAddress } from "elysia/universal";
import type { SetType } from "../types/set";
import type { RateLimiterMock } from "../redis/mock";

type Options = {
  redis: Redis | RateLimiterMock;
  ip: SocketAddress;
  set: SetType;
};

export async function sendOTPRateLimit({ redis, ip, set }: Options) {
  const key = `rate-limit:${ip}`;

  const currentRequests = await redis.incr(key);

  if (currentRequests === 1) {
    redis.expire(key, SEND_OTP_RATE_LIMIT_WINDOW);
  }

  if (currentRequests > SEND_OTP_RATE_LIMIT_MAX_REQUESTS) {
    set.status = "Too Many Requests";
    throw error(set.status, "Requests amount exceeded");
  }
}
