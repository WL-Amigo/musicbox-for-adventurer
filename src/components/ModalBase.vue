<template>
  <teleport to="body">
    <div
      class="bg-black bg-opacity-25 absolute top-0 left-0 w-screen h-screen-dynamic flex items-center justify-center"
      v-if="open"
      @click="$emit('clickAway')"
    >
      <slot />
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { makeRequiredBooleanProp } from '../utils/vue/Props';

export default defineComponent({
  props: {
    open: makeRequiredBooleanProp(),
  },
  emits: {
    clickAway: null,
  },
});
</script>
