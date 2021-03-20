// shims for music-metadata-browser > [readable-stream, typedarray-to-buffer]
window.Buffer = require('buffer').Buffer;
window.global = {
  Uint8Array,
};
