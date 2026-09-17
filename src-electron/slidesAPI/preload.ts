import { ipcRenderer } from 'electron';
import type {
  SlidesAPI,
  SlidesOpenResult,
  SlidesState,
} from '@/../common/SlidesAPI';

const api: SlidesAPI = {
  open: (url: string) =>
    ipcRenderer.invoke('slides:open', url) as Promise<SlidesOpenResult>,
  reopen: () => ipcRenderer.invoke('slides:reopen') as Promise<SlidesOpenResult>,
  close: () => ipcRenderer.send('slides:close'),

  next: () => ipcRenderer.send('slides:next'),
  previous: () => ipcRenderer.send('slides:previous'),

  setBlackout: (value: boolean) =>
    ipcRenderer.send('slides:setBlackout', value),
  toggleBlackout: () => ipcRenderer.send('slides:toggleBlackout'),

  setFullscreen: (value: boolean) =>
    ipcRenderer.send('slides:setFullscreen', value),
  toggleFullscreen: () => ipcRenderer.send('slides:toggleFullscreen'),

  getState: () => ipcRenderer.invoke('slides:getState') as Promise<SlidesState>,
  onStateChange: (callback) => {
    ipcRenderer.on('slides:onStateChange', (_event, state: SlidesState) =>
      callback(state),
    );
  },
};

export default api;
