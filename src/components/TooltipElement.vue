<template>
  <teleport to="body">
    <transition
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      @afterLeave="onAfterLeave"
    >
      <div v-if="open" ref="elementRef" class="bg-black bg-opacity-50 text-white px-2 py-1 transition-opacity">
        <slot />
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import { createPopper, Instance as PopperInstance } from '@popperjs/core';
import { defineComponent, PropType, ref, watchEffect } from 'vue';
import { defineBooleanProp } from '../utils/vue/Props';

export default defineComponent({
  props: {
    anchorEl: {
      type: Object as PropType<HTMLElement | null>,
    },
    open: defineBooleanProp(false),
  },
  setup(props) {
    const elementRef = ref<HTMLElement | null>(null);
    const popperInstancesNeedToDispose: PopperInstance[] = [];
    watchEffect(() => {
      const anchorEl = props.anchorEl;
      const open = props.open;
      const selfElement = elementRef.value;
      if (anchorEl === null || anchorEl === undefined || selfElement === null || !open) {
        return;
      }

      const popperInstance = createPopper(anchorEl, selfElement, {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
          {
            name: 'preventOverflow',
            options: {
              padding: 8,
            },
          },
        ],
      });
      popperInstancesNeedToDispose.push(popperInstance);
    });

    const onAfterLeave = () => {
      const disposeTargets = popperInstancesNeedToDispose.splice(0, popperInstancesNeedToDispose.length);
      disposeTargets.forEach((i) => i.destroy());
    };

    return {
      elementRef,
      onAfterLeave,
    };
  },
});
</script>
