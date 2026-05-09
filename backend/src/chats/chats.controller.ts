import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto';

@Controller('chats')
@UseGuards(AuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  async createChat(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateChatDto,
  ) {
    return this.chatsService.createChat(req.user.id, dto.title, req.user.email);
  }

  @Get()
  async listChats(@Req() req: AuthenticatedRequest) {
    return this.chatsService.listChats(req.user.id);
  }

  @Get(':id')
  async getChat(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.chatsService.getChatById(id, req.user.id);
  }

  @Delete(':id')
  async deleteChat(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.chatsService.deleteChat(id, req.user.id);
  }
}
