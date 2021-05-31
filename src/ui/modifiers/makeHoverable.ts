import Konva from 'konva';
import { Layer } from 'konva/types/Layer';
import { Shape } from 'konva/types/Shape';

import { Transformer } from 'konva/types/shapes/Transformer';

import colors from '../colors';
import { EHelpernode } from '.';

const hoverRect = new Konva.Rect({ stroke: colors['--helpernode'], strokeWidth: 1, name: EHelpernode.HOVER });

function makeHoverable(shape: Shape, layer: Layer, transformer: Transformer): void {
  layer?.add(hoverRect);
  shape.on('mouseover dragmove', (e) => {
    const dontHoverIfElementIsSelected = transformer?.nodes()[0] === e.target;
    if (dontHoverIfElementIsSelected) return;

    const width = shape.width();
    const height = shape.height();
    const x = shape.x();
    const y = shape.y();
    hoverRect.setAttrs({ x, y, width, height });
    hoverRect.show();
    layer?.draw();
  });
  shape.on('mouseout dragend', () => {
    hoverRect.hide();
    layer?.draw();
  });
}

export default makeHoverable;
