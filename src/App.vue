<template>
  <div class="w-full h-full">
    <bootstrap>
      <file-input-provider>
        <player />
      </file-input-provider>
    </bootstrap>
  </div>
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
