import { describe, expect, test, mock, it } from "bun:test";
import { sendOTP } from "../../src/utils/auth/sendOTP";
import jwt from "@elysiajs/jwt";
import { SendOTPRoute } from "march1-auth";
import { sendOTPRateLimit } from "../../src/utils/rateLimiter/sendOTPRateLimit";
import { RateLimiterMock } from "../../src/utils/rateLimiter/mock";
import { SEND_OTP_RATE_LIMIT_MAX_REQUESTS } from "../../src/utils/constants/rateLimits";

const body = {
  phoneNumber: "",
};

const jwtAuth = jwt({
  name: "jwtAuth",
  secret: process.env.AUTH_JWT_SECRET!,
}).decorator.jwtAuth;

const sendOTPRoute: SendOTPRoute = async ({ token }: { token: string }) => {
  return {
    data: "Code Sent",
    error: null,
    response: new Response(),
    status: 200,
    headers: undefined,
  };
};

const sendOTPRouteError: SendOTPRoute = async ({
  token,
}: {
  token: string;
}) => {
  return {
    data: null,
    error: {
      value: { type: "validation", on: "", message: "Bad Request" },
      status: 422,
    },
    response: new Response(),
    status: 422,
    headers: undefined,
  };
};

describe("Send OTP Route", () => {
  it("Should send API request", async () => {
    const res = await sendOTP({
      body,
      jwtAuth,
      set: {},
      ip: "::1",
      sendOTPRoute,
      rateLimit: sendOTPRateLimit,
      redis: new RateLimiterMock(),
    });

    expect(res).toBe("Code Sent");
  });

  it("Should throw error on API request fail", async () => {
    try {
      await sendOTP({
        body,
        jwtAuth,
        set: {},
        ip: "::1",
        sendOTPRoute: sendOTPRouteError,
        rateLimit: sendOTPRateLimit,
        redis: new RateLimiterMock(),
      });
    } catch (e: any) {
      expect(e.response).toBe("Bad Request");
    }
  });

  it("Should throw rate limit error on too many requests", async () => {
    let e: any | undefined;
    try {
      const redis = new RateLimiterMock();
      for (let i = 0; i < SEND_OTP_RATE_LIMIT_MAX_REQUESTS + 1; i++) {
        await sendOTP({
          body,
          jwtAuth,
          set: {},
          ip: "::1",
          sendOTPRoute,
          rateLimit: sendOTPRateLimit,
          redis,
        });
      }
    } catch (error: any) {
      e = error;
    }
    expect(e.response).toBe("Too Many Requests");
  });
});
