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

export async function sendOTPRateLimit({
  redis,
  ip,
  set,
  phoneNumber,
}: Options) {
  const ipKey = `rate-limit-send-otp:${ip}`;
  const phoneNumberKey = `rate-limit-send-otp${phoneNumber}`;

  const ipRequests = await redis.incr(ipKey);
  const phoneNumberRequests = await redis.incr(phoneNumberKey);
  if (ipRequests === 1) {
    redis.expire(ipKey, SEND_OTP_RATE_LIMIT_WINDOW);
  }
  if (phoneNumberRequests === 1) {
    redis.expire(phoneNumberKey, SEND_OTP_RATE_LIMIT_WINDOW);
  }
  if (
    ipRequests > SEND_OTP_RATE_LIMIT_MAX_REQUESTS ||
    phoneNumberRequests > SEND_OTP_RATE_LIMIT_MAX_REQUESTS
  ) {
    set.status = "Too Many Requests";
    throw error(set.status);
  }
}
