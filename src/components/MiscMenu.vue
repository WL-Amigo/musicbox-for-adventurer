<template>
  <headless-menu as="div" class="relative text-left">
    <menu-button class="px-4 py-2 bg-white rounded">その他</menu-button>
    <menu-items
      class="absolute origin-bottom-right left-0 bottom-10 mb-2 p-1 bg-white rounded flex flex-col space-y-1 focus:outline-none min-w-32"
    >
      <menu-item v-slot:default="{ active }">
        <button :class="calcMenuItemClass(active)" @click="doExport">エクスポート</button>
      </menu-item>
      <menu-item v-slot:default="{ active }">
        <button :class="calcMenuItemClass(active)" @click="doImport">インポート</button>
      </menu-item>
    </menu-items>
  </headless-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Menu as HeadlessMenu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';
import { ServiceKeys, useService } from '../compositions/ServiceProvider';
import { downloadJson } from '../utils/FileDownload';
import { useOpenFileDialog } from '../compositions/FileInput';

export default defineComponent({
  components: {
    HeadlessMenu,
    MenuButton,
    MenuItems,
    MenuItem,
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

    const calcMenuItemClass = (active: boolean) => (active ? ['bg-gray-100'] : []);

    return {
      calcMenuItemClass,
      doExport,
      doImport,
    };
  },
});
</script>
