const { remote } = require('electron');
const win = remote.getCurrentWindow();

window.Filament={};
Filament.gameDir=win.projectPath;
Filament.devmode=win.devmode;