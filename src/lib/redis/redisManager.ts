import { Redis } from "ioredis";
import { logger } from "@/utils/logger.js";

export class RedisManager {
  private static instance: RedisManager;
  private redisClient: InstanceType<typeof Redis>;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new RedisManager();
    }
    return this.instance;
  }

  private constructor() {
    this.redisClient = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: null,
    });
    this.redisClient.on("error", (err: Error) =>
      logger.error("[Redis] Client Error", err)
    );
  }

  /**
   * Get the raw Redis client
   */
  getclient(): InstanceType<typeof Redis> {
    return this.redisClient;
  }

  /**
   * Set data in Redis with optional TTL
   */
  async set<T = any>(key: string, data: T, ttl: number = 86400): Promise<void> {
    const value = typeof data === "string" ? data : JSON.stringify(data);
    try {
      await this.redisClient.set(key, value, "EX", ttl);
    } catch (err) {
      logger.error(`[Redis] SET Error for key ${key}:`, err);
    }
  }

  /**
   * Get data from Redis
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key);
      if (!data) return null;
      try {
        return JSON.parse(data) as T;
      } catch {
        return data as unknown as T;
      }
    } catch (err) {
      logger.error(`[Redis] GET Error for key ${key}:`, err);
      return null;
    }
  }

  /**
   * Delete data from Redis
   */
  async del(key: string) {
    try {
      await this.redisClient.del(key);
      logger.info(`[Redis] Key deleted: ${key}`);
    } catch (err) {
      logger.error(`[Redis] Failed to delete key ${key}:`, err);
    }
  }

  /**
   * Scan keys by pattern
   */
  async scanKeys(pattern: string) {
    let cursor = "0";
    let keys: string[] = [];

    do {
      const result = await this.redisClient.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = result[0];
      keys = keys.concat(result[1]);
    } while (cursor !== "0");

    return keys;
  }

  /**
   * Graceful disconnect
   */
  async disconnect() {
    await this.redisClient.quit();
  }
}
