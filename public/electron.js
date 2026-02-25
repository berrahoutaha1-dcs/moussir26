// Load environment variables FIRST (before any other imports)
require('dotenv').config();

// Debugging: Catch all unhandled errors
const { app, BrowserWindow, ipcMain, dialog, protocol } = require('electron');


// Disable hardware acceleration to prevent crashes on some Windows systems
app.disableHardwareAcceleration();

// Register schemes as privileged MUST be done before app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app-img', privileges: { standard: true, secure: true, supportFetchAPI: true, bypassCSP: true } }
]);

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
    "img-src 'self' data: blob: app-img: http://localhost:* https://localhost:*; " +
    "font-src 'self' data: http://localhost:* https://localhost:*; " +
    "connect-src 'self' http://localhost:* https://localhost:* ws://localhost:* wss://localhost:*; " +
    "media-src 'self' data: blob:; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
    : "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob: app-img:; " +
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
      "img-src 'self' data: blob: app-img: http://localhost:* https://localhost:*; " +
      "font-src 'self' data: http://localhost:* https://localhost:*; " +
      "connect-src 'self' http://localhost:* https://localhost:* ws://localhost:* wss://localhost:*; " +
      "media-src 'self' data: blob:; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';"
      : "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob: app-img:; " +
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

  // Hide the native menu bar on any popup windows opened by the renderer (e.g. PDF preview)
  mainWindow.webContents.setWindowOpenHandler(({ url, features }) => {
    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        autoHideMenuBar: true,
        menuBarVisible: false,
        width: 1100,
        height: 750,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js'),
        },
      },
    };
  });
}

// ── Silent Receipt Printer ───────────────────────────────────────────────────
// Prints HTML directly to the default printer (XPrinter) with no dialog
ipcMain.handle('print:receipt', async (event, htmlContent) => {
  try {
    const printWin = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      }
    });

    await printWin.loadURL(
      'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent)
    );

    await new Promise((resolve, reject) => {
      printWin.webContents.print(
        {
          silent: false, // Show OS print dialog
          printBackground: true,
          color: false,
          margins: { marginType: 'none' },
          pageSize: { width: 80000, height: 500000 }
        },
        (success, errorType) => {
          if (success) resolve();
          else reject(new Error(errorType || 'print failed'));
        }
      );
    });

    printWin.close();
    return { success: true };
  } catch (err) {
    console.error('print:receipt error:', err);
    return { success: false, reason: err.message };
  }
});
// ─────────────────────────────────────────────────────────────────────────────

// ── PDF Save Handler ──────────────────────────────────────────────────────────
// Called from the preview popup via window.opener.electronAPI.savePDF(html)
ipcMain.handle('pdf:save', async (event, htmlContent) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Show native Save File dialog
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Enregistrer le PDF',
      defaultPath: `situation-fournisseurs-${today}.pdf`,
      filters: [{ name: 'Fichiers PDF', extensions: ['pdf'] }],
      properties: ['createDirectory', 'showOverwriteConfirmation']
    });

    if (canceled || !filePath) return { success: false, reason: 'canceled' };

    // 2. Create a hidden BrowserWindow to render the HTML and generate PDF
    const pdfWin = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        javascript: true,
      }
    });

    // Load HTML as a data URL
    await pdfWin.loadURL(
      'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent)
    );

    // 3. Generate PDF
    const pdfBuffer = await pdfWin.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      landscape: false,
      margins: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
    });

    pdfWin.close();

    // 4. Write to chosen file
    fs.writeFileSync(filePath, pdfBuffer);

    return { success: true, filePath };
  } catch (err) {
    console.error('pdf:save error:', err);
    return { success: false, reason: err.message };
  }
});
// ─────────────────────────────────────────────────────────────────────────────

// This method will be called when Electron has finished initialization

app.whenReady().then(() => {
  // Initialize database first
  initializeDatabase();

  const uploadsPath = require('../src/backend/config/app.config').getUploadsPath();
  console.log('DEBUG: App initialization - Uploads Path:', uploadsPath);

  // Setup IPC handlers for database operations
  setupIpcHandlers();

  // Register image protocol
  protocol.registerFileProtocol('app-img', (request, callback) => {
    // Standard protocols (standard: true) interpret app-img://file.png as host=file.png path=/
    // We want to extract everything after app-img://
    let urlPath = request.url.replace(/^app-img:\/\/+/, '');

    // Decode and remove trailing slash if present
    urlPath = decodeURIComponent(urlPath);
    if (urlPath.endsWith('/')) {
      urlPath = urlPath.slice(0, -1);
    }

    const uploadsRoot = require('../src/backend/config/app.config').getUploadsPath();
    const finalPath = path.join(uploadsRoot, urlPath);

    // Log the mapping for debugging
    console.log(`DEBUG: Protocol handler loading: ${request.url}`);
    console.log(`DEBUG: Translated path: ${finalPath}`);
    console.log(`DEBUG: File exists: ${fs.existsSync(finalPath)}`);

    callback({ path: finalPath });
  });

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

