import Konva from 'konva';
import { v4 as uuid } from 'uuid';
import { Layer } from 'konva/types/Layer';
import { Box, TransformerConfig } from 'konva/types/shapes/Transformer';
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
import UndoIcon from './icons/UndoIcon';
import RedoIcon from './icons/RedoIcon';
import ImageIcon from './icons/ImageIcon';
import TextAddIcon from './icons/TextAddIcon';
import { Image } from 'konva/types/shapes/Image';
import SaveIcon from './icons/SaveIcon';
import CopyIcon from './icons/CopyIcon';
import makeTextEditible from './ui/modifiers/makeTextEditible';
import { EHelpernode } from './ui/modifiers';
import makeSnapable from './ui/modifiers/makeSnapable';
import utils from './ui/modifiers/utils';
import colors from './ui/colors';
import makeGuidelineable from './ui/modifiers/makeGuidelineable';
import makeHoverable from './ui/modifiers/makeHoverable';
import { Rect } from 'konva/types/shapes/Rect';
import Toolbar from './ui/components/Toolbar';
import { EAddittionType, IHistoryState, ILayerHistory } from './ui/history/history';
import useLayerHistory from './ui/history/useLayerHistory';

interface ISideBar {
  template: ITemplate;
  onRowClick: (node: INode) => void;
  onMouseOverRow: (node: INode) => void;
  onMouseLeaveRow: (node: INode) => void;
}
function SideBar(props: ISideBar): React.ReactElement {
  const { template, onRowClick, onMouseOverRow, onMouseLeaveRow } = props;

  return (
    <div className="sidebar__container">
      <div className="sidebar">
        <div className="menu">
          <div>Document structure</div>
          {/* <div>{template.nodes.length}</div> */}
          {template.nodes.map((node, idx) => {
            const { meta } = node;

            return (
              <div
                key={idx}
                className="document-structure__row"
                onClick={() => onRowClick(node)}
                onMouseOver={() => onMouseOverRow(node)}
                onMouseLeave={() => onMouseLeaveRow(node)}
              >
                <TextIcon className="document-structure__row-icon" />

                <span>{meta.type == 'text' ? meta.content : meta.type}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
function selectNode(transformer: Transformer, node: Node) {
  transformer.nodes([node]);
  // transformer.setAttrs({enabledAnchors: []})
}

interface ITemplateTrash {
  nodes: INode[];
}
interface ITemplate {
  size: ISize;
  nodes: INode[];
  trash: ITemplateTrash;
}
// const defaultTemplate: ITemplate = {
//   size: { width: 720, height: 1080 } as ISize,
//   nodes: [],
// };
const loadedTemplate: ITemplate = {
  size: { width: 720, height: 1080 } as ISize,
  nodes: [
    {
      guid: 'b2404fc2-b81b-4fb1-8ddd-80e5f19fbde8',
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
      guid: 'c20df2a9-7dbb-4095-9baa-9c374c774f56',
      position: { x: 294, y: 288 },
      size: { width: 100, height: 60 },
      draggable: true,
      meta: {
        type: 'text',
        fontSize: 20,
        content: 'New text ...2',
      },
    } as INodeText,
  ],
  trash: {
    nodes: [],
  },
};
interface INode {
  guid: string;
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
    guid: text.id(),
    size: { width: text.textWidth, height: text.textHeight },
    position: { x: text.x(), y: text.y() },
    draggable: text.draggable(),
    meta: {
      type: 'text',
      content: text.text(),
    } as IMetaText,
  };
};
function buildImageNode(image: Image) {
  return {
    guid: image.id(),
    size: { width: image.width(), height: image.height() },
    position: { x: image.x(), y: image.y() },
    draggable: image.draggable(),
    meta: {
      type: 'image',
    } as IMetaImage,
  };
}
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
// <<<<<
// <<<<<
// <<<<<
// <<<<<

enum ETemplateNodeTypes {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  TEMPLATE_RECT = 'TEMPLATE_RECT',
}
type TPlaceableNodeTypes = ETemplateNodeTypes.TEXT | ETemplateNodeTypes.IMAGE;

const genTemplateNodeName = (type: ETemplateNodeTypes) => `template-node ${type}`;

const indestructibleNodeNames = [ETemplateNodeTypes.TEMPLATE_RECT];
const destructibleNodes = (node: Node) => !indestructibleNodeNames.some((n) => node.name().includes(n));

// const ZIndexes = {
//   [ETemplateNodeTypes.TEMPLATE_RECT]: 3,
//   [ETemplateNodeTypes.TEXT]: 2,
//   [EHelpernode.COMMON]: 1,
// };

const styles = {
  anchorStroke: colors['--border-color'],
  anchorFill: colors['--color-bg-tool'],
  anchorSize: 7,
  borderDash: [5, 5],
  borderStroke: '#727585',

  rotateEnabled: false,
} as TransformerConfig;
const transformer: Transformer = new Konva.Transformer({ ...styles });
// transformer.on('transform', (e) => {
//   e.target
// });

enum ETransformerTypes {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}
function setupTransformer(type: ETransformerTypes = ETransformerTypes.TEXT): Transformer {
  // ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right']
  const configs = {
    [ETransformerTypes.TEXT]: {
      name: EHelpernode.COMMON,
      enabledAnchors: ['middle-left', 'middle-right'],
      boundBoxFunc: (oldBox: Box, newBox: Box) => {
        const MIN_WIDTH = 20;

        return newBox.width < MIN_WIDTH ? oldBox : newBox;
      },
    } as TransformerConfig,

    [ETransformerTypes.IMAGE]: {
      name: EHelpernode.COMMON,
      enabledAnchors: [
        'top-left',
        'top-center',
        'top-right',
        'middle-right',
        'middle-left',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ],
      boundBoxFunc: (oldBox: Box, newBox: Box) => {
        const MIN_WIDTH = 20;

        return newBox.width < MIN_WIDTH ? oldBox : newBox;
      },
    } as TransformerConfig,
  };
  // console.log('🚀 ~ file: type', type);

  transformer.setAttrs(configs[type]);
  transformer.moveToTop();
  transformer.getLayer()?.draw();

  return transformer;
}
function getTransformer(): Transformer {
  return transformer;
}

const layer = new Konva.Layer();
function buildLayer() {
  return layer;
}

const hoveredNode = new Konva.Rect({
  stroke: colors['--helpernode'],
  strokeWidth: 1,
  name: EHelpernode.HOVERED_ON_SIDEBAR,
});
function hoveredOnSidebarRectBuilder(): Rect {
  return hoveredNode;
}

enum EFactoryTypes {
  TRANSFORMER = 'TRANSFORMER',
}
function factory(type: EFactoryTypes) {
  if (type == EFactoryTypes.TRANSFORMER) return setupTransformer();

  return setupTransformer();
}

function makeTransformable(shape: Shape, type: ETransformerTypes) {
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

const templateRect = new Konva.Rect({
  x: 20,
  y: 20,
  fill: '#fff',

  name: genTemplateNodeName(ETemplateNodeTypes.TEMPLATE_RECT),
});
function buildTemplateRect(): Rect {
  return templateRect;
}
function loadTemplate(
  template: ITemplate,
  transformer: Transformer,
  layer: Layer,
  stage: Stage,
  History: ILayerHistory,
  setCoordsAndSizeAttrs: (e: KonvaEventObject<MouseEvent>) => void,
) {
  const templateRect = buildTemplateRect();
  templateRect.setAttrs({ width: template.size.width, height: template.size.height });
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
          name: genTemplateNodeName(ETemplateNodeTypes.TEXT),
          id: n.guid,
        });

        makeTransformable(text, ETransformerTypes.TEXT);
        makeTextEditible(text, transformer, stage, layer);
        makeHoverable(text, layer, transformer);
        makeGuidelineable(text, transformer, layer);
        makeSnapable(text, layer);
        text.on('click dragmove', setCoordsAndSizeAttrs);
        text.on('click', () => setupTransformer(ETransformerTypes.TEXT));

        return text;
      }
      if (node.meta.type == 'text') return textNodeBuilder;

      console.error('No builder found for node:', node);
      return () => undefined;
    }
    const build = defineBuilder(node);

    const shape = build(node);
    shape && layer.add(shape);
    shape && History.rememberDragEnd(shape);
    shape && History.rememberTransform(transformer);
  });

  layer.draw();
}

function App(): React.ReactElement {
  const [template, setTemplate] = React.useState<ITemplate>(loadedTemplate);

  const konvaStageContainer = 'konva-stage-container';
  const konvaStageRef = React.useRef<HTMLDivElement>(null);

  const layer = buildLayer();
  const [stage, setStage] = React.useState<Stage>();
  const transformer = getTransformer();

  const setCoordsAndSizeAttrs = (e: KonvaEventObject<MouseEvent>) => {
    setCoords({ x: e.target.x(), y: e.target.y() });
    setSize({ width: e.target.width(), height: e.target.height() });
  };
  const History = useLayerHistory(layer);
  React.useEffect(() => {
    const stateSwapper = (state: IHistoryState): IHistoryState => {
      const swapType = (type: EAddittionType): EAddittionType => {
        if (type == EAddittionType.CREATE) return EAddittionType.DELETE;
        if (type == EAddittionType.DELETE) return EAddittionType.CREATE;

        return type;
      };

      const buildState = (target: Node): IHistoryState => {
        return {
          ...state,
          attrs: { ...state.attrs, visible: target.visible() },
          type: swapType(type),
          target,
        };
      };

      const { type, target } = state;
      if (type == EAddittionType.CREATE) {
        // since the previous state was the creation, we need to hide current
        // target on undo and mark current addition type as DELETE so that further redo
        // could revert the state
        target.hide();
        removeNodeFromTemplate(target);
        return buildState(target);
      }

      if (type == EAddittionType.DELETE) {
        // since the previous state was the deletion, we need to show current
        // target on undo and mark current addition type as CREATE so that further redo
        // could revert the state
        target.show();
        restoreNodeForTemplate(target);
        return buildState(target);
      }

      return state;
    };
    History.swappers.undo = stateSwapper;
    History.swappers.redo = stateSwapper;
  }, []);

  React.useEffect(() => {
    const width = konvaStageRef.current?.offsetWidth;
    const height = konvaStageRef.current?.offsetHeight;
    const stage = new Konva.Stage({
      container: konvaStageContainer,
      width: width,
      height: height,
      draggable: true,
      scaleX: 1, // 0.5
      scaleY: 1, // 0.5
    });
    setStage(stage);

    stage.add(layer);
    layer.add(transformer);
    // History.initialize(layer);

    // const transformer = buildTransformer(ETransformerTypes.TEXT);
    transformer.on('transform dragmove', setCoordsAndSizeAttrs);

    stage.on('click', setCoordsAndSizeAttrs);

    loadTemplate(loadedTemplate, transformer, layer, stage, History, setCoordsAndSizeAttrs);

    const handleSelection = (e: KonvaEventObject<MouseEvent>) => {
      const nodes = e.target === stage ? [] : [e.target];
      transformer.nodes(nodes);
      setPinned(nodes.length != 0 && !isSelectionDraggable(transformer));
    };
    stage.on('click', handleSelection);

    const hoveredNode = hoveredOnSidebarRectBuilder();
    hoveredNode.hide();
    layer.add(hoveredNode);

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
  }, []);

  const [coords, setCoords] = React.useState({ x: 0, y: 0 });
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  const handlePinCoords = () => {
    const nodes = transformer.nodes() || [];
    if (nodes.length == 0) return;

    const draggable = isSelectionDraggable(transformer);
    setPinned(draggable);
    nodes.forEach((node) => node.draggable(!draggable));
  };

  const isSelectionDraggable = (tr: Transformer): boolean => {
    if (!tr.nodes() || tr.nodes().length == 0) return false;
    return tr.nodes().every((node) => node.draggable());
  };

  const [pinned, setPinned] = React.useState(false);

  Object.assign(window, { __stage: stage, __layer: layer, __tr: transformer, __uuid: uuid });

  // console.log('🚀 ~ file: App.tsx ~ line 333 ~ onClickTextTool2 ~ stage', stage?.attrs.x, stage?.attrs.y);
  // console.log('🚀 ~ file: App.tsx ~ line 333 ~ onClickTextTool2 ~ stage', stage);
  // console.log('template', template);

  function handleRemoveNodes() {
    const nodes = transformer.nodes().filter(destructibleNodes).filter(utils.isNotHelpernode) || [];

    const destroyTemplateNode = (node: Node) => {
      const nodes = template.nodes.filter((n) => n.guid != node.id());

      setTemplate((t) => ({ ...t, nodes: [...nodes] }));
    };

    nodes.forEach(destroyTemplateNode);
    nodes.forEach((node: Node) => node.destroy());
    transformer.nodes([]);
    layer.batchDraw();
  }

  const findTemplateNodeByGuid = (guid: string): Node | undefined => {
    const node = layer.findOne((node: Node) => node.id() == guid);
    if (!node) console.warn('Node not found. guid: ', guid);
    return node;
  };

  function highlightHoveredNode(node: Node) {
    const hoveredNode = hoveredOnSidebarRectBuilder();

    hoveredNode.show();
    hoveredNode.setAttrs({
      x: node.x(),
      y: node.y(),
      width: node.width(),
      height: node.height(),
    });
    layer.draw();
  }

  function shapePlacementHandler(
    type: TPlaceableNodeTypes,
    shape: Shape,
    onShapePlaced?: (shape: Shape) => void,
    onDiscard?: () => void,
  ) {
    shape.zIndex(2);

    const mapping = {
      [ETransformerTypes.TEXT]: ETransformerTypes.TEXT,
      [ETransformerTypes.IMAGE]: ETransformerTypes.IMAGE,
    };

    makeTransformable(shape, mapping[type]);
    makeHoverable(shape, layer, transformer);
    makeGuidelineable(shape, transformer, layer);
    makeSnapable(shape, layer);

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
          x: x - shape.width() / 2,
          y: y - shape.height() / 2,
        };
      };
      const positionWithStageScale = currentPositionConsideringStageScale();
      const { x, y } = centerCursorOnElement(positionWithStageScale);
      shape.setAttrs({ x, y });
      layer.draw();
      setCoordsAndSizeAttrs(e);
    };

    const handleRightMouseClick = (e: KonvaEventObject<MouseEvent>) => {
      e.evt.preventDefault();
      shape.destroy();
      layer.draw();
      cleanup();
      onDiscard && onDiscard();
    };

    const cleanup = () => {
      stage?.off('contextmenu', handleRightMouseClick);
      stage?.off('mousemove', handleMouseMove);
      shape.off('click.node-placement', placeNode);
    };

    const placeNode = () => {
      cleanup();
      shape.on('dragmove', setCoordsAndSizeAttrs);
      History.rememberDragEnd(shape);
      History.rememberTransform(transformer);

      History.add(shape, EAddittionType.CREATE);

      onShapePlaced && onShapePlaced(shape);
    };

    shape.on('click', () => setupTransformer(mapping[type]));

    stage?.on('mousemove', handleMouseMove);
    stage?.on('contextmenu', handleRightMouseClick);
    shape.on('click.node-placement', placeNode);

    stage?.batchDraw();
  }

  const [currentlyAdding, setCurrentlyAdding] = React.useState<TPlaceableNodeTypes | null>();

  async function handlePlaceNode(type: TPlaceableNodeTypes, meta?: IImage) {
    if (currentlyAdding) return;

    setCurrentlyAdding(type);

    async function buildShape(type: TPlaceableNodeTypes, meta?: IImage): Promise<Shape> {
      const common = {
        id: uuid(), // ref: guid
        name: genTemplateNodeName(type),

        x: 50,
        y: 60,
        draggable: true,
      };

      if (type == ETemplateNodeTypes.TEXT)
        return new Promise<Text>((resolve) => {
          resolve(
            new Konva.Text({
              ...common,

              width: 100,
              height: 20,
              text: 'New text ...',
              fontSize: 20,
            }),
          );
        });

      // if (type == ETemplateNodeTypes.IMAGE)
      return new Promise<Image>((resolve) => {
        Konva.Image.fromURL(meta?.src, (image: Image) => {
          image.setAttrs({ ...common });
          resolve(image);
        });
      });
    }

    const shape = await buildShape(type, meta);
    layer.add(shape);

    if (type == ETemplateNodeTypes.TEXT) {
      stage && makeTextEditible(shape as Text, transformer, stage, layer);
    }

    const templateNodeConverters = {
      [ETemplateNodeTypes.TEXT]: (shape: Shape) => buildTextNode(shape as Text),
      [ETemplateNodeTypes.IMAGE]: (shape: Shape) => buildImageNode(shape as Image),
    };

    const converter = templateNodeConverters[type];

    const onShapePlaced = (shape: Shape) => {
      setTemplate((t) => {
        const node: INode = converter(shape); // convertToTemplateNode
        t.nodes = [...t.nodes, node];
        return t;
      });
      setCurrentlyAdding(null);
    };
    const onDiscard = () => {
      setCurrentlyAdding(null);
    };
    shapePlacementHandler(type, shape, onShapePlaced, onDiscard);
  }

  function removeNodeFromTemplate(node: Node) {
    const guid = node.id();
    setTemplate((t) => {
      const nodes = [...t.nodes.filter((n) => n.guid != guid)];
      const trashNode = t.nodes.find((n) => n.guid == guid);
      const trashNodes = trashNode ? [...t.trash.nodes, trashNode] : t.trash.nodes;
      const trash = { ...t.trash, nodes: trashNodes };

      return { ...t, nodes, trash };
    });
  }

  function restoreNodeForTemplate(node: Node) {
    const guid = node.id();

    setTemplate((t) => {
      const trashNode = t.trash.nodes.find((n) => n.guid == guid);
      const nodes = trashNode ? [...t.nodes, trashNode] : t.nodes;
      const trashNodes = [...t.trash.nodes.filter((n) => n.guid != guid)];
      const trash = { ...t.trash, nodes: trashNodes };

      return { ...t, nodes, trash };
    });
  }

  // const Template = {
  //   load: (templateSchema),
  //   add: (node: Node),
  //   restore(guid: string),
  //   remove(guid: string),
  //   destroy(node: Node),
  // }

  return (
    <>
      <NavBar />

      <div className="main">
        <div className="page">
          <SideBar
            template={template}
            onRowClick={(node: INode) => {
              const n = findTemplateNodeByGuid(node.guid);
              if (!n) console.warn('Node not found. INode:', node);

              const map = {
                text: ETransformerTypes.TEXT,
                image: ETransformerTypes.IMAGE,
              };
              const type = map[node.meta.type];
              const transformer = setupTransformer(type);

              n && transformer.nodes([n]);
            }}
            onMouseOverRow={(node: INode) => {
              const n = findTemplateNodeByGuid(node.guid);
              n && highlightHoveredNode(n);
            }}
            onMouseLeaveRow={() => {
              const hoveredNode = hoveredOnSidebarRectBuilder();
              hoveredNode?.hide();
            }}
          />

          <div className="builder-main">
            <div id={konvaStageContainer} ref={konvaStageRef}></div>
          </div>

          <Toolbar.Panel>
            <Toolbar.Group>
              <Toolbar.Tool>
                <SaveIcon />
              </Toolbar.Tool>

              <Toolbar.Tool disabled={!History.isUndoable} onClick={History.undo}>
                <UndoIcon />
              </Toolbar.Tool>

              <Toolbar.Tool disabled={!History.isRedoable} onClick={History.redo}>
                <RedoIcon />
              </Toolbar.Tool>

              <Toolbar.Tool>
                <CopyIcon />
              </Toolbar.Tool>
            </Toolbar.Group>

            <Toolbar.Separator />

            <Toolbar.Group>
              <Toolbar.Tool onClick={handleRemoveNodes}>
                <ButtonRemove />
              </Toolbar.Tool>
            </Toolbar.Group>

            <Toolbar.Separator />

            <Toolbar.Group>
              <Toolbar.Tool active={currentlyAdding == ETemplateNodeTypes.IMAGE}>
                <ImageIcon />
              </Toolbar.Tool>

              <Toolbar.Tool
                active={currentlyAdding == ETemplateNodeTypes.TEXT}
                onClick={() => handlePlaceNode(ETemplateNodeTypes.TEXT)}
              >
                <TextAddIcon />
              </Toolbar.Tool>
            </Toolbar.Group>
          </Toolbar.Panel>

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
            </div>

            <div className="controls-section">
              <div className={`gallery`}>
                {images.map((img, idx) => {
                  return (
                    <div
                      className="gallery__image"
                      key={idx}
                      onClick={() => handlePlaceNode(ETemplateNodeTypes.IMAGE, img)}
                    >
                      <img src={img.src} alt="" />
                    </div>
                  );
                })}

                {Array.from(new Array(3 - (images.length % 3))).map((_elem, idx) => (
                  <div className="gallery__image-blank" key={idx} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

interface IImage {
  src: string;
  alt?: string;
}
const images: IImage[] = [
  {
    src: 'https://images.ctfassets.net/hrltx12pl8hq/3MbF54EhWUhsXunc5Keueb/60774fbbff86e6bf6776f1e17a8016b4/04-nature_721703848.jpg?fit=fill&w=480&h=270',
  },

  {
    src: 'https://i.pinimg.com/564x/e9/29/1c/e9291cc39e820cd4afc6e58618dfc9e0.jpg',
  },

  {
    src: 'https://i.pinimg.com/564x/e9/29/1c/e9291cc39e820cd4afc6e58618dfc9e0.jpg',
  },

  {
    src: 'https://i.pinimg.com/564x/e9/29/1c/e9291cc39e820cd4afc6e58618dfc9e0.jpg',
  },

  {
    src: 'https://i.pinimg.com/564x/e9/29/1c/e9291cc39e820cd4afc6e58618dfc9e0.jpg',
  },

  {
    src: 'https://i.pinimg.com/564x/e9/29/1c/e9291cc39e820cd4afc6e58618dfc9e0.jpg',
  },

  {
    src: 'https://i.pinimg.com/564x/e9/29/1c/e9291cc39e820cd4afc6e58618dfc9e0.jpg',
  },

  {
    src: 'https://i.pinimg.com/564x/e9/29/1c/e9291cc39e820cd4afc6e58618dfc9e0.jpg',
  },
];
