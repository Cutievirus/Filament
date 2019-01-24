Filament.UI = class extends PIXI.Container{
	constructor(){
		super();
		this.ui = document.createElement('div');
		this.anchor = new PIXI.ObservablePoint(this._onAnchorUpdate, this);
		this.setAccessor('id');
		this.setAccessor('className');
		this.classList=this.ui.classList;
		this.style=this.ui.style;
		this.style.position="absolute";
	}
	mount(parent){
		parent.addChild(this);
		return this;
	}
	mountUI(parent){
		(parent instanceof Filament.UI ? parent.ui : parent).append(this.ui);
		return this;
	}
	setAccessor(v1,v2=v1){
		Object.defineProperty(this,v1,{
			get(){return this.ui[v2];},
			set(v){this.ui[v2]=v;}
		});
	}
	enable(){
		super.enable();
		this.setAttribute('data-enabled',true);
	}
	disable(){
		super.disable();
		this.setAttribute('data-enabled',false);
	}
	destroy(){
		super.destroy();
		this.ui.parentNode.removeChild(this.ui);
	}
	setAttribute(name,value){
		value=String(value);
		if(this.ui.getAttribute(name)!==value){
			this.ui.setAttribute(name,value);
		}
	}
	setProperty(name,value){
		value=String(value);
		if(this.ui.style.getPropertyValue(name)!==value){
			this.ui.style.setProperty(name,value);
		}
	}
	setAttributes(attributes){
		for (const key in attributes){ this.setAttribute(key,attributes[key]); }
	}
	setProperties(properties){
		for (const key in properties){ this.setProperty(key,properties[key]); }
	}
	updateUI(delta){
		this.setAttribute("data-visible",this.worldVisible);
		if(!this.ui.parentNode && this.scene && this.scene!==this){ this.mountUI(this.scene); }
	}
	_onAnchorUpdate(){
		//this.ui.style.transform = "translate("+-this.anchor.x*100+"%,"+-this.anchor.y*100+"%)";
	}
}