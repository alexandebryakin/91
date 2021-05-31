export enum EHelpernode {
  COMMON = 'helpernode',
  HOVER = 'helpernode-hover',
  SNAPPED_RECT = 'helpernode-snapped-rect',
  HOVERED_ON_SIDEBAR = 'helpernode-hovered-on-sidebar',
}

export const helpernodes: string[] = Object.values(EHelpernode);
