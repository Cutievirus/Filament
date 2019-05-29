Filament.pixiCanvas = document.querySelector("#screen-game canvas");
Filament.parent = Filament.pixiCanvas.parentElement;
Filament.ui_container = document.getElementById("ui-container");
Filament.pixi = new PIXI.Application({
	view: Filament.pixiCanvas,
	width: Filament.settings.width,
	height: Filament.settings.height,
	backgroundColor:0x000088,
});
Filament.origin=new PIXI.Point(0,0);

Filament.start=async function(){
	await Filament.loadSettings();
	Filament.pixiContext = Filament.pixiCanvas.getContext("2d");
	if( Filament.settings.scaleMode === Filament.SCALE_MODE.HYBRID ){
		Filament.hybridCanvas = document.createElement('canvas');
		Filament.hybridContext = Filament.hybridCanvas.getContext("2d");
		Filament.hybridCanvas.id="hybrid-canvas";
		Filament.pixiCanvas.parentElement.appendChild(Filament.hybridCanvas);
		Filament.pixiCanvas.style.opacity=0;
	}

	Filament.ui_container.style.setProperty('--width', Filament.settings.width*Filament.settings.uiRes);
	Filament.ui_container.style.setProperty('--height', Filament.settings.height*Filament.settings.uiRes);

	window.addEventListener('resize',Filament.resize);
	Filament.resize();
	Filament.ticker = Filament.pixi.ticker.add(Filament.update,Filament);

	Filament.events.fireEvent('start');

	for (const scene of Object.values(Filament.scenes)){
		scene.start();
	}
};

Filament.update=()=>{
	const delta = Filament.ticker.elapsedMS/1000;

	if(Filament.scene){
		Filament.scene.update(delta);
		Filament.scene.updateUI(delta);
	}

	if(Filament.hybridCanvas){
		Filament.pixi.render();
		Filament.hybridContext.drawImage(
			Filament.pixiCanvas,
			0,0, Filament.pixiCanvas.width, Filament.pixiCanvas.height,
			0,0, Filament.hybridCanvas.width, Filament.hybridCanvas.height
		);
	}
};

Filament.roundScale=n=>Math.round(n)||1;

Filament.resize=async()=>{
	if(Filament.electron){
		Filament._resize();
		if(Filament.resizing){ return; }
		Filament.resizing=true;
		for(let i=0;i<10;++i){
			Filament._resize();
			await Filament.sleep(10);
		}
		Filament.resizing=false;
	}else{
		Filament._resize();
	}
}
Filament._resize=()=>{

	let ratio = Filament.parent.offsetWidth/Filament.parent.offsetHeight;
	let default_ratio = Filament.settings.width/Filament.settings.height;
	ratio=Filament.minmax(default_ratio/Filament.settings.maintainAspectRatio,default_ratio*Filament.settings.maintainAspectRatio,ratio)
	if(ratio>default_ratio){//wide
		Filament.pixi.renderer.resize(
			Filament.settings.height*ratio,
			Filament.settings.height
		);
	}else{ //tall
		Filament.pixi.renderer.resize(
			Filament.settings.width,
			Filament.settings.width/ratio
		);
	}

	let scale = Filament.determineScale();
	document.body.style.setProperty('--uiRes',Filament.settings.uiRes);

	Filament.pixiCanvas.style.width = Filament.pixiCanvas.width*scale+"px";
	Filament.pixiCanvas.style.height = Filament.pixiCanvas.height*scale+"px";
	if(Filament.hybridCanvas){
		Filament.hybridCanvas.width = Filament.settings.width*Filament.roundScale(scale);
		Filament.hybridCanvas.height = Filament.settings.height*Filament.roundScale(scale);
		Filament.hybridCanvas.style.width = Filament.pixiCanvas.style.width;
		Filament.hybridCanvas.style.height = Filament.pixiCanvas.style.height;
		Filament.hybridContext.imageSmoothingEnabled=false;
	}

	Filament.ui_container.style.setProperty('--scale', scale/Filament.settings.uiRes);
	Filament.ui_container.style.setProperty('--left', Filament.parent.offsetWidth/2 - Filament.ui_container.offsetWidth/2);
	Filament.ui_container.style.setProperty('--top', Filament.parent.offsetHeight/2 - Filament.ui_container.offsetHeight/2);
	Filament.ui_container.style.setProperty('--width', Filament.pixiCanvas.width*Filament.settings.uiRes);
	Filament.ui_container.style.setProperty('--height', Filament.pixiCanvas.height*Filament.settings.uiRes);

	Filament.alignScene();

	Filament.events.fireEvent('resize');
};

Filament.determineScale=()=>{
	let scaleX = Filament.parent.offsetWidth / Filament.pixiCanvas.width;
	let scaleY = Filament.parent.offsetHeight / Filament.pixiCanvas.height;
	let scale = Math.min(scaleX,scaleY);
	Filament.scale=scale;
	document.body.style.setProperty('--scale',scale);
	return scale;
};

Filament.alignScene=()=>{
	Filament.scene.position.set(
		Math.round((Filament.pixiCanvas.width-Filament.settings.width)/2),
		Math.round((Filament.pixiCanvas.height-Filament.settings.height)/2)
	);
}