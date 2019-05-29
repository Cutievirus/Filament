Filament.Enum = class Enum{
	constructor(...values){
		for (const value of values){
			this[value]=value;
		}
	}
};

Filament.SCALE_MODE = new Filament.Enum(
	"NORMAL","NEAREST","HYBRID"
);

Filament.settings = {
	slug: 'filament',
	width: 320,
	height: 240,
	tileSize: 16,
	cellSize: 24,
	scaleMode: Filament.SCALE_MODE.HYBRID,
	_maintainAspectRatio: 1,
	get maintainAspectRatio(){ return this._maintainAspectRatio<1?Infinity:this._maintainAspectRatio; },
	set maintainAspectRatio(value){ this._maintainAspectRatio=value<1?Infinity:value; },
	_uiRes:0,
	get uiRes(){ return this._uiRes>0?this._uiRes:Filament.scale; },
	set uiRes(value){ this._uiRes=value; },
	language:'en',
};

Filament.configure=options=>{
	Object.assign(Filament.settings,options);
};

Filament.loadSettings=async function(){
	const settings = await (await fetch(Filament.gameFile('settings.json'))).json();
	Filament.configure(settings);
	Filament.determineScale();

	const body = document.body.style;
	body.setProperty('--uiRes',Filament.settings.uiRes);
	body.setProperty('--screen-width',Filament.settings.width);
	body.setProperty('--screen-height',Filament.settings.height);
	body.setProperty('--tileSize',Filament.settings.tileSize);
};

Object.defineProperties(Filament,{
	pixiScaleMode:{
		get:()=>Filament.settings.scaleMode===Filament.SCALE_MODE.NORMAL ? PIXI.SCALE_MODES.LINEAR : PIXI.SCALE_MODES.NEAREST
	}
});