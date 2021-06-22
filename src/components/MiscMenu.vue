<template>
  <HeadlessMenu as="div" class="relative text-left">
    <MenuButton as="template">
      <IconButton class="text-white" v-model:buttonRef="popperAnchorEl" @click="isOpen = !isOpen">
        <MoreFill class="w-6 h-6 m-2" />
      </IconButton>
    </MenuButton>
    <teleport to="body">
      <div ref="popperContentEl" v-show="isOpen" class="p-1 bg-white rounded min-w-32">
        <MenuItems static class="flex flex-col space-y-1 focus:outline-none">
          <MenuItem v-slot:default="{ active }">
            <button :class="calcMenuItemClass(active)" @click="doExport">エクスポート</button>
          </MenuItem>
          <MenuItem v-slot:default="{ active }">
            <button :class="calcMenuItemClass(active)" @click="doImport">インポート</button>
          </MenuItem>
        </MenuItems>
      </div>
    </teleport>
  </HeadlessMenu>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { Menu as HeadlessMenu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';
import { ServiceKeys, useService } from '../compositions/ServiceProvider';
import { downloadJson } from '../utils/FileDownload';
import { useOpenFileDialog } from '../compositions/FileInput';
import IconButton from './IconButton.vue';
import MoreFill from '../icons/RemixIcon/MoreFill.vue';
import { createPopper } from '@popperjs/core';
import { onClickOutside } from '@vueuse/core';

export default defineComponent({
  components: {
    HeadlessMenu,
    MenuButton,
    MenuItems,
    MenuItem,
    IconButton,
    MoreFill,
  },
  setup() {
    const loopInfoDB = useService(ServiceKeys.loopInfoDatabase);
    const { openFileDialog } = useOpenFileDialog();
    const doExport = async () => {
      const exportedData = await loopInfoDB.export();
      downloadJson(exportedData, 'loopinfo-data.json');
    };
    const doImport = () => {
      openFileDialog(async (files) => {
        const file = files[0];
        await loopInfoDB.import(await file.text());
      });
    };

    const isOpen = ref(false);

    const calcMenuItemClass = (active: boolean) => (active ? ['bg-gray-100'] : []);
    const popperAnchorEl = ref<HTMLElement | null>(null);
    const popperContentEl = ref<HTMLElement | null>(null);
    watch([popperAnchorEl, popperContentEl, isOpen], ([anchorEl, contentEl, isOpenValue], _, onInvalidate) => {
      if (anchorEl === null || contentEl === null || !isOpenValue) {
        return;
      }

      const popperInstance = createPopper(anchorEl, contentEl, {
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
      onInvalidate(() => popperInstance.destroy());
    });
    onClickOutside(popperAnchorEl, () => (isOpen.value = false));

    return {
      calcMenuItemClass,
      doExport,
      doImport,
      isOpen,
      popperAnchorEl,
      popperContentEl,
    };
  },
});
</script>
