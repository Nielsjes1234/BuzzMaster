import { ipcRenderer } from 'electron';
import type {
  RemoteAPI,
  RemoteReceiverAPI,
  RemoteSenderAPI,
  RemoteServerAPI,
} from '@/../common/RemoteAPI';

const senderAPI: RemoteSenderAPI = {
  updateGameState: (state) => ipcRenderer.send('remote:updateGameState', state),
  updateGameSettings: (settings) =>
    ipcRenderer.send('remote:updateGameSettings', settings),
  updateLocale: (locale) => ipcRenderer.send('remote:updateLocale', locale),
  updateSlides: (state) => ipcRenderer.send('remote:updateSlides', state),
};

const receiverAPI: RemoteReceiverAPI = {
  onRemoteAction: (callback) =>
    ipcRenderer.on('remote:onRemoteAction', (_, action) => callback(action)),
  onServerStatusChange: (callback) =>
    ipcRenderer.on('remote:onServerStatusChange', (_, running) =>
      callback(running),
    ),
};

const serverAPI: RemoteServerAPI = {
  getServerInfo: () => ipcRenderer.invoke('remote:getServerInfo'),
};

const api: RemoteAPI = {
  ...senderAPI,
  ...receiverAPI,
  ...serverAPI,
};

export default api;
