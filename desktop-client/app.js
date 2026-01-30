const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');
const { createServer } = require('http-server');

let mainWindow;
let chatWindow;

const server = createServer({ root: path.join(__dirname, 'dist/client') });
server.listen(0, () => {
    console.log(`Server running on port ${server.server.address().port}`);
});

function createMainWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        width,
        height,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            devTools: false,
        },
        resizable: false,
        autoHideMenuBar: true,
    });

    const port = server.server.address().port;
    mainWindow.loadURL(`http://localhost:${port}`);

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('close', () => {
        if (chatWindow) chatWindow.close();
    });
    mainWindow.on('closed', () => (mainWindow = null));
}

function createChatWindow(username, theme) {
    if (chatWindow) return;

    chatWindow = new BrowserWindow({
        autoHideMenuBar: true,
        width: 400,
        minWidth: 300,
        height: 600,
        minHeight: 400,
        parent: mainWindow,
        modal: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    const port = server.server.address().port;
    console.log(username);
    console.log(theme);
    chatWindow.loadURL(`http://localhost:${port}/#/chat?username=${username}&theme=${theme}`);
    chatWindow.on('closed', () => {
        mainWindow?.webContents.send('chat-closed');
        chatWindow = null;
    });

    ipcMain.on('change-theme', (_, theme) => {
        chatWindow?.webContents.send('change-theme', theme);
    });
}

ipcMain.on('open-chat', (_, data) => createChatWindow(data.chatterName, data.currentTheme));

ipcMain.on('ipc-relay', (_, data) => {
    chatWindow?.webContents.send('ipc-relay', data);
});

ipcMain.on('send-ws-event', (_, data) => {
    mainWindow?.webContents.send('send-ws-event', data);
});

ipcMain.on('ws-ack', (_, { id, event, data }) => {
    mainWindow?.webContents.send('ws-ack', { id, event, data });
    // Listen for acknowledgment from the main window
    ipcMain.once(`ws-ack-${id}`, (_, response) => {
        chatWindow?.webContents.send(`ws-ack-${id}`, response);
    });
});

// Electron app lifecycle
app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// used to disable the refresh shortcut when the window is focused since reload returns a blank page
// https://stackoverflow.com/questions/39190476/disable-reload-via-keyboard-shortcut-electron-app
app.on('browser-window-focus', () => {
    if (!globalShortcut.isRegistered('CommandOrControl+R')) globalShortcut.register('CommandOrControl+R', () => {});
    if (!globalShortcut.isRegistered('Shift+CommandOrControl+R')) globalShortcut.register('Shift+CommandOrControl+R', () => {});
    if (!globalShortcut.isRegistered('F5')) globalShortcut.register('F5', () => {});
});

app.on('browser-window-blur', () => {
    globalShortcut.unregister('CommandOrControl+R');
    globalShortcut.unregister('Shift+CommandOrControl+R');
    globalShortcut.unregister('F5');
});
