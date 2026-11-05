const state = {
  sessionId: null,
  case: null,
  clues: [],
  hintCount: 0,
  messages: {},   // { suspectId: [{role, text, emotion?}] }
  suspectId: null,
};
const listeners = new Set();

export const getState = () => state;

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
