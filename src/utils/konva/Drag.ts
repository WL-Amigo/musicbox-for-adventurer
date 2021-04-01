import { NodeConfig } from 'konva/types/Node';

export const lockDragBoundFunc: NodeConfig['dragBoundFunc'] = function () {
  return { x: this.x(), y: this.y() };
};
