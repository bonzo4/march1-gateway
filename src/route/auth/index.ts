import { Elysia, error } from "elysia";
import { sendOTP, sendOTPBody } from "../../utils/auth/sendOTP";
import { verifyOTP, verifyOTPBody } from "../../utils/auth/verifyOTP";
import { jwt } from "@elysiajs/jwt";
import { authApi } from "@/utils/auth";
import { deriveIp } from "@/utils/derive/ip";
import { sendOTPRateLimit } from "@/utils/rateLimiter/sendOTPRateLimit";
import { redisClient } from "@/utils/rateLimiter";
import { verifyOTPRateLimit } from "@/utils/rateLimiter/verifyOTPRateLimit";

export const authRouter = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwtAuth",
      secret: process.env.AUTH_JWT_SECRET!,
      exp: "1d",
    })
  )
  .derive(({ set, server, request }) => deriveIp({ set, server, request }))
  .decorate("redis", redisClient)
  .post(
    "/sendOTP",
    ({ body, jwtAuth, set, ip, redis }) =>
      sendOTP({
        body,
        jwtAuth,
        set,
        ip,
        sendOTPRoute: authApi.sendOTP.post,
        rateLimit: sendOTPRateLimit,
        redis,
      }),
    {
      body: sendOTPBody,
    }
  )
  .post(
    "/verifyOTP",
    ({ body, jwtAuth, set, ip, redis }) =>
      verifyOTP({
        body,
        jwtAuth,
        set,
        ip,
        verifyOTPRoute: authApi.verifyOTP.post,
        rateLimit: verifyOTPRateLimit,
        redis,
      }),
    {
      body: verifyOTPBody,
    }
  );
