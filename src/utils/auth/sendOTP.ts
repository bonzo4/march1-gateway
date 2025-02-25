import { t } from "elysia";
import { authApi } from ".";
import type { JwtType } from "../types/jwt";

export const sendOTPBody = t.Object({
  phoneNumber: t.String(),
});

type SendOTPOptions = {
  body: typeof sendOTPBody.static;
  jwtAuth: JwtType;
};

export async function sendOTP({
  jwtAuth,
  body: { phoneNumber },
}: SendOTPOptions) {
  const token = await jwtAuth.sign({ phoneNumber });
  const { data, error } = await authApi.sendOTP.post({ token });
  if (error) throw error;
  return data;
}
