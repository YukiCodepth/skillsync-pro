const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        titleBarStyle: 'hiddenInset',
        vibrancy: 'under-window',
        transparent: true,
        frame: true,
        title: 'SkillSnap - AI Micro-Skill Mentor'
    });

    mainWindow.loadFile('index.html');
    
    // Dev tools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}

// Free AI code analysis
function analyzeCodeForFree(code) {
    const commonIssues = {
        'syntax': [
            { pattern: /console\.log\([^)]*\)/g, fix: 'Use proper debugging techniques' },
            { pattern: /var\s+\w+/g, fix: 'Use let/const instead of var' },
            { pattern: /==/g, fix: 'Use === for strict equality comparison' }
        ],
        'best_practices': [
            { pattern: /function\s*\(/g, fix: 'Consider using arrow functions for better scope handling' },
            { pattern: /for\s*\(\s*;\s*;\s*\)/g, fix: 'Ensure your for loop has proper initialization, condition, and increment' }
        ]
    };

    let results = { issues: [], suggestions: [] };

    for (let category in commonIssues) {
        commonIssues[category].forEach(issue => {
            if (issue.pattern.test(code)) {
                results.issues.push({
                    category: category,
                    description: issue.fix,
                    severity: 'medium'
                });
            }
        });
    }

    return results;
}

// Simple email authentication system
const users = new Map();

ipcMain.handle('user-signup', async (event, { email, password }) => {
    if (users.has(email)) {
        return { success: false, message: 'Email already exists' };
    }
    users.set(email, { password, progress: {} });
    return { success: true, message: 'Signup successful' };
});

ipcMain.handle('user-login', async (event, { email, password }) => {
    const user = users.get(email);
    if (user && user.password === password) {
        return { success: true, user: { email, progress: user.progress } };
    }
    return { success: false, message: 'Invalid credentials' };
});

ipcMain.handle('analyze-code', async (event, code) => {
    return analyzeCodeForFree(code);
});

ipcMain.handle('save-progress', async (event, progressData) => {
    return { success: true };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});