import React from 'react';
import {
  ContentBlock,
  convertFromRaw,
  convertToRaw,
  Editor,
  EditorState,
  RawDraftContentState,
  RichUtils,
} from 'draft-js';
import createStyles from 'draft-js-custom-styles';

import './RichTextEditor.scss';

import EditorToolbar from './components/EditorToolbar';
import useCliskOutside from '../../hooks/use-click-outside';
import { content } from 'html2canvas/dist/types/css/property-descriptors/content';
import { Vector2d } from 'konva/types/types';

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
  scale?: Vector2d;
}

// function DraftJsEditorForRender({ rawDraftJs }: { rawDraftJs: RawDraftContentState }) {
//   const contentState = convertFromRaw(rawDraftJs);
//   const editorState = EditorState.createWithContent(contentState);

//   const ref = React.useRef(null);

//   return (
//     <div ref={ref}>
//       <Editor
//         editorState={editorState}
//         onChange={() => console.log('No need for that')}
//         // handleKeyCommand={handleKeyCommand}
//         customStyleFn={customStyleFn}
//         blockStyleFn={getBlockStyle}
//       />
//     </div>
//   );
// }

function RichTextEditor(props: RichTextEditorProps): React.ReactElement | null {
  const { controller, scale } = props;

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

  const [editor, setEditor] = React.useState<Editor | null>();

  React.useEffect(() => {
    editor?.focus();
  }, [editor]);

  if (controller.values.visible() == false) return null;
  return (
    <div className="rich-text-editor">
      <EditorToolbar
        refRoot={(ref) => (controller.outsideClickTrackerRef.current = ref)}
        editorState={editorState}
        setEditorState={setEditorState}
        styles={styles}
      />

      <div
        className="rich-text-editor__container"
        style={controller.styles()}
        ref={(ref) => (controller.editorContainerRef.current = ref)}
      >
        <Editor
          ref={setEditor}
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
  scale: (v: Vector2d) => void;

  styles: () => React.CSSProperties;
  outsideClickTrackerRef: React.MutableRefObject<HTMLElement | null>;
  editorContainerRef: React.MutableRefObject<HTMLElement | null>;
  onClickOutside: (outsideClickHandler: TOutsideClickHandler) => void;
  recaclulateSize: () => void;

  values: {
    x: () => number;
    y: () => number;
    width: () => number;
    height: () => number;
    visible: () => boolean;
    scale: () => void;
  };
}
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
export function useRichTextEditorController(): IEditorController {
  const outsideClickTrackerRef = React.useRef<HTMLElement>(null);
  const editorContainerRef = React.useRef<HTMLElement>(null);
  const [onClickOutside, setOnClickOutside] = React.useState(() => noop);

  useCliskOutside([outsideClickTrackerRef, editorContainerRef], onClickOutside);

  const x = React.useRef<number>(0);
  const y = React.useRef<number>(0);
  const width = React.useRef<number>(0);
  const height = React.useRef<number>(0);
  const visible = React.useRef<boolean>(false);
  const scale = React.useRef<Vector2d>({ x: 1, y: 1 });

  const styles = (): React.CSSProperties => {
    const round = (num: number): number => Math.round(num * 100) / 100;
    return {
      top: `${y.current}px`,
      left: `${x.current}px`,
      minWidth: `${width.current}px`,
      minHeight: `${height.current}px`,
      visibility: visible.current ? 'visible' : 'hidden',
      // transform: `scale(${round(scale.current.x)}, ${round(scale.current.y)})`,
    };
  };

  const recaclulateSize = () => {
    if (!editorContainerRef.current) return;

    const rect = editorContainerRef.current.getBoundingClientRect();
    width.current != rect.width && (width.current = rect.width);
    height.current != rect.height && (height.current = rect.height);
  };

  const [, setLoading] = React.useState(false);
  const redrawUI = () => {
    setLoading((l) => !l);
    console.log('updating UI');
  };
  const withL = (f: () => void) => {
    // setLoading(true);
    const prev = scale.current;
    console.warn("Don't think we need scale()");
    f();
    const next = scale.current;
    Math.abs(prev.x - next.x) > 0.005 && redrawUI();
  };

  const values = {
    x: () => x.current,
    y: () => y.current,
    width: () => width.current,
    height: () => height.current,
    visible: () => visible.current,
    scale: () => scale.current,
  };
  // Object.entries(values).map(([key, func]) => {
  //   console.log(key, func());
  // });
  console.log(visible.current);
  return {
    x: (v: number) => (x.current = v),
    y: (v: number) => (y.current = v),
    width: (v: number) => (width.current = v),
    height: (v: number) => (height.current = v),
    visible: (v: boolean) => (visible.current = v) && redrawUI(),
    scale: (v: Vector2d) => withL(() => (scale.current = v)),

    styles,
    outsideClickTrackerRef,
    editorContainerRef,
    onClickOutside: (handler: TOutsideClickHandler) => setOnClickOutside(() => handler),

    recaclulateSize,

    values,
  };
}
