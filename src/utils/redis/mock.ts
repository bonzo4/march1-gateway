import type { RedisKey } from "ioredis";

export class RateLimiterMock {
  map: Map<string, number> = new Map<string, number>();
  constructor() {}

  async incr(key: string): Promise<number> {
    const count = this.map.get(key);
    if (!count) {
      this.map.set(key, 1);
      return 1;
    }
    return count;
  }

  async expire(key: RedisKey, seconds: number | string): Promise<number> {
    return 0;
  }
}
