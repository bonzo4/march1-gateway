import type Redis from "ioredis";
import type { RateLimiterMock } from "../rateLimiter/mock";
import type { SetType } from "./set";

export type AuthRateLimit = (options: {
  redis: Redis | RateLimiterMock;
  ip: string;
  set: SetType;
  phoneNumber: string;
}) => Promise<void>;
