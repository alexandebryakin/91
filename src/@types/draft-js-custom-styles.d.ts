import { EditorState } from 'draft-js';

interface IDraftJsCustomStyleActions {
  add: (editorState: EditorState, cssPropertyVal: string | number) => EditorState;
  remove: (editorState: EditorState) => EditorState;
  toggle: (editorState: EditorState, cssPropertyVal: string | number) => EditorState;
  current: (editorState: EditorState) => string;
}

type TDraftJsCustomStyleCamelCased = { [cssPropertyCamelCased: string]: IDraftJsCustomStyleActions };

type CSSProperties = string[];

type TCustomStyleFN = (
  style: Draft.Model.ImmutableData.DraftInlineStyle,
  block: Draft.Model.ImmutableData.ContentBlock,
) => React.CSSProperties;

type TExporter = (editorState: EditorState) => Record<string, unknown>;

declare function createStyles(
  cssProperties: CSSProperties,
  prefix?: string,
  customStyleMap?: DraftStyleMap,
): { styles: TDraftJsCustomStyleCamelCased; customStyleFn: TCustomStyleFN; exporter: TExporter };

declare module 'draft-js-custom-styles' {
  export { IDraftJsCustomStyles };
  export { TCustomStyleFN };
  export { TExporter };

  export = createStyles;
}
