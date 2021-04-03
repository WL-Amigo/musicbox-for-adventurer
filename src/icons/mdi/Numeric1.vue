<template>
  <svg viewBox="0 0 24 24">
    <path
      fill="currentColor"
      paint-order="stroke"
      :stroke-width="stroke !== undefined ? 2 : 0"
      :stroke="stroke"
      d="M10,7V9H12V17H14V7H10Z"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    stroke: String,
  },
});
</script>
