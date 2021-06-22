<template>
  <div class="w-full h-full flex flex-row items-end">
    <div
      class="relative w-full overflow-x-hidden overflow-y-visible"
      @drop="onDrop"
      @dragenter="onDragEnterOrOver"
      @dragleave="onDragLeave"
      @dragover="onDragEnterOrOver"
    >
      <div class="absolute inset-0 window-main" />
      <div class="relative p-4 min-h-32 flex flex-col lg:flex-row lg:justify-between items-center overflow-y-visible">
        <div class="flex flex-row items-center px-4 text-white">
          <IconButtonGrow :disabled="!canStop" @click="stop">
            <StopIcon class="w-12 h-12 m-4" />
          </IconButtonGrow>
          <IconButtonGrow :disabled="!canPause" @click="pause">
            <PauseIcon class="w-12 h-12 m-4" />
          </IconButtonGrow>
          <IconButtonGrow :disabled="!canPlay" @click="play">
            <PlayIcon class="w-12 h-12 m-4" />
          </IconButtonGrow>
        </div>
        <div class="px-4 flex flex-row justify-center items-center space-x-2">
          <IconButton class="text-white" @click="onOpenFile">
            <FolderOpenIcon class="w-6 h-6 m-2" />
            <template v-slot:tooltip>
              <span>ファイルを開く</span>
            </template>
          </IconButton>
          <IconButton class="text-white" @click="onOpenLoopTool" :disabled="currentFile === undefined">
            <FindAndReplaceIcon class="w-6 h-6 m-2" />
            <template v-slot:tooltip>
              <span>ループツール</span>
            </template>
          </IconButton>
          <LoginButton />
          <MiscMenu />
        </div>
      </div>
      <template v-if="currentAudioBuffer !== undefined && currentFile !== undefined">
        <LoopTool
          v-model:open="isLoopToolOpened"
          :file="currentFile"
          :audio-buffer="currentAudioBuffer"
          :current-loop-start="currentLoopInfo?.loopStart ?? 0"
          :current-loop-end="currentLoopInfo?.loopEnd ?? currentAudioBuffer.length"
          @registered="onLoopInfoRegistered"
          @cancel="isLoopToolOpened = false"
        />
      </template>
    </div>
    <Loading :open="isLoading" message="読込中…" />
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
import FindAndReplaceIcon from '../icons/RemixIcon/FindAndReplace.vue';
import LoopTool from './LoopTool/LoopTool.vue';
import LoginButton from './Auth/LoginButton.vue';
import MiscMenu from './MiscMenu.vue';
import IconButton from '../components/IconButton.vue';
import IconButtonGrow from '../components/IconButtonGrow.vue';
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
    LoginButton,
    MiscMenu,
    Loading: LoadingOverlay,
    IconButton,
    FindAndReplaceIcon,
    IconButtonGrow,
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
