import { Elysia, error } from "elysia";
import { sendOTP, sendOTPBody } from "../../utils/auth/sendOTP";
import { verifyOTP, verifyOTPBody } from "../../utils/auth/verifyOTP";
import { jwt } from "@elysiajs/jwt";
import * as jsonwebtoken from "jsonwebtoken";

export const authRouter = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwtAuth",
      secret: process.env.AUTH_JWT_SECRET!,
      exp: "1d",
    })
  )
  .onError(({ code, set, error }) => {
    return error;
  })
  .get("/", async ({ set }) => {
    const res = await fetch(process.env.AUTH_API_URL!, {
      headers: {
        authorization: jsonwebtoken.sign({}, process.env.AUTH_JWT_SECRET!),
      },
    });
    if (!res.ok) {
      set.status = res.status;
      throw error(set.status, await res.text());
    }
    const text = await res.text();
    return text;
  })
  .post("/sendOTP", sendOTP, {
    body: sendOTPBody,
  })
  .post("/verifyOTP", verifyOTP, {
    body: verifyOTPBody,
  });
