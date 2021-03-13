declare module 'audio-metadata' {
  const exports: {
    ogg: (buffer: ArrayBuffer) => Record<string, string> | null;
  };
  export default exports;
}
