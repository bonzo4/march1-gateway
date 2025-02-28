import Elysia, { error } from "elysia";
import Redis from "ioredis";
import {
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW,
} from "../constants/rateLimits";

export const redisClient = new Redis(process.env.RATE_LIMITER_CACHE_PORT!);

export const rateLimiter = new Elysia({ name: "rateLimiter" })
  .decorate("redis", redisClient)
  .onBeforeHandle(async ({ redis, request, server, set }) => {
    if (!server) {
      set.status = "Bad Request";
      throw error(set.status, "No server found");
    }
    const ip = server.requestIP(request);

    if (!ip) {
      set.status = "Bad Request";
      throw error(set.status, "No server found");
    }

    const key = `rate-limit:${ip}`;

    const currentRequests = await redis.incr(key);
    console.log(currentRequests);

    if (currentRequests === 1) {
      redis.expire(key, RATE_LIMIT_WINDOW);
    }

    if (currentRequests > RATE_LIMIT_MAX_REQUESTS) {
      set.status = "Too Many Requests";
      throw error(set.status, "Requests amount exceeded");
    }
  });
