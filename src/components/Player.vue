<template>
  <div
    class="rounded p-8 shadow-lg bg-white bg-opacity-80 relative"
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
    <div class="w-full h-auto flex flex-row justify-center items-center space-x-2">
      <button class="p-2 focus:outline-none" @click="onOpenFile">
        <folder-open-icon class="w-8 h-8" />
      </button>
      <button class="px-4 py-2 rounded bg-white" @click="onOpenLoopTool">ループツール</button>
    </div>
    <template v-if="currentAudioBuffer !== undefined && currentFile !== undefined">
      <loop-tool
        v-model:open="isLoopToolOpened"
        :file="currentFile"
        :audio-buffer="currentAudioBuffer"
        :current-loop-start="currentLoopInfo?.loopStart ?? 0"
        :current-loop-end="currentLoopInfo?.loopEnd ?? currentAudioBuffer.length"
        @registered="onLoopInfoRegistered"
        @cancel="isLoopToolOpened = false"
      />
    </template>
    <loading :open="isLoading" message="読込中…" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted, ref, shallowRef } from 'vue';
import { useDragAndDropFileInput, useOpenFileDialog } from '../compositions/FileInput';
import { ServiceKeys, useService } from '../compositions/ServiceProvider';
import { PlayerState } from '../services/ILoopMusicPlayer';
import PlayIcon from '../icons/boxicons/Play.vue';
import StopIcon from '../icons/boxicons/Stop.vue';
import PauseIcon from '../icons/boxicons/Pause.vue';
import FolderOpenIcon from '../icons/boxicons/FolderOpen.vue';
import LoopTool from './LoopTool/LoopTool.vue';
import { LoadingOverlay } from '../components/Loading';
import { useLoadingState } from '../compositions/Loading';

export default defineComponent({
  name: 'Player',
  components: {
    PlayIcon,
    StopIcon,
    PauseIcon,
    FolderOpenIcon,
    LoopTool,
    loading: LoadingOverlay,
  },
  setup() {
    const fileLoader = useService(ServiceKeys.audioFileLoader);
    const player = useService(ServiceKeys.loopMusicPlayer);
    const loopInfoDB = useService(ServiceKeys.loopInfoDatabase);
    const currentState = shallowRef<PlayerState>();
    const unsubscribeStateChanged = player.onStateChanged((state) => (currentState.value = state));
    onUnmounted(() => unsubscribeStateChanged());
    const { isLoading, load } = useLoadingState();

    const loadFile = (file: File) => {
      load(
        fileLoader.load(file).then((fileWithMetadata) => {
          return player.load(fileWithMetadata);
        }),
      );
    };
    const { onDragEnterOrOver, onDragLeave, onDrop } = useDragAndDropFileInput((fl) => loadFile(fl[0]));
    const { openFileDialog } = useOpenFileDialog();
    const onOpenFile = () => openFileDialog((fl) => loadFile(fl[0]));

    const canPlay = computed(() => currentState.value?.canPlay ?? false);
    const canStop = computed(() => currentState.value?.canStop ?? false);
    const canPause = computed(() => currentState.value?.canPause ?? false);
    const currentAudioBuffer = computed(() => {
      const state = currentState.value;
      return state?.audioBuffer;
    });
    const currentFile = computed(() => {
      const state = currentState.value;
      return state?.file;
    });
    const currentLoopInfo = computed(() => {
      const state = currentState.value;
      return state?.file?.loopInfo;
    });
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

    const isLoopToolOpened = ref(false);
    const onOpenLoopTool = () => {
      stop();
      isLoopToolOpened.value = true;
    };

    const closeLoopTool = () => (isLoopToolOpened.value = false);
    const reloadLoopInfo = async () => {
      const file = currentState.value?.file;
      if (file === undefined) {
        return;
      }
      const loopInfo = await loopInfoDB.getLoopInfo(file);
      if (loopInfo === undefined) {
        return;
      }
      await load(
        player.load({
          ...file,
          loopInfo,
        }),
      );
    };
    const onLoopInfoRegistered = async () => {
      closeLoopTool();
      await reloadLoopInfo();
    };

    return {
      onDrop,
      onDragEnterOrOver,
      onDragLeave,
      onOpenFile,
      isLoading,
      canPlay,
      canStop,
      canPause,
      currentFile,
      currentAudioBuffer,
      currentLoopInfo,
      makeButtonStyles,
      play,
      stop,
      pause,
      isLoopToolOpened,
      onOpenLoopTool,
      onLoopInfoRegistered,
    };
  },
});
</script>
