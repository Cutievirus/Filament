Filament.Sprite = class extends PIXI.Sprite{
	constructor(key){
		super(PIXI.Texture.EMPTY);
		this.loadTexture(key);
	}
	async loadTexture(key){
		this.texture=await Filament.cache.requestImage(key);
	}
	mount(parent){
		parent.addChild(this);
		return this;
	}
}