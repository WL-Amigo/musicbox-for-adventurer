<template>
  <div class="relative">
    <play class="absolute inset-0" />
    <numeric-5 class="absolute -top-1 -left-1 w-3/4 h-3/4" stroke="white" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Play from '../boxicons/Play.vue';
import Numeric5 from '../mdi/Numeric5.vue';

export default defineComponent({
  components: {
    Play,
    Numeric5,
  },
});
</script>
