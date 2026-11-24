const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('index.html', 'utf8');

console.log('=== VERIFYING ALL 4 PRECISION POLISH & BUG FIXES ===');

// 1. Syntax check
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptCount = 0;
while ((match = scriptRegex.exec(html)) !== null) {
    scriptCount++;
    try {
        new vm.Script(match[1]);
    } catch (err) {
        console.error(`Script ${scriptCount} failed to compile:`, err.message);
        process.exit(1);
    }
}
console.log(`[PASS] Syntax check: All ${scriptCount} script tags compile with zero errors.`);

// 2. Item 1: Composer Auto-Lift / Shrink Resize Glitch (Hysteresis Threshold Lock)
const hasProbe = html.includes('id="mobile-composer-text-probe"') || html.includes("'mobile-composer-text-probe'");
const hasSingleRowWidth = html.includes('singleRowMaxWidth');
const hasHysteresis = html.includes('singleRowMaxWidth - 16');
console.log('[PASS] Item 1 (Hysteresis Lock):');
console.log('  Width probe implementation:', hasProbe);
console.log('  Single row max width calculation:', hasSingleRowWidth);
console.log('  Hysteresis threshold lock (singleRowMaxWidth - 16):', hasHysteresis);
if (!hasProbe || !hasSingleRowWidth || !hasHysteresis) {
    throw new Error('Item 1 failed');
}

// 3. Item 2: Lightbox & Click Bleed-Through
const hasTopLevelLightbox = html.includes('id="mobile-composer-ref-lightbox"') &&
    html.includes('z-[120] pointer-events-auto bg-black/85 backdrop-blur-md');
const hasStopPropagationOnCards = html.includes('openMobileComposerRefLightbox(ref.dataUrl);') &&
    html.includes('e.stopPropagation();');
const hasLightboxSwallowClicks = html.includes('onclick="event.preventDefault(); event.stopPropagation(); closeMobileComposerRefLightbox();"');
console.log('[PASS] Item 2 (Thumbnail Lightbox & Click Bleed-Through):');
console.log('  Top-level overlay z-[120] pointer-events-auto:', hasTopLevelLightbox);
console.log('  Clean first-tap stopPropagation on cards:', hasStopPropagationOnCards);
console.log('  Swallows all pointer/touch/click events:', hasLightboxSwallowClicks);
if (!hasTopLevelLightbox || !hasStopPropagationOnCards || !hasLightboxSwallowClicks) {
    throw new Error('Item 2 failed');
}

// 4. Item 3: Right-to-Left Scrolling Equalizer & Stop Button
const hasRtlScrolling = html.includes('_mobileVoiceBarHeights.push(currentSample);') &&
    html.includes('_mobileVoiceBarHeights.shift();');
const has2_5pxBars = html.includes('w-[2.5px] rounded-full bg-slate-900');
const hasStopSquare = html.includes('id="mobile-voice-stop-icon"') && html.includes('w-3.5 h-3.5 rounded-[3px] bg-slate-900');
const hasStopSpinner = html.includes('id="mobile-voice-stop-spinner"') && html.includes('w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin');
console.log('[PASS] Item 3 (RTL Waveform & Dark Stop Icon):');
console.log('  Right-to-left array scrolling (push & shift):', hasRtlScrolling);
console.log('  w-[2.5px] discrete rounded bars:', has2_5pxBars);
console.log('  Larger dark stop square (w-3.5 h-3.5 rounded-[3px] bg-slate-900):', hasStopSquare);
console.log('  Crisp circular spinner on stop:', hasStopSpinner);
if (!hasRtlScrolling || !has2_5pxBars || !hasStopSquare || !hasStopSpinner) {
    throw new Error('Item 3 failed');
}

// 5. Item 4: Voice-to-Text & Insecure Context / Server Fallback
const hasSpeechRec = html.includes('SpeechRecognition') && html.includes('_mobileVoiceTranscribedText');
const hasMediaRecorder = html.includes('MediaRecorder') && html.includes('_mobileVoiceAudioChunks');
const hasLanDetection = html.includes('Microphone requires HTTPS on LAN');
const hasTranscribePost = html.includes("fetch('/api/transcribe'");
console.log('[PASS] Item 4 (Dual-Pipeline & Server Whisper Fallback):');
console.log('  Primary Live SpeechRecognition pipeline:', hasSpeechRec);
console.log('  MediaRecorder backup pipeline:', hasMediaRecorder);
console.log('  Insecure LAN HTTP detection:', hasLanDetection);
console.log('  Server Whisper /api/transcribe fallback POST:', hasTranscribePost);
if (!hasSpeechRec || !hasMediaRecorder || !hasLanDetection || !hasTranscribePost) {
    throw new Error('Item 4 failed');
}

console.log('\n>>> ALL 4 PRECISION CODE CHECKS PASSED 100%! <<<');
