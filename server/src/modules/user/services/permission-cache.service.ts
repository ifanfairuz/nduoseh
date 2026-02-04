import { Inject, Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/services/redis/redis.service';

@Injectable()
export class PermissionCacheService {
  private readonly logger = new Logger(PermissionCacheService.name);
  private readonly PREFIX = 'user:permissions:';

  constructor(@Inject() private readonly redis: RedisService) {}

  async getPermissions(userId: string): Promise<string[] | null> {
    try {
      const key = this.PREFIX + userId;
      const cached = await this.redis.get(key);

      if (cached) {
        return JSON.parse(cached) as string[];
      }

      return null;
    } catch (error) {
      this.logger.warn(
        `Failed to get cached permissions for user ${userId}`,
        error,
      );
      return null;
    }
  }

  async setPermissions(userId: string, permissions: string[]): Promise<void> {
    try {
      const key = this.PREFIX + userId;
      await this.redis.set(key, JSON.stringify(permissions));
    } catch (error) {
      this.logger.warn(`Failed to cache permissions for user ${userId}`, error);
    }
  }

  async invalidateUser(userId: string): Promise<void> {
    try {
      const key = this.PREFIX + userId;
      await this.redis.del(key);
    } catch (error) {
      this.logger.warn(`Failed to invalidate cache for user ${userId}`, error);
    }
  }

  async invalidateMultipleUsers(userIds: string[]): Promise<void> {
    try {
      if (userIds.length === 0) return;

      const keys = userIds.map((id) => this.PREFIX + id);
      await this.redis.del(...keys);
    } catch (error) {
      this.logger.warn('Failed to invalidate multiple user caches', error);
    }
  }
}
