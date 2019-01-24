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

Filament.gameFile=filename=>`${Filament.gameDir}${Filament.gameDir[Filament.gameDir.length-1]==='/'?'':'/'}${filename}`;

Filament.loadGame=()=>{
	const scripts = ["engine/engine.js"];
	if(Filament.electron){
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
		window=remote.getCurrentWindow(),
		dialog=remote.dialog
	}
}catch(err){}
