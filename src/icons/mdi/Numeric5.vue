<template>
  <svg viewBox="0 0 24 24">
    <path
      fill="currentColor"
      paint-order="stroke"
      :stroke-width="stroke !== undefined ? 2 : 0"
      :stroke="stroke"
      d="M9,7V13H13V15H9V17H13A2,2 0 0,0 15,15V13A2,2 0 0,0 13,11H11V9H15V7H9Z"
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
