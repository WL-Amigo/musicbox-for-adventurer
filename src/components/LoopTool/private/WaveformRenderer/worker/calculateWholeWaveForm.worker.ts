import { makeBufferView } from '../Common';
import { CalculateWholeWaveFormRequestMessage, CalculateWholeWaveFormResponseMessage } from './MessageType';

onmessage = function (e: MessageEvent<CalculateWholeWaveFormRequestMessage>) {
  const { samplesL, samplesR, width } = e.data;
  const bufLength = samplesL.length;
  const samplesPerPx = bufLength / width;

  const maxAmps: number[] = [];
  const minAmps: number[] = [];
  const rmsArray: number[] = [];

  for (let x = 0; x < width; x++) {
    const samplesFrom = Math.round(samplesPerPx * x);
    const samplesTo = Math.round(samplesPerPx * (x + 1));
    const samplesViewL = makeBufferView(samplesL, samplesFrom, samplesTo);
    const samplesViewR = makeBufferView(samplesR, samplesFrom, samplesTo);
    const samplesM = samplesViewL.map((l, i) => l + samplesViewR[i]);

    maxAmps.push(Math.max(...samplesM) / 2);
    minAmps.push(Math.min(...samplesM) / 2);
    rmsArray.push(samplesM.reduce((pv, v) => pv + v * v, 0) / samplesM.length);
  }

  const msg: CalculateWholeWaveFormResponseMessage = {
    maxAmps,
    minAmps,
    rmsArray: rmsArray,
  };
  postMessage(msg);
};
