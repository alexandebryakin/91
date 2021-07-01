import React from 'react';
import { ContentBlock, Editor, EditorState, RichUtils } from 'draft-js';
import createStyles from 'draft-js-custom-styles';

import './RichTextEditor.scss';

import EditorToolbar from './components/EditorToolbar';

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

function RichTextEditor(): React.ReactElement {
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
  };

  return (
    <div className="rich-text-editor">
      <EditorToolbar editorState={editorState} setEditorState={setEditorState} styles={styles} />

      <div className="rich-text-editor__container">
        <Editor
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
