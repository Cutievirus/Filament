Filament.editorScreen("Tilesets",{
	template:`<div id="screen-tilesets">tileset</div>`,
});

Filament.vue.$data.panels.tileset={
	template:`<aside id="tileset-panel"
	:style="{'--width':tileset_width,'--height':tileset_height}">
		<select id="tileset-select">
		</select>
		<div class='editor-button-set'>
			<button v-for="tool in tools"
			:data-rightTool="rightTool===tool.mode"
			:data-leftTool="leftTool===tool.mode"
			:data-tool="tool.mode"
			@click="pickTool"
			@contextmenu.prevent="pickTool"
			>
				<img draggable=false :src="tool.img">
			</button>
		</div>
		<div id="tileset-container">
			<div id="selectedTile" :style="{'--x':editor.tileBox.x,'--y':editor.tileBox.y,'--w':editor.tileBox.width,'--h':editor.tileBox.height, visibility:selectorVisibility}"></div>
			<img draggable=false :src="tileset_url" id="tileset"
			@mousedown="mousedown"
			@mousemove="mousemove"
			>
		</div>
	</aside>`,
	data:()=>({
		tileset_url:undefined,
		tileset_width:96,
		tileset_height:96,
		tools:[{
			mode:Filament.PLACEMENT_MODE.PEN,
			img:"engine/img/tool-pen.png"
		},{
			mode:Filament.PLACEMENT_MODE.ERASE,
			img:"engine/img/tool-eraser.png"
		},{
			mode:Filament.PLACEMENT_MODE.FILL,
			img:"engine/img/tool-bucket.png"
		},{
			mode:Filament.PLACEMENT_MODE.RECT,
			img:"engine/img/tool-rect.png"
		},{
			mode:Filament.PLACEMENT_MODE.CLEARRECT,
			img:"engine/img/tool-clearrect.png"
		},{
			mode:Filament.PLACEMENT_MODE.CLONE,
			img:"engine/img/tool-clone.png"
		}],
		leftTool:Filament.editor.leftTool,
		rightTool:Filament.editor.rightTool,
		editor:Filament.editor,
		get selectorVisibility(){ return this.editor.clone?'hidden':'visible'; }
	}),
	methods:{
		pickTool(event){
			const tool = event.target.getAttribute('data-tool');
			if(event.button>0){
				this.rightTool=tool;
				Filament.editor.rightTool=tool;
			}else{
				this.leftTool=tool;
				Filament.editor.leftTool=tool;
			}
		},
		selectTile(event){
			const ts = Filament.settings.tileSize*Filament.scale;
			const tileBox = Filament.editor.tileBox;
			tileBox.ox = tileBox.x = Math.floor(event.offsetX/ts);
			tileBox.oy = tileBox.y = Math.floor(event.offsetY/ts);
			tileBox.width = 1; tileBox.height = 1;
			Filament.editor.clone=false;
		},
		mousedown(event){
			this.selectTile(event);
			this.mouseIsDown=true;
		},
		mouseup(event){
			this.mouseIsDown=false;
		},
		mousemove(event){
			if(!this.mouseIsDown){ return; }
			const ts = Filament.settings.tileSize*Filament.scale;
			const x = Math.floor(event.offsetX/ts);
			const y = Math.floor(event.offsetY/ts);
			Filament.TileSelector.prototype.dragSelection.call(null,Filament.editor.tileBox,x,y);
		}
	},
	async created(){
		const tileset = await Filament.cache.requestTileset(Filament.editor.tilesetId);
		Filament.editor.tileset = tileset;
		this.tileset_url=tileset.image.baseTexture.imageUrl;
		this.tileset_width=tileset.image.baseTexture.width;
		this.tileset_height=tileset.image.baseTexture.height;
		Filament.resize();
		this.mouseup_event=Filament.mouse.addEvent('mouseup',this.mouseup,this);
	},

	beforeDestroy(){
		Filament.mouse.removeEvent('mouseup',this.mouseup_event);
	}
}

Filament.events.addEvent('resize',()=>{
	const tilesetBounds=document.getElementById("tileset").getBoundingClientRect();
	const tilesetPanel = document.getElementById("tileset-panel");
	tilesetPanel.style.width=tilesetBounds.width+'px';
	tilesetPanel.style.setProperty('--tileset-x',tilesetBounds.x);
	tilesetPanel.style.setProperty('--tileset-y',tilesetBounds.y);
	tilesetPanel.style.setProperty('--tileset-width',tilesetBounds.width);
	tilesetPanel.style.setProperty('--tileset-height',tilesetBounds.height);
});