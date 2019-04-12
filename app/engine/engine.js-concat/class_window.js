Filament.Window = class extends Filament.UI{
	constructor(){
		super();
		this.classList.add('window');
		this.ui_width=20;
		this.ui_height=20;
		this.minwidth=20;
		this.minheight=20;
		this.maxwidth=Filament.settings.width;
		this.maxheight=Filament.settings.height;
		this._hasFrame=false;
		this._interactive=false;
		this.movable=false;
		this.resizable=false;
		this.closable=false;
		this.edgeSnap=true;
		this.content=Filament.createElement('div.content').mount(this.ui);
		this.handle=Filament.createElement('div.handle').mount(this.ui);
		this.closeButton=Filament.createElement('div.closeButton','×').mount(this.ui);
		this.closeButton.addEventListener('click',event=>{
			this.destroy();
		});
		this.teletype=0;
		this.handle.addEventListener('mousedown',event=>{
			Filament.arrayRemove(this.scene.windows,this);
			Filament.arrayAdd(this.scene.windows,this);
			this.dragging=true;
		});
		this.handle.addEventListener('mouseup',event=>{
			this.dragging=false;
			this.finishDrag(event);
		});
		this.contentObserver=new MutationObserver(()=>{
			if(this.resizable){
				if(this.content.style.width||this.content.style.height){
					this.content.style.width='';
					this.content.style.height='';
					this.resizing=true;
				}
			}
		});
		this.contentObserver.observe(this.content,{attributes:true,attributeFilter:['style']});
	}
	mount(parent){
		super.mount(parent);
		if(parent.scene)this.mountUI(this.scene);
		return this;
	}
	mountUI(scene){
		if(this.scene) Filament.arrayRemove(this.scene.windows,this);
		super.mountUI(scene);
		Filament.arrayAdd(scene.windows,this);
		return this;
	}
	destroy(){
		if(this.scene) Filament.arrayRemove(this.scene.windows,this);
		super.destroy(...arguments);
	}
	get width(){return this.ui_width;}
	set width(v){this.ui_width=v;}
	get height(){return this.ui_height;}
	set height(v){this.ui_height=v;}
	get interactive(){return this._interactive||this.movable||this.resizable||this.closable;}
	set interactive(v){this._interactive=v;}
	get hasFrame(){return this._hasFrame||this.movable||this.resizable||this.closable;}
	set hasFrame(v){this._hasFrame=v;}
	getBoundsUI(){
		let bounds = {};
		bounds.width = Filament.round(this.width,2);
		bounds.height = Filament.round(this.height,2);
		bounds.left=Filament.round(this.worldTransform.tx-this.anchor.x*bounds.width,2);
		bounds.top=Filament.round(this.worldTransform.ty-this.anchor.y*bounds.height,2);
		if(this.edgeSnap){
			bounds.left=Filament.minmax(0,Filament.settings.width-bounds.width,bounds.left);
			bounds.top=Filament.minmax(0,Filament.settings.height-bounds.height,bounds.top);
		}
		return bounds;
	}
	updateUI(delta){
		super.updateUI(delta);
		if(this.resizable){
			this.width=Filament.minmax(this.minwidth,this.maxwidth,this.width);
			this.height=Filament.minmax(this.minheight,this.maxheight,this.height);
		}
		let bounds = this.getBoundsUI(true);
		const windex = this.scene.windows.indexOf(this);
		this.setProperties({
			"--width"	:	bounds.width,
			"--height"	:	bounds.height,
			"--x"		:	bounds.left,
			"--y"		:	bounds.top,
			"--z"		:	this.zIndex+windex/1000,
			"--alpha"	:	this.worldAlpha,
		});
		this.setAttributes({
			"data-frame"		:	this.hasFrame,
			"data-interactive"	:	this.interactive,
			"data-movable"		:	this.movable,
			"data-resizable"	:	this.resizable,
			"data-closable"		:	this.closable,
		});
	}
	updateDrag(event){
		this.x+=event.movementX/Filament.scale;
		this.y+=event.movementY/Filament.scale;
	}
	finishDrag(event){
		if(this.edgeSnap){
			this.x=Filament.minmax(0,Filament.settings.width-this.width,this.x);
			this.y=Filament.minmax(0,Filament.settings.height-this.height,this.y);
		}
	}
	updateResize(event){
		this.width=Math.min(Filament.settings.width-this.x, this.width+event.movementX/Filament.scale);
		this.height=Math.min(Filament.settings.height-this.y, this.height+event.movementY/Filament.scale);
		this.resizing=false;
	}

	get text(){ return this.content.innerHTML; }
	set text(value){

	}
}

window.addEventListener('mousemove',event=>{
	if(!Filament.scene){ return; }
	for (const win of Filament.scene.windows){
		if (win.dragging){ win.updateDrag(event); }
		if (win.resizing){ win.updateResize(event); }
	}
});
window.addEventListener('mouseup',event=>{
	if(!Filament.scene){ return; }
	for (const win of Filament.scene.windows){
		win.dragging=false;
		win.finishDrag();
	}
});