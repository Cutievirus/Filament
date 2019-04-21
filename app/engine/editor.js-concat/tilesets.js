Filament.editorScreen("Tilesets",{
	template:`<div id="screen-tilesets">tileset</div>`,
});

Filament.vue.$data.panels.tileset={
	template:`<aside id="tileset-panel"
	:style="{'--width':tileset_width,'--height':tileset_height}">
		<select id="tileset-select">
		</select>
		<button v-for="tool in tools">
			<img draggable=false :src="tool.img">
		</button>
		<img draggable=false :src="tileset_url" id="tileset">
	</aside>`,
	data:()=>({
		tileset_id:0,
		tileset_url:undefined,
		tileset_width:96,
		tileset_height:96,
		tileset:{},
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
			mode:Filament.PLACEMENT_MODE.CLONE,
			img:"engine/img/tool-clone.png"
		}]
	}),
	async created(){
		this.tileset= await Filament.cache.requestTileset(this.tileset_id);
		this.tileset_url=this.tileset.image.baseTexture.imageUrl;
		this.tileset_width=this.tileset.image.baseTexture.width;
		this.tileset_height=this.tileset.image.baseTexture.height;
		Filament.resize();
		Filament.resize();
	}
}

Filament.events.addEvent('resize',()=>{
	document.getElementById("tileset-panel").style.width=
	document.getElementById("tileset").getBoundingClientRect().width+'px';
});