import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { EscalateChannelDto } from './dto/escalate-channel.dto';
import { AssignChannelDto } from './dto/assign-channel.dto';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('channels')
  @ApiOperation({ summary: 'Create a new chat channel' })
  async createChannel(@Request() req, @Body() createChannelDto: CreateChannelDto) {
    const { userId, tenantId } = req.user;
    return this.chatService.createChannel(tenantId, userId, createChannelDto);
  }

  @Get('channels')
  @ApiOperation({ summary: 'Get all channels for current user' })
  async getUserChannels(@Request() req) {
    const { userId, tenantId } = req.user;
    return this.chatService.getUserChannels(userId, tenantId);
  }

  @Get('channels/:id')
  @ApiOperation({ summary: 'Get specific channel with messages' })
  async getChannel(@Request() req, @Param('id') channelId: string) {
    const { userId, tenantId } = req.user;
    return this.chatService.getChannel(channelId, userId, tenantId);
  }

  @Post('channels/:id/messages')
  @ApiOperation({ summary: 'Send a message in a channel' })
  async sendMessage(
    @Request() req,
    @Param('id') channelId: string,
    @Body() sendMessageDto: SendMessageDto
  ) {
    const { userId, tenantId } = req.user;
    return this.chatService.sendMessage(channelId, userId, tenantId, sendMessageDto);
  }

  @Put('channels/:id/escalate')
  @ApiOperation({ summary: 'Escalate channel to super admin' })
  async escalateChannel(
    @Request() req,
    @Param('id') channelId: string,
    @Body() escalateDto: EscalateChannelDto
  ) {
    const { userId, tenantId } = req.user;
    return this.chatService.escalateToSuperAdmin(
      channelId,
      tenantId,
      userId,
      escalateDto.reason
    );
  }

  @Put('channels/:id/assign')
  @ApiOperation({ summary: 'Assign channel to team member' })
  async assignChannel(
    @Request() req,
    @Param('id') channelId: string,
    @Body() assignDto: AssignChannelDto
  ) {
    const { tenantId } = req.user;
    return this.chatService.assignToTeamMember(
      channelId,
      tenantId,
      assignDto.teamMemberId
    );
  }

  @Put('channels/:id/resolve')
  @ApiOperation({ summary: 'Mark channel as resolved' })
  async resolveChannel(
    @Request() req,
    @Param('id') channelId: string,
    @Body() body: { resolution?: string }
  ) {
    const { userId, tenantId } = req.user;
    return this.chatService.resolveChannel(
      channelId,
      tenantId,
      userId,
      body.resolution
    );
  }

  @Delete('channels/:id')
  @ApiOperation({ summary: 'Archive a channel' })
  async archiveChannel(@Request() req, @Param('id') channelId: string) {
    const { userId, tenantId } = req.user;
    return this.chatService.archiveChannel(channelId, tenantId, userId);
  }
}
