// Load environment variables FIRST (before any other imports)
require('dotenv').config();

// Debugging: Catch all unhandled errors
const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { setupIpcHandlers } = require('../src/backend/ipc/ipcHandlers');
const { initializeDatabase } = require('../src/backend/config/database');

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let buildServer = null;

// Function to check if dev server is running
function checkDevServer() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:3000', (res) => {
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Function to wait for dev server
async function waitForDevServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const isRunning = await checkDevServer();
    if (isRunning) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Waiting for dev server... (${i + 1}/${maxAttempts})`);
  }
  return false;
}

// Function to start a local server for the build folder
function startBuildServer(buildDir, port = 3001) {
  return new Promise((resolve, reject) => {
    if (buildServer) {
      resolve(`http://localhost:${port}`);
      return;
    }

    const server = http.createServer((req, res) => {
      let filePath = req.url === '/' ? '/index.html' : req.url;
      // Remove query string
      filePath = filePath.split('?')[0];

      const fullPath = path.join(buildDir, filePath);

      // Security: ensure the file is within buildDir
      if (!fullPath.startsWith(buildDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      fs.readFile(fullPath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('File not found');
          return;
        }

        // Set content type based on file extension
        const ext = path.extname(fullPath);
        const contentTypes = {
          '.html': 'text/html',
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon',
          '.woff': 'font/woff',
          '.woff2': 'font/woff2',
          '.ttf': 'font/ttf',
          '.eot': 'application/vnd.ms-fontobject'
        };

        res.writeHead(200, {
          'Content-Type': contentTypes[ext] || 'application/octet-stream'
        });
        res.end(data);
      });
    });

    server.listen(port, 'localhost', () => {
      buildServer = server;
      console.log(`Build server started on http://localhost:${port}`);
      resolve(`http://localhost:${port}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port already in use, try next port
        startBuildServer(buildDir, port + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

// Function to stop the build server
function stopBuildServer() {
  if (buildServer) {
    buildServer.close();
    buildServer = null;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // Enable web security
      webSecurity: true,
    },
    title: 'Commercial Management System',
    show: false,
    autoHideMenuBar: true,
  });

  const buildPath = path.join(__dirname, '../build/index.html');
  const buildExists = fs.existsSync(buildPath);

  // Store current CSP in a variable that can be updated
  // Note: 'unsafe-inline' is required for React development mode with hot reloading
  // 'unsafe-eval' has been removed for better security - React dev mode should work without it
  let currentCSP = (isDev && !buildExists)
    ? "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' http://localhost:* https://localhost:*; " +
    "style-src 'self' 'unsafe-inline' http://localhost:* https://localhost:*; " +
    "img-src 'self' data: blob: http://localhost:* https://localhost:*; " +
    "font-src 'self' data: http://localhost:* https://localhost:*; " +
    "connect-src 'self' http://localhost:* https://localhost:* ws://localhost:* wss://localhost:*; " +
    "media-src 'self' data: blob:; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
    : "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; " +
    "font-src 'self' data:; " +
    "connect-src 'self'; " +
    "media-src 'self' data: blob:; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';";

  // Set up CSP handler once (uses closure to access currentCSP)
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [currentCSP]
      }
    });
  });

  // Function to update CSP
  function setCSP(usingDevServer) {
    currentCSP = usingDevServer
      ? "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' http://localhost:* https://localhost:*; " +
      "style-src 'self' 'unsafe-inline' http://localhost:* https://localhost:*; " +
      "img-src 'self' data: blob: http://localhost:* https://localhost:*; " +
      "font-src 'self' data: http://localhost:* https://localhost:*; " +
      "connect-src 'self' http://localhost:* https://localhost:* ws://localhost:* wss://localhost:*; " +
      "media-src 'self' data: blob:; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';"
      : "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob:; " +
      "font-src 'self' data:; " +
      "connect-src 'self'; " +
      "media-src 'self' data: blob:; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';";
  }

  const startURL = isDev
    ? 'http://127.0.0.1:3000'
    : buildPath;

  // Load URL (wait for dev server if in development, fallback to build if available)
  if (isDev) {
    waitForDevServer().then((serverReady) => {
      if (serverReady) {
        console.log('Dev server is ready. Loading URL:', startURL);
        setCSP(true); // Update CSP for dev server
        mainWindow.loadURL(startURL);
      } else if (buildExists) {
        console.log('Dev server not running, but build found. Loading from build folder.');
        setCSP(false); // Update CSP for production build
        // Start a local server to serve the build folder
        const buildDir = path.join(__dirname, '../build');
        startBuildServer(buildDir).then((url) => {
          console.log('Loading from build server:', url);
          mainWindow.loadURL(url);
        }).catch((err) => {
          console.error('Failed to start build server:', err);
          // Fallback to loadFile
          mainWindow.loadFile(buildPath);
        });
      } else {
        console.error('Dev server is not running and no build found. Please run: npm start or npm run build');
        mainWindow.loadURL('data:text/html,<html><body style="font-family: sans-serif; padding: 40px; text-align: center;"><h1>Development Server Not Running</h1><p>Please start the React development server first:</p><p><code>npm start</code></p><p>Or use: <code>npm run electron-dev</code></p><p>Or build the app: <code>npm run build</code></p></body></html>');
      }
    });
  } else {
    console.log('Loading from build folder.');
    setCSP(false); // Production CSP
    // Start a local server to serve the build folder
    const buildDir = path.join(__dirname, '../build');
    startBuildServer(buildDir).then((url) => {
      console.log('Loading from build server:', url);
      mainWindow.loadURL(url);
    }).catch((err) => {
      console.error('Failed to start build server:', err);
      // Fallback to loadFile
      mainWindow.loadFile(startURL);
    });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('Window is ready and shown');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Initialize database first
  initializeDatabase();

  // Setup IPC handlers for database operations
  setupIpcHandlers();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopBuildServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopBuildServer();
});

