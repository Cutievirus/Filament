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

Filament.save = async function(){
	await Filament.lzma.compress_promise(Filament.savedata,1);
}
Filament.load = async function(){
	await Filament.lzma.decompress_promise("TODO");
}