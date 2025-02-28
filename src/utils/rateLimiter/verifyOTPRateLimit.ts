import type Redis from "ioredis";
import type { SetType } from "../types/set";
import type { RateLimiterMock } from "./mock";
import {
  VERIFY_OTP_RATE_LIMIT_MAX_REQUESTS,
  VERIFY_OTP_RATE_LIMIT_WINDOW,
} from "../constants/rateLimits";
import { error } from "elysia";

type Options = {
  redis: Redis | RateLimiterMock;
  ip: string;
  phoneNumber: string;
  set: SetType;
};

export async function verifyOTPRateLimit({
  redis,
  ip,
  set,
  phoneNumber,
}: Options) {
  const key = `rate-limit:${ip}`;

  const currentRequests = await redis.incr(key);
  if (currentRequests === 1) {
    redis.expire(key, VERIFY_OTP_RATE_LIMIT_WINDOW);
  }
  if (currentRequests > VERIFY_OTP_RATE_LIMIT_MAX_REQUESTS) {
    set.status = "Too Many Requests";
    throw error(set.status);
  }
}
