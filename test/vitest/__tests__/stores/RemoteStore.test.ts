import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useRemoteStore } from '@/stores/remote-store';
import { useQuasar } from 'quasar';
import type { GameState } from '@/../common/gameState';

// Mock socket.io-client
const mockSocket = {
  on: vi.fn(),
  emit: vi.fn(),
};

vi.mock('socket.io-client', () => {
  return {
    io: vi.fn(() => mockSocket),
  };
});

// Mock quasar
vi.mock('quasar', () => ({
  useQuasar: vi.fn(() => ({
    platform: { is: { electron: false } },
  })),
}));

describe('RemoteStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('connects to remote server and updates connection status', () => {
    const store = useRemoteStore();
    expect(store.isConnected).toBe(false);

    store.connectToRemoteServer();

    // Test connection listener
    const onConnect = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'connect',
    )?.[1];
    expect(onConnect).toBeDefined();
    if (onConnect) onConnect();
    expect(store.isConnected).toBe(true);

    // Test disconnection listener
    const onDisconnect = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'disconnect',
    )?.[1];
    expect(onDisconnect).toBeDefined();
    if (onDisconnect) onDisconnect();
    expect(store.isConnected).toBe(false);
  });

  it('updates state when socket receives data', () => {
    const store = useRemoteStore();
    store.connectToRemoteServer();

    // Test gameState listener
    const onGameState = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'gameState',
    )?.[1];
    const dummyState = { game: 'quiz', name: 'preparing' } as GameState;
    if (onGameState) onGameState(dummyState);
    expect(store.gameState).toEqual(dummyState);

    // Test locale listener
    const onLocale = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'locale',
    )?.[1];
    if (onLocale) onLocale('nl-NL');
    expect(store.locale).toBe('nl-NL');
  });

  it('emits remote actions properly', () => {
    const store = useRemoteStore();
    store.connectToRemoteServer();

    store.isConnected = true; // Mock connected state

    store.sendRemoteAction('test:action', { data: 123 });

    expect(mockSocket.emit).toHaveBeenCalledWith('action', {
      action: 'test:action',
      payload: { data: 123 },
    });
  });

  it('does not emit if not connected', () => {
    const store = useRemoteStore();
    store.connectToRemoteServer();

    store.isConnected = false; // Mock offline state

    store.sendRemoteAction('test:action', { data: 123 });

    expect(mockSocket.emit).not.toHaveBeenCalled();
  });
});
