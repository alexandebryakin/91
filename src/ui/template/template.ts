import Konva from 'konva';
import { Layer } from 'konva/types/Layer';
import { Transformer } from 'konva/types/shapes/Transformer';
import { Text } from 'konva/types/shapes/Text';
import { Node } from 'konva/types/Node';
import { Image } from 'konva/types/shapes/Image';

import { KonvaEventObject } from 'konva/types/Node';
import { Stage } from 'konva/types/Stage';
import { Shape } from 'konva/types/Shape';
import makeTextEditible from '../modifiers/makeTextEditible';
import makeHoverable from '../modifiers/makeHoverable';
import makeGuidelineable from '../modifiers/makeGuidelineable';
import makeSnapable from '../modifiers/makeSnapable';
import { ETransformerTypes, setupTransformer } from '../../App';
import { ILayerHistory } from '../history/history';
import { Rect } from 'konva/types/shapes/Rect';
import makeTransformable from '../modifiers/makeTransformable';

export enum ETemplateNodeTypes {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  TEMPLATE_RECT = 'TEMPLATE_RECT',
}
export type TPlaceableNodeTypes = ETemplateNodeTypes.TEXT | ETemplateNodeTypes.IMAGE;

const genTemplateNodeName = (type: ETemplateNodeTypes): string => `template-node ${type}`;

interface ITemplateTrash {
  nodes: INode[];
}
export interface ITemplate {
  size: ISize;
  nodes: INode[];
  trash: ITemplateTrash;
}
export interface INode {
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
export interface INodeText extends INode {
  meta: IMetaText;
}
export interface INodeImage extends INode {
  meta: IMetaImage;
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

function buildImageNode(image: Image): INodeImage {
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
export interface IMetaImage {
  type: 'image';
  src: string;
  alt: string;
  // ...
}
export interface ISize {
  width: number;
  height: number;
}
export interface IPosition {
  x: number;
  y: number;
}

const indestructibleNodeNames = [ETemplateNodeTypes.TEMPLATE_RECT];
const destructibleNodes = (node: Node): boolean => !indestructibleNodeNames.some((n) => node.name().includes(n));

const templateRect = new Konva.Rect({
  x: 20,
  y: 20,
  fill: '#fff',

  name: genTemplateNodeName(ETemplateNodeTypes.TEMPLATE_RECT),
});
function buildTemplateRect(): Rect {
  return templateRect;
}

const template: ITemplate = {
  size: {
    width: 0,
    height: 0,
  },
  nodes: [],
  trash: {
    nodes: [],
  },
};

function _initialize(size: ISize) {
  template.size = size;
}

function load(
  template: ITemplate,
  transformer: Transformer,
  layer: Layer,
  stage: Stage,
  History: ILayerHistory,
  setCoordsAndSizeAttrs: (e: KonvaEventObject<MouseEvent>) => void,
): void {
  _initialize(template.size);
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
    shape && Template.Node.add(shape);
    shape && History.rememberDragEnd(shape);
    shape && History.rememberTransform(transformer);
  });

  layer.draw();
}

function add(shape: Shape): ITemplate {
  const getConverter = (shape: Shape) => {
    if (shape.getClassName() == 'Text') return (shape: Shape) => Template.builders.textNode(shape as Text);
    if (shape.getClassName() == 'Image') return (shape: Shape) => Template.builders.imageNode(shape as Image);

    console.error('Converter not found for shape', shape);
    return;
  };
  const converter = getConverter(shape);
  if (!converter) return template;

  const node: INode = converter(shape); // convertToTemplateNode
  template.nodes = [...template.nodes, node];
  return template;
}

function removeNodeFromTemplate(node: Node): ITemplate {
  const guid = node.id();

  const nodes = [...template.nodes.filter((n) => n.guid != guid)];
  const trashNode = template.nodes.find((n) => n.guid == guid);
  const trashNodes = trashNode ? [...template.trash.nodes, trashNode] : template.trash.nodes;
  const trash = { ...template.trash, nodes: trashNodes };

  template.nodes = nodes;
  template.trash = trash;
  return template;
  // return { ...template, nodes, trash };
}

function restoreNodeForTemplate(node: Node): ITemplate {
  const guid = node.id();

  const trashNode = template.trash.nodes.find((n) => n.guid == guid);
  const nodes = trashNode ? [...template.nodes, trashNode] : template.nodes;
  const trashNodes = [...template.trash.nodes.filter((n) => n.guid != guid)];
  const trash = { ...template.trash, nodes: trashNodes };

  template.nodes = nodes;
  template.trash = trash;
  return template;
  // return { ...template, nodes, trash };
}

const utils = {
  destructibleNodes,
};

const builders = {
  imageNode: buildImageNode,
  textNode: buildTextNode,
};

const Template = {
  load,
  utils,
  builders,

  Node: {
    add,
    remove: removeNodeFromTemplate,
    restore: restoreNodeForTemplate,
  },

  genTemplateNodeName,
};

export default Template;
