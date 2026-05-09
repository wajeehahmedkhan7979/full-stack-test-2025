export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

export type MessageRole = 'USER' | 'ASSISTANT';
export type MessageStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  createdAt: string;
}

export interface SendMessageResponse {
  userMessage: Message;
  pendingMessageId: string;
}

export interface ApiError {
  statusCode: number;
  message: string[];
  timestamp: string;
}
