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
  const ipKey = `rate-limit-verify-otp:${ip}`;
  const phoneNumberKey = `rate-limit-verify-otp${phoneNumber}`;

  const ipRequests = await redis.incr(ipKey);
  const phoneNumberRequests = await redis.incr(phoneNumberKey);
  if (ipRequests === 1) {
    redis.expire(ipKey, VERIFY_OTP_RATE_LIMIT_WINDOW);
  }
  if (phoneNumberRequests === 1) {
    redis.expire(phoneNumberKey, VERIFY_OTP_RATE_LIMIT_WINDOW);
  }
  if (
    ipRequests > VERIFY_OTP_RATE_LIMIT_MAX_REQUESTS ||
    phoneNumberRequests > VERIFY_OTP_RATE_LIMIT_MAX_REQUESTS
  ) {
    set.status = "Too Many Requests";
    throw error(set.status);
  }
}
