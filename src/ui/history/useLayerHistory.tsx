import React from 'react';

import { Layer } from 'konva/types/Layer';
import { ILayerHistory } from './history';
import History from './history';
import { EHistoryEventType } from './events';

interface IUseLayerHistory extends ILayerHistory {
  isUndoable: boolean;
  isRedoable: boolean;
}
function useLayerHistory(layer: Layer): IUseLayerHistory {
  const [isUndoable, setUndoable] = React.useState(false);
  const [isRedoable, setRedoable] = React.useState(false);

  History.initialize(layer);

  const reassign = () => {
    setUndoable(() => History.undoable());
    setRedoable(() => History.redoable());
  };
  React.useEffect(() => {
    History.on(EHistoryEventType.CHANGE, () => reassign());
  }, []);

  return { ...History, isUndoable, isRedoable };
}

export default useLayerHistory;
