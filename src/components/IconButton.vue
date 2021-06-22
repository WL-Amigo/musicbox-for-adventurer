<template>
  <button
    class="p-2 rounded relative focus:outline-none disabled:cursor-default"
    :class="buttonCls"
    ref="buttonRefInner"
    :disabled="disabled"
  >
    <div
      class="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-20 transition-colors duration-200 group-hover:animate-pulse"
    />
    <slot />
    <TooltipElement :open="isOpen" :anchorEl="buttonRefInner">
      <slot name="tooltip" />
    </TooltipElement>
  </button>
</template>

<script lang="ts">
import { useMouseInElement } from '@vueuse/core';
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import { defineBooleanProp } from '../utils/vue/Props';
import TooltipElement from './TooltipElement.vue';

export default defineComponent({
  props: {
    buttonRef: {
      type: Object as PropType<HTMLButtonElement>,
    },
    disabled: defineBooleanProp(false),
  },
  emits: {
    'update:buttonRef': null,
  },
  setup(props, ctx) {
    const buttonRefInner = ref<HTMLButtonElement | null>(null);
    watch(buttonRefInner, (buttonRefInnerValue) => {
      ctx.emit('update:buttonRef', buttonRefInnerValue);
    });

    const tooltipElRef = ref<HTMLElement | null>(null);
    const { isOutside } = useMouseInElement(buttonRefInner);
    const isTooltipPresent = ctx.slots['tooltip'] !== undefined;
    const isOpen = computed(() => buttonRefInner.value !== null && !isOutside.value && isTooltipPresent);

    const disabledCls = computed(() => (props.disabled ? ['opacity-20'] : ['group']));
    const buttonCls = computed(() => disabledCls.value);

    return {
      buttonRefInner,
      buttonCls,
      tooltipElRef,
      isOpen,
    };
  },
  components: {
    TooltipElement,
  },
});
</script>
