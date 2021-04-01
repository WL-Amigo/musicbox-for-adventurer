export const makeBufferView = (f32Array: Float32Array, from: number, to: number): readonly number[] =>
  Array.from(f32Array.slice(from, to));
