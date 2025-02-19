import { treaty } from "@elysiajs/eden";
import { AuthApi } from "march1-auth";
import jwt from "jsonwebtoken";

export const authApi = treaty<AuthApi>(process.env.AUTH_API_URL!, {
  headers() {
    return {
      authorization: jwt.sign({}, process.env.AUTH_JWT_SECRET!),
    };
  },
});
