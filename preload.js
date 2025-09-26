// preload.js - KEEP AS IS
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    analyzeCode: (code) => ipcRenderer.invoke('analyze-code', code),
    saveProgress: (data) => ipcRenderer.invoke('save-progress', data)
});