<template>
  <button class="focus:outline-none" :class="cls" :disabled="disabled">
    <slot />
  </button>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { defineBooleanProp } from '../utils/vue/Props';

export default defineComponent({
  props: {
    disabled: defineBooleanProp(false),
  },
  setup(props) {
    const disabledCls = computed(() =>
      props.disabled ? ['opacity-20', 'cursor-default'] : ['filter', 'transition-all', 'hover:drop-shadow-grow'],
    );
    const cls = computed(() => disabledCls.value);

    return {
      cls,
    };
  },
});
</script>
