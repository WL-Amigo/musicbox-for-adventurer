<template>
  <HeadlessMenu as="div" class="relative text-left">
    <MenuButton as="template">
      <IconButton
        class="text-white"
        v-model:buttonRef="popperAnchorEl"
        @click="isOpen = !isOpen"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
      >
        <MoreFill class="w-6 h-6 m-2" />
      </IconButton>
    </MenuButton>
    <teleport to="body">
      <div ref="popperContentEl" v-show="isOpen" class="relative p-6 bg-white w-48">
        <div class="window-sub absolute inset-0" />
        <MenuItems static class="relative flex flex-col space-y-1 focus:outline-none">
          <MenuItem v-slot:default="{ active }">
            <IconMenuButton :active="active" @click="doExport">
              <template v-slot:icon>
                <UploadLineIcon class="w-6 h-6" />
              </template>
              <span>エクスポート</span>
            </IconMenuButton>
          </MenuItem>
          <MenuItem v-slot:default="{ active }">
            <IconMenuButton :active="active" @click="doImport">
              <template v-slot:icon>
                <DownloadLineIcon class="w-6 h-6" />
              </template>
              <span>インポート</span>
            </IconMenuButton>
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
import IconMenuButton from './IconMenuButton.vue';
import DownloadLineIcon from '../icons/RemixIcon/DownloadLine.vue';
import UploadLineIcon from '../icons/RemixIcon/UploadLine.vue';
import MoreFill from '../icons/RemixIcon/MoreFill.vue';
import { createPopper } from '@popperjs/core';
import { onClickOutside } from '@vueuse/core';
import { useMouseHoverState } from '../compositions/Mouse';

export default defineComponent({
  components: {
    HeadlessMenu,
    MenuButton,
    MenuItems,
    MenuItem,
    IconButton,
    IconMenuButton,
    MoreFill,
    DownloadLineIcon,
    UploadLineIcon,
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
    const { isHover: isAnchorHovered, onMouseEnter, onMouseLeave } = useMouseHoverState();
    onClickOutside(
      popperContentEl,
      () => {
        if (!isAnchorHovered.value) {
          isOpen.value = false;
        }
      },
      { event: 'pointerup' },
    );

    return {
      calcMenuItemClass,
      doExport,
      doImport,
      isOpen,
      popperAnchorEl,
      popperContentEl,
      onMouseEnter,
      onMouseLeave,
    };
  },
});
</script>
