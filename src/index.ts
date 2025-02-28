import { Elysia } from "elysia";
import { authRouter } from "./route/auth";

const gatewayApi = new Elysia().use(authRouter).listen(process.env.PORT!);

type GatewayApi = typeof gatewayApi;
export type { GatewayApi };
