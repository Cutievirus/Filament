if(!window.Filament){ window.Filament={
	gameDir: "./game/"
};}

Filament.loadScript=sources=>{
	return new Promise(resolve=>{
		if( !(sources instanceof Array) ){ sources = [sources]; }
		const script = document.createElement("script");
		script.src = sources.shift();
		if( sources.length ) {
			script.onload =()=>Filament.loadScript(sources).then(resolve);
		}else{
			script.onload = resolve;
		}
		document.head.append(script);
	});
};

Filament.loadStyle=source=>{
	const stylesheet = document.createElement("link");
	stylesheet.setAttribute('rel','stylesheet');
	stylesheet.setAttribute('type','text/css');
	stylesheet.setAttribute('href',source);
	document.head.append(stylesheet);
}

Filament.path=(...parts)=>{
	let path='';
	while(parts.length){
		if(!parts[0]){ parts.shift();continue; }
		path+=`${!path||path[path.length-1]==='/'?'':'/'}${parts.shift()}`;
	}
	return path;
};
Filament.gameFile=filename=>Filament.path(Filament.gameDir,filename);

Filament.loadGame=()=>{
	const scripts = ["engine/engine.js"];
	if(Filament.electron){
		Filament.vue.$data.editor=true;
		scripts.push("engine/editor.js");
	}
	scripts.push(Filament.gameFile("game.js"));
	Filament.loadScript(scripts);
};

Filament.loadStyle(Filament.gameFile('style.css'));

try{
	const { remote, ipcRenderer:ipc } = require('electron');
	Filament.electron={
		remote:remote,
		ipc:ipc,
		mainProcess:remote.require('./main.js'),
		window:remote.getCurrentWindow(),
		dialog:remote.dialog
	}
}catch(err){}
