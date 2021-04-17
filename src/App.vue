<template>
  <bootstrap>
    <file-input-provider>
      <div class="w-full h-full flex flex-row justify-center items-center bg-gray-800">
        <player />
      </div>
    </file-input-provider>
  </bootstrap>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Player from './components/Player.vue';
import { Bootstrap } from './Bootstrap';
import { FileInputProvider } from './compositions/FileInput';

export default defineComponent({
  name: 'App',
  components: {
    Player,
    Bootstrap,
    FileInputProvider,
  },
});
</script>
