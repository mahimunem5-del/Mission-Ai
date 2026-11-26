import {
  getConversations,
  getConversationById,
  createConversation,
  deleteConversation
} from '../../db/dbService.js';
import { listByConversation } from './messagesRepository.js';
import { listPartsByMessageIds } from './messagePartsRepository.js';
import { listAttachmentsByConversation } from './attachmentsRepository.js';

/**
 * Hydrates a conversation with ordered messages, structured message_parts,
 * and attachment metadata using 3 flat queries (zero N+1 queries).
 */
export async function hydrateConversationForUser(id, userId) {
  const conv = await getConversationById(id, userId, { includeMessages: false });
  if (!conv) return null;

  const messages = await listByConversation(conv.id);
  const messageIds = messages.map(m => m.id).filter(Boolean);

  const [parts, attachments] = await Promise.all([
    listPartsByMessageIds(messageIds),
    listAttachmentsByConversation(conv.id, userId)
  ]);

  const partsByMessage = new Map();
  for (const part of parts) {
    const arr = partsByMessage.get(part.message_id) || [];
    arr.push(part);
    partsByMessage.set(part.message_id, arr);
  }

  const attachmentsByMessage = new Map();
  const unlinkedAttachments = [];
  for (const att of attachments) {
    if (att.message_id) {
      const arr = attachmentsByMessage.get(att.message_id) || [];
      arr.push(att);
      attachmentsByMessage.set(att.message_id, arr);
    } else {
      unlinkedAttachments.push(att);
    }
  }

  const hydratedMessages = messages.map(m => {
    const msgParts = partsByMessage.get(m.id) || [];
    const msgAttachments = attachmentsByMessage.get(m.id) || [];
    return {
      ...m,
      parts: msgParts,
      attachments: msgAttachments
    };
  });

  return {
    ...conv,
    messages: hydratedMessages,
    ...(unlinkedAttachments.length > 0 ? { attachments: unlinkedAttachments } : {})
  };
}

export const conversationsRepository = {
  listByUser: (userId, options = {}) => getConversations({ ...options, userId }),
  findByIdForUser: (id, userId) => hydrateConversationForUser(id, userId),
  upsertForUser: (userId, data = {}) => createConversation({ ...data, user_id: userId }),
  deleteForUser: (id, userId) => deleteConversation(id, userId)
};

export default conversationsRepository;
