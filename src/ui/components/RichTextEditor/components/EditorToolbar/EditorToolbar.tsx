import React from 'react';
import { EditorState, RichUtils } from 'draft-js';

import { TDraftJsCustomStyleCamelCased } from '../../../../../@types/draft-js-custom-styles';

import './EditorToolbar.scss';

import BoldIcon from '../../../../../icons/BoldIcon';
import ChevronLeftIcon from '../../../../../icons/ChevronLeftIcon';
import ChevronRightIcon from '../../../../../icons/ChevronRightIcon';
import ItalicIcon from '../../../../../icons/ItalicIcon';
import TextAlignIcons from '../../../../../icons/TextAlignIcons';
import UnderlineIcon from '../../../../../icons/UnderlineIcon';
import FontPicker from '../FontPicker';
import { ECustomBlockStyleTypes } from '../../RichTextEditor';

interface EditorToolbarProps {
  refRoot?: React.LegacyRef<HTMLDivElement>;
  visible?: boolean;
  styles: TDraftJsCustomStyleCamelCased;

  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
}

function keepCursorFocusInsideEditor(e: React.MouseEvent) {
  e.preventDefault();
}

function EditorToolbar(props: EditorToolbarProps): React.ReactElement | null {
  const { editorState, setEditorState } = props;
  const { refRoot, visible, styles } = props;

  const _onClickBold = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
  };

  const _onClickItalic = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'ITALIC'));
  };

  const _onClickUnderline = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'UNDERLINE'));
  };

  const inlineStyle = editorState.getCurrentInlineStyle();
  const isBold = inlineStyle.has('BOLD');
  const isItalic = inlineStyle.has('ITALIC');
  const isUnderline = inlineStyle.has('UNDERLINE');

  const currentBlockType = RichUtils.getCurrentBlockType(editorState);

  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 38, 46, 54, 62, 72];
  const applyFontSize = (size: number) => {
    const newEditorState = styles.fontSize.remove(editorState);

    setEditorState(styles.fontSize.add(newEditorState, `${size}px`));
  };

  const [fontSize, setFontSize] = React.useState<string>('');
  const notANumberRegex = /[^0-9]/g;
  const setFontSizeFromInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numberWithDecimalsRegex = /\d+(\.|,)?(\d{1,2})?/;
    const match = value.match(numberWithDecimalsRegex);
    const extractedValue = (match ? match[0] : '').replace(',', '.');
    // const newFontSize = parseFloat(extractedValue) || undefined;
    const newFontSize = extractedValue;
    setFontSize(newFontSize);
    const parsedFontSize = parseFloat(extractedValue) || undefined;
    if (!parsedFontSize) return;

    applyFontSize(parsedFontSize);
  };

  const fontSizeOptionsRef = React.useRef<HTMLDivElement>(null);
  const [fontSizeLeftBtnHidden, setFontSizeLeftBtnHidden] = React.useState(true);
  const [fontSizeRightBtnHidden, setFontSizeRightBtnHidden] = React.useState(false);
  const handleFontSizeScroll = (e: any) => {
    //React.UIEvent<HTMLDivElement, UIEvent>
    const element = e.target;
    const scrollLeft = e.target.scrollLeft;

    const isScrollEnd = element.scrollWidth - element.scrollLeft === element.clientWidth;

    setFontSizeLeftBtnHidden(scrollLeft == 0);
    setFontSizeRightBtnHidden(isScrollEnd);
  };
  const handleBtnScrollClick = (direction: 'left' | 'right') => {
    const scrollContainer = fontSizeOptionsRef.current;
    if (!scrollContainer) return;

    const { scrollWidth, scrollLeft, clientWidth } = scrollContainer;

    const defineScrollLeftOffset = (): number => {
      const offset = 60;
      if (direction == 'left') return scrollLeft - offset < 0 ? 0 : scrollLeft - offset;

      return clientWidth + scrollLeft + offset > scrollWidth ? scrollWidth - clientWidth : scrollLeft + offset;
    };

    scrollContainer.scrollLeft = defineScrollLeftOffset();
  };

  const defaultFamily = 'serif';
  const withDefaultFontFamily = (family: string): string => `${family}, ${defaultFamily}`;
  const withoutDefaultFontFamily = (family: string): string => (family || '').split(',')[0];

  const onChangeFontFamily = (family: string) => {
    const newEditorState = styles.fontFamily.remove(editorState);
    setEditorState(styles.fontFamily.add(newEditorState, withDefaultFontFamily(family)));
  };

  const currentFontFamily = withoutDefaultFontFamily(styles.fontFamily.current(editorState));

  const handleAlignment = (direction: 'left' | 'center' | 'right') => {
    setEditorState(RichUtils.toggleBlockType(editorState, direction));
  };

  if (visible === false) return null;
  return (
    <div
      className="editor-toolbar"
      ref={refRoot}
      // ref={(r) => ref?.current && (ref.current = r)}
    >
      <div className="editor-toolbar__row">
        <button
          type="button"
          onClick={() => handleAlignment('left')}
          className={`editor-toolbar__btn ${
            currentBlockType == ECustomBlockStyleTypes.left ? 'editor-toolbar__btn--active' : ''
          }`}
        >
          <TextAlignIcons.Left />
        </button>

        <button
          type="button"
          onClick={() => handleAlignment('center')}
          className={`editor-toolbar__btn ${
            currentBlockType == ECustomBlockStyleTypes.center ? 'editor-toolbar__btn--active' : ''
          }`}
        >
          <TextAlignIcons.Center />
        </button>

        <button
          type="button"
          onClick={() => handleAlignment('right')}
          className={`editor-toolbar__btn ${
            currentBlockType == ECustomBlockStyleTypes.right ? 'editor-toolbar__btn--active' : ''
          }`}
        >
          <TextAlignIcons.Right />
        </button>
      </div>

      <div className="editor-toolbar__separator" />

      <div className="editor-toolbar__row">
        <button
          type="button"
          onClick={_onClickBold}
          className={`editor-toolbar__btn ${isBold ? 'editor-toolbar__btn--active' : ''}`}
        >
          <BoldIcon />
        </button>

        <button
          type="button"
          onClick={_onClickItalic}
          className={`editor-toolbar__btn ${isItalic ? 'editor-toolbar__btn--active' : ''}`}
        >
          <ItalicIcon />
        </button>

        <button
          type="button"
          onClick={_onClickUnderline}
          className={`editor-toolbar__btn ${isUnderline ? 'editor-toolbar__btn--active' : ''}`}
        >
          <UnderlineIcon />
        </button>
      </div>

      <div className="editor-toolbar__separator" />

      <div className="editor-toolbar__row">
        <div className="typeface-select">
          <div className="typeface-select__label">Typeface</div>
          <FontPicker onChangeFontFamily={onChangeFontFamily} selectedFontFamily={currentFontFamily} />
        </div>
      </div>

      <div className="editor-toolbar__separator" />

      <div className="editor-toolbar__row">
        <div className="fontsize-select">
          <div className="fontsize-select__label">Size</div>

          <div className="fontsize-select__controls">
            <div className="fontsize-select__input">
              <input
                type="text"
                className="text-input"
                placeholder="Size"
                onChange={setFontSizeFromInput}
                value={fontSize || ''}
              />
            </div>

            <div
              className={`fontsize-select__btn-scroll fontsize-select__btn-scroll-left ${
                fontSizeLeftBtnHidden ? 'fontsize-select__btn-scroll--hidden' : ''
              }`}
              onClick={() => handleBtnScrollClick('left')}
            >
              <ChevronLeftIcon />
            </div>

            <div className="fontsize-select__options" ref={fontSizeOptionsRef} onScroll={handleFontSizeScroll}>
              {fontSizes.map((size) => {
                const currentFontSize = (styles.fontSize.current(editorState) || '').replace(notANumberRegex, '');
                return (
                  <button
                    key={`font-size-${size}`}
                    type="button"
                    onClick={(e) => {
                      keepCursorFocusInsideEditor(e);
                      setFontSize(size.toString());
                      applyFontSize(size);
                    }}
                    className={`editor-toolbar__btn fontsize-select__option ${
                      currentFontSize == size.toString() ? 'editor-toolbar__btn--active' : ''
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            <div
              className={`fontsize-select__btn-scroll fontsize-select__btn-scroll-right ${
                fontSizeRightBtnHidden ? 'fontsize-select__btn-scroll--hidden' : ''
              }`}
              onClick={() => handleBtnScrollClick('right')}
            >
              <ChevronRightIcon />
            </div>
          </div>
        </div>
      </div>

      <div className="editor-toolbar__separator" />
    </div>
  );
}

export default EditorToolbar;
