
Filament.MapCellTexture = class extends PIXI.RenderTexture{
	constructor(){
		super(new PIXI.BaseRenderTexture({
			width: Filament.settings.tileSize*Filament.settings.cellSize,
			height: Filament.settings.tileSize*Filament.settings.cellSize,
			scaleMode: Filament.pixiScaleMode,
		}));
	}
};

Filament.MapCellLayer = class extends PIXI.Sprite{
	constructor(){
		super(new Filament.MapCellTexture());
	}
	destroy(){
		super.destroy(...arguments);
		this.texture.destroy();
	}
}

/**
 * An object representing an indivitual cell of a particular elevation in the tilemap.
 * contains a reference to MapCellLayer objects for the base and fringe layers as well as
 * a list of all entities in the actorLayer associated with this cell.
 */
Filament.MapCell = class{
	constructor(tilemap){
		this.tilemap=tilemap;
		this.baseLayer=new Filament.MapCellLayer();
		this.fringeLayer=new Filament.MapCellLayer();
		tilemap.baseLayer.addChild(this.baseLayer);
		tilemap.fringeLayer.addChild(this.fringeLayer);
	}
	load(x,y,elevation){
		//load cell terrain and json
		this.data=[];
		this.actors=[];
	}
	unload(){
		this.baseLayer.destroy();
		this.fringeLayer.destroy();
	}
}

/**
 * An elevation layer for the tilemap. Each elevation layer
 * has 3 layers. The base layer, the actor layer, and the fringe layer.
 * The actor layer contains all entities and also tile objects which
 * are stacked like entities.
 */
Filament.TileMapLayer = class extends PIXI.Container{
	constructor(){
		super();
		this.baseLayer = new PIXI.Container();
		this.actorLayer = new PIXI.Container();
		this.fringeLayer = new PIXI.Container();
		this.cells = new Filament.CoordMap(2);
	}
}

/**
 * The TileMap Class.
 * Each tilemap has multiple elevation layers.
 */
Filament.TileMap = class extends PIXI.Container{
	constructor(){

	}
}