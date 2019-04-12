
Filament.MapCellTexture = class extends PIXI.RenderTexture{
	constructor(tilemap){
		super(new PIXI.BaseRenderTexture({
			width: Filament.settings.tileSize*tilemap.cellSize,
			height: Filament.settings.tileSize*tilemap.cellSize,
			scaleMode: Filament.pixiScaleMode,
		}));
		this.tilemap=tilemap;
	}
};

Filament.MapCellLayer = class extends PIXI.Sprite{
	constructor(tilemap){
		super(new Filament.MapCellTexture(tilemap));
	}
	destroy(){
		super.destroy(...arguments);
		this.texture.destroy();
	}
	drawTile(tileset,tx,ty,x,y){
		const stamp = tileset.getStamp(tx,ty);
		stamp.position.set(x,y);
		Filament.pixi.renderer.render(stamp,this.texture);
	}
}

/**
 * An object representing an indivitual cell in the tilemap.
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
		this.loaded=false;
		this.lastTileset=0;
		this.texture = new MapCellTexture(this.tilemap);
	}
	async load(){
		// load cell terrain and json
		this.data=[];
		this.actors=[];

		// loop through each tile stack in the data
		for(let i=0;i<data.length;++i){
			const stack = data[i];
			const x=i%this.tilemap.cellSize;
			const y=Math.floor(i/Math.tilemap.cellSize);
			if(stack instanceof Array){
				for(const tile of stack){ await this.loadTile(tile,x,y); }
			}else{
				await this.loadTile(stack,x,y);
			}
		}
		this.loaded=true;
	}
	async loadTile(tileData,x,y){
		const tilesetId='ts' in tileData ? tileData.ts : this.lastTileset;
		if(tilesetId !== this.lastTileset){ this.lastTileset = tilesetId; }
		const tileX=tileData.x;
		const tileY=tileData.y;
		const tileset=Filament.cache.requestTileset(tileId);
		// get tile layer data so we know how to draw it.
		const layerType = tileset.getTile(tileX,tileY).layer;
		switch(layerType){
		case 0://base
			this.baseLayer.drawTile(tileset,tileX,tileY,x,y);
			break;
		case 1://actor
			break;
		case 2://fringe
			break;
		case 3://overpass
			break;
		default:
		}
	}
	unload(){
		this.baseLayer.destroy();
		this.fringeLayer.destroy();
	}
}

Filament.TileSet = class{
	constructor(image,data){
		this.image=image;
		this.data=data;
		this.stamp = new PIXI.Sprite(image);
	}
	getStamp(x,y){
		const ts=this.data.tileSize;
		this.stamp.crop(x*ts,y*ts,ts,ts);
		return this.stamp;
	}
	getTile(x,y){
		const row = this.data.data[y];
		if(!row){ return null; }
		let tile = row[x];
		if(tile==undefined){ return null; }
		if( typeof tile==='number' ){
			tile={data:tile,note:''};
		}else if( tile.passage ){ return tile; }
		tile.passage = tile.data & 0b1111;
		tile.opaque = (tile.data>>>4) & 0b1;
		tile.layer = (tile.data>>>5) & 0b111;
		tile.terrain = tile.data>>>8;
		row[x]=tile;
	}
}

/**
 * The TileMap Class.
 * Each tilemap has multiple elevation layers.
 */
Filament.TileMap = class extends PIXI.Container{
	constructor(){
		super();
		this.baseLayer = new PIXI.Container();
		this.actorLayer = new PIXI.Container();
		this.fringeLayer = new PIXI.Container();
		this.cells = new Filament.CoordMap(2);
		// TODO: read map settings from JSON.
		this.selector = new Filament.TileSelector().mount(this);
		this.settings={
			name:'',
			cellSize:null,
		};
	}
	get cellSize(){
		return this.settings.cellSize?this.settings.cellSize:Filament.settings.cellSize;
	}
	mount(){
		super.mount(...arguments);
		this.selector.mountUI(this.scene);
	}
}

/*
Better idea for elevation.
Everything is handled in one layer with tile stacks as usual.

An tile can be opaque or transparent.
Opaque tiles erase underlying tiles when placed.
Transparent tiles stack on top of underlying tiles.

There are four "layering" options for each tile.
Base is rendered under player.
Actor is rendered same layer as player.
Fringe is rendered above player.
Overpass is special. It's in the actor layer, but is rendered above or below the player depending on their elevation.
overpass elevation is one plus the number of overpass tiles underlying in the stack.
When player can step onto overpass tile, their elevation is set to same as the overpass they're walking on.
When player can't step onto the overpass tile, they instead step under it.

*/

Filament.TileSelector = class extends Filament.UI{
	constructor(){
		super();
		this.classList.add('tileSelector');
	}
}