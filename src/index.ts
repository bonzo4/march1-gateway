import { Elysia, error } from "elysia";
import { authRouter } from "./route/auth";
import { rateLimiter, redis } from "./utils/rateLimiter";
import {
  RATE_LIMIT_WINDOW,
  RATE_LIMIT_MAX_REQUESTS,
} from "./utils/constants/rateLimits";

const gatewayApi = new Elysia()
  .decorate("redis", redis)
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

    if (currentRequests === 1) {
      redis.expire(key, RATE_LIMIT_WINDOW);
    }

    if (currentRequests > RATE_LIMIT_MAX_REQUESTS) {
      set.status = "Too Many Requests";
      throw error(set.status, "Requests amount exceeded");
    }
  })
  .get("/", () => {
    return "test";
  })
  .use(authRouter)
  .listen(process.env.PORT!);

type GatewayApi = typeof gatewayApi;
export type { GatewayApi };
