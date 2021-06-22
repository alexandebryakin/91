import React from 'react';
import './RichTextEditor.scss';

import { Editor, EditorState, RichUtils } from 'draft-js';
import BoldIcon from '../../../icons/BoldIcon';
import ItalicIcon from '../../../icons/ItalicIcon';
import UnderlineIcon from '../../../icons/UnderlineIcon';

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

  const _onClickBold = () => {
    handleChange(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
  };

  const _onClickItalic = () => {
    handleChange(RichUtils.toggleInlineStyle(editorState, 'ITALIC'));
  };

  const _onClickUnderline = () => {
    handleChange(RichUtils.toggleInlineStyle(editorState, 'UNDERLINE'));
  };

  const inlineStyle = editorState.getCurrentInlineStyle();
  const isBold = inlineStyle.has('BOLD');
  const isItalic = inlineStyle.has('ITALIC');
  const isUnderline = inlineStyle.has('UNDERLINE');

  return (
    <div className="rich-text-editor">
      <div className="rich-text-editor__controls">
        <button
          type="button"
          onClick={_onClickBold}
          className={`rich-text-editor__btn ${isBold ? 'rich-text-editor__btn--active' : ''}`}
        >
          <BoldIcon />
        </button>

        <button
          type="button"
          onClick={_onClickItalic}
          className={`rich-text-editor__btn ${isItalic ? 'rich-text-editor__btn--active' : ''}`}
        >
          <ItalicIcon />
        </button>

        <button
          type="button"
          onClick={_onClickUnderline}
          className={`rich-text-editor__btn ${isUnderline ? 'rich-text-editor__btn--active' : ''}`}
        >
          <UnderlineIcon />
        </button>
      </div>
      <Editor editorState={editorState} onChange={handleChange} handleKeyCommand={handleKeyCommand} />
    </div>
  );
}

export default RichTextEditor;
