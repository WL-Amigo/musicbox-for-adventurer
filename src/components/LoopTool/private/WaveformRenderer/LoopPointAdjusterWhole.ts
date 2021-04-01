import Konva from 'konva';
import Chroma from 'chroma-js';
import { makeBufferView } from './Common';
import {
  computed,
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  readonly,
  ref,
  Ref,
  shallowRef,
  toRef,
  watch,
} from 'vue';
import { makeRequiredCustomTypeProp, makeRequiredNumberProp } from '../../../../utils/vue/Props';
import { WaveformWidth, WholeWaveformHeight } from '../consts';
import { lockDragBoundFunc } from '../../../../utils/konva/Drag';
import { KonvaEventObject } from 'konva/types/Node';

const drawWaveform = (ctx: Konva.Context, audioBuffer: AudioBuffer, konvaShape: Konva.Shape): void => {
  const width = konvaShape.width();
  const height = konvaShape.height();
  const halfHeight = height / 2;
  const drawY = Math.round(height / 2);
  const bufLength = audioBuffer.length;
  const samplesPerPx = bufLength / width;
  const mainFillColor = konvaShape.fill() ?? 'black';
  const subFillColor = Chroma(mainFillColor).alpha(0.5).hex();

  for (let x = 0; x < width; x++) {
    const samplesFrom = Math.round(samplesPerPx * x);
    const samplesTo = Math.round(samplesPerPx * (x + 1));
    const samplesL = makeBufferView(audioBuffer.getChannelData(0), samplesFrom, samplesTo);
    const samplesR = makeBufferView(audioBuffer.getChannelData(0), samplesFrom, samplesTo);
    const samplesM = samplesL.map((l, i) => l + samplesR[i]);
    const maxAmp = Math.max(...samplesM) / 2;
    const minAmp = Math.min(...samplesM) / 2;
    const rms = Math.sqrt(samplesM.reduce((pv, v) => pv + v * v, 0) / samplesM.length);

    // 薄い色
    ctx.setAttr('fillStyle', subFillColor);
    ctx.fillRect(x, drawY - maxAmp * halfHeight, 1, (maxAmp - minAmp) * halfHeight);
    // 濃い色でRMS
    ctx.setAttr('fillStyle', mainFillColor);
    ctx.fillRect(x, drawY - rms * halfHeight, 1, rms * halfHeight * 2);
  }
};

const useWholeWaveformShape = (width: Ref<number>, height: Ref<number>, audioBuffer: AudioBuffer): Konva.Layer => {
  const shape = new Konva.Shape({
    x: 0,
    y: 0,
    height: height.value,
    width: width.value,
    opacity: 1,
    fill: 'black',
    sceneFunc: (ctx, shape) => {
      drawWaveform(ctx, audioBuffer, shape);
    },
  });
  const layer = new Konva.Layer();
  layer.add(shape);

  const redraw = () => {
    layer.batchDraw();
  };
  watch([width, height], redraw);
  redraw();

  return layer;
};

type DragState = {
  dragStartScreenX: number;
  dragStartSamplePos: number;
};

const useLoopPointerShape = (
  loopPointRef: Ref<number>,
  sampleCountRef: Ref<number>,
  waveformWidthRef: Ref<number>,
  color: string,
  onChangeLoopPoint: (sample: number) => void,
): Konva.RegularPolygon => {
  const pointerPos = computed(
    () => Math.round((loopPointRef.value / sampleCountRef.value) * waveformWidthRef.value) + 5,
  );
  const pointer = new Konva.RegularPolygon({
    sides: 3,
    radius: 5,
    x: pointerPos.value,
    y: 5,
    fill: color,
    rotation: 180,
    draggable: true,
    dragBoundFunc: lockDragBoundFunc,
  });
  watch([pointerPos], ([newPosition]) => pointer.x(newPosition));

  const pointerDragState = shallowRef<DragState>();
  pointer.on('dragstart', (e) => {
    pointerDragState.value = {
      dragStartScreenX: e.evt.screenX,
      dragStartSamplePos: loopPointRef.value,
    };
  });
  pointer.on('dragmove', (e: KonvaEventObject<DragEvent>) => {
    const state = pointerDragState.value;
    const samples = sampleCountRef.value;
    if (state === undefined) {
      return;
    }
    let newLoopPoint =
      state.dragStartSamplePos +
      Math.round((e.evt.screenX - state.dragStartScreenX) * (samples / waveformWidthRef.value));
    if (newLoopPoint < 0) {
      newLoopPoint = 0;
    }
    if (newLoopPoint >= samples) {
      newLoopPoint = samples - 1;
    }
    onChangeLoopPoint(newLoopPoint);
  });

  return pointer;
};

export const LoopAdjusterWholeWaveformRenderer = defineComponent({
  name: 'LoopAdjusterWholeWaveformRenderer',
  props: {
    audioBuffer: makeRequiredCustomTypeProp<AudioBuffer>(),
    loopStart: makeRequiredNumberProp(),
    loopEnd: makeRequiredNumberProp(),
  },
  emits: {
    'update:loopStart': null,
    'update:loopEnd': null,
  },
  setup(props, ctx) {
    const loopStartPropRef = readonly(toRef(props, 'loopStart'));
    const loopEndPropRef = readonly(toRef(props, 'loopEnd'));
    const samples = computed(() => {
      const buf = props.audioBuffer;
      return buf.length;
    });

    const konvaMountRef = ref<HTMLDivElement | null>(null);
    const width = ref(WaveformWidth - 10);
    const stageWidth = computed(() => width.value + 10);
    const height = ref(WholeWaveformHeight);
    const stageHeight = computed(() => height.value + 10);
    const stage = new Konva.Stage({
      width: stageWidth.value,
      height: stageHeight.value,
      container: document.createElement('div'),
    });
    onMounted(() => {
      if (konvaMountRef.value !== null) {
        stage.setContainer(konvaMountRef.value);
      }
    });
    onUnmounted(() => {
      stage.destroy();
    });

    const waveformLayer = useWholeWaveformShape(width, height, props.audioBuffer);
    waveformLayer.y(10);
    stage.add(waveformLayer);

    const loopStartPointer = useLoopPointerShape(loopStartPropRef, samples, width, '#7142ff', (sample) => {
      ctx.emit('update:loopStart', sample);
    });
    const loopEndPointer = useLoopPointerShape(loopEndPropRef, samples, width, '#ff5a36', (sample) => {
      ctx.emit('update:loopEnd', sample);
    });
    const adjusterLayer = new Konva.Layer();
    adjusterLayer.add(loopStartPointer);
    adjusterLayer.add(loopEndPointer);
    watch([loopStartPropRef, loopEndPropRef], () => adjusterLayer.batchDraw());
    stage.add(adjusterLayer);

    return () => h('div', { ref: konvaMountRef });
  },
});
