import { t } from "elysia";
import { authApi } from ".";
import { JwtType } from "../jwt";

export const verifyOTPBody = t.Object({
  phoneNumber: t.String(),
  code: t.String(),
});

type VerifyOTPOptions = {
  body: typeof verifyOTPBody.static;
  jwtAuth: JwtType;
};

export async function verifyOTP({
  jwtAuth,
  body: { phoneNumber, code },
}: VerifyOTPOptions) {
  const token = await jwtAuth.sign({ phoneNumber, code });
  const { data, error } = await authApi.verifyOTP.post({ token });
  if (error) throw error;
  return data;
}
