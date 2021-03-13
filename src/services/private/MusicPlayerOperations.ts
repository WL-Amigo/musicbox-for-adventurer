import { UnexpectedStateError } from '../../errors/FatalError';
import { NotSupportedFileTypeError } from '../../errors/FileError';
import { LoopInfo } from '../../model/LoopInfo';
import AudioMetadata from 'audio-metadata';

const waitFor = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const loadFileToAudioBuffer = async (
  file: File,
  ctx: AudioContext,
): Promise<{
  buffer: AudioBuffer;
  loopInfo: LoopInfo;
}> => {
  if (!file.type.startsWith('audio')) {
    throw new NotSupportedFileTypeError(file.type);
  }

  const rawBuffer = await new Promise<ArrayBuffer>((res, rej) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (!(result instanceof ArrayBuffer)) {
        rej(new UnexpectedStateError('FileReader.target.result が ArrayBuffer ではありません'));
        return;
      }
      res(result);
      return;
    };
    reader.readAsArrayBuffer(file);
  });

  const decoded = await ctx.decodeAudioData(rawBuffer);

  const metadata = AudioMetadata.ogg(rawBuffer);
  if (metadata === null) {
    return {
      buffer: decoded,
      loopInfo: {},
    };
  }

  const comments: {
    loopstart?: string;
    looplength?: string;
  } = metadata;
  const loopStart = comments.loopstart !== undefined ? parseInt(comments.loopstart) : undefined;
  const loopEnd =
    loopStart !== undefined && comments.looplength !== undefined
      ? loopStart + parseInt(comments.looplength)
      : undefined;

  return {
    buffer: decoded,
    loopInfo: {
      loopStart,
      loopEnd,
    },
  };
};

export const startPlayback = (
  ctx: AudioContext,
  buf: AudioBuffer,
  loopInfo: LoopInfo,
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
  if (loopInfo.loopStart !== undefined && loopInfo.loopEnd !== undefined) {
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
