PIXI.DisplayObject.prototype.enabled=true;
PIXI.DisplayObject.prototype.enable=function(){
	this.enabled=true;
	this.visible=true;
};
PIXI.DisplayObject.prototype.disable=function(){
	this.enabled=false;
	this.visible=false;
};
PIXI.DisplayObject.prototype.update=function(delta){};

PIXI.DisplayObject.prototype.zIndex=0;
PIXI.Container.prototype.update=function(delta){
	this.children.sort((a,b)=>a.zIndex-b.zIndex);
	for(const child of this.children){
		child.update(delta);
	}
};

Object.defineProperty(PIXI.DisplayObject.prototype,'scene',{
	get(){
		let obj=this;
		while (!(obj instanceof Filament.Scene) && obj.parent){
			obj=obj.parent;
		}
		return (obj instanceof Filament.Scene)?obj:null;
	},
	set(scene){
		if(this.scene===scene){ return; }
		scene.addChild(this);
	}
});