import type {
  AppAPI,
  CastAPI,
  WindowAPI,
  RemoteAPI,
  SlidesAPI,
} from '@/../common';

export {};

declare global {
  interface Window {
    windowAPI: WindowAPI;
    appAPI: AppAPI;
    castAPI: CastAPI;
    remoteAPI: RemoteAPI;
    slidesAPI: SlidesAPI;
  }
}
