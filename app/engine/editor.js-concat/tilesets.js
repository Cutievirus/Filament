Filament.editorScreen("Tilesets",{
	template:`<div id="screen-tilesets">tileset</div>`,
});

Filament.vue.$data.panels.tileset={
	template:`<aside id="tileset-panel" :style="{'--width':tileset_width,'--height':tileset_height}"><img :src="tileset_url"></aside>`,
	data:()=>({
		tileset_id:0,
		tileset_url:undefined,
		tileset_width:96,
		tileset_height:96,
		tileset:{},
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