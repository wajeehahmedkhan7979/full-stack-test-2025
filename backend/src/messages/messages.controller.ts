import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto';

@Controller('chats/:chatId/messages')
@UseGuards(AuthGuard, ThrottlerGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async getMessages(
    @Req() req: AuthenticatedRequest,
    @Param('chatId') chatId: string,
  ) {
    return this.messagesService.getMessages(chatId, req.user.id);
  }

  @Post()
  async sendMessage(
    @Req() req: AuthenticatedRequest,
    @Param('chatId') chatId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(chatId, req.user.id, dto.content);
  }
}
