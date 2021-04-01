<template>
  <div class="bg-white p-4 rounded" @click.stop="">
    <loop-timing-adjuster
      :audio-buffer="audioBuffer"
      v-model:loop-start="loopStartLocal"
      v-model:loop-end="loopEndLocal"
      class="pb-2"
    />
    <div class="w-full flex flex-row justify-end">
      <button class="py-2 px-8 bg-white hover:bg-gray-200" @click="onRegister">登録</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { ServiceKeys, useService } from '../../../compositions/ServiceProvider';
import { FileWithMetadata } from '../../../model/FileWithMetadata';
import { LoopInfo } from '../../../model/LoopInfo';
import { makeRequiredCustomTypeProp, makeRequiredNumberProp } from '../../../utils/vue/Props';
import LoopTimingAdjuster from './LoopTimingAdjuster.vue';

export default defineComponent({
  components: {
    LoopTimingAdjuster,
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

    return {
      loopStartLocal,
      loopEndLocal,
      onRegister,
    };
  },
});
</script>
