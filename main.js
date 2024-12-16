// main.js
const { app, BrowserWindow } = require("electron");
const path = require("path");

// Disable all quit shortcuts at app level
app.on("before-quit", (e) => {
  e.preventDefault();
});

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    // Prevent Alt+F4
    closable: false,
    // Add fullscreen settings
    fullscreen: true,
    frame: false, // Remove window frame
    kiosk: true, // Enable kiosk mode for true fullscreen
  });

  // Ensure window stays fullscreen
  win.setFullScreenable(true);
  win.setVisibleOnAllWorkspaces(true);

  // Prevent leaving fullscreen
  win.on("leave-full-screen", () => {
    win.setFullScreen(true);
  });

  // Track exit sequence
  let exitBuffer = "";
  let exitTimeout = null;

  // Register comprehensive shortcut prevention
  win.webContents.on("before-input-event", (event, input) => {
    // Handle exit sequence
    if (
      input.type === "keyDown" &&
      !input.meta &&
      !input.control &&
      !input.alt &&
      !input.shift
    ) {
      // Reset buffer after 2 seconds of no input
      if (exitTimeout) {
        clearTimeout(exitTimeout);
      }
      exitTimeout = setTimeout(() => {
        exitBuffer = "";
      }, 2000);

      // Add character to buffer
      exitBuffer += input.key.toLowerCase();

      // Check if buffer ends with 'exit'
      if (exitBuffer.endsWith("exit")) {
        app.exit(0);
      }
    }

    // Prevent Command/Ctrl + W
    // Prevent Command/Ctrl + Q
    // Prevent Command/Ctrl + Shift + W
    // Prevent Command/Ctrl + Option/Alt + W
    // Prevent Command + Tab
    // Add prevention of fullscreen exit shortcuts
    if (
      ((input.meta || input.control) &&
        (input.key.toLowerCase() === "w" ||
          input.key.toLowerCase() === "q" ||
          (input.shift && input.key.toLowerCase() === "w") ||
          (input.alt && input.key.toLowerCase() === "w"))) ||
      (input.meta && input.key === "Tab") ||
      // Prevent fullscreen exit shortcuts
      input.key === "Escape" ||
      (input.meta && input.control && input.key === "f") ||
      (input.meta && input.key === "f") ||
      (input.function && input.key === "F11")
    ) {
      event.preventDefault();
    }

    // Prevent Alt + F4
    if (input.alt && input.key === "F4") {
      event.preventDefault();
    }
  });

  win.loadFile("web/index.html");

  // Force fullscreen after load
  win.webContents.on("did-finish-load", () => {
    win.setFullScreen(true);
  });

  // Uncomment to open DevTools by default
  // win.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
