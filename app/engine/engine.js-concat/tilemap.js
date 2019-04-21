
/**
 * The TileMap Class.
 * Each tilemap has multiple elevation layers.
 */
Filament.TileMap = class extends PIXI.Container{
	constructor(){
		super();
		this.baseLayer = new PIXI.Container().mount(this);
		this.actorLayer = new PIXI.Container().mount(this);
		this.fringeLayer = new PIXI.Container().mount(this);
		this.cells = new Filament.CoordMap(2,Filament.MapCell,this);
		// TODO: read map settings from JSON.
		this.selector = new Filament.TileSelector(this).mount(this);
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
Filament.createTileEraser=function(){
	Filament.tileEraser = new PIXI.Graphics();
	Filament.tileEraser.beginFill(0);
	const ts = Filament.settings.tileSize;
	Filament.tileEraser.drawRect(0,0,ts,ts);
	Filament.tileEraser.endFill();
	Filament.tileEraser.blendMode=Filament.BLEND_MODES.ERASE;
}
Filament.getEraser=function(x,y){
	const ts = Filament.settings.tileSize;
	Filament.tileEraser.position.set(x*ts,y*ts);
	return Filament.tileEraser;
}
Filament.events.addEvent('start',()=>{
	Filament.addBlendMode("ERASE",[0, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA]);
	Filament.createTileEraser();
});

Filament.TileSet = class{
	constructor(image,data){
		this.image=image;
		this.data=data;
		this.stamp = new PIXI.Sprite(image);
	}
	getStamp(tsX,tsY,x,y){
		const ts=this.data.tileSize;
		this.stamp.crop(tsX*ts,tsY*ts,ts,ts);
		this.stamp.position.set(x*ts,y*ts);
		return this.stamp;
	}
	getTile(x,y){
		const row = this.data.data[y];
		if(!row){ row=[] }
		let tile = row[x];
		if(tile==undefined){ tile={data:0} }
		if( typeof tile==='number' ){
			tile={data:tile};
		}else if( tile.passage ){ return tile; }
		tile.passage = tile.data & 0b1111;
		tile.opaque = (tile.data>>>4) & 0b1;
		tile.layer = (tile.data>>>5) & 0b111;
		tile.terrain = tile.data>>>8;
		row[x]=tile;
		return tile;
	}
}

Filament.TileSelector = class extends Filament.Window{
	constructor(tilemap){
		super();
		this.tilemap=tilemap;
		this.classList.add('tileSelector');
		this.minwidth=0;
		this.minheight=0;
		this.width=Filament.settings.tileSize;
		this.height=Filament.settings.tileSize;
		this.edgeSnap=true;
		this.tileX=0;
		this.tileY=0;
		this.rightclicked=false;
		Filament.mouse.addEvent('mousemove',this.mousemove,this);
		Filament.mouse.addEvent('mousedown',this.mousedown,this);
	}

	mousemove(event){
		this.tileX=Math.floor(event.worldX/Filament.settings.tileSize);
		this.tileY=Math.floor(event.worldY/Filament.settings.tileSize);
		this.x=this.tileX*Filament.settings.tileSize;
		this.y=this.tileY*Filament.settings.tileSize;
		if(Filament.mouse.isDown){
			this.placeTile(event);
		}
	}
	mousedown(event){
		this.rightclicked=event.button>0;
		this.placeTile(event);
	}
	placeTile(event){
		const cellX=Math.floor(this.tileX/this.tilemap.cellSize);
		const cellY=Math.floor(this.tileY/this.tilemap.cellSize);
		const cell = this.tilemap.cells.get(cellX,cellY);
		const ctX=this.tileX%this.tilemap.cellSize;
		const ctY=this.tileY%this.tilemap.cellSize;
		const stack = cell.getTileStack(ctX,ctY);
		cell.clearTile(ctX,ctY);
		if(this.rightclicked){
			stack.length=0;
		}else{
			stack[0]={ts:0,x:0,y:0};
			cell.loadTileStack(ctX,ctY,stack);
		}
	}
}
Filament.PLACEMENT_MODE = new Filament.Enum(
	"PEN","ERASE","FILL","RECT","CLONE"
);

/**
 * An object representing an indivitual cell in the tilemap.
 * contains a reference to MapCellLayer objects for the base and fringe layers as well as
 * a list of all entities in the actorLayer associated with this cell.
 */
Filament.MapCell = class{
	constructor(tilemap){
		this.tilemap=tilemap;
		this.baseLayer=new Filament.MapCellLayer(tilemap);
		this.fringeLayer=new Filament.MapCellLayer(tilemap);
		tilemap.baseLayer.addChild(this.baseLayer);
		tilemap.fringeLayer.addChild(this.fringeLayer);
		this.loaded=false;
		this.lastTileset=0;
		this.load();
	}
	getTileStack(x,y){
		const i = x+y*this.tilemap.cellSize;
		if(!(this.data[i] instanceof Array)){
			this.data[i]=[this.data[i]];
		}
		return this.data[i];
	}
	async load(){
		// load cell terrain and json
		this.data=[];
		this.actors=[];

		// loop through each tile stack in the data
		for(let y=0;y<this.tilemap.cellSize;++y)
		for(let x=0;x<this.tilemap.cellSize;++x){
			await this.loadTileStack(x,y);
		}
		this.loaded=true;
	}
	async loadTileStack(x,y,stack=this.getTileStack(x,y)){
		for(const tile of stack){
			await this.loadTile(tile,x,y);
		}
	}
	async loadTile(tileData,x,y){
		if(!tileData){ return; }
		const tilesetId='ts' in tileData ? tileData.ts : this.lastTileset;
		if(tilesetId !== this.lastTileset){ this.lastTileset = tilesetId; }
		const tsX=tileData.x;
		const tsY=tileData.y;
		const tileset=await Filament.cache.requestTileset(tilesetId);
		// get tile layer data so we know how to draw it.
		//const tsData = tileset.getTile(tsX,tsY);
		const layerType = tileset.getTile(tsX,tsY).layer;
		switch(layerType){
		case 0://base
			this.baseLayer.drawTile(tileset,tsX,tsY,x,y);
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
	clearTile(x,y){
		this.baseLayer.clearTile(x,y);
		this.fringeLayer.clearTile(x,y);
	}
	unload(){
		this.baseLayer.destroy();
		this.fringeLayer.destroy();
	}
}

Filament.MapCellLayer = class extends PIXI.Sprite{
	constructor(tilemap){
		super(new Filament.MapCellTexture(tilemap));
		this.tilemap=tilemap;
	}
	destroy(){
		super.destroy(...arguments);
		this.texture.destroy();
	}
	drawTile(tileset,tx,ty,x,y){
		const stamp = tileset.getStamp(tx,ty,x,y);
		Filament.pixi.renderer.render(stamp,this.texture,false);
	}
	clearTile(x,y){
		const eraser = Filament.getEraser(x,y);
		Filament.pixi.renderer.render(eraser,this.texture,false);
	}
}

Filament.MapCellTexture = class extends PIXI.RenderTexture{
	constructor(tilemap){
		super(new PIXI.BaseRenderTexture(
			Filament.settings.tileSize*tilemap.cellSize,
			Filament.settings.tileSize*tilemap.cellSize,
			Filament.pixiScaleMode,
		));
		this.tilemap=tilemap;
	}
};



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

