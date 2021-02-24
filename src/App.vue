<template>
  <div class="w-full h-full flex flex-row justify-center items-center bg-gray-800">
    <div v-if="isSetupError">
      <span>お使いのブラウザではご利用頂けません。</span>
    </div>
    <player v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { setupDependencies } from './services/SetupDependencies';
import Player from './components/Player.vue';

export default defineComponent({
  name: 'App',
  components: {
    Player,
  },
  setup() {
    const isSetupError = ref(false);
    try {
      setupDependencies();
    } catch (error) {
      isSetupError.value = true;
    }

    return {
      isSetupError,
    };
  },
});
</script>
