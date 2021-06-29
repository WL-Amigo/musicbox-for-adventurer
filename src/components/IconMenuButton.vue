<template>
  <button class="relative p-1">
    <div class="absolute inset-0" :class="bgCls" />
    <div class="relative flex flex-row items-center space-x-2">
      <slot name="icon">
        <div class="w-6 h-6" />
      </slot>
      <slot />
    </div>
  </button>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { defineBooleanProp } from '../utils/vue/Props';

export default defineComponent({
  props: {
    active: defineBooleanProp(false),
  },
  setup(props) {
    const bgCls = computed(() => (props.active ? ['animate-pulse', 'bg-white', 'bg-opacity-100'] : []));

    return {
      bgCls,
    };
  },
});
</script>
