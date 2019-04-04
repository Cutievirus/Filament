Filament.Cache=class{
	constructor(){
		this._cache={};
	}

	async requestImage(key,path='assets/images'){
		return await this.gameAsset(key,path,(resource)=>{
			resource.texture.baseTexture.scaleMode=Filament.pixiScaleMode;
			return resource.texture;
		});
	}
	async requestAudio(key){
		
	}
	async requestJSON(key,path='data'){
		return await this.gameAsset(key,path,(resource)=>{
			return resource.data;
		})
	}
	async requestTileset(id){
		const data = await requestJSON(`tilesets/${id}.json`);
		const image = await requestImage(data.image,'assets/tilesets');
		return new Filament.TileSet(image,data);
	}
	async gameAsset(key,path,callback){
		path=Filament.path(path,key);
		return await this.requestAsset(path,Filament.gameFile(path),callback);
	}
	requestAsset(key,url,callback){
		return new Promise((resolve,reject)=>{
			if(!this._cache[key]){
				this._cache[key]=new Filament.AssetLoader(key,url,this);
			}
			if(this._cache[key] instanceof Filament.AssetLoader){
				this._cache[key].addRequest(resolve,reject,callback);
			}else{
				resolve(callback(this._cache[key]));
			}
		});
	}
}
Filament.cache=new Filament.Cache();

Filament.AssetLoader=class extends PIXI.loaders.Loader{
	constructor(key,url,cache){
		super();
		this.add(key,url);
		this._requests=[];
		this.load((loader,resources)=>{
			const resource=resources[key];
			for (const request of this._requests){
				if(resource.error){
					request.reject(resource.error);
				}else{
					request.resolve(request.callback(resource));
				}
			}
			if(resource.error){
				delete cache._cache[key];
			}else{
				cache._cache[key]=resource;
			}
		});
	}
	addRequest(resolve,reject,callback){
		this._requests.push(new Filament.AssetRequest(resolve,reject,callback));
	}
}

Filament.AssetRequest=class{
	constructor(resolve,reject,callback){
		this.resolve=resolve;
		this.reject=reject;
		this.callback=callback;
	}
}