import Konva from 'konva';
import { Layer } from 'konva/types/Layer';
import { Transformer } from 'konva/types/shapes/Transformer';
import { Text } from 'konva/types/shapes/Text';
import { Node } from 'konva/types/Node';

import { KonvaEventObject } from 'konva/types/Node';
import { Stage } from 'konva/types/Stage';
import React from 'react';
import './App.scss';
import LabeledInput from './ui/components/LabeledInput';
import NavBar from './ui/components/NavBar';
import PinIcon from './icons/PinIcon';
import { Shape } from 'konva/types/Shape';
import TextIcon from './icons/TextIcon';
import ButtonRemove from './ui/components/ButtonRemove';
import { Line } from 'konva/types/shapes/Line';

interface ISideBar {
  template: ITemplate;
}
function SideBar(props: ISideBar): React.ReactElement {
  const { template } = props;

  return (
    <div className="sidebar__container">
      <div className="sidebar">
        <div className="menu">
          <div>Document structure</div>
          {/* <div>{template.nodes.length}</div> */}
          {template.nodes.map((node, idx) => {
            const { meta } = node;

            return (
              <div key={idx}>
                <span>
                  <TextIcon />
                </span>
                {meta.type == 'text' ? meta.content : meta.type}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
interface ITemplate {
  size: ISize;
  nodes: INode[];
}
const defaultTemplate: ITemplate = {
  size: { width: 720, height: 1080 } as ISize,
  nodes: [],
};
const loadedTemplate: ITemplate = {
  size: { width: 720, height: 1080 } as ISize,
  nodes: [
    {
      position: { x: 94, y: 88 },
      size: { width: 100, height: 20 },
      draggable: true,
      meta: {
        type: 'text',
        fontSize: 18,
        content: 'New text ...',
      },
    } as INodeText,

    {
      position: { x: 194, y: 188 },
      size: { width: 100, height: 20 },
      draggable: true,
      meta: {
        type: 'text',
        fontSize: 20,
        content: 'New text ...2',
      },
    } as INodeText,
  ],
};
interface INode {
  position: IPosition;
  size: ISize;
  draggable: boolean;
  meta: TMeta;
}
type TMeta = TNoMeta | IMetaText | IMetaImage;
// type TMetaType = 'text' | 'image' | 'table?';
type TNoMeta = Record<string, never>;
interface IMetaText {
  type: 'text';
  fontSize: number;
  content: string;
  // ...
}
interface INodeText extends INode {
  meta: IMetaText;
}
const buildTextNode = (text: Text): INodeText => {
  return {
    size: { width: text.textWidth, height: text.textHeight },
    position: { x: text.x(), y: text.y() },
    draggable: text.draggable(),
    meta: {
      type: 'text',
      content: text.text(),
    } as IMetaText,
  };
};
interface IMetaImage {
  type: 'image';
  src: string;
  alt: string;
  // ...
}
interface ISize {
  width: number;
  height: number;
}
interface IPosition {
  x: number;
  y: number;
}

function makeTextEditible(text: Text, transformer: Transformer, stage: Stage, layer: Layer) {
  text.on('dblclick dbltap', () => {
    // hide text node and transformer:
    text.hide();
    transformer?.hide();
    layer?.draw();

    // create textarea over canvas with absolute position
    // first we need to find position for textarea
    // how to find it?

    // at first lets find position of text node relative to the stage:
    const textPosition = text.absolutePosition();

    // so position of textarea will be the sum of positions above:
    const areaPosition = {
      x: (stage?.container().offsetLeft || 0) + textPosition.x,
      y: (stage?.container().offsetTop || 0) + textPosition.y,
    };

    // create textarea and style it
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    // apply many styles to match text on canvas as close as possible
    // remember that text rendering on canvas and on the textarea can be different
    // and sometimes it is hard to make it 100% the same. But we will try...
    textarea.value = text.text();
    textarea.style.position = 'absolute';
    textarea.style.top = areaPosition.y + 'px';
    textarea.style.left = areaPosition.x + 'px';
    textarea.style.width = text.width() - text.padding() * 2 + 'px';
    textarea.style.height = text.height() - text.padding() * 2 + 5 + 'px';
    textarea.style.fontSize = text.fontSize() + 'px';
    textarea.style.border = '1px solid gray';
    textarea.style.padding = '0px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = text.lineHeight().toString();
    textarea.style.fontFamily = text.fontFamily();
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = text.align();
    textarea.style.color = text.fill();
    const rotation = text.rotation();
    let transform = '';
    if (rotation) {
      transform += 'rotateZ(' + rotation + 'deg)';
    }

    let px = 0;
    // also we need to slightly move textarea on firefox
    // because it jumps a bit
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    if (isFirefox) {
      px += 2 + Math.round(text.fontSize() / 20);
    }
    transform += 'translateY(-' + px + 'px)';

    textarea.style.transform = transform;

    // reset height
    textarea.style.height = 'auto';
    // after browsers resized it we can set actual value
    textarea.style.height = textarea.scrollHeight + 3 + 'px';

    textarea.focus();

    function removeTextarea() {
      textarea.parentNode?.removeChild(textarea);
      window.removeEventListener('click', handleOutsideClick);
      text.show();
      transformer?.show();
      transformer?.forceUpdate();
      layer?.draw();
    }

    function setTextareaWidth(newWidth: number) {
      if (!newWidth) {
        // set width for placeholder
        // newWidth = text.placeholder.length * text.fontSize();
        // text.value.length
        newWidth = text.value.length * text.fontSize();
      }
      // some extra fixes on different browsers
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      if (isSafari || isFirefox) {
        newWidth = Math.ceil(newWidth);
      }

      // var isEdge =
      //   document.documentMode || /Edge/.test(navigator.userAgent);
      // if (isEdge) {
      //   newWidth += 1;
      // }
      textarea.style.width = newWidth + 'px';
    }

    textarea.addEventListener('keydown', function (e) {
      // hide on enter
      // but don't hide on shift + enter
      // e.key
      console.warn('The usage of e.keyCode is deprecated ⛔️ (`makeTextEditable`)');
      if (e.keyCode === 13 && !e.shiftKey) {
        text.text(textarea.value);
        removeTextarea();
      }
      // on esc do not set value back to node
      if (e.keyCode === 27) {
        removeTextarea();
      }
    });

    textarea.addEventListener('keydown', function () {
      const scale = text.getAbsoluteScale().x;
      setTextareaWidth(text.width() * scale);
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + text.fontSize() + 'px';
    });

    function handleOutsideClick(this: Window, e: MouseEvent) {
      if (e.target !== textarea) {
        text.text(textarea.value);
        removeTextarea();
      }
    }
    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    });
  });
}

function makeTextTransformable(text: Text) {
  const MIN_WIDTH = 20;
  text.on('transform', () => {
    // with enabled anchors we can only change scaleX
    // so we don't need to reset height
    // just width
    text.setAttrs({
      width: Math.max(text.width() * text.scaleX(), MIN_WIDTH),
      scaleX: 1,
      scaleY: 1,
    });
  });
}

const makeHoverable = (shape: Shape, layer: Layer, transformer: Transformer) => {
  const hoverRect = new Konva.Rect({ stroke: '#ebc175', strokeWidth: 1 });

  layer?.add(hoverRect);
  shape.on('mouseover', (e) => {
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
  shape.on('mouseout', () => {
    hoverRect.hide();
    layer?.draw();
  });
};

interface ICenterRect extends IPosition, ISize {}
function makeGuidelineable(shape: Shape, transformer: Transformer, layer: Layer) {
  const redLine1 = new Konva.Line({
    points: [],
    stroke: 'red',
    strokeWidth: 1,
  });
  redLine1.hide();
  layer.add(redLine1);

  const redLine2 = new Konva.Line({
    points: [],
    stroke: 'green',
    strokeWidth: 1,
  });
  redLine2.hide();
  layer.add(redLine2);

  function drawHorizontalGuideline(e: KonvaEventObject<MouseEvent>, line: Line, placement: 'top' | 'bottom') {
    const selectedNode = transformer.nodes()[0];
    if (!selectedNode || selectedNode === shape) return;

    const center1 = {
      x: selectedNode.x() + selectedNode.width() / 2,
      y: selectedNode.y() + selectedNode.height() / 2,
      width: selectedNode.width(),
      height: selectedNode.height(),
    } as ICenterRect;

    const center2 = {
      x: e.target.x() + e.target.width() / 2,
      y: e.target.y() + e.target.height() / 2,
      width: e.target.width(),
      height: e.target.height(),
    } as ICenterRect;

    const maxHalf = Math.max(e.target.width() / 2, selectedNode.width() / 2);
    if (Math.abs(center1.x - center2.x) <= maxHalf) return; // target == 'center'

    const orderByXAsc = (center1: ICenterRect, center2: ICenterRect) =>
      center1.x < center2.x ? [center1, center2] : [center2, center1];

    const orderByYAsc = (center1: ICenterRect, center2: ICenterRect) =>
      center1.y < center2.y ? [center1, center2] : [center2, center1];

    const [minPointByX, maxPointByX] = orderByXAsc(center1, center2);
    const [minPointByY, maxPointByY] = orderByYAsc(center1, center2);

    const direction = minPointByY.x > maxPointByY.x ? -1 : +1;
    const startingX = minPointByY.x + (minPointByY.width / 2) * direction;
    // const endingX = direction == 1 ? maxPointByX.x : minPointByX.x; // target == 'center'
    const endingX = direction == 1 ? maxPointByX.x - maxPointByX.width / 2 : minPointByX.x + maxPointByX.width / 2; // target == 'edge'
    const startingY = placement == 'top' ? minPointByY.y : maxPointByY.y;
    const endingY = startingY;

    if ((startingX - endingX) * direction > 0) return; // target == 'edge'

    const arrowPoints = [endingX - 7 * direction, endingY - 3, endingX - 7 * direction, endingY + 3, endingX, endingY];
    // const arrow: number[] = [];
    const linePoints = [startingX, startingY, endingX, endingY];
    const points = [...linePoints, ...arrowPoints];

    const solid: number[] = [];
    const dashed = [10, 10];
    const dash = startingY == selectedNode.y() + selectedNode.height() / 2 ? solid : dashed;

    line.setAttrs({ points, dash });
    line.show();
    layer.draw();
  }

  shape.on('mouseover dragmove', (e) => {
    drawHorizontalGuideline(e, redLine1, 'top');
    drawHorizontalGuideline(e, redLine2, 'bottom');
  });

  shape.on('mouseout', () => {
    redLine1.hide();
    redLine2.hide();
    layer.draw();
  });
}

function App(): React.ReactElement {
  const [template, setTemplate] = React.useState<ITemplate>(loadedTemplate);

  const konvaStageRef = React.useRef<HTMLDivElement>(null);
  const konvaStageContainer = 'konva-stage-container';
  React.useEffect(() => {
    const width = konvaStageRef.current?.offsetWidth;
    const height = konvaStageRef.current?.offsetHeight;

    const stage = new Konva.Stage({
      container: konvaStageContainer,
      width: width,
      height: height,
      draggable: true,
      scaleX: 0.5,
      scaleY: 0.5,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    const tr = new Konva.Transformer({
      nodes: [],
      padding: 5,

      // enable only side anchors
      enabledAnchors: ['middle-left', 'middle-right'],
      // limit transformer size
      boundBoxFunc: (oldBox, newBox) => {
        const MIN_WIDTH = 20;

        return newBox.width < MIN_WIDTH ? oldBox : newBox;
      },
    });
    function loadTemplate(template: ITemplate, transformer: Transformer) {
      const templateRect = new Konva.Rect({
        x: 20,
        y: 20,
        fill: '#fff',
        width: template.size.width,
        height: template.size.height,
      });
      layer.add(templateRect);
      layer.draw();

      template.nodes.forEach((node) => {
        function defineBuilder(node: INode): (node: INode) => Shape | undefined {
          //
          function textNodeBuilder(n: INode): Text {
            const node = n as INodeText;
            const text = new Konva.Text({
              x: node.position.x,
              y: node.position.y,
              width: node.size.width,
              height: node.size.height,
              fontSize: node.meta.fontSize,
              text: node.meta.content,
              draggable: node.draggable,
            });

            makeTextTransformable(text);
            makeTextEditible(text, transformer, stage, layer);
            makeHoverable(text, layer, transformer);
            makeGuidelineable(text, transformer, layer);

            return text;
          }
          if (node.meta.type == 'text') return textNodeBuilder;

          console.error('No builder found for node:', node);
          return () => undefined;
        }
        const build = defineBuilder(node);

        const shape = build(node);
        shape && layer.add(shape);
      });

      layer.draw();
    }
    loadTemplate(loadedTemplate, tr);

    tr.on('transform', () => {
      setSize(() => {
        return {
          width: Math.round(tr.width()),
          height: Math.round(tr.height()),
        };
      });
    });

    tr.on('dragmove', function (e) {
      const { x, y } = e.target.attrs;
      setCoords(() => ({ x: Math.round(x), y: Math.round(y) }));
    });
    layer.add(tr);

    const handleSelection = (e: KonvaEventObject<MouseEvent>) => {
      const nodes = e.target === stage ? [] : [e.target];
      tr.nodes(nodes);
      setPinned(nodes.length != 0 && !isSelectionDraggable(tr));
    };
    stage.on('click', handleSelection);

    const handleStageScale = (e: KonvaEventObject<WheelEvent>) => {
      if (!e.evt.ctrlKey) return;
      const scaleBy = 1.02;
      e.evt.preventDefault();
      const oldScale = stage.scaleX();

      const pointer = stage.getPointerPosition();

      const pointerX = pointer?.x || 0;
      const pointerY = pointer?.y || 0;
      const mousePointTo = {
        x: (pointerX - stage.x()) / oldScale,
        y: (pointerY - stage.y()) / oldScale,
      };

      const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      stage.scale({ x: newScale, y: newScale });

      const newPos = {
        x: pointerX - mousePointTo.x * newScale,
        y: pointerY - mousePointTo.y * newScale,
      };
      stage.position(newPos);
      stage.batchDraw();
    };
    stage.on('wheel', handleStageScale);

    setStage(stage);
    setLayer(layer);
    setTransformer(tr);
  }, []);

  const [stage, setStage] = React.useState<Stage>();
  const [layer, setLayer] = React.useState<Layer>();
  const [transformer, setTransformer] = React.useState<Transformer>();

  const [coords, setCoords] = React.useState({ x: 0, y: 0 });
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  const [currentlyAddingTextNode, setCurrentlyAddingTextNode] = React.useState(false);
  const onClickTextTool2 = () => {
    if (currentlyAddingTextNode) return;
    else setCurrentlyAddingTextNode(true);
    // currentlyAddingTextNode = true;

    const text = new Konva.Text({
      x: 50,
      y: 60,
      fontSize: 20,
      text: 'New text ...',
      draggable: true,
    });
    const { textWidth, textHeight } = text;
    setSize({ width: Math.round(textWidth), height: Math.round(textHeight) });

    makeTextTransformable(text);
    layer && transformer && stage && makeTextEditible(text, transformer, stage, layer);
    layer && transformer && makeHoverable(text, layer, transformer);

    const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
      const currentPositionConsideringStageScale = (): IPosition => {
        const scaleX = stage?.scaleX() || 1;
        const scaleY = stage?.scaleY() || 1;
        const x = e.evt.offsetX / scaleX - (stage?.x() || 0) / scaleX;
        const y = e.evt.offsetY / scaleY - (stage?.y() || 0) / scaleY;
        return { x, y };
      };

      const centerCursorOnElement = ({ x, y }: IPosition): IPosition => {
        return {
          x: x - text.width() / 2,
          y: y - text.height() / 2,
        };
      };
      const positionWithStageScale = currentPositionConsideringStageScale();
      const { x, y } = centerCursorOnElement(positionWithStageScale);
      text.setAttrs({ x, y });
      layer?.add(text);
      layer?.draw();
      setCoords({ x, y });
    };

    const handleRightMouseClick = (e: KonvaEventObject<MouseEvent>) => {
      e.evt.preventDefault();
      text.destroy();
      layer?.draw();
      cleanup();
    };

    const cleanup = () => {
      stage?.off('contextmenu', handleRightMouseClick);
      stage?.off('mousemove', handleMouseMove);
      cleanClickOnTextAfterPlacement();
      setCurrentlyAddingTextNode(false);
    };

    const cleanClickOnTextAfterPlacement = () => {
      text.off('click', placeText);
    };
    const placeText = () => {
      cleanup();
      setTemplate((t) => {
        const node: INode = buildTextNode(text);
        t.nodes = [...t.nodes, node];
        return t;
      });
    };

    stage?.on('mousemove', handleMouseMove);
    stage?.on('contextmenu', handleRightMouseClick);
    text?.on('click', placeText);

    stage?.batchDraw();
  };

  const handlePinCoords = () => {
    const nodes = transformer?.nodes() || [];
    if (nodes.length == 0) return;

    const draggable = isSelectionDraggable(transformer);
    setPinned(draggable);
    nodes.forEach((node) => node.draggable(!draggable));
  };

  const isSelectionDraggable = (tr: Transformer | undefined): boolean => {
    if (!tr?.nodes() || tr?.nodes().length == 0) return false;
    return tr?.nodes().every((node) => node.draggable());
  };

  const [pinned, setPinned] = React.useState(false);

  Object.assign(window, { __stage: stage, __layer: layer, __tr: transformer });

  // console.log('🚀 ~ file: App.tsx ~ line 333 ~ onClickTextTool2 ~ stage', stage?.attrs.x, stage?.attrs.y);
  // console.log('🚀 ~ file: App.tsx ~ line 333 ~ onClickTextTool2 ~ stage', stage);
  // console.log('template', template);

  return (
    <>
      <NavBar />

      <div className="main">
        <div className="page">
          <SideBar template={template} />

          <div className="builder-main">
            <div id={konvaStageContainer} ref={konvaStageRef}></div>
          </div>

          <div className="toolbar">
            <div className="toolbar__group">
              <div className="tool">A</div>
              <div className="tool">B</div>
            </div>

            <div className="separator" />

            <div className="toolbar__group">
              <div className={`tool ${currentlyAddingTextNode ? 'tool--active' : ''}`} onClick={onClickTextTool2}>
                T
              </div>
            </div>

            <div className="separator" />
          </div>

          <div className="builder-controls">
            <div className="controls-section">
              <div className="controls-section__row">
                <LabeledInput label="X" value={(coords.x || '').toString()} />

                <div className="controls-section__separator">
                  <PinIcon active={pinned} onClick={handlePinCoords} />
                </div>

                <LabeledInput label="Y" value={(coords.y || '').toString()} />
              </div>

              <div className="controls-section__row">
                <LabeledInput label="W" value={(size.width || '').toString()} />

                <div className="controls-section__separator">A</div>

                <LabeledInput label="H" value={(size.height || '').toString()} />
              </div>

              <ButtonRemove text={'abra kada'} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
