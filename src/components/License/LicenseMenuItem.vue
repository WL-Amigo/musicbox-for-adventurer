<template>
  <IconMenuButton :active="active" v-bind="$attrs" @click="openModal">
    <template v-slot:icon>
      <ScalesFill class="w-6 h-6" />
    </template>
    <span>ライセンス・利用素材等</span>
  </IconMenuButton>
  <LicenseModal :open="isModalOpen" @close="closeModal" />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import IconMenuButton from '../IconMenuButton.vue';
import ScalesFill from '../../icons/RemixIcon/ScalesFill.vue';
import { defineBooleanProp } from '../../utils/vue/Props';
import LicenseModal from './LicenseModal.vue';

export default defineComponent({
  components: {
    IconMenuButton,
    ScalesFill,
    LicenseModal,
  },
  props: {
    active: defineBooleanProp(false),
  },
  setup() {
    const isModalOpen = ref(false);
    const openModal = () => (isModalOpen.value = true);
    const closeModal = () => (isModalOpen.value = false);

    return {
      isModalOpen,
      openModal,
      closeModal,
    };
  },
});
</script>
