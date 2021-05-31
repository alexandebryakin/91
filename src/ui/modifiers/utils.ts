import { Node } from 'konva/types/Node';
import { helpernodes } from '.';

const isHelpernode = (node: Node): boolean => helpernodes.includes(node.name());
const isNotHelpernode = (node: Node): boolean => !helpernodes.includes(node.name());

const utils = {
  isNotHelpernode,
  isHelpernode,
};

export default utils;
