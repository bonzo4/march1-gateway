import { describe, expect, test, mock, it } from "bun:test";
import { verifyOTP } from "../../src/utils/auth/verifyOTP";
import jwt from "@elysiajs/jwt";
import { VerifyOTPRoute } from "march1-auth";
import { verifyOTPRateLimit } from "../../src/utils/rateLimiter/verifyOTPRateLimit";
import { RateLimiterMock } from "../../src/utils/rateLimiter/mock";
import { VERIFY_OTP_RATE_LIMIT_MAX_REQUESTS } from "../../src/utils/constants/rateLimits";

const body = {
  phoneNumber: "",
  code: "",
};

const jwtAuth = jwt({
  name: "jwtAuth",
  secret: process.env.AUTH_JWT_SECRET!,
}).decorator.jwtAuth;

const verifyOTPRoute: VerifyOTPRoute = async ({ token }: { token: string }) => {
  return {
    data: {
      status: true,
      token: "1",
      user: {
        id: "1",
        createdAt: new Date(),
        email: "@",
        emailVerified: false,
        name: "test",
        phoneNumber: "1",
        phoneNumberVerified: true,
        updatedAt: new Date(),
      },
    },
    error: null,
    response: new Response(),
    status: 200,
    headers: undefined,
  };
};

const verifyOTPRouteError: VerifyOTPRoute = async ({
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

describe("Verify OTP Route", () => {
  it("Should send API request", async () => {
    const res = await verifyOTP({
      body,
      jwtAuth,
      set: {},
      ip: "::1",
      verifyOTPRoute,
      rateLimit: verifyOTPRateLimit,
      redis: new RateLimiterMock(),
    });

    expect(res).toEqual({
      status: true,
      token: "1",
      user: {
        id: "1",
        createdAt: new Date(),
        email: "@",
        emailVerified: false,
        name: "test",
        phoneNumber: "1",
        phoneNumberVerified: true,
        updatedAt: new Date(),
      },
    });
  });

  it("Should throw error on API request fail", async () => {
    try {
      await verifyOTP({
        body,
        jwtAuth,
        set: {},
        ip: "::1",
        verifyOTPRoute: verifyOTPRouteError,
        rateLimit: verifyOTPRateLimit,
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
      for (let i = 0; i < VERIFY_OTP_RATE_LIMIT_MAX_REQUESTS + 1; i++) {
        await verifyOTP({
          body,
          jwtAuth,
          set: {},
          ip: "::1",
          verifyOTPRoute,
          rateLimit: verifyOTPRateLimit,
          redis,
        });
      }
    } catch (error: any) {
      e = error;
    }
    expect(e.response).toBe("Too Many Requests");
  });
});
