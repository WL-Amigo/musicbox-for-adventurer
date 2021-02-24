<template>
  <div
    class="rounded p-8 shadow-lg bg-white bg-opacity-80"
    @drop="onDrop"
    @dragenter="onDragEnterOrOver"
    @dragleave="onDragLeave"
    @dragover="onDragEnterOrOver"
  >
    <div class="w-auto h-24">
      <div class="flex flex-row items-center px-8">
        <button class="p-4 focus:outline-none" :class="makeButtonStyles(canStop)" :disabled="!canStop" @click="stop">
          <stop-icon class="w-12 h-12" />
        </button>
        <button class="p-4 focus:outline-none" :class="makeButtonStyles(canPause)" :disabled="!canPause" @click="pause">
          <pause-icon class="w-12 h-12" />
        </button>
        <button class="p-4 focus:outline-none" :class="makeButtonStyles(canPlay)" :disabled="!canPlay" @click="play">
          <play-icon class="w-12 h-12" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted, shallowRef } from 'vue';
import { useDragAndDropFileInput } from '../compositions/FileInput';
import { ServiceKeys, useService } from '../compositions/ServiceProvider';
import { PlayerState } from '../services/ILoopMusicPlayer';
import PlayIcon from '../icons/boxicons/Play.vue';
import StopIcon from '../icons/boxicons/Stop.vue';
import PauseIcon from '../icons/boxicons/Pause.vue';

export default defineComponent({
  name: 'Player',
  components: {
    PlayIcon,
    StopIcon,
    PauseIcon,
  },
  setup() {
    const player = useService(ServiceKeys.loopMusicPlayer);
    const currentState = shallowRef<PlayerState>();
    const unsubscribeStateChanged = player.onStateChanged((state) => (currentState.value = state));
    onUnmounted(() => unsubscribeStateChanged());

    const { onDragEnterOrOver, onDragLeave, onDrop } = useDragAndDropFileInput((fl) => {
      player.load(fl[0]).catch((e) => console.error(e));
    });

    const canPlay = computed(() => currentState.value?.canPlay ?? false);
    const canStop = computed(() => currentState.value?.canStop ?? false);
    const canPause = computed(() => currentState.value?.canPause ?? false);
    const makeButtonStyles = (enabled: boolean): string[] => {
      return enabled ? [] : ['opacity-20', 'cursor-default'];
    };
    const play = () => {
      if (canPlay.value) {
        player.start();
      }
    };
    const stop = () => {
      if (canStop.value) {
        player.stop();
      }
    };
    const pause = () => {
      if (canPause.value) {
        player.pause();
      }
    };

    return {
      onDrop,
      onDragEnterOrOver,
      onDragLeave,
      canPlay,
      canStop,
      canPause,
      makeButtonStyles,
      play,
      stop,
      pause,
    };
  },
});
</script>
