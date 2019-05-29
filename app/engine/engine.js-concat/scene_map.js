new Filament.Scene('map');

Filament.scenes.map.start=function(){
	Filament.map = new Filament.TileMap().mount(this);
}

Filament.scenes.map.update=function(delta){
	Filament.Scene.prototype.update.call(this,delta);
}