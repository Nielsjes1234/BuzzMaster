import type { AppAPI, CastAPI, WindowAPI, RemoteAPI } from '@/../common';

export {};

declare global {
  interface Window {
    windowAPI: WindowAPI;
    appAPI: AppAPI;
    castAPI: CastAPI;
    remoteAPI: RemoteAPI;
  }
}
