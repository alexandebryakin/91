import { Node } from 'konva/types/Node';
import { Shape } from 'konva/types/Shape';

import { ETransformerTypes } from '../../App';

function makeTransformable(shape: Shape, type: ETransformerTypes): void {
  // console.log('type -> ', type);
  const MIN_WIDTH = 20;
  const handlers = {
    [ETransformerTypes.IMAGE]: (node: Node) => ({
      width: Math.max(node.width() * node.scaleX(), MIN_WIDTH),
      height: Math.max(node.height() * node.scaleY(), MIN_WIDTH),
    }),

    [ETransformerTypes.TEXT]: (node: Node) => ({
      // with enabled anchors we can only change scaleX
      // so we don't need to reset height
      // just width
      width: Math.max(node.width() * node.scaleX(), MIN_WIDTH),
      scaleX: 1,
      scaleY: 1,
    }),
  };

  shape.on('transform', (e) => {
    const handler = handlers[type];
    shape.setAttrs(handler(e.target));
  });
}

export default makeTransformable;
