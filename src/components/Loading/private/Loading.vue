<template>
  <transition
    enter-from-class="opacity-0"
    enter-active-class="transition"
    leave-active-class="transition"
    leave-to-class="opacity-0"
  >
    <div class="flex flex-col justify-center items-center space-y-2 text-white" v-if="open">
      <AtomSpinner />
      <div>{{ message }}</div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { defineBooleanProp } from '../../../utils/vue/Props';
import AtomSpinner from './AtomSpinner.vue';

export default defineComponent({
  props: {
    message: String,
    open: defineBooleanProp(false),
  },
  setup() {
    return {};
  },
  components: {
    AtomSpinner,
  },
});
</script>

<style scoped>
.loading-glow {
  filter: drop-shadow(0 0 4px #fff);
}
</style>
