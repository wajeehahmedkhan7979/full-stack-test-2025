import { Injectable, Logger } from '@nestjs/common';
import { MessageRole, MessageStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChatsService } from '../chats/chats.service';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatsService: ChatsService,
    private readonly llmService: LlmService,
  ) {}

  /**
   * Retrieves all messages for a chat, enforcing ownership.
   */
  async getMessages(chatId: string, userId: string) {
    // Validates ownership in a single query
    await this.chatsService.validateOwnership(chatId, userId);

    return this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true,
        content: true,
        status: true,
        createdAt: true,
      },
    });
  }

  /**
   * Handles user message submission:
   * 1. Validates chat ownership
   * 2. Stores user message immediately
   * 3. Creates a PENDING assistant message placeholder
   * 4. Triggers async LLM generation (fire-and-forget)
   * 5. Returns immediately
   */
  async sendMessage(chatId: string, userId: string, content: string) {
    // Step 1: Validate ownership
    const chat = await this.chatsService.validateOwnership(chatId, userId);

    // Step 2: Store user message
    const userMessage = await this.prisma.message.create({
      data: {
        chatId,
        userId,
        role: MessageRole.USER,
        content,
        status: MessageStatus.SENT,
      },
    });

    // Step 3: Create pending assistant message
    const pendingMessage = await this.prisma.message.create({
      data: {
        chatId,
        userId,
        role: MessageRole.ASSISTANT,
        content: '',
        status: MessageStatus.PENDING,
      },
    });

    // Step 4: Auto-title on first message
    const messageCount = await this.prisma.message.count({
      where: { chatId, role: MessageRole.USER },
    });

    if (messageCount === 1) {
      const title = content.length > 50 ? content.substring(0, 47) + '...' : content;
      await this.chatsService.updateChatTitle(chatId, userId, title);
    }

    // Step 5: Update chat timestamp
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // Step 6: Fire-and-forget async LLM reply generation
    this.generateAssistantReplyAsync(chatId, userId, content, pendingMessage.id);

    this.logger.log(
      `User message stored (${userMessage.id}), assistant reply pending (${pendingMessage.id})`,
    );

    return {
      userMessage: {
        id: userMessage.id,
        role: userMessage.role,
        content: userMessage.content,
        status: userMessage.status,
        createdAt: userMessage.createdAt,
      },
      pendingMessageId: pendingMessage.id,
    };
  }

  /**
   * Async LLM reply generation - runs in the background, does NOT block the request.
   * Updates the pending assistant message with the generated reply or marks it as failed.
   */
  private async generateAssistantReplyAsync(
    chatId: string,
    userId: string,
    userContent: string,
    pendingMessageId: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `Starting async LLM generation for chat ${chatId}, message ${pendingMessageId}`,
      );

      const reply = await this.llmService.generateReply(userContent);

      // Update the pending message with the actual reply
      await this.prisma.message.update({
        where: { id: pendingMessageId },
        data: {
          content: reply,
          status: MessageStatus.SENT,
        },
      });

      // Touch chat updatedAt
      await this.prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      });

      this.logger.log(
        `Assistant reply generated and stored for message ${pendingMessageId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate assistant reply for message ${pendingMessageId}: ${(error as Error).message}`,
      );

      // Mark as failed so the frontend can show an error state
      await this.prisma.message.update({
        where: { id: pendingMessageId },
        data: {
          content: 'Sorry, I was unable to generate a response. Please try again.',
          status: MessageStatus.FAILED,
        },
      });
    }
  }
}
