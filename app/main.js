const {
	app,
	BrowserWindow,
	ipcMain:ipc,
	Menu,
	shell,
	dialog,
} = require('electron');
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob-promise');
const winston = require('winston');
const log = winston;
exports.log = {};
for (const level of ['error','warn','info','verbose','debug','silly']){
	exports.log[level]=(...args)=>log[level](...args);
}

let settings = {
	debug: require('electron-is-dev')||process.env.CUTIEVIRUS_DEBUG,
	production: !require('electron-is-dev'),
	editor: true,
	dataDirectory: app.getPath("userData"),
	projectDirectory: path.resolve(app.getPath("userData"),"projects"),
}
exports.settings=settings;
fs.ensureDir(settings.projectDirectory);

winston.configure({
	level: 'silly',
	format: winston.format.simple(),
	transports:[
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple(),
			),
		}),
		new winston.transports.File({
			filename: path.resolve(settings.dataDirectory,"log.txt"),
			level: 'info',
			format: winston.format.combine(
				winston.format.timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
				winston.format.printf(info=>
					`[${info.timestamp}]${info.level}: ${info.message}`
				),
			),
		}),
	]
});

let launcher, project;

function openLauncher(){
	if(launcher||project){ return; }
	launcher = new BrowserWindow({
		useContentSize:true,
		width:400,height:220,
		resizable: false,
		icon: path.resolve(__dirname,'icon.png'),
		webPreferences:{
			partition:"persist:filament-launcher",
		},
	});
	launcher.loadFile(path.resolve(__dirname,'launcher.html'));
	const menuTemplate = [{
		label: 'File',
		submenu: [{
			label: 'Open Project Folder',
			click: ()=>shell.openExternal(settings.projectDirectory),
		},{
			label: 'Quit',
			click: ()=>launcher.close(),
		}]
	}];
	if(settings.debug)menuTemplate.push({
		label: 'Debug',
		submenu: [{
			label: "Open Dev Tools",
			click: ()=>launcher.openDevTools(),
		}]
	});
	launcher.setMenu(Menu.buildFromTemplate(menuTemplate));
	//launcher.openDevTools();
	launcher.on('closed',()=>launcher=null);
}

async function openProject(name,devmode){
	if(project){ return; }
	let projectPath;
	switch(name){
	case "<default>":
		projectPath = path.resolve(__dirname,'game');
		break;
	default:
		projectPath = path.resolve(settings.projectDirectory,name);
	}
	projectPath=projectPath.replace(/\\/g,'/')+'/';
	let gameSettings;
	try{
		gameSettings = await fs.readJson(path.resolve(projectPath,"settings.json"));
	}catch(err){
		gameSettings = {};
	}
	const gameScale = Number(gameSettings.initialScale)||1;
	project = new BrowserWindow({
		useContentSize:true,
		width:(Number(gameSettings.width)||800)*gameScale,
		height:(Number(gameSettings.height)||600)*gameScale,
		icon: path.resolve(__dirname,'icon.png'),
		webPreferences:{
			partition:`persist:filament-project-${name}`,
			preload:path.resolve(__dirname,'preload.js'),
			nodeIntegration:devmode,
			devTools:devmode,
		},
	});
	project.projectPath=projectPath;
	project.devmode=devmode;
	project.loadFile(path.resolve(__dirname,'index.html'));
	const menuTemplate = [{
		label: 'File',
		submenu: [{
			label: 'Open Project Folder',
			click: ()=>shell.openExternal(projectPath),
		},{
			label: 'Refresh',
			click: ()=>project.reload(),
		},{
			label: 'Quit',
			click: ()=>project.close(),
		}]
	},{
		label: 'Debug',
		submenu: [{
			label: "Open Dev Tools",
			click: ()=>project.openDevTools(),
		}]
	}];
	project.setMenu(devmode?Menu.buildFromTemplate(menuTemplate):null);
	project.on('closed',()=>{
		project=null;
		launcher.send("reload");
		launcher.show();
	});
}

app.on('ready', ()=>{
	openLauncher();
});

app.on('window-all-closed',()=>{
	if(process.platform !== 'darwin'){
		app.quit();
	}
});

app.on('activate',()=>{
	if(launcher===null && !project){
		openLauncher();
	}
});

exports.newProject=async name=>{
	name=name.trim();
	if(!name){ return; }
	const projectPath = path.resolve(settings.projectDirectory,name);
	if(!/^[^\\\/\r\n<>:"|?*%]*[^. ]$/.test(name)
	||/^(?:CON|PRN|AUX|NUL|COM\d|LPT\d)$/i.test(name)){
		const message = `Invalid project name ${name}.`;
		log.error(message);
		dialog.showMessageBox(launcher,{type:'error',message:message});
		return false;
	}
	if(await fs.pathExists(projectPath)){
		const message = `Project ${name} already exists.`
		log.info(message);
		dialog.showMessageBox(launcher,{type:'info',message:message});
		return false;
	}
	try{
		await fs.copy(path.resolve(__dirname,'game'),projectPath);
	}catch(err){
		log.error(err.message);
		dialog.showMessageBox(launcher,{type:'error',message:err.message});
		return false;
	}
	log.verbose(`Created new project ${name}.`);
	openProject(name,true);
	launcher.hide();
	return name;
};
exports.openProject=async(name,devmode)=>{
	if(!name){ return false; }
	openProject(name,devmode);
	launcher.hide();
	return name;
};

exports.getProjectList=getProjectList;
async function getProjectList(){
	const projectList = await glob(path.resolve(settings.projectDirectory,"*"));
	for (const i in projectList){
		projectList[i]=path.basename(projectList[i]);
	}
	return projectList;
}