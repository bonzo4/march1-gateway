import { Elysia, error } from "elysia";
import { sendOTP, sendOTPBody } from "../../utils/auth/sendOTP";
import { verifyOTP, verifyOTPBody } from "../../utils/auth/verifyOTP";
import { jwt } from "@elysiajs/jwt";
import { authApi } from "@/utils/auth";

export const authRouter = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwtAuth",
      secret: process.env.AUTH_JWT_SECRET!,
      exp: "1d",
    })
  )
  .derive(({ set, server, request }) => {
    const ip = server?.requestIP(request);
    if (!ip) {
      set.status = "Bad Request";
      throw error(set.status, "Invalid IP");
    }
    return {
      ip,
    };
  })
  .post(
    "/sendOTP",
    ({ body, jwtAuth, set, ip }) =>
      sendOTP({
        body,
        jwtAuth,
        set,
        ip,
        authApiFunction: authApi.sendOTP.post,
      }),
    {
      body: sendOTPBody,
    }
  )
  .post("/verifyOTP", verifyOTP, {
    body: verifyOTPBody,
  });
