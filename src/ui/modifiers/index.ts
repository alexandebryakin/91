export enum EHelpernode {
  COMMON = 'helpernode',

  GUIDELINE = 'helpernode-guideline',
  GUIDELINE_LABEL = 'helpernode-guideline-label',
  GUIDELINE_LABEL_TAG = 'helpernode-guideline-label-text',
  GUIDELINE_LABEL_TEXT = 'helpernode-guideline-label-tag',

  HOVER = 'helpernode-hover',
  SNAPPED_RECT = 'helpernode-snapped-rect',
  HOVERED_ON_SIDEBAR = 'helpernode-hovered-on-sidebar',
}

export const helpernodes: string[] = Object.values(EHelpernode);
