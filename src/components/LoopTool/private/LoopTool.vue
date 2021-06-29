<template>
  <div class="w-full h-full flex flex-col justify-center items-center">
    <div class="window-sub-white" @click.stop="">
      <LoopTimingAdjuster
        :audio-buffer="audioBuffer"
        v-model:loop-start="loopStartLocal"
        v-model:loop-end="loopEndLocal"
        class="pb-2"
      />
      <div class="w-full flex flex-row justify-between items-center">
        <div class="flex flex-row items-center space-x-2">
          <div class="flex flex-row items-center space-x-1">
            <IconButton :applyPadding="false" bgColor="bg-gray-500" @click="stopPreview">
              <StopIcon class="w-8 h-8" />
              <template v-slot:tooltip>
                <span>プレビューを停止</span>
              </template>
            </IconButton>
            <IconButton :applyPadding="false" bgColor="bg-gray-500" @click="playPreview(1)">
              <Play1Icon class="w-8 h-8" />
              <template v-slot:tooltip>
                <span>ループ 1 秒前から再生</span>
              </template>
            </IconButton>
            <IconButton :applyPadding="false" bgColor="bg-gray-500" @click="playPreview(3)">
              <Play3Icon class="w-8 h-8" />
              <template v-slot:tooltip>
                <span>ループ 3 秒前から再生</span>
              </template>
            </IconButton>
            <IconButton :applyPadding="false" bgColor="bg-gray-500" @click="playPreview(5)">
              <Play5Icon class="w-8 h-8" />
              <template v-slot:tooltip>
                <span>ループ 5 秒前から再生</span>
              </template>
            </IconButton>
            <div v-if="restTimeForLoopPoint > 0">ループ地点まであと {{ restTimeForLoopPoint.toFixed(3) }} 秒</div>
          </div>
        </div>
        <div class="flex flex-row items-center space-x-2">
          <button class="py-2 px-8 bg-white hover:bg-gray-200" @click="onCancel">キャンセル</button>
          <button class="py-2 px-8 bg-blue-800 text-white hover:bg-blue-600" @click="onRegister">登録</button>
        </div>
      </div>
    </div>
    <div class="p-1 text-white">
      <div>
        <span>本ツールは「吉里吉里ループツール」を再実装したものです。</span>
      </div>
      <div class="space-x-1">
        <span>吉里吉里ループツールは</span>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://krkrz.github.io/"
          class="underline hover:text-blue-200"
          >吉里吉里Z</a
        >
        <span>にも同梱されています。</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, readonly, Ref, ref, toRef } from 'vue';
import { ServiceKeys, useService } from '../../../compositions/ServiceProvider';
import { FileWithMetadata } from '../../../model/FileWithMetadata';
import { LoopInfo } from '../../../model/LoopInfo';
import { makeRequiredCustomTypeProp, makeRequiredNumberProp } from '../../../utils/vue/Props';
import LoopTimingAdjuster from './LoopTimingAdjuster.vue';
import IconButton from '../../IconButton.vue';
import Play1Icon from '../../../icons/composite/Play1.vue';
import Play3Icon from '../../../icons/composite/Play3.vue';
import Play5Icon from '../../../icons/composite/Play5.vue';
import StopIcon from '../../../icons/boxicons/Stop.vue';

const useLoopPreview = (
  audioBufferRef: Readonly<Ref<AudioBuffer>>,
  currentLoopStartRef: Readonly<Ref<number>>,
  currentLoopEndRef: Readonly<Ref<number>>,
) => {
  const loopPreviewPlayer = useService(ServiceKeys.loopPreviewPlayer);
  const countDownEndTime = ref(0);
  const restTimeForLoopPoint = ref(0);

  const playPreview = (offsetSecFromEnd: number) => {
    loopPreviewPlayer.start(
      audioBufferRef.value,
      {
        loopStart: currentLoopStartRef.value,
        loopEnd: currentLoopEndRef.value,
        sampleRate: audioBufferRef.value.sampleRate,
      },
      offsetSecFromEnd,
    );
    countDownEndTime.value = Date.now() + offsetSecFromEnd * 1000;
    updateCountDown();
  };
  const stopPreview = () => {
    loopPreviewPlayer.stop();
    countDownEndTime.value = 0;
  };

  const updateCountDown = () => {
    const restTimeForLoopPointRaw = countDownEndTime.value - Date.now();
    if (restTimeForLoopPointRaw < 0) {
      restTimeForLoopPoint.value = 0;
      return;
    }

    restTimeForLoopPoint.value = restTimeForLoopPointRaw / 1000;
    requestAnimationFrame(updateCountDown);
  };

  onUnmounted(stopPreview);

  return {
    playPreview,
    stopPreview,
    restTimeForLoopPoint: readonly(restTimeForLoopPoint),
  };
};

export default defineComponent({
  components: {
    LoopTimingAdjuster,
    IconButton,
    Play1Icon,
    Play3Icon,
    Play5Icon,
    StopIcon,
  },
  props: {
    file: makeRequiredCustomTypeProp<FileWithMetadata>(),
    audioBuffer: makeRequiredCustomTypeProp<AudioBuffer>(),
    currentLoopStart: makeRequiredNumberProp(),
    currentLoopEnd: makeRequiredNumberProp(),
  },
  emits: {
    registered: null,
    cancel: null,
  },
  setup(props, ctx) {
    const loopInfoDB = useService(ServiceKeys.loopInfoDatabase);
    const loopStartLocal = ref(props.currentLoopStart);
    const loopEndLocal = ref(props.currentLoopEnd);

    // copy loopStart/loopEnd on mounted
    onMounted(() => {
      loopStartLocal.value = props.currentLoopStart;
      loopEndLocal.value = props.currentLoopEnd;
    });

    const onRegister = async () => {
      const newLoopInfo: LoopInfo = {
        loopStart: loopStartLocal.value,
        loopEnd: loopEndLocal.value,
        sampleRate: props.audioBuffer.sampleRate,
      };
      await loopInfoDB.saveLoopInfo(props.file, newLoopInfo);
      ctx.emit('registered', newLoopInfo);
    };
    const onCancel = () => {
      ctx.emit('cancel');
    };

    const { playPreview, stopPreview, restTimeForLoopPoint } = useLoopPreview(
      toRef(props, 'audioBuffer'),
      loopStartLocal,
      loopEndLocal,
    );

    return {
      loopStartLocal,
      loopEndLocal,
      onRegister,
      onCancel,
      playPreview,
      stopPreview,
      restTimeForLoopPoint,
    };
  },
});
</script>
