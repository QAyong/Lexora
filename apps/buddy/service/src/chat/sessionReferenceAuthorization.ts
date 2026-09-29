import type { ConversationRepository } from '../storage/conversationRepository'
import { BuddyServiceError } from '../rpc/runtimeRequest'

export function resolveAuthorizedSessionReferences(
  references: readonly { id: string, title: string }[],
  currentSpaceId: string | null,
  conversations: Pick<ConversationRepository, 'findById'>,
) {
  const seen = new Set<string>()
  return references.flatMap(({ id }) => {
    if (seen.has(id))
      return []
    seen.add(id)
    const target = conversations.findById(id)
    if (!target || target.deletedAt || (target.spaceId !== null && target.spaceId !== currentSpaceId))
      throw new BuddyServiceError('VALIDATION_FAILED')
    return [{ id, title: target.title?.replace(/[\r\n]+/gu, ' ').trim().slice(0, 80) || 'Untitled conversation' }]
  })
}
