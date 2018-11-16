EbRPG.SCALE_MODE = {
	NORMAL: 0,
	NEAREST: 1,
	HYBRID: 2,
};

EbRPG.settings = {
	width: 320,
	height: 240,
	tileSize: 16,
	cellSize: 24,
	scaleMode: EbRPG.SCALE_MODE.HYBRID,
	maintainAspectRatio: true,
};

EbRPG.configure=(options)=>{

};

EbRPG.pixiCanvas = document.querySelector("#screen-game canvas");
EbRPG.parent = EbRPG.pixiCanvas.parentElement;
EbRPG.ui_container = document.getElementById("ui-container");
EbRPG.pixi = new PIXI.Application({
	view: EbRPG.pixiCanvas,
	width: EbRPG.settings.width,
	height: EbRPG.settings.height,
	backgroundColor:0x000088
});

EbRPG.start=()=>{
	EbRPG.pixiContext = EbRPG.pixiCanvas.getContext("2d");
	if( EbRPG.settings.scaleMode === EbRPG.SCALE_MODE.HYBRID ){
		EbRPG.hybridCanvas = document.createElement('canvas');
		EbRPG.hybridContext = EbRPG.hybridCanvas.getContext("2d");
		EbRPG.hybridCanvas.id="hybrid-canvas";
		EbRPG.pixiCanvas.parentElement.appendChild(EbRPG.hybridCanvas);
		EbRPG.pixiCanvas.style.opacity=0;
	}

	EbRPG.ui_container.style.width = EbRPG.settings.width+"px";
	EbRPG.ui_container.style.height = EbRPG.settings.height+"px";

	window.addEventListener('resize',EbRPG.resize);
	EbRPG.resize();
	EbRPG.ticker = EbRPG.pixi.ticker.add(EbRPG.update,EbRPG);
};

EbRPG.update=(delta)=>{
	delta = EbRPG.ticker.elapsedMS/1000;

	if(EbRPG.hybridCanvas){
		EbRPG.pixi.render();
		EbRPG.hybridContext.drawImage(
			EbRPG.pixiCanvas,
			0,0, EbRPG.settings.width, EbRPG.settings.height,
			0,0, EbRPG.hybridCanvas.width, EbRPG.hybridCanvas.height
		);
	}
};

EbRPG.resize=()=>{
	let scaleX = EbRPG.parent.offsetWidth / EbRPG.settings.width;
	let scaleY = EbRPG.parent.offsetHeight / EbRPG.settings.height;
	let scale = Math.min(scaleX,scaleY);
	if(EbRPG.settings.maintainAspectRatio){
		scaleX = scaleY = scale;
	}
	EbRPG.pixiCanvas.style.width = EbRPG.settings.width*scaleX+"px";
	EbRPG.pixiCanvas.style.height = EbRPG.settings.height*scaleY+"px";
	if(EbRPG.hybridCanvas){
		EbRPG.hybridCanvas.width = EbRPG.settings.width*Math.round(scaleX);
		EbRPG.hybridCanvas.height = EbRPG.settings.height*Math.round(scaleY);
		EbRPG.hybridCanvas.style.width = EbRPG.pixiCanvas.style.width;
		EbRPG.hybridCanvas.style.height = EbRPG.pixiCanvas.style.height;
		EbRPG.hybridContext.imageSmoothingEnabled=false;
	}
	EbRPG.ui_container.style.transform="scale("+scale+")";
	EbRPG.ui_container.style.left=
		EbRPG.parent.offsetWidth/2 - EbRPG.settings.width/2+"px";
	EbRPG.ui_container.style.top=
		EbRPG.parent.offsetHeight/2 - EbRPG.settings.height/2+"px";
};

// tilemap.js 


PIXI.DisplayObject.prototype.enabled=true;
PIXI.DisplayObject.prototype.enable=function(){
	this.enabled=true;
	this.visible=true;
};
PIXI.DisplayObject.prototype.disable=function(){
	this.enabled=false;
	this.visible=false;
};
PIXI.DisplayObject.prototype.update=function(){};

//# sourceMappingURL=engine.js.map