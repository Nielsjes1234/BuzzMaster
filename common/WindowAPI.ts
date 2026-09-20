export type WindowAPI = {
  minimize: () => void;
  toggleMaximize: () => void;
  close: () => void;
  pin: () => void;
  unpin: () => void;
  mute: () => void;
  unmute: () => void;
  /** Schedule a complete repaint of the window after a visual mode change. */
  invalidate: () => void;
  openDevTools: () => void;
};
