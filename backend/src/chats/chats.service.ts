import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatsService {
  private readonly logger = new Logger(ChatsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new chat for the authenticated user.
   */
  async createChat(userId: string, title?: string, email?: string) {
    // Ensure the user exists in our local Prisma DB before associating a chat
    // This fixes the P2003 foreign key constraint error if they haven't visited /auth/me
    await this.prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: email || `${userId}@placeholder.com`,
      },
    });

    const chat = await this.prisma.chat.create({
      data: {
        userId,
        title: title || 'New Chat',
      },
    });

    this.logger.log(`Chat ${chat.id} created for user ${userId}`);
    return chat;
  }

  /**
   * Lists all chats belonging to the authenticated user, most recent first.
   */
  async listChats(userId: string) {
    return this.prisma.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  /**
   * Gets a single chat by ID, enforcing ownership in a single query.
   * Returns 404 (not 403) to avoid leaking existence of other users' chats.
   */
  async getChatById(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  /**
   * Validates ownership and returns the chat. Used by messages service.
   */
  async validateOwnership(chatId: string, userId: string) {
    return this.getChatById(chatId, userId);
  }

  /**
   * Deletes a chat and all its messages (cascade).
   */
  async deleteChat(chatId: string, userId: string) {
    const chat = await this.getChatById(chatId, userId);

    await this.prisma.chat.delete({
      where: { id: chat.id },
    });

    this.logger.log(`Chat ${chatId} deleted by user ${userId}`);
    return { deleted: true };
  }

  /**
   * Updates the chat title in a single query with ownership enforcement.
   * Uses updateMany to filter by both id and userId atomically.
   */
  async updateChatTitle(chatId: string, userId: string, title: string) {
    const result = await this.prisma.chat.updateMany({
      where: { id: chatId, userId },
      data: { title },
    });

    if (result.count === 0) {
      throw new NotFoundException('Chat not found');
    }

    return result;
  }
}
