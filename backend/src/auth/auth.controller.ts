import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard, AuthenticatedRequest } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: AuthenticatedRequest) {
    const user = await this.authService.ensureUser(req.user);
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
