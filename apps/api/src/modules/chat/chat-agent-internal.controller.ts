import type { AgentChatAttachmentContent, AgentGetReferencedChatSession, AgentReferencedChatSession, ChatGenerationBootstrap } from '@haohaoxue/lexora-contracts'
import { AgentGetReferencedChatSessionSchema } from '@haohaoxue/lexora-contracts'
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common'
import { Public } from '../../decorators/public.decorator'
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe'
import { ChatAssetsService } from './chat-assets.service'
import { ChatSessionsService } from './chat-sessions.service'

@Controller('internal/chat')
export class ChatAgentInternalController {
  constructor(
    private readonly chatSessionsService: ChatSessionsService,
    private readonly chatAssetsService: ChatAssetsService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('generations/:generationId/bootstrap')
  async getChatGenerationBootstrap(
    @Param('generationId') generationId: string,
  ): Promise<ChatGenerationBootstrap> {
    return this.chatSessionsService.getAgentGenerationBootstrap({
      generationId,
    })
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('generations/:generationId/referenced-session')
  async getReferencedChatSession(
    @Param('generationId') generationId: string,
    @Body(new ZodValidationPipe(AgentGetReferencedChatSessionSchema)) payload: AgentGetReferencedChatSession,
  ): Promise<AgentReferencedChatSession> {
    return this.chatSessionsService.getReferencedChatSession({
      generationId,
      sessionId: payload.sessionId,
    })
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('generations/:generationId/assets/:assetId/content')
  async getChatGenerationAssetContent(
    @Param('generationId') generationId: string,
    @Param('assetId') assetId: string,
  ): Promise<AgentChatAttachmentContent> {
    return this.chatAssetsService.getGenerationAssetContent({
      generationId,
      assetId,
    })
  }
}
