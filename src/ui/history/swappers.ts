import { IHistoryState } from './history';

export interface IHistoryStateSwappers {
  undo: (state: IHistoryState) => IHistoryState;
  redo: (state: IHistoryState) => IHistoryState;
}

const swappers: IHistoryStateSwappers = {
  undo: (state: IHistoryState): IHistoryState => state,
  redo: (state: IHistoryState): IHistoryState => state,
};

export { swappers };
