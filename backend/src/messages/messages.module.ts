import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { AuthModule } from '../auth/auth.module';
import { ChatsModule } from '../chats/chats.module';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [AuthModule, ChatsModule, LlmModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
