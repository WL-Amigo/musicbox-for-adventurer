declare module "audio-metadata" {
  const exports: {
    ogg: (buffer: ArrayBuffer) => Record<string, string>;
  };
  export default exports;
}
