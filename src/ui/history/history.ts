import { Layer } from 'konva/types/Layer';
import { Transformer } from 'konva/types/shapes/Transformer';
import { Node } from 'konva/types/Node';
import { EHistoryEventType, THistoryCallback, fire, on } from './events';
import { IHistoryStateSwappers, swappers } from './swappers';

export interface IHistoryState {
  target: Node;
  attrs: Record<string, unknown>;
  type: EAddittionType;
}
let history: IHistoryState[] = [];
let current = -1;

export enum EAddittionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}
function add(node: Node, type: EAddittionType = EAddittionType.UPDATE): void {
  current += 1;
  history = history.slice(0, current);
  history.push(_buildState(node, type));

  fire(EHistoryEventType.ADD, _redrawLayer);
}

function cloneShallow(obj: Record<string, unknown>): Record<string, unknown> {
  return { ...obj };
}

const undoable = (): boolean => current >= 0;
const redoable = (): boolean => current + 1 < history.length;

function _swapCurrentStateOnUndo(state: IHistoryState): IHistoryState {
  const updatedState = swappers.undo(state);
  history[current] = _buildState(updatedState.target, updatedState.type);

  return updatedState;
}

function _swapCurrentStateOnRedo(state: IHistoryState): IHistoryState {
  const updatedState = swappers.redo(state);
  history[current] = _buildState(updatedState.target, updatedState.type);

  return updatedState;
}

function redo(): void {
  if (!redoable()) return;

  current += 1;
  const state = _swapCurrentStateOnRedo(history[current]);
  state.target.setAttrs(state.attrs);

  fire(EHistoryEventType.REDO, _redrawLayer);
}

function undo(): void {
  if (!undoable()) return;

  const state = _swapCurrentStateOnUndo(history[current]);

  state.target.setAttrs(state.attrs);
  current -= 1;

  fire(EHistoryEventType.UNDO, _redrawLayer);
}

function _buildState(node: Node, type: EAddittionType): IHistoryState {
  // const cloneDeep = (node: Node) => node.clone().getAttrs();
  return {
    target: node,
    attrs: cloneShallow(node.getAttrs()),
    type,
    // attrs: cloneDeep(node),
  };
}

function _redrawLayer(): void {
  _layer?.draw();
}

let _layer: Layer;
function initialize(layer: Layer): void {
  _layer = layer;
}

function rememberDragEnd(node: Node): void {
  node.on('dragstart', () => add(node));
}

function rememberTransform(transformer: Transformer): void {
  transformer.on('transformstart', (e) => add(e.target));
}

export interface ILayerHistory {
  initialize: (layer: Layer) => void;

  add: (node: Node, type?: EAddittionType) => void;
  undo: () => void;
  redo: () => void;
  undoable: () => boolean;
  redoable: () => boolean;

  swappers: IHistoryStateSwappers;

  on: (type: EHistoryEventType, callback: THistoryCallback) => void;

  rememberDragEnd: (node: Node) => void;
  rememberTransform: (transformer: Transformer) => void;
}

const History: ILayerHistory = {
  initialize,

  add,
  undo,
  redo,
  undoable,
  redoable,

  swappers,

  on,

  rememberDragEnd,
  rememberTransform,
};

export default History;
