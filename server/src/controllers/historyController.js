import {
  conversationsRepository,
  messagesRepository,
  messagePartsRepository,
  attachmentsRepository
} from '../database/repositories/index.js';
import { NotFoundError, AuthenticationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export async function listConversations(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AuthenticationError('Authenticated user required'));

    const { projectId, limit } = req.query;
    const parsedLimit = limit ? parseInt(limit, 10) : 50;

    const conversations = await conversationsRepository.listByUser(userId, {
      projectId: projectId || null,
      limit: Number.isNaN(parsedLimit) ? 50 : Math.min(parsedLimit, 100)
    });

    res.json({ success: true, data: conversations });
  } catch (err) {
    logger.error('Failed to list conversations', { requestId: req.id, error: err.message });
    next(err);
  }
}

export async function getConversation(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AuthenticationError('Authenticated user required'));

    const { id } = req.params;
    const conversation = await conversationsRepository.findByIdForUser(id, userId);

    if (!conversation) {
      return next(new NotFoundError(`Conversation not found with ID: ${id}`));
    }

    res.json({ success: true, data: conversation });
  } catch (err) {
    logger.error('Failed to fetch conversation detail', { requestId: req.id, error: err.message });
    next(err);
  }
}

export async function createConversation(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AuthenticationError('Authenticated user required'));

    const { id, title, model_id, modelId, mode, project_id, projectId } = req.body || {};

    const created = await conversationsRepository.upsertForUser(userId, {
      id,
      title: title || 'New Chat',
      model_id: model_id || modelId || 'mahi-engine',
      mode: mode || 'chat',
      project_id: project_id || projectId || null
    });

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    logger.error('Failed to create conversation', { requestId: req.id, error: err.message });
    next(err);
  }
}

export async function addMessageToConversation(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AuthenticationError('Authenticated user required'));

    const { id: conversationId } = req.params;
    const existing = await conversationsRepository.findByIdForUser(conversationId, userId);
    if (!existing) {
      return next(new NotFoundError(`Conversation not found with ID: ${conversationId}`));
    }

    const { id, role, content, type, metadata, parts, attachments } = req.body || {};

    const createdMessage = await messagesRepository.createMessage(conversationId, {
      id,
      role: role || 'user',
      content: content || '',
      type: type || 'text',
      metadata: metadata || {}
    });

    // Optionally persist structured message parts & attachment metadata
    if (Array.isArray(parts) && parts.length > 0 && createdMessage?.id) {
      await messagePartsRepository.saveMessageParts(createdMessage.id, parts);
    }

    if (Array.isArray(attachments) && attachments.length > 0 && createdMessage?.id) {
      for (const att of attachments) {
        await attachmentsRepository.createAttachment(userId, {
          ...att,
          conversation_id: existing.id,
          message_id: createdMessage.id
        });
      }
    }

    res.status(201).json({ success: true, data: createdMessage });
  } catch (err) {
    logger.error('Failed to add message to conversation', { requestId: req.id, conversationId: req.params.id, error: err.message });
    next(err);
  }
}

export async function getMessageParts(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AuthenticationError('Authenticated user required'));

    const { id: conversationId, messageId } = req.params;
    const existing = await conversationsRepository.findByIdForUser(conversationId, userId);
    if (!existing) {
      return next(new NotFoundError(`Conversation not found with ID: ${conversationId}`));
    }

    const parts = await messagePartsRepository.listPartsByMessage(messageId);
    res.json({ success: true, data: parts });
  } catch (err) {
    logger.error('Failed to fetch message parts', { requestId: req.id, error: err.message });
    next(err);
  }
}

export async function deleteConversation(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AuthenticationError('Authenticated user required'));

    const { id } = req.params;
    const existing = await conversationsRepository.findByIdForUser(id, userId);
    if (!existing) {
      return next(new NotFoundError(`Conversation not found with ID: ${id}`));
    }

    const deleted = await conversationsRepository.deleteForUser(id, userId);
    res.json({ success: true, deleted: Boolean(deleted) });
  } catch (err) {
    logger.error('Failed to delete conversation', { requestId: req.id, id: req.params.id, error: err.message });
    next(err);
  }
}

export default {
  listConversations,
  getConversation,
  createConversation,
  addMessageToConversation,
  getMessageParts,
  deleteConversation
};
