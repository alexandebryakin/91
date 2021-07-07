import React from 'react';
import { ContentBlock, Editor, EditorState, RichUtils } from 'draft-js';
import createStyles from 'draft-js-custom-styles';

import './RichTextEditor.scss';

import EditorToolbar from './components/EditorToolbar';
import useCliskOutside from '../../hooks/use-click-outside';

const { styles, customStyleFn } = createStyles(['font-size', 'font-family']);

export enum ECustomBlockStyleTypes {
  left = 'left',
  center = 'center',
  right = 'right',
}
const getBlockStyle = (block: ContentBlock) => {
  return (
    {
      [ECustomBlockStyleTypes.left]: 'align-left',
      [ECustomBlockStyleTypes.center]: 'align-center',
      [ECustomBlockStyleTypes.right]: 'align-right',
    }[block.getType()] || ''
  );
};

interface RichTextEditorProps {
  controller: IEditorController;
}

function RichTextEditor(props: RichTextEditorProps): React.ReactElement | null {
  const { controller } = props;

  const [editorState, setEditorState] = React.useState(() => EditorState.createEmpty());

  const handleKeyCommand = (command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      handleChange(newState);
      return 'handled';
    }

    return 'not-handled';
  };

  const handleChange = (editorState: EditorState) => {
    setEditorState(editorState);
    controller.recaclulateSize();
  };

  // const editorRef = React.useRef(null);

  if (controller.values.visible() == false) return null;
  return (
    <div className="rich-text-editor">
      <EditorToolbar editorState={editorState} setEditorState={setEditorState} styles={styles} />

      <div className="rich-text-editor__container" style={controller.styles()} ref={controller.outsideClickTrackerRef}>
        <Editor
          // ref={editorRef}
          editorState={editorState}
          onChange={handleChange}
          handleKeyCommand={handleKeyCommand}
          customStyleFn={customStyleFn}
          blockStyleFn={getBlockStyle}
        />
      </div>
    </div>
  );
}

export default RichTextEditor;

type TOutsideClickHandler = () => void;
export interface IEditorController {
  x: (v: number) => void;
  y: (v: number) => void;
  width: (v: number) => void;
  height: (v: number) => void;
  visible: (v: boolean) => void;

  styles: () => React.CSSProperties;
  outsideClickTrackerRef: React.MutableRefObject<HTMLDivElement | null>;
  onClickOutside: (outsideClickHandler: TOutsideClickHandler) => void;
  recaclulateSize: () => void;

  values: {
    x: () => number;
    y: () => number;
    width: () => number;
    height: () => number;
    visible: () => boolean;
  };
}
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
export function useRichTextEditorController(): IEditorController {
  const outsideClickTrackerRef = React.useRef<HTMLDivElement>(null);
  const [onClickOutside, setOnClickOutside] = React.useState(() => noop);

  useCliskOutside(outsideClickTrackerRef, onClickOutside);

  const x = React.useRef<number>(0);
  const y = React.useRef<number>(0);
  const width = React.useRef<number>(0);
  const height = React.useRef<number>(0);
  const visible = React.useRef<boolean>(false);

  const styles = (): React.CSSProperties => {
    return {
      top: `${y.current}px`,
      left: `${x.current}px`,
      minWidth: `${width.current}px`,
      minHeight: `${height.current}px`,
      visibility: visible.current ? 'visible' : 'hidden',
    };
  };

  const recaclulateSize = () => {
    if (!outsideClickTrackerRef.current) return;

    const rect = outsideClickTrackerRef.current.getBoundingClientRect();
    width.current != rect.width && (width.current = rect.width);
    height.current != rect.height && (height.current = rect.height);
  };

  return {
    x: (v: number) => (x.current = v),
    y: (v: number) => (y.current = v),
    width: (v: number) => (width.current = v),
    height: (v: number) => (height.current = v),
    visible: (v: boolean) => (visible.current = v),

    styles,
    outsideClickTrackerRef,
    onClickOutside: (handler: TOutsideClickHandler) => setOnClickOutside(() => handler),

    recaclulateSize,

    values: {
      x: () => x.current,
      y: () => y.current,
      width: () => width.current,
      height: () => height.current,
      visible: () => visible.current,
    },
  };
}
