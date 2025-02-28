import type { StatusMap } from "elysia";
import type { ElysiaCookie } from "elysia/cookies";
import type { HTTPHeaders } from "elysia/types";

export type SetType = {
  headers?: HTTPHeaders;
  status?: number | keyof StatusMap;
  redirect?: string;
  /**
   * ! Internal Property
   *
   * Use `Context.cookie` instead
   */
  cookie?: Record<string, ElysiaCookie>;
};
