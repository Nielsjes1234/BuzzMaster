import { ipcMain, type IpcMainEvent, type WebContents } from 'electron';
import {
  getServerInfo,
  broadcastToRemotes,
  onRemoteAction,
  onServerStatusChange,
} from '../remote-server';

let host: WebContents | undefined;

function forwardToRemote(event: string) {
  return (e: IpcMainEvent, ...args: unknown[]) => {
    host = e.sender; // Save the host reference to send messages back
    if (broadcastToRemotes) {
      broadcastToRemotes(event, ...args);
    }
  };
}

export default () => {
  onRemoteAction((action) => {
    if (host && !host.isDestroyed()) {
      host.send('remote:onRemoteAction', action);
    }
  });

  onServerStatusChange((running) => {
    if (host && !host.isDestroyed()) {
      host.send('remote:onServerStatusChange', running);
    }
  });

  // Host UI requesting server info
  ipcMain.handle('remote:getServerInfo', () => getServerInfo());

  // Host UI updating game state
  ipcMain.on('remote:updateGameState', forwardToRemote('gameState'));
  ipcMain.on('remote:updateGameSettings', forwardToRemote('gameSettings'));
  ipcMain.on('remote:updateLocale', forwardToRemote('locale'));
  ipcMain.on('remote:updateSlides', forwardToRemote('slides'));
};
