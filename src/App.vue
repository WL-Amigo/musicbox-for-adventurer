<template>
  <bootstrap>
    <div class="w-full h-full flex flex-row justify-center items-center bg-gray-800">
      <player />
    </div>
  </bootstrap>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Player from './components/Player.vue';
import { Bootstrap } from './Bootstrap';

export default defineComponent({
  name: 'App',
  components: {
    Player,
    Bootstrap,
  },
});
</script>
