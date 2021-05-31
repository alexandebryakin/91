import Konva from 'konva';
import { Layer } from 'konva/types/Layer';
import { Shape } from 'konva/types/Shape';
import { Node } from 'konva/types/Node';
import { KonvaEventObject } from 'konva/types/Node';

import { Vector2d } from 'konva/types/types';
import { Rect } from 'konva/types/shapes/Rect';
import utils from './utils';
import { EHelpernode } from '.';

interface ISnapCoords {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
}

function makeSnapable(shape: Shape, layer: Layer): void {
  const buildSnapline = () => {
    const snapline = new Konva.Line({
      points: [],
      stroke: 'blue',
      dash: [10, 10],
      strokeWidth: 1,
      name: EHelpernode.COMMON,
    });

    snapline.hide();
    layer.add(snapline);
    return snapline;
  };
  const snaplineVertical = buildSnapline();
  const snaplineHorizontal = buildSnapline();

  shape.on('dragmove', (e: KonvaEventObject<MouseEvent>) => {
    if (!e.evt.shiftKey) return snaplineVertical.hide();

    const nodes = layer.children
      .toArray()
      .filter((n) => n.visible())
      .filter((n) => n !== shape)
      .filter(utils.isNotHelpernode);

    const guidesX = nodes.map((node) => [node.x(), node.x() + node.width()]).flat();
    const guidesY = nodes.map((node) => [node.y(), node.y() + node.height()]).flat();

    const OFFSET = 15;

    const nearestXStart = (x: number) => Math.abs(shape.x() - x) < OFFSET;
    const nearestXEnd = (x: number) => Math.abs(shape.x() + shape.width() - x) < OFFSET;
    const nearestYStart = (y: number) => Math.abs(shape.y() - y) < OFFSET;
    const nearestYEnd = (y: number) => Math.abs(shape.y() + shape.height() - y) < OFFSET;
    const guides: ISnapCoords = {
      sx: Math.min(...guidesX.filter(nearestXStart)),
      ex: Math.min(...guidesX.filter(nearestXEnd)),
      sy: Math.min(...guidesY.filter(nearestYStart)),
      ey: Math.min(...guidesY.filter(nearestYEnd)),
    };

    const diffs: ISnapCoords = {
      sx: Math.abs(guides.sx - shape.x()),
      ex: Math.abs(guides.ex - shape.x() + shape.width()),
      sy: Math.abs(guides.sy - shape.y()),
      ey: Math.abs(guides.ey - shape.y() + shape.height()),
    };

    const getNearestX = (guides: ISnapCoords, diffs: ISnapCoords) => {
      if (isNaN(diffs.sx) && isNaN(diffs.ex)) return NaN;
      if (isNaN(diffs.sx)) return guides.ex - shape.width();
      if (isNaN(diffs.ex)) return guides.sx;
      return diffs.sx < diffs.ex ? guides.sx : guides.ex - shape.width();
    };
    const getNearestY = (guides: ISnapCoords, diffs: ISnapCoords) => {
      if (isNaN(diffs.sy) && isNaN(diffs.ey)) return NaN;
      if (isNaN(diffs.sy)) return guides.ey - shape.height();
      if (isNaN(diffs.ey)) return guides.sy;
      return diffs.sy < diffs.ey ? guides.sy : guides.ey - shape.height();
    };

    const x = getNearestX(guides, diffs);
    const y = getNearestY(guides, diffs);

    const isSnappingToStartX = x == guides.sx;
    const snaplineX = Math.round(isSnappingToStartX ? x : guides.ex);
    if (!isNaN(x) && isFinite(x)) {
      snaplineVertical.setAttrs({ points: [snaplineX, -6000, snaplineX, +6000] });
      snaplineVertical.show();
    } else {
      snaplineVertical.hide();
      destorySnapNodes(layer);
    }

    const isSnappingToStartY = y == guides.sy;
    const snaplineY = Math.round(isSnappingToStartY ? y : guides.ey);
    if (!isNaN(y) && isFinite(y)) {
      snaplineHorizontal.setAttrs({ points: [-6000, snaplineY, +6000, snaplineY] });
      snaplineHorizontal.show();
    } else {
      snaplineHorizontal.hide();
      destorySnapNodes(layer);
    }

    higlightSnappedNode({ x: snaplineX, y: snaplineY }, layer, shape);
    const coords = { x: isFinite(x) ? x : shape.x(), y: isFinite(y) ? y : shape.y() };
    const hoverRect = layer.findOne((node: Node) => node.name().includes(EHelpernode.HOVER));
    hoverRect?.setAttrs(coords);
    shape.setAttrs(coords);
  });

  shape.on('dragend', () => {
    snaplineVertical.hide();
    snaplineHorizontal.hide();
    destorySnapNodes(layer);
  });
}

function destorySnapNodes(layer: Layer) {
  layer.find((node: Node) => node.name().includes(EHelpernode.SNAPPED_RECT)).each((n: Node) => n.destroy());
}
function higlightSnappedNode(snaplineCoords: Vector2d, layer: Layer, shape: Shape) {
  const { x, y } = snaplineCoords;
  const snappingNodes = layer
    .find(
      (node: Node) =>
        Math.round(node.x()) == x ||
        Math.round(node.x() + node.width()) == x ||
        Math.round(node.y()) == y ||
        Math.round(node.y() + node.height()) == y,
    )
    .toArray()
    .filter((node: Node) => node !== shape)
    .filter(utils.isNotHelpernode);

  // console.log('>>>>>\n');
  // const f = (shape: Node) => [shape.x(), shape.y(), shape.x() + shape.width(), shape.y() + shape.height()];
  // console.log('snap', snaplineCoords);
  // console.log('shape', f(shape));
  // layer
  //   .find(isNotHelpernode)
  //   .toArray()
  //   .filter((node: Node) => node !== shape)
  //   .forEach((n, i) => console.log(`snap ${i}`, f(n)));
  // console.log('<<<<<');
  // destorySnapNodes(layer);

  const buildSnappingRect = (node: Node): Rect => {
    return new Konva.Rect({
      x: node.x(),
      y: node.y(),
      width: node.width(),
      height: node.height(),
      stroke: 'blue',
      strokeWidth: 1,
      name: EHelpernode.SNAPPED_RECT,
    });
  };

  const snappingRects = snappingNodes.map(buildSnappingRect);
  snappingRects.forEach((rect: Rect) => layer.add(rect));
}

export default makeSnapable;
