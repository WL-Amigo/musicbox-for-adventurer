<template>
  <div class="space-y-2">
    <loop-adjuster-whole-waveform-renderer
      :audio-buffer="audioBuffer"
      :loop-start="loopStart"
      :loop-end="loopEnd"
      @update:loopStart="$emit('update:loopStart', $event)"
      @update:loopEnd="$emit('update:loopEnd', $event)"
    />
    <loop-adjuster-waveform-renderer
      :audio-buffer="audioBuffer"
      :loop-start="loopStart"
      :loop-end="loopEnd"
      @update:loopStart="$emit('update:loopStart', $event)"
      @update:loopEnd="$emit('update:loopEnd', $event)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { makeRequiredCustomTypeProp, makeRequiredNumberProp } from '../../../utils/vue/Props';
import { LoopAdjusterWaveformRenderer } from './WaveformRenderer/LoopPointAdjuster';
import { LoopAdjusterWholeWaveformRenderer } from './WaveformRenderer/LoopPointAdjusterWhole';

export default defineComponent({
  props: {
    audioBuffer: makeRequiredCustomTypeProp<AudioBuffer>(),
    loopStart: makeRequiredNumberProp(),
    loopEnd: makeRequiredNumberProp(),
  },
  emits: {
    'update:loopStart': null,
    'update:loopEnd': null,
  },
  setup() {
    return {};
  },
  components: {
    LoopAdjusterWaveformRenderer,
    LoopAdjusterWholeWaveformRenderer,
  },
});
</script>
