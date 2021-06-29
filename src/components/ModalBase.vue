<template>
  <teleport to="body">
    <transition
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      @afterLeave="onAfterLeave"
    >
      <div
        class="bg-black bg-opacity-25 absolute top-0 left-0 w-screen h-screen-dynamic flex items-center justify-center transition-opacity duration-200 backdrop-filter backdrop-blur-sm"
        v-show="open"
        v-if="isOpenInner"
        @click="$emit('clickAway')"
      >
        <slot />
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue';
import { makeRequiredBooleanProp } from '../utils/vue/Props';

export default defineComponent({
  props: {
    open: makeRequiredBooleanProp(),
  },
  emits: {
    clickAway: null,
  },
  setup(props) {
    const isOpenInner = ref(false);
    watchEffect(() => {
      const isOpen = props.open;
      if (isOpen) {
        isOpenInner.value = true;
      }
    });
    const onAfterLeave = () => (isOpenInner.value = false);

    return {
      isOpenInner,
      onAfterLeave,
    };
  },
});
</script>
