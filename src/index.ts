import { Elysia } from "elysia";
import { authRouter } from "./route/auth";

const app = new Elysia().use(authRouter).listen(process.env.PORT!);
