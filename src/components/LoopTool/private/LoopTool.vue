<template>
  <div class="bg-white p-4 rounded" @click.stop="">
    <loop-timing-adjuster
      :audio-buffer="audioBuffer"
      v-model:loop-start="loopStartLocal"
      v-model:loop-end="loopEndLocal"
      class="pb-2"
    />
    <div class="w-full flex flex-row justify-between items-center">
      <div class="space-x-2">
        <div class="flex flex-row space-x-1">
          <button class="bg-white hover:bg-gray-200" @click="stopPreview">
            <stop-icon class="w-8 h-8" />
          </button>
          <button class="bg-white hover:bg-gray-200" @click="playPreview(1)">
            <play-1-icon class="w-8 h-8" />
          </button>
          <button class="bg-white hover:bg-gray-200" @click="playPreview(3)">
            <play-3-icon class="w-8 h-8" />
          </button>
          <button class="bg-white hover:bg-gray-200" @click="playPreview(5)">
            <play-5-icon class="w-8 h-8" />
          </button>
        </div>
      </div>
      <button class="py-2 px-8 bg-white hover:bg-gray-200" @click="onRegister">登録</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, Ref, ref, toRef } from 'vue';
import { ServiceKeys, useService } from '../../../compositions/ServiceProvider';
import { FileWithMetadata } from '../../../model/FileWithMetadata';
import { LoopInfo } from '../../../model/LoopInfo';
import { makeRequiredCustomTypeProp, makeRequiredNumberProp } from '../../../utils/vue/Props';
import LoopTimingAdjuster from './LoopTimingAdjuster.vue';
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
  const playPreview = (offsetSecFromEnd: number) => {
    loopPreviewPlayer.start(
      audioBufferRef.value,
      {
        loopStart: currentLoopStartRef.value,
        loopEnd: currentLoopEndRef.value,
      },
      offsetSecFromEnd,
    );
  };
  const stopPreview = () => loopPreviewPlayer.stop();

  onUnmounted(stopPreview);

  return {
    playPreview,
    stopPreview,
  };
};

export default defineComponent({
  components: {
    LoopTimingAdjuster,
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
      };
      await loopInfoDB.saveLoopInfo(props.file, newLoopInfo);
      ctx.emit('registered', newLoopInfo);
    };

    const { playPreview, stopPreview } = useLoopPreview(toRef(props, 'audioBuffer'), loopStartLocal, loopEndLocal);

    return {
      loopStartLocal,
      loopEndLocal,
      onRegister,
      playPreview,
      stopPreview,
    };
  },
});
</script>
