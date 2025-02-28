import type { Server } from "elysia/universal";
import type { SetType } from "../types/set";
import { error, type Context } from "elysia";

type Options = {
  set: SetType;
  server: Server | null;
  request: Context["request"];
};

export function deriveIp({ set, server, request }: Options) {
  const ip = server?.requestIP(request);
  if (!ip) {
    set.status = "Bad Request";
    throw error(set.status, "Invalid IP");
  }
  return {
    ip: ip.address,
  };
}
