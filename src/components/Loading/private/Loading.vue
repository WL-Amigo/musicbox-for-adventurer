<template>
  <transition
    enter-from-class="opacity-0"
    enter-active-class="transition"
    leave-active-class="transition"
    leave-to-class="opacity-0"
  >
    <div class="flex flex-col justify-center items-center space-y-2 text-white" v-if="open">
      <!-- from https://tablericons.com/ -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-16 w-16 loading-glow animate-spin"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="21" x2="12" y2="21.01" />
        <line x1="3" y1="9" x2="3" y2="9.01" />
        <line x1="21" y1="9" x2="21" y2="9.01" />
        <path d="M8 20.1a9 9 0 0 1 -5 -7.1" />
        <path d="M16 20.1a9 9 0 0 0 5 -7.1" />
        <path d="M6.2 5a9 9 0 0 1 11.4 0" />
      </svg>
      <div>{{ message }}</div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { defineBooleanProp } from '../../../utils/vue/Props';

export default defineComponent({
  props: {
    message: String,
    open: defineBooleanProp(false),
  },
  setup() {
    return {};
  },
});
</script>

<style scoped>
.loading-glow {
  filter: drop-shadow(0 0 4px #fff);
}
</style>
