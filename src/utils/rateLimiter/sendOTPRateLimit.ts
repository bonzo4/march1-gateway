import { error } from "elysia";
import {
  SEND_OTP_RATE_LIMIT_MAX_REQUESTS,
  SEND_OTP_RATE_LIMIT_WINDOW,
} from "../constants/rateLimits";
import type Redis from "ioredis";
import type { SetType } from "../types/set";
import type { RateLimiterMock } from "./mock";

type Options = {
  redis: Redis | RateLimiterMock;
  ip: string;
  set: SetType;
  phoneNumber: string;
};

export async function sendOTPRateLimit({ redis, ip, set }: Options) {
  const key = `rate-limit:${ip}`;

  const currentRequests = await redis.incr(key);
  if (currentRequests === 1) {
    redis.expire(key, SEND_OTP_RATE_LIMIT_WINDOW);
  }
  if (currentRequests > SEND_OTP_RATE_LIMIT_MAX_REQUESTS) {
    set.status = "Too Many Requests";
    throw error(set.status);
  }
}
