import Konva from 'konva';
import { Layer } from 'konva/types/Layer';
import { Shape } from 'konva/types/Shape';
import { Node } from 'konva/types/Node';
import { KonvaEventObject } from 'konva/types/Node';

import { Transformer } from 'konva/types/shapes/Transformer';
import { Label } from 'konva/types/shapes/Label';
import { Line } from 'konva/types/shapes/Line';

import colors from '../colors';
import { EHelpernode } from '.';

interface IFigure {
  x: number;
  y: number;
  endX: number;
  endY: number;
  centerX: number;
  centerY: number;
}
interface ILineCoords {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
}
type TSector1 = 1;
type TSector2 = 2;
type TSector3 = 3;
type TSector4 = 4;
type TSector5 = 5;
type TSector6 = 6;
type TSector7 = 7;
type TSector8 = 8;
type TSector9 = 9;
type TSector = TSector1 | TSector2 | TSector3 | TSector4 | TSector5 | TSector6 | TSector7 | TSector8 | TSector9;
type TLineMap = {
  [key in TSector]: ILineCoords;
};

function makeGuidelineable(shape: Shape, transformer: Transformer, layer: Layer): void {
  const generateGuideline = (): Line => {
    const line = new Konva.Line({
      points: [],
      stroke: colors['--helpernode'],
      strokeWidth: 1,
      name: EHelpernode.COMMON,
    });
    line.hide();
    layer.add(line);
    return line;
  };
  const redLine1 = generateGuideline();
  const redLine2 = generateGuideline();
  const redLine3 = generateGuideline();
  const redLine4 = generateGuideline();

  const generateLabel = (): Label => {
    const label = new Konva.Label({ name: EHelpernode.COMMON });
    label.add(new Konva.Tag({ fill: colors['--helpernode'], cornerRadius: 5, name: EHelpernode.COMMON }));
    label.add(new Konva.Text({ fontSize: 12, padding: 3, fill: '#fff', name: EHelpernode.COMMON }));
    label.hide();
    layer.add(label);
    return label;
  };
  const label1 = generateLabel();
  const label2 = generateLabel();
  const label3 = generateLabel();
  const label4 = generateLabel();

  const buildObject = (node: Node): IFigure => {
    return {
      x: node.x(),
      y: node.y(),
      endX: node.x() + node.width(),
      endY: node.y() + node.height(),
      centerX: node.x() + node.width() / 2,
      centerY: node.y() + node.height() / 2,
    };
  };
  const defineSector = (target: IFigure, selected: IFigure): TSector => {
    if (target.endX < selected.x && target.endY < selected.y) return 1;
    if (target.x > selected.endX && target.endY < selected.y) return 3;
    if (target.x > selected.endX && target.y > selected.endY) return 5;
    if (target.endX < selected.x && target.y > selected.endY) return 7;

    if (target.endY < selected.y) return 2;
    if (target.x > selected.endX) return 4;
    if (target.y > selected.endY) return 6;
    if (target.endX < selected.x) return 8;

    return 9;
  };
  const noline = { sx: 0, sy: 0, ex: 0, ey: 0 };

  function drawGuideline(e: KonvaEventObject<MouseEvent>, line: Line, label: Label, map: TLineMap) {
    const selectedNode = transformer.nodes()[0];

    const target = buildObject(e.target);
    const selected = buildObject(selectedNode);

    const sector = defineSector(target, selected);
    const noline = { sx: 0, sy: 0, ex: 0, ey: 0 };
    const l = map[sector];

    if (l === noline) return;

    const linePoints = [l.sx, l.sy, l.ex, l.ey];
    const points = [...linePoints];

    const solid: number[] = [];
    const dashed = [10, 10];

    const lineSnapsToSelected =
      l.ex >= selected.x && l.ex <= selected.endX && l.ey >= selected.y && l.ey <= selected.endY;
    const dash = lineSnapsToSelected ? solid : dashed;

    if (lineSnapsToSelected) {
      const isVertical = l.sx == l.ex;
      const labelText = Math.round(Math.abs(isVertical ? l.ey - l.sy : l.ex - l.sx));
      label.getText().setAttrs({ text: labelText });
      const halfTextWidth = label.getText().width() / 2;
      const halfTextHeight = label.getText().height() / 2;
      const lineCenters = {
        x: Math.min(l.sx, l.ex) + Math.abs(l.sx - l.ex) / 2,
        y: Math.min(l.sy, l.ey) + Math.abs(l.sy - l.ey) / 2,
      };
      label.setAttrs({ x: lineCenters.x - halfTextWidth, y: lineCenters.y - halfTextHeight });
      label.show();
    } else label.hide();

    line.setAttrs({ points, dash });
    line.show();
    layer.draw();
  }

  function buildLeftGuidelineMap(target: IFigure, selected: IFigure): TLineMap {
    return {
      [1]: { sx: target.endX, sy: target.endY, ex: target.endX, ey: selected.centerY },
      [2]: noline,
      [3]: { sx: selected.centerX, sy: target.endY, ex: selected.centerX, ey: selected.y },
      [4]: noline,
      [5]: { sx: selected.centerX, sy: target.y, ex: selected.centerX, ey: selected.endY },
      [6]: noline,
      [7]: { sx: target.endX, sy: target.y, ex: target.endX, ey: selected.centerY },
      [8]: noline,
      [9]: noline,
    };
  }

  function buildRightGuidelineMap(target: IFigure, selected: IFigure): TLineMap {
    const defSecond = () => {
      if (target.centerX < selected.x) return selected.x;
      if (target.centerX > selected.endX) return selected.endX;
      return target.centerX;
    };
    return {
      [1]: { sx: selected.centerX, sy: target.endY, ex: selected.centerX, ey: selected.y },
      [2]: {
        sx: defSecond(),
        sy: target.endY,
        ex: defSecond(),
        ey: selected.y,
      },
      [3]: { sx: target.x, sy: target.endY, ex: target.x, ey: selected.centerY },
      [4]: noline,
      [5]: { sx: target.x, sy: target.y, ex: target.x, ey: selected.centerY },
      [6]: {
        sx: defSecond(),
        sy: target.y,
        ex: defSecond(),
        ey: selected.endY,
      },
      [7]: { sx: selected.centerX, sy: target.y, ex: selected.centerX, ey: selected.endY },
      [8]: noline,
      [9]: noline,
    };
  }

  function buildTopGuidelineMap(target: IFigure, selected: IFigure): TLineMap {
    const defSecond = () => {
      if (target.centerY < selected.y) return selected.y;
      if (target.centerY > selected.endY) return selected.endY;
      return target.centerY;
    };

    return {
      [1]: { sx: target.endX, sy: target.endY, ex: selected.centerX, ey: target.endY },
      [2]: noline,
      [3]: { sx: target.x, sy: target.endY, ex: selected.centerX, ey: target.endY },
      [4]: {
        sx: target.x,
        sy: defSecond(),
        ex: selected.endX,
        ey: defSecond(),
      },
      [5]: { sx: target.x, sy: selected.centerY, ex: selected.endX, ey: selected.centerY },
      [6]: noline,
      [7]: { sx: target.endX, sy: selected.centerY, ex: selected.x, ey: selected.centerY },
      [8]: {
        sx: target.endX,
        sy: defSecond(),
        ex: selected.x,
        ey: defSecond(),
      },
      [9]: noline,
    };
  }

  function buildBottomGuidelineMap(target: IFigure, selected: IFigure): TLineMap {
    return {
      [1]: { sx: target.endX, sy: selected.centerY, ex: selected.x, ey: selected.centerY },
      [2]: noline,
      [3]: { sx: target.x, sy: selected.centerY, ex: selected.endX, ey: selected.centerY },
      [4]: noline,
      [5]: { sx: target.x, sy: target.y, ex: selected.centerX, ey: target.y },
      [6]: noline,
      [7]: { sx: target.endX, sy: target.y, ex: selected.centerX, ey: target.y },
      [8]: noline,
      [9]: noline,
    };
  }

  shape.on('mouseover dragmove', (e) => {
    const selectedNode = transformer.nodes()[0];
    if (!selectedNode || selectedNode === shape) return;
    const target = buildObject(e.target);
    const selected = buildObject(selectedNode);
    drawGuideline(e, redLine1, label1, buildBottomGuidelineMap(target, selected));
    drawGuideline(e, redLine2, label2, buildTopGuidelineMap(target, selected));
    drawGuideline(e, redLine3, label3, buildLeftGuidelineMap(target, selected));
    drawGuideline(e, redLine4, label4, buildRightGuidelineMap(target, selected));
  });

  shape.on('mouseout', () => {
    redLine1.hide();
    redLine2.hide();
    redLine3.hide();
    redLine4.hide();
    label1.hide();
    label2.hide();
    label3.hide();
    label4.hide();
    layer.draw();
  });
}

export default makeGuidelineable;
