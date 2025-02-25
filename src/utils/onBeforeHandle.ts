import { error } from "elysia";
import type { SetType } from "./types/set";

type Options = {
  request: Request;
  set: SetType;
};

// TODO: Add RateLimiting

export function onBeforeHandle({ request, set }: Options) {
  console.log(request.headers.entries().toArray());
  const origin = request.headers.get("origin");
  console.log(origin);
  //   if (!origin) {
  //     set.status = "Unauthorized";
  //     throw error(set.status);
  //   }
}
