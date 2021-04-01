import { LoopInfo } from '../../model/LoopInfo';
import { FileWithMetadata } from '../../model/FileWithMetadata';

const waitFor = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const loadFileToAudioBuffer = async (
  file: FileWithMetadata,
  ctx: AudioContext,
): Promise<{
  buffer: AudioBuffer;
}> => {
  const rawBuffer = await file.file.arrayBuffer();
  const decoded = await ctx.decodeAudioData(rawBuffer);
  return {
    buffer: decoded,
  };
};

export const startPlayback = (
  ctx: AudioContext,
  buf: AudioBuffer,
  loopInfo: LoopInfo | undefined,
  startOffset: number,
  fadeInMS = 0,
): {
  gainNode: GainNode;
  sourceNode: AudioBufferSourceNode;
  pseudoPlayStartedTimestamp: number;
} => {
  const source = ctx.createBufferSource();
  source.buffer = buf;
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(1, ctx.currentTime);
  source.connect(gainNode);
  gainNode.connect(ctx.destination);
  if (loopInfo !== undefined) {
    source.loopStart = loopInfo.loopStart / buf.sampleRate;
    source.loopEnd = loopInfo.loopEnd / buf.sampleRate;
  }
  source.loop = true;
  source.start(ctx.currentTime, startOffset);

  // fade in
  if (fadeInMS > 0) {
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + fadeInMS / 1000);
  }

  return {
    gainNode: gainNode,
    sourceNode: source,
    pseudoPlayStartedTimestamp: Date.now() - startOffset * 1000,
  };
};

export const stopPlayback = async (
  ctx: AudioContext,
  gainNode: GainNode,
  sourceNode: AudioBufferSourceNode,
  fadeoutMSec: number,
): Promise<{
  playEndedTimeStamp: number;
}> => {
  const currentTimeStamp = Date.now();

  // fade-out
  gainNode.gain.setValueAtTime(1, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeoutMSec / 1000);
  await waitFor(fadeoutMSec);
  sourceNode.stop();

  // disconnect audio source
  gainNode.disconnect();
  sourceNode.disconnect();
  sourceNode.buffer = null;

  return {
    playEndedTimeStamp: currentTimeStamp,
  };
};
