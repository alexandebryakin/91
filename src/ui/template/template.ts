import Konva from 'konva';
import { Layer } from 'konva/types/Layer';
import { Transformer } from 'konva/types/shapes/Transformer';
import { Text } from 'konva/types/shapes/Text';
import { Node } from 'konva/types/Node';
import { Image } from 'konva/types/shapes/Image';

import draftToHtml from 'draftjs-to-html';
import html2canvas from 'html2canvas';

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
import { IEditorController } from '../components/RichTextEditor/RichTextEditor';

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
type TRawDrawJs = string;
interface IMetaText {
  type: 'text';
  fontSize: number;
  content: TRawDrawJs;
  // ...
}
export interface INodeText extends INode {
  meta: IMetaText;
}
export interface INodeImage extends INode {
  meta: IMetaImage;
}

const defaultDrawJsTextAsImageContent =
  '{"blocks":[{"key":"64a0","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"3pj82","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"babc3","text":"dsa","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"5f8hp","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"bkoqa","text":"sda","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"6j9n1","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"5curb","text":"sda","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}';

const buildTextNode = (textAsImage: Image): INodeText => {
  const node = template.nodes.find((n) => n.guid == textAsImage.id());
  const content = node ? (node as INodeText).meta.content : defaultDrawJsTextAsImageContent;
  return {
    guid: textAsImage.id(),
    size: { width: textAsImage.width(), height: textAsImage.height() },
    position: { x: textAsImage.x(), y: textAsImage.y() },
    draggable: textAsImage.draggable(),
    meta: {
      type: 'text',
      content: content,
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
  editorController: IEditorController,
): void {
  _initialize(template.size);
  const templateRect = buildTemplateRect();
  templateRect.setAttrs({ width: template.size.width, height: template.size.height });
  layer.add(templateRect);
  layer.draw();

  template.nodes.forEach((node) => {
    function defineBuilder(node: INode): (node: INode) => Shape | undefined {
      //
      function textNodeBuilder(n: INode): Image {
        const node = n as INodeText;
        const text = new Konva.Image({
          x: node.position.x,
          y: node.position.y,
          width: node.size.width,
          height: node.size.height,
          // fontSize: node.meta.fontSize,
          // text: node.meta.content,
          image: undefined,
          draggable: node.draggable,
          name: genTemplateNodeName(ETemplateNodeTypes.TEXT),
          id: n.guid,
        });

        transformDraftJsRawToImage(node.meta.content).then((canvas) => text.image(canvas));

        makeTransformable(text, ETransformerTypes.TEXT);
        makeTextEditible(text, transformer, stage, layer, editorController);
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

async function transformDraftJsRawToImage(jsonRawDraftJs: TRawDrawJs) {
  return undefined;
  const rawDraftJs = JSON.parse(jsonRawDraftJs);
  // const editorState = convertFromRaw(rawDraftJs);
  const html = draftToHtml(rawDraftJs);
  const stringToHTML = (str: string): HTMLElement => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(str, 'text/html');
    return doc.body;
  };
  const element = stringToHTML(html);

  return await html2canvas(element);
}

async function transformTextAsImage(element: HTMLElement | null | undefined) {
  if (!element) return;
  return await html2canvas(element);
}

function add(shape: Shape): ITemplate {
  const getConverter = (shape: Shape) => {
    // console.log('add(shape)', shape);
    const isText = shape.name().includes(ETemplateNodeTypes.TEXT);
    if (isText) return (shape: Shape) => Template.builders.textNode(shape as Image);
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

  transformDraftJsRawToImage,
  transformTextAsImage,
  defaultDrawJsTextAsImageContent,

  genTemplateNodeName,
};

export default Template;
