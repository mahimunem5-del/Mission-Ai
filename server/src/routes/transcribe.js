import { Router } from 'express';
import config from '../config/env.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { audio, mimeType } = req.body || {};
    if (!audio) {
      return res.status(200).json({ text: '' });
    }

    // 1. If GROQ_API_KEY is available: use Groq Whisper STT (whisper-large-v3)
    const groqKey = process.env.GROQ_API_KEY?.trim();
    if (groqKey) {
      try {
        const audioBuffer = Buffer.from(audio, 'base64');
        const formData = new FormData();
        formData.append('file', new Blob([audioBuffer], { type: mimeType || 'audio/webm' }), 'speech.webm');
        formData.append('model', 'whisper-large-v3');

        const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`
          },
          body: formData
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          if (data && data.text) {
            return res.json({ text: data.text.trim() });
          }
        }
      } catch (groqErr) {
        console.warn('Groq Whisper transcribe error:', groqErr.message);
      }
    }

    // 2. If Mahi Engine / Gemini key is available: use Gemini Multimodal Audio Transcription
    const mahiKey = config.mahiEngine?.apiKey;
    if (mahiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${mahiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || 'audio/webm',
                    data: audio
                  }
                },
                {
                  text: 'Transcribe this spoken audio verbatim into plain text. Output ONLY the exact transcribed words and punctuation, with zero explanation or quotes.'
                }
              ]
            }]
          })
        });

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const text = gData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          if (text) {
            return res.json({ text });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini transcribe fallback error:', geminiErr.message);
      }
    }

    return res.status(200).json({ text: '' });
  } catch (err) {
    console.error('/api/transcribe uncaught error:', err);
    return res.status(200).json({ text: '' });
  }
});

export default router;
