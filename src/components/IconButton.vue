<template>
  <button
    class="rounded relative focus:outline-none disabled:cursor-default"
    :class="buttonCls"
    ref="buttonRefInner"
    :disabled="disabled"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div
      class="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-colors duration-200 group-hover:animate-pulse"
      :class="bgCls"
    />
    <slot />
    <TooltipElement :open="isOpen" :anchorEl="buttonRefInner">
      <slot name="tooltip" />
    </TooltipElement>
  </button>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { defineBooleanProp } from '../utils/vue/Props';
import TooltipElement from './TooltipElement.vue';
import { useMouseHoverState } from '../compositions/Mouse';

export default defineComponent({
  props: {
    disabled: defineBooleanProp(false),
    applyPadding: defineBooleanProp(true),
    bgColor: {
      type: String,
    },
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
    const { isHover, onMouseEnter, onMouseLeave } = useMouseHoverState();
    const isTooltipPresent = ctx.slots['tooltip'] !== undefined;
    const isOpen = computed(() => buttonRefInner.value !== null && isHover.value && isTooltipPresent);

    const disabledCls = computed(() => (props.disabled ? ['opacity-20'] : ['group']));
    const buttonCls = computed(() => disabledCls.value.concat(props.applyPadding ? ['p-2'] : []));
    const bgCls = computed(() => (props.bgColor !== undefined ? [props.bgColor] : ['bg-white']));

    return {
      buttonRefInner,
      buttonCls,
      bgCls,
      tooltipElRef,
      isOpen,
      onMouseEnter,
      onMouseLeave,
    };
  },
  components: {
    TooltipElement,
  },
});
</script>
