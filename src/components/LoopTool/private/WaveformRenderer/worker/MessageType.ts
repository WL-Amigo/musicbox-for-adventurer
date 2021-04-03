export interface CalculateWholeWaveFormRequestMessage {
  samplesL: Float32Array;
  samplesR: Float32Array;
  width: number;
}

export interface CalculateWholeWaveFormResponseMessage {
  maxAmps: readonly number[];
  minAmps: readonly number[];
  rmsArray: readonly number[];
}
