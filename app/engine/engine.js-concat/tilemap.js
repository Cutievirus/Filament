
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
		if(Filament.editor.enabled){
			this.clone = new Filament.TileSelection().mount(this);
			this.selection = new Filament.TileSelection().mount(this);
			this.selector = new Filament.TileSelector(this).mount(this);
		}
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
		const scene = this.scene;
		this.clone.mountUI(scene);
		this.selection.mountUI(scene);
		this.selector.mountUI(scene);
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
		let row = this.data.data[y];
		if(!row){ row=this.data.data[y]=[]; }
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

Filament.Tile = class{
	constructor(ts,x,y){
		if(typeof ts === 'object'){
			x=ts.x;
			y=ts.y;
			ts=ts.ts;
		}
		this.ts=ts;
		this.x=x;
		this.y=y;
	}
	equals(tile){
		return this.ts===tile.ts && this.x===tile.x && this.y === tile.y;
	}
	static equalStacks(stack1, stack2){
		if(stack1.length !== stack2.length){ return false; }
		for (let i=0; i<stack1.length; ++i){
			if( !Filament.Tile.prototype.equals.call(stack1[i],stack2[i]) ){ return false; }
		}
		return true;
	}
	async loadTileset(){
		if(this.tileset){ return; }
		this.tileset = await Filament.cache.requestTileset(this.ts);
		this.tileData = tileset.getTile(this.x, this.y);
	}
}

Filament.TileSelection = class extends Filament.Window{
	constructor(){
		super();
		this.classList.add('tileSelection');
		this.minwidth=0; this.minheight=0;
		this.width=Filament.settings.tileSize;
		this.height=Filament.settings.tileSize;
		this.edgeSnap=false;
		this.zIndex=0;
		this.box={ox:0,oy:0};
		Object.defineProperties(this.box,{
			x:this.boxAccessor('x'),
			y:this.boxAccessor('y'),
			width:this.boxAccessor('width'),
			height:this.boxAccessor('height'),
		});
		
	}
	boxAccessor(p){
		const ts = Filament.settings.tileSize;
		return {
			get:()=>this[p]/ts,
			set:v=>this[p]=v*ts,
		};
	}
}

Filament.TileSelector = class extends Filament.TileSelection{
	constructor(tilemap){
		super();
		this.tilemap=tilemap;
		this.classList.add('tileSelector');
		this.rightclicked=false;
		this.dragTool=null;
		Filament.mouse.addEvent('mousemove',this.mousemove,this);
		Filament.mouse.addEvent('mousedown',this.mousedown,this);
		Filament.mouse.addEvent('mouseup',this.mouseup,this);
	}
	update(delta){
		super.update(delta);
		this.calcBrushSize();
		this.tilemap.selection.visible = !!this.dragTool;
		this.tilemap.clone.visible = Filament.editor.clone;
	}
	mousemove(event){
		this.box.x=Math.floor(event.worldX/Filament.settings.tileSize);
		this.box.y=Math.floor(event.worldY/Filament.settings.tileSize);
		//this.x=this.tileX*Filament.settings.tileSize;
		//this.y=this.tileY*Filament.settings.tileSize;
		if(Filament.mouse.isDown){
			this.useTool();
		}
		if(this.dragTool){
			this.dragSelection(this.tilemap.selection.box,this.box.x,this.box.y);
		}
	}
	dragSelection(s,x,y){
		s.x=s.ox; s.y=s.oy;
		s.width = x - s.ox;
		if(s.width<0){ s.x = s.ox + s.width; s.width*=-1; }
		s.height = y - s.oy;
		if(s.height<0){ s.y = s.oy + s.height; s.height*=-1; }
		s.width+=1; s.height+=1;
	}
	mousedown(event){
		this.dragTool=null;
		this.rightclicked=event.button>0;
		this.useTool();
	}
	mouseup(event){
		if(this.dragTool){
			switch(this.dragTool){
				case Filament.PLACEMENT_MODE.RECT: this.tool_RECT(); break;
				case Filament.PLACEMENT_MODE.CLEARRECT: this.tool_CLEARRECT(); break;
				case Filament.PLACEMENT_MODE.CLONE: this.tool_CLONE(); break;
			}
			this.dragTool=null;
		}
		if(event.button>0){ this.rightclicked=false; }
	}
	getTool(){
		return this.rightclicked?Filament.editor.rightTool:Filament.editor.leftTool;
	}
	useTool(){
		const tool = this.getTool();
		switch(tool){
			case Filament.PLACEMENT_MODE.PEN:
				return this.tool_PEN();
			case Filament.PLACEMENT_MODE.ERASE:
				return this.tool_ERASE();
			case Filament.PLACEMENT_MODE.FILL:
				return this.tool_FILL();
			case Filament.PLACEMENT_MODE.RECT:
			case Filament.PLACEMENT_MODE.CLEARRECT:
			case Filament.PLACEMENT_MODE.CLONE:
				return this.startDrag(tool);
		}
	}
	startDrag(tool){
		if(this.dragTool){ return; }
		this.dragTool=tool;
		this.tilemap.selection.box.ox=this.box.x;
		this.tilemap.selection.box.oy=this.box.y;
		this.dragSelection(this.tilemap.selection.box,this.box.x,this.box.y);
	}
	async tool_PEN(){
		const tiles = await this.getSelectedTiles();
		for(let x=0; x<tiles.length; ++x){
			for (let y=0; y<tiles[x].length; ++y){
				const tile = tiles[x][y];
				await this.setTile(tile,this.box.x+x,this.box.y+y);
			}
		}
	}
	async tool_ERASE(){
		await this.eraseTile(this.box.x,this.box.y);
	}
	async tool_FILL(){
		const tx = this.box.x;
		const ty = this.box.y;
		const tiles = await this.getSelectedTiles();
		let {cell,x:ctX,y:ctY,stack:firststack} = await this.getCellTile(tx,ty);
		firststack = Array.from(firststack);
		const visited = [];
		let fillCount = 0;
		const checkAdjacent=async(x,y)=>{
			if( x<0 || x>= this.tilemap.cellSize || y<0 || y>= this.tilemap.cellSize ){ return; }
			const stack = await cell.getTileStack(x,y);
			if(visited.includes(stack)){ return; }
			if(Filament.Tile.equalStacks(stack,firststack)){
				visited.push(stack);
				const col = tiles[Filament.modulo(x-ctX,tiles.length)];
				const tile = col[Filament.modulo(y-ctY,col.length)];
				this.setTile(tile,tx+x-ctX,ty+y-ctY);
				++fillCount;
				if(fillCount%10===0){ await Filament.sleep(0); }
				const neighbors = [
					[x+1,y],
					[x,y+1],
					[x-1,y],
					[x,y-1],
				].sort((a,b)=> (Math.pow(a[0]-ctX,2)+Math.pow(a[1]-ctY,2)) - (Math.pow(b[0]-ctX,2)+Math.pow(b[1]-ctY,2)) );
				for (const neighbor of neighbors){
					await checkAdjacent(...neighbor);
				}
				
			}
		}
		await checkAdjacent(ctX,ctY);
	}
	async tool_RECT(){
		const tiles = await this.getSelectedTiles();
		const s = this.tilemap.selection.box;
		for (let x=s.x; x<s.x+s.width; ++x){
			for (let y=s.y; y<s.y+s.height; ++y){
				const col = tiles[Filament.modulo(x-s.x,tiles.length)];
				const tile = col[Filament.modulo(y-s.y,col.length)];
				await this.setTile(tile,x,y);
			}
		}
	}
	async tool_CLEARRECT(){
		const s = this.tilemap.selection.box;
		for (let x=s.x; x<s.x+s.width; ++x){
			for (let y=s.y; y<s.y+s.height; ++y){
				await this.eraseTile(x,y);
			}
		}
	}
	tool_CLONE(){
		const c = this.tilemap.clone.box;
		const s = this.tilemap.selection.box;
		c.x = s.x; c.y = s.y;
		c.width= s.width; c.height = s.height;
		Filament.editor.clone=true;
	}
	calcBrushSize(){
		if(this.getTool()!==Filament.PLACEMENT_MODE.PEN){ 
			this.box.width=this.box.height=1;
			return;
		}
		if(Filament.editor.clone){
			this.box.width=this.tilemap.clone.box.width;
			this.box.height=this.tilemap.clone.box.height;
		}else{
			this.box.width=Filament.editor.tileBox.width;
			this.box.height=Filament.editor.tileBox.height;
		}
	}
	async getSelectedTiles(){
		const tiles = [];
		if(Filament.editor.clone){
			const c = this.tilemap.clone.box;
			for (let x=c.x; x<c.x+c.width; ++x){
				const col = [];
				tiles.push(col);
				for (let y=c.y; y<c.y+c.height; ++y){
					const {stack} = await this.getCellTile(x,y);
					col.push(Array.from(stack));
				}
			}
			return tiles;
		}
		const e = Filament.editor.tileBox;
		for (let x=e.x; x<e.x+e.width; ++x){
			const col = [];
			tiles.push(col);
			for (let y=e.y; y<e.y+e.height; ++y){
				col.push(new Filament.Tile(Filament.editor.tilesetId,x,y));
			}
		}
		return tiles;
	}
	async setTile(newtile,x,y){
		const {cell,x:ctX,y:ctY,stack} = await this.getCellTile(x,y);
		if (newtile instanceof Filament.Tile) for (let i=0; i<stack.length; ++i){
			const tile = stack[i];
			if(!tile){ continue; }
			if(newtile.equals(tile)){
				if(i===stack.length-1){ return; }
				Filament.arrayRemove(stack,tile);
				break;
			}
		} 
		//stack[0]=newtile;
		if(newtile instanceof Array){
			stack.length=0;
			stack.push(...newtile);
		}else{
			Filament.arrayAdd(stack,newtile);
		}
		cell.clearTile(ctX,ctY);
		await cell.loadTileStack(ctX,ctY,stack);
		if(cell.empty){ cell.empty=false; }
	}
	async eraseTile(x,y){
		const {cell,x:ctX,y:ctY,stack} = await this.getCellTile(x,y);
		cell.clearTile(ctX,ctY);
		stack.length=0;
	}
	async getCellTile(x,y){
		const cellX=Math.floor(x/this.tilemap.cellSize);
		const cellY=Math.floor(y/this.tilemap.cellSize);
		const cell = this.tilemap.cells.get(cellX,cellY);
		const ctX=Filament.modulo(x,this.tilemap.cellSize);
		const ctY=Filament.modulo(y,this.tilemap.cellSize);
		const stack = await cell.getTileStack(ctX,ctY);
		return {cell:cell,x:ctX,y:ctY,stack:stack};
	}
}
Filament.PLACEMENT_MODE = new Filament.Enum(
	"PEN","ERASE","FILL","RECT","CLEARRECT","CLONE"
);
Object.assign(Filament.editor,{
	leftTool: Filament.PLACEMENT_MODE.PEN,
	rightTool: Filament.PLACEMENT_MODE.ERASE,
	tilesetId:0,
	tileBox:{x:0,y:0,width:1,height:1,ox:0,oy:0},
	clone:false,
});

/**
 * An object representing an indivitual cell in the tilemap.
 * contains a reference to MapCellLayer objects for the base and fringe layers as well as
 * a list of all entities in the actorLayer associated with this cell.
 */
Filament.MapCell = class{
	constructor(tilemap,x,y){
		this.x=x; this.y=y;
		this.tilemap=tilemap;
		this.baseLayer=new Filament.MapCellLayer(tilemap,x,y);
		this.fringeLayer=new Filament.MapCellLayer(tilemap,x,y);
		tilemap.baseLayer.addChild(this.baseLayer);
		tilemap.fringeLayer.addChild(this.fringeLayer);
		this.lastTileset=0;
		this.loaded=false;
		this.loadPromises=[];
		this.load();
		if(Filament.editor.enabled){
			this.grid=new Filament.MapCellGrid(tilemap.cellSize).mount(this.fringeLayer);
		}
	}
	waitForLoad(){
		return new Promise((resolve,reject)=>{
			if(this.loaded){ return void resolve(); }
			this.loadPromises.push({resolve:resolve,reject:reject});
		});
	}
	finishLoading(success=true){
		this.loaded=true;
		for( const promise of this.loadPromises ){
			success?promise.resolve():promise.reject();
		}
	}
	async getTileStack(x,y){
		await this.waitForLoad();
		const i = x+y*this.tilemap.cellSize;
		if(this.data[i]==undefined){
			this.data[i]=[];
		}else if(!(this.data[i] instanceof Array)){
			this.data[i]=[this.data[i]];
		}
		return this.data[i];
	}
	async load(){
		// load cell terrain and json
		this.empty=true;
		this.data=[];
		this.actors=[];

		await this.finishLoading(true);
		// data has been loaded. tiles still need to be drawn.

		// loop through each tile stack in the data
		for(let y=0;y<this.tilemap.cellSize;++y)
		for(let x=0;x<this.tilemap.cellSize;++x){
			await this.loadTileStack(x,y);
		}
	}
	async loadTileStack(x,y,stack){
		if(!stack){
			stack = await this.getTileStack(x,y);
		}
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
	async saveToFile(){

	}
	async loadToFile(){

	}
}

Filament.MapCellGrid = class extends Filament.Window{
	constructor(cellSize){
		super();
		this.classList.add('mapCell-grid');
		this.width=Filament.settings.tileSize*cellSize;
		this.height=Filament.settings.tileSize*cellSize;
		this.edgeSnap=false;
		this.zIndex=-1;
	}
}

Filament.MapCellLayer = class extends PIXI.Sprite{
	constructor(tilemap,x,y){
		super(new Filament.MapCellTexture(tilemap));
		this.tilemap=tilemap;
		this.x=x*Filament.settings.tileSize*this.tilemap.cellSize;
		this.y=y*Filament.settings.tileSize*this.tilemap.cellSize;
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

TODO / Ideas:
Animated Tiles
Autotiles
Parallax layers


*/

