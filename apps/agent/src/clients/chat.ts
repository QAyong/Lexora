import type {
  AgentChatAttachmentContent,
  AgentReferencedChatSession,
  ChatGenerationBootstrap,
} from '@haohaoxue/lexora-contracts'
import {
  AgentChatAttachmentContentSchema,
  AgentGetReferencedChatSessionSchema,
  AgentReferencedChatSessionSchema,
  ChatGenerationBootstrapSchema,
} from '@haohaoxue/lexora-contracts'
import { normalizeApiInternalBaseUrl, postApiInternalJson } from './utils'

export interface AgentChatApiClient {
  getGenerationBootstrap: (options: AgentGetGenerationBootstrapOptions) => Promise<ChatGenerationBootstrap>
  getReferencedChatSession: (options: AgentGetReferencedChatSessionOptions) => Promise<AgentReferencedChatSession>
  getGenerationAssetContent: (options: AgentGetGenerationAssetContentOptions) => Promise<AgentChatAttachmentContent>
}

export interface AgentGetGenerationBootstrapOptions {
  generationId: string
}

export interface AgentGetReferencedChatSessionOptions {
  generationId: string
  sessionId: string
}

export interface AgentGetGenerationAssetContentOptions {
  generationId: string
  assetId: string
}

export interface CreateAgentChatApiClientInput {
  apiInternalUrl: string
  appInternalKey: string
}

export function createAgentChatApiClient(input: CreateAgentChatApiClientInput): AgentChatApiClient {
  const baseUrl = normalizeApiInternalBaseUrl(input.apiInternalUrl)

  return {
    async getGenerationBootstrap(options) {
      return ChatGenerationBootstrapSchema.parse(await postApiInternalJson({
        baseUrl,
        path: `internal/chat/generations/${encodeURIComponent(options.generationId)}/bootstrap`,
        payload: {},
        errorMessage: '读取聊天生成上下文失败',
        appInternalKey: input.appInternalKey,
      }))
    },

    async getReferencedChatSession(options) {
      const payload = AgentGetReferencedChatSessionSchema.parse({ sessionId: options.sessionId })
      return AgentReferencedChatSessionSchema.parse(await postApiInternalJson({
        baseUrl,
        path: `internal/chat/generations/${encodeURIComponent(options.generationId)}/referenced-session`,
        payload,
        errorMessage: '读取引用会话失败',
        appInternalKey: input.appInternalKey,
      }))
    },

    async getGenerationAssetContent(options) {
      return AgentChatAttachmentContentSchema.parse(await postApiInternalJson({
        baseUrl,
        path: `internal/chat/generations/${encodeURIComponent(options.generationId)}/assets/${encodeURIComponent(options.assetId)}/content`,
        payload: {},
        errorMessage: '读取聊天附件内容失败',
        appInternalKey: input.appInternalKey,
      }))
    },
  }
}
