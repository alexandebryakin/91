export enum EHistoryEventType {
  UNDO = 'UNDO',
  REDO = 'REDO',
  ADD = 'ADD',

  CHANGE = 'CHANGE',
}

export type THistoryCallback = () => void;

const events = {
  [EHistoryEventType.UNDO]: {
    callbacks: [] as THistoryCallback[],
  },

  [EHistoryEventType.REDO]: {
    callbacks: [] as THistoryCallback[],
  },

  [EHistoryEventType.ADD]: {
    callbacks: [] as THistoryCallback[],
  },

  [EHistoryEventType.CHANGE]: {
    callbacks: [] as THistoryCallback[],
  },
};

function on(type: EHistoryEventType, callback: THistoryCallback): void {
  const event = events[type];

  const cb = event.callbacks.find((cb) => cb.toString() == callback.toString());

  if (!cb) event.callbacks.push(callback);
}

function fire(type: EHistoryEventType, onEnded?: () => void): void {
  const run = (callback: THistoryCallback) => callback();
  events[type].callbacks.forEach(run);
  events[EHistoryEventType.CHANGE].callbacks.forEach(run);

  typeof onEnded == 'function' && onEnded();
}

export { on, fire };
