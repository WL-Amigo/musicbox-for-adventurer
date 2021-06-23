<template>
  <ModalBase :open="open" @clickAway="$emit('close')">
    <div class="relative container window-sub h-full lg:h-9/10 overflow-hidden" @click.stop="">
      <div class="relative h-full space-y-4 overflow-x-hidden overflow-y-auto">
        <h2 class="text-lg font-bold">直接使用しているライブラリのライセンス</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div
            v-for="license in dependencyLicenses"
            :key="license.name"
            class="relative pl-8 flex flex-row items-center"
          >
            <div class="absolute -ml-8 h-full flex flex-row items-center">
              <SettingsFill class="w-6 h-6" />
            </div>
            <a class="hover:underline" v-if="license.url.length > 0" rel="noopenner noreferrer" :href="license.url"
              >{{ license.name }} ({{ license.license }})</a
            >
            <span v-else>{{ license.name }} ({{ license.license }})</span>
          </div>
        </div>
        <h2 class="text-lg font-bold">利用素材(アイコン、画像等)</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div v-for="license in assetLicenses" :key="license.name" class="relative pl-8 flex flex-row items-center">
            <div class="absolute -ml-8 h-full flex flex-row items-center">
              <VipDiamondFill class="w-6 h-6" />
            </div>
            <a class="hover:underline" v-if="license.url.length > 0" rel="noopenner noreferrer" :href="license.url"
              >{{ license.name }} {{ license.license.length > 0 ? `(${license.license})` : '' }}</a
            >
            <span v-else>{{ license.name }} {{ license.license.length > 0 ? `(${license.license})` : '' }}</span>
          </div>
        </div>
        <h2 class="text-lg font-bold">謝辞</h2>
        <div>
          <span
            >本アプリに付属しているループツールは「吉里吉里ループツール」を参考にブラウザ向けに再実装したものです。</span
          ><br />
          <span>吉里吉里ループツールは、OSS として開発中の</span>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://krkrz.github.io/"
            class="underline hover:text-blue-200"
            >吉里吉里Z</a
          >
          <span>にも同梱されています。</span><br />
          <span
            >ループ地点を設定するツールの優れた UI
            のアイデアを与えて下さった吉里吉里の開発者の皆様に、ここに感謝の意を示します。</span
          >
        </div>
      </div>
      <button class="absolute right-0 top-0 p-4 -mr-4 -mt-4" @click="$emit('close')">
        <Close class="w-6 h-6" />
      </button>
    </div>
  </ModalBase>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { makeRequiredBooleanProp } from '../../utils/vue/Props';
import Licenses from 'virtual:licenses';
import { AdditionalLicenses } from '../../assets/AdditionalLicenses';
import ModalBase from '../ModalBase.vue';
import SettingsFill from '../../icons/RemixIcon/SettingsFill.vue';
import VipDiamondFill from '../../icons/RemixIcon/VipDiamondFill.vue';
import Close from '../../icons/boxicons/Close.vue';

const AllLicenses = Licenses.concat(AdditionalLicenses);

export default defineComponent({
  props: {
    open: makeRequiredBooleanProp(),
  },
  emits: {
    close: null,
  },
  setup() {
    const dependencyLicenses = computed(() => AllLicenses.filter((l) => l.category === 'dependency'));
    const assetLicenses = computed(() => AllLicenses.filter((l) => l.category === 'asset'));

    return {
      dependencyLicenses,
      assetLicenses,
    };
  },
  components: {
    ModalBase,
    SettingsFill,
    VipDiamondFill,
    Close,
  },
});
</script>
