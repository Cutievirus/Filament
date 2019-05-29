Filament.lzma = new LZMA("./lib/lzma_worker-min.js");

Filament.lzma.compress_promise=(data,mode=1,progress=undefined)=>new Promise((resolve,reject)=>{
	Filament.lzma.compress(data,mode,(result,error)=>{
		if(error){
			reject(error);
		}else{
			resolve(result);
		}
	},progress);
});

Filament.lzma.decompress_promise=(data,progress)=>new Promise((resolve,reject)=>{
	Filament.lzma.decompress(data,(result,error)=>{
		if(error){
			reject(error);
		}else{
			resolve(result);
		}
	},progress);
});

Filament.saveGameData = async function(){
	await Filament.lzma.compress_promise(Filament.savedata,1);
}
Filament.loadGameData = async function(){
	await Filament.lzma.decompress_promise("TODO");
}

Filament.saveFile = async function(text,path,json=true){
	path = Filament.gameFile(path);
	if(json){ text = JSON.stringify(text); }
	let data = await Filament.lzma.compress_promise(text,1);
	// TODO: Save
}
Filament.loadFile = async function(path,json=true){
	path = Filament.gameFile(path);
	// TODO
}

Filament.saveData = async function(text,key,json=true){
	if(json){ text = JSON.stringify(text); }
	let data = await Filament.lzma.compress_promise(text,1);
	data = data.map(n=>String.fromCodePoint((n<0?n+256:n)+32)).join('');
	window.localStorage.set(`${Filament.settings.slug}-${key}`,data);
}
Filament.loadData = async function(key,json=true){
	key = `${Filament.settings.slug}-${key}`;
	let data = window.localStorage.get(key);
	data = new Int8Array(Array.prototype.map.call(data,n=>n.codePointAt(0)-32));
	data = await Filament.lzma.decompress_promise(data);
	if(json){ data=JSON.parse(data); }
	return data;
}