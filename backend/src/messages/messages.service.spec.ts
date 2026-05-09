import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MessageRole, MessageStatus } from '@prisma/client';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';
import { ChatsService } from '../chats/chats.service';
import { LlmService } from '../llm/llm.service';

// ─── Mocks ──────────────────────────────────────────────────────────────────────

const mockPrisma = {
  message: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  chat: {
    update: jest.fn(),
  },
};

const mockChatsService = {
  validateOwnership: jest.fn(),
  updateChatTitle: jest.fn(),
};

const mockLlmService = {
  generateReply: jest.fn(),
};

// ─── Test Data ──────────────────────────────────────────────────────────────────

const TEST_USER_ID = 'user-abc-123';
const TEST_CHAT_ID = 'chat-xyz-789';
const OTHER_USER_ID = 'user-other-456';

const mockChat = {
  id: TEST_CHAT_ID,
  userId: TEST_USER_ID,
  title: 'New Chat',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserMessage = {
  id: 'msg-1',
  chatId: TEST_CHAT_ID,
  userId: TEST_USER_ID,
  role: MessageRole.USER,
  content: 'Hello, world!',
  status: MessageStatus.SENT,
  createdAt: new Date(),
};

const mockPendingMessage = {
  id: 'msg-2',
  chatId: TEST_CHAT_ID,
  userId: TEST_USER_ID,
  role: MessageRole.ASSISTANT,
  content: '',
  status: MessageStatus.PENDING,
  createdAt: new Date(),
};

// ─── Test Suite ─────────────────────────────────────────────────────────────────

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ChatsService, useValue: mockChatsService },
        { provide: LlmService, useValue: mockLlmService },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  // ─── getMessages ────────────────────────────────────────────────────────────

  describe('getMessages', () => {
    it('should return messages for an owned chat', async () => {
      const messages = [mockUserMessage];
      mockChatsService.validateOwnership.mockResolvedValue(mockChat);
      mockPrisma.message.findMany.mockResolvedValue(messages);

      const result = await service.getMessages(TEST_CHAT_ID, TEST_USER_ID);

      expect(mockChatsService.validateOwnership).toHaveBeenCalledWith(
        TEST_CHAT_ID,
        TEST_USER_ID,
      );
      expect(mockPrisma.message.findMany).toHaveBeenCalledWith({
        where: { chatId: TEST_CHAT_ID },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          role: true,
          content: true,
          status: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(messages);
    });

    it('should throw NotFoundException when chat is not owned by user', async () => {
      mockChatsService.validateOwnership.mockRejectedValue(
        new NotFoundException('Chat not found'),
      );

      await expect(
        service.getMessages(TEST_CHAT_ID, OTHER_USER_ID),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.message.findMany).not.toHaveBeenCalled();
    });
  });

  // ─── sendMessage ────────────────────────────────────────────────────────────

  describe('sendMessage', () => {
    beforeEach(() => {
      mockChatsService.validateOwnership.mockResolvedValue(mockChat);
      mockPrisma.message.create
        .mockResolvedValueOnce(mockUserMessage)     // user message
        .mockResolvedValueOnce(mockPendingMessage);  // pending assistant message
      mockPrisma.message.count.mockResolvedValue(1); // first message
      mockPrisma.chat.update.mockResolvedValue(mockChat);
      mockLlmService.generateReply.mockResolvedValue('Mock reply');
      mockPrisma.message.update.mockResolvedValue({});
    });

    it('should store user message and create pending assistant message', async () => {
      const result = await service.sendMessage(
        TEST_CHAT_ID,
        TEST_USER_ID,
        'Hello, world!',
      );

      // Verify user message was created
      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          chatId: TEST_CHAT_ID,
          userId: TEST_USER_ID,
          role: MessageRole.USER,
          content: 'Hello, world!',
          status: MessageStatus.SENT,
        }),
      });

      // Verify pending assistant message was created
      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          chatId: TEST_CHAT_ID,
          role: MessageRole.ASSISTANT,
          content: '',
          status: MessageStatus.PENDING,
        }),
      });

      // Verify return structure
      expect(result).toEqual({
        userMessage: {
          id: mockUserMessage.id,
          role: mockUserMessage.role,
          content: mockUserMessage.content,
          status: mockUserMessage.status,
          createdAt: mockUserMessage.createdAt,
        },
        pendingMessageId: mockPendingMessage.id,
      });
    });

    it('should auto-title chat on first user message', async () => {
      mockPrisma.message.count.mockResolvedValue(1);

      await service.sendMessage(TEST_CHAT_ID, TEST_USER_ID, 'Hello, world!');

      expect(mockChatsService.updateChatTitle).toHaveBeenCalledWith(
        TEST_CHAT_ID,
        TEST_USER_ID,
        'Hello, world!',
      );
    });

    it('should truncate long titles with ellipsis', async () => {
      mockPrisma.message.count.mockResolvedValue(1);
      const longMessage = 'A'.repeat(60);

      await service.sendMessage(TEST_CHAT_ID, TEST_USER_ID, longMessage);

      expect(mockChatsService.updateChatTitle).toHaveBeenCalledWith(
        TEST_CHAT_ID,
        TEST_USER_ID,
        'A'.repeat(47) + '...',
      );
    });

    it('should NOT auto-title on subsequent messages', async () => {
      mockPrisma.message.count.mockResolvedValue(3);

      await service.sendMessage(TEST_CHAT_ID, TEST_USER_ID, 'Another message');

      expect(mockChatsService.updateChatTitle).not.toHaveBeenCalled();
    });

    it('should reject message to a chat not owned by user', async () => {
      mockChatsService.validateOwnership.mockRejectedValue(
        new NotFoundException('Chat not found'),
      );

      await expect(
        service.sendMessage(TEST_CHAT_ID, OTHER_USER_ID, 'Sneaky message'),
      ).rejects.toThrow(NotFoundException);

      // No messages should have been created
      expect(mockPrisma.message.create).not.toHaveBeenCalled();
    });

    it('should fire-and-forget the LLM generation without blocking', async () => {
      const result = await service.sendMessage(
        TEST_CHAT_ID,
        TEST_USER_ID,
        'Hello',
      );

      // sendMessage should return immediately with the pending message ID
      expect(result.pendingMessageId).toBe(mockPendingMessage.id);

      // LLM service should have been called (fire-and-forget)
      // Allow the microtask queue to flush
      await new Promise((r) => setTimeout(r, 10));
      expect(mockLlmService.generateReply).toHaveBeenCalledWith('Hello');
    });
  });
});
