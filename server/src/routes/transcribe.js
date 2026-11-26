import { Router } from 'express';
import config from '../config/env.js';
import { ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

const router = Router();
const MAX_AUDIO_BASE64_LENGTH = 25 * 1024 * 1024; // ~25MB base64 ceiling

router.post('/', async (req, res, next) => {
  try {
    const { audio, mimeType } = req.body || {};
    if (!audio) {
      return res.status(200).json({ text: '' });
    }
    if (typeof audio !== 'string' || audio.length > MAX_AUDIO_BASE64_LENGTH) {
      return next(new ValidationError('Invalid or oversized audio payload'));
    }

    const safeMime = (typeof mimeType === 'string' && /^audio\/[a-z0-9.+-]+$/i.test(mimeType))
      ? mimeType
      : 'audio/webm';

    // 1. Groq Whisper STT (whisper-large-v3)
    const groqKey = config.groq?.apiKey;
    if (groqKey) {
      try {
        const audioBuffer = Buffer.from(audio, 'base64');
        const formData = new FormData();
        formData.append('file', new Blob([audioBuffer], { type: safeMime }), 'speech.webm');
        formData.append('model', 'whisper-large-v3');

        const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`
          },
          body: formData,
          signal: AbortSignal.timeout(25000)
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          if (data && data.text) {
            return res.json({ text: data.text.trim() });
          }
        }
      } catch (groqErr) {
        logger.warn('Groq Whisper transcribe error', { requestId: req.id, error: groqErr.message });
      }
    }

    // 2. Gemini Multimodal Audio Transcription (key sent via header, never in URL)
    const mahiKey = config.mahiEngine?.apiKey;
    if (mahiKey) {
      try {
        const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': mahiKey
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  inlineData: {
                    mimeType: safeMime,
                    data: audio
                  }
                },
                {
                  text: 'Transcribe this spoken audio verbatim into plain text. Output ONLY the exact transcribed words and punctuation, with zero explanation or quotes.'
                }
              ]
            }]
          }),
          signal: AbortSignal.timeout(25000)
        });

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const text = gData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          if (text) {
            return res.json({ text });
          }
        }
      } catch (geminiErr) {
        logger.warn('Gemini transcribe fallback error', { requestId: req.id, error: geminiErr.message });
      }
    }

    return res.status(200).json({ text: '' });
  } catch (err) {
    logger.error('/api/transcribe uncaught error', { requestId: req.id, error: err.message });
    return res.status(200).json({ text: '' });
  }
});

export default router;
