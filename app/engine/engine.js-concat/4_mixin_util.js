Filament.MixinUtil={
	mount(parent){
		parent.addChild(this);
		return this;
    },
    assign(key,value){
        if(typeof arguments[0]==="object"){
            Object.assign(this,arguments[0]);
        }else{
            this[key]=value;
        }
        return this;
    }
}
Filament.mixin(PIXI.DisplayObject, Filament.MixinUtil);