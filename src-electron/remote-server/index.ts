import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import os from 'os';
import log from 'electron-log';
import { createProxyMiddleware } from 'http-proxy-middleware';

let io: Server | null = null;
const serverPort = 3000;
let isRunning = false;
let serverPin = '0000';

let actionCallback: ((action: unknown) => void) | null = null;
let statusCallback: ((running: boolean) => void) | null = null;

export function onRemoteAction(cb: (action: unknown) => void) {
  actionCallback = cb;
}

export function onServerStatusChange(cb: (running: boolean) => void) {
  statusCallback = cb;
}

function getLocalIp(): string {
  const interfaces = os.networkInterfaces();

  // Best effort: Look for an IPv4 address on a non-internal interface
  // Priorities:
  // 1. "Wi-Fi" or "WLAN"
  // 2. "Ethernet" or "en0", "eth0"
  // 3. Any other non-internal, excluding known VM networks (VirtualBox 192.168.56.x)

  const allIps: { ip: string; name: string }[] = [];

  for (const [name, ifaces] of Object.entries(interfaces)) {
    if (!ifaces) continue;
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        // Exclude VirtualBox Host-Only Network default subnet
        if (iface.address.startsWith('192.168.56.')) continue;
        allIps.push({ ip: iface.address, name: name.toLowerCase() });
      }
    }
  }

  if (allIps.length === 0) return '127.0.0.1';

  // Try to find a Wi-Fi adapter
  const wifi = allIps.find(
    (i) => i.name.includes('wi-fi') || i.name.includes('wlan'),
  );
  if (wifi) return wifi.ip;

  // Try to find an Ethernet adapter
  const eth = allIps.find(
    (i) =>
      i.name.includes('ethernet') ||
      i.name.includes('eth') ||
      i.name.includes('en'),
  );
  if (eth) return eth.ip;

  // Fallback to the first available IP
  return allIps[0]!.ip;
}

export function startServer() {
  if (isRunning) return;

  const app = express();
  const httpServer = createServer(app);

  // Generate a random 4-digit PIN
  serverPin = Math.floor(1000 + Math.random() * 9000).toString();

  io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  io.use((socket, next) => {
    const pin = socket.handshake.auth.pin;
    if (pin === serverPin) {
      return next();
    }
    return next(new Error('invalid_pin'));
  });

  io.on('connection', (socket) => {
    log.info('Remote connected:', socket.id);

    // Send latest state to the newly connected remote
    Object.entries(dataSnapshot).forEach(([name, args]) => {
      socket.emit(name, ...args);
    });

    if (actionCallback) {
      actionCallback({ action: 'remote:connected' });
    }

    socket.on('action', (action) => {
      if (actionCallback) actionCallback(action);
    });
  });

  if (import.meta.env.QUASAR_DEV) {
    // In dev mode, proxy everything to the Quasar dev server so the phone can access it
    const devUrl = new URL(import.meta.env.QUASAR_APP_URL);
    app.use(
      '/',
      createProxyMiddleware({
        target: devUrl.origin,
        changeOrigin: true,
        ws: true,
      }),
    );
  } else {
    // In production, we serve the directory containing index.html
    app.use(express.static(import.meta.dirname));
  }

  httpServer.listen(serverPort, '0.0.0.0', () => {
    isRunning = true;
    if (statusCallback) statusCallback(true);
    log.info(`Remote server running on ${getLocalIp()}:${serverPort}`);
  });
}

export function getServerInfo() {
  if (!isRunning) {
    startServer();
  }
  const address = getLocalIp();
  let url: string;

  if (import.meta.env.QUASAR_DEV) {
    // In dev mode, the express proxy on port 3000 routes to the vite dev server!
    url = `http://${address}:${serverPort}/#/remote`;
  } else {
    // In production, the express static server on port 3000 routes to the built files
    url = `http://${address}:${serverPort}/#/remote`;
  }

  return {
    ip: address,
    port: serverPort,
    url,
    pin: serverPin,
  };
}

const dataSnapshot: Record<string, unknown[]> = {};

export function broadcastToRemotes(event: string, ...args: unknown[]) {
  // Keep a snapshot of the last sent arguments for each event
  dataSnapshot[event] = args;

  if (io) {
    io.emit(event, ...args);
  }
}
