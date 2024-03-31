<template>
  <div class="w-48 gap-x-2 h-full flex flex-row items-center">
    <div class="flex-1 h-8">
      <input type="range" class="slider" min="0" max="1" step="0.01" @input="onChange" :value="value" />
    </div>
    <div class="flex-shrink-0 text-white text-lg">{{ (value * 100).toFixed(0) }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, ref } from 'vue';
import { ServiceKeys, useService } from '../../compositions/ServiceProvider';

export default defineComponent({
  name: 'MasterVolumeSlider',
  setup() {
    const playerSettings = useService(ServiceKeys.playerSettingsService);
    const onChange = (ev: Event) => {
      playerSettings.setMasterVolume(parseFloat((ev.target as HTMLInputElement).value));
    };
    const valueRef = ref(playerSettings.getMasterVolume());
    const unsubscribe = playerSettings.listenMasterVolumeChanged((value) => {
      valueRef.value = value;
    });
    onUnmounted(unsubscribe);

    return {
      onChange,
      value: valueRef,
    };
  },
});
</script>

<style scoped>
.slider {
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  background-color: white;
  height: 4px;
  width: 100%;
  border-radius: 10px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  background-color: white;
  width: 8px;
  height: 24px;
  border-radius: 0%;
}

.slider::-moz-range-thumb {
  background-color: white;
  width: 8px;
  height: 24px;
  border-radius: 0%;
  border: none;
}

.slider::-moz-focus-outer {
  border: 0;
}
</style>
