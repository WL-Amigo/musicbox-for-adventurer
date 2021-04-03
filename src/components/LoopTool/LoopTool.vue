<template>
  <modal-base :open="open">
    <main-component
      :file="file"
      :audio-buffer="audioBuffer"
      :current-loop-start="currentLoopStart"
      :current-loop-end="currentLoopEnd"
      @registered="$emit('registered', $event)"
      @cancel="$emit('cancel')"
    />
  </modal-base>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import { FileWithMetadata } from '../../model/FileWithMetadata';
import { makeRequiredBooleanProp, makeRequiredCustomTypeProp, makeRequiredNumberProp } from '../../utils/vue/Props';
import ModalBase from '../ModalBase.vue';

export default defineComponent({
  components: {
    ModalBase,
    mainComponent: defineAsyncComponent(() => import('./private/LoopTool.vue')),
  },
  props: {
    open: makeRequiredBooleanProp(),
    file: makeRequiredCustomTypeProp<FileWithMetadata>(),
    audioBuffer: makeRequiredCustomTypeProp<AudioBuffer>(),
    currentLoopStart: makeRequiredNumberProp(),
    currentLoopEnd: makeRequiredNumberProp(),
  },
  emits: {
    'update:open': null,
    registered: null,
    cancel: null,
  },
  setup() {
    return {};
  },
});
</script>
