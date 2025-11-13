import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @Roles('SUPER_ADMIN','ORG_ADMIN','PARTICIPANT','SPECTATOR')
  async me(@Req() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    return { id: user.id, email: user.email, role: user.role };
  }
}
