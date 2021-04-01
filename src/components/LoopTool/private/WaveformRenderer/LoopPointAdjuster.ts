import { defineComponent, h, onMounted, onUnmounted, readonly, Ref, ref, shallowRef, toRef, watch } from 'vue';
import { makeRequiredCustomTypeProp, makeRequiredNumberProp } from '../../../../utils/vue/Props';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/types/Node';
import { makeBufferView } from './Common';
import { LoopPoint } from '../../../../types/LoopPoint';
import { MainWaveformHeight, WaveformWidth } from '../consts';
import { lockDragBoundFunc } from '../../../../utils/konva/Drag';

const makeBufferViewAroundPos = (f32Array: Float32Array, pos: number, width: number): readonly number[] =>
  makeBufferView(
    f32Array,
    Math.max(pos - Math.floor(width / 2), 0),
    Math.min(pos + Math.floor(width / 2), f32Array.length),
  );

const drawWaveform = (ctx: Konva.Context, audioBuffer: AudioBuffer, pos: number, konvaShape: Konva.Shape) => {
  const width = konvaShape.width();
  const height = konvaShape.height();

  const waveformDataL = makeBufferViewAroundPos(audioBuffer.getChannelData(0), pos, width);
  const waveformDataR = makeBufferViewAroundPos(audioBuffer.getChannelData(1), pos, width);
  const viewLength = waveformDataL.length;
  let drawSamplePos = 0;
  let drawX = 0;
  if (pos - Math.floor(width / 2) < 0) {
    drawX = Math.floor(width / 2) - pos;
  }

  const leftWFDrawY = Math.ceil(height / 4);
  const rightWFDrawY = Math.floor((height / 4) * 3);
  const waveformMaxH = Math.floor(height / 4);
  ctx.fillStrokeShape(konvaShape);
  ctx.clearRect(0, 0, width, height);
  while (drawX < width || drawSamplePos < viewLength) {
    ctx.fillRect(drawX, leftWFDrawY, 1, Math.round(waveformDataL[drawSamplePos] * waveformMaxH));
    ctx.fillRect(drawX, rightWFDrawY, 1, Math.round(waveformDataR[drawSamplePos] * waveformMaxH));
    drawX++;
    drawSamplePos++;
  }
};

const useWaveformShape = (
  width: Ref<number>,
  height: Ref<number>,
  audioBuffer: AudioBuffer,
  positionRef: Readonly<Ref<number>>,
  fill: string,
  opacity: number,
) => {
  const shape = new Konva.Shape({
    x: 0,
    y: 0,
    height: height.value,
    width: width.value,
    opacity,
    fill,
    sceneFunc: (ctx, shape) => {
      drawWaveform(ctx, audioBuffer, positionRef.value, shape);
    },
  });
  const layer = new Konva.Layer();
  layer.add(shape);

  const redraw = () => {
    layer.batchDraw();
  };
  watch([width, height, positionRef], redraw);
  redraw();

  return {
    layer,
  };
};

type LoopPointAdjustingState = {
  target: LoopPoint;
  dragStartX: number;
  dragStartSamplePos: number;
};

export const LoopAdjusterWaveformRenderer = defineComponent({
  name: 'LoopAdjusterWaveformRenderer',
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

    const loopPointAdjustingState = shallowRef<LoopPointAdjustingState>();

    const konvaMountRef = ref<HTMLDivElement | null>(null);
    const width = ref(WaveformWidth);
    const height = ref(MainWaveformHeight);
    const stage = new Konva.Stage({
      width: width.value,
      height: height.value,
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
    stage.on('dragstart', (e) => {
      const target: LoopPoint = e.evt.offsetX > width.value / 2 ? 'loopStart' : 'loopEnd';
      loopPointAdjustingState.value = {
        target,
        dragStartX: e.evt.clientX,
        dragStartSamplePos: target === 'loopStart' ? props.loopStart : props.loopEnd,
      };
    });
    stage.on('dragmove', (e: KonvaEventObject<DragEvent>) => {
      const state = loopPointAdjustingState.value;
      if (state === undefined) {
        return;
      }

      if (state.target === 'loopStart') {
        ctx.emit('update:loopStart', state.dragStartSamplePos - e.evt.clientX + state.dragStartX);
      } else {
        ctx.emit('update:loopEnd', state.dragStartSamplePos - e.evt.clientX + state.dragStartX);
      }
    });
    stage.on('dragend', () => {
      loopPointAdjustingState.value = undefined;
    });

    const { layer: layerOfLoopEnd } = useWaveformShape(width, height, props.audioBuffer, loopEndPropRef, 'red', 0.2);
    stage.add(layerOfLoopEnd);
    const { layer: layerOfLoopStart } = useWaveformShape(
      width,
      height,
      props.audioBuffer,
      loopStartPropRef,
      'blue',
      0.2,
    );
    stage.add(layerOfLoopStart);

    // overlays
    const overlayLayer = new Konva.Layer();
    const centerLine = new Konva.Line({
      stroke: 'red',
      points: [width.value / 2 - 0.5, 0, width.value / 2 - 0.5, height.value],
      strokeWidth: 1,
      lineCap: 'square',
    });
    const loopStartText = new Konva.Text({
      x: 5,
      y: 5,
      fontSize: 20,
      fill: 'red',
      width: width.value / 2,
      text: 'ループ前',
      align: 'left',
    });
    const loopEndText = new Konva.Text({
      x: width.value / 2 - 5,
      y: 5,
      fontSize: 20,
      fill: 'blue',
      width: width.value / 2,
      text: 'ループ後',
      align: 'right',
    });
    overlayLayer.add(centerLine);
    overlayLayer.add(loopStartText);
    overlayLayer.add(loopEndText);
    stage.add(overlayLayer);

    // ドラッグイベントを捕らえるため透明なシェイプを含むレイヤーを用意
    const transparentRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: width.value,
      height: height.value,
      fill: 'transparent',
      draggable: true,
      dragBoundFunc: lockDragBoundFunc,
    });
    const dragEventLayer = new Konva.Layer();
    dragEventLayer.add(transparentRect);
    stage.add(dragEventLayer);

    return () =>
      h('div', {
        ref: konvaMountRef,
      });
  },
});
