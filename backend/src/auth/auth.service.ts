import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from './auth.guard';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ensures a user record exists in our database, synced from Supabase Auth.
   * Uses upsert to atomically handle concurrent first-login requests —
   * prevents unique constraint violations from the find-then-create race condition.
   */
  async ensureUser(authUser: AuthenticatedUser) {
    const user = await this.prisma.user.upsert({
      where: { id: authUser.id },
      create: {
        id: authUser.id,
        email: authUser.email,
      },
      update: {}, // intentionally empty — don't overwrite on re-login
    });

    this.logger.log(`User synced: ${user.email} (${user.id})`);
    return user;
  }

  async getUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
