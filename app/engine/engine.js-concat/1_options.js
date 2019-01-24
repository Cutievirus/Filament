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
Filament.INDENT_MODE =  new Filament.Enum(
	"TAB","SPACE"
);

Filament.settings = {
	width: 320,
	height: 240,
	tileSize: 16,
	cellSize: 24,
	scaleMode: Filament.SCALE_MODE.HYBRID,
	maintainAspectRatio: true,
	uiRes:1,
	tabSize:4,
	indentMode:Filament.INDENT_MODE.TAB,
};

Filament.configure=options=>{
	Object.assign(Filament.settings,options);
};

Filament.loadSettings=async function(){
	const settings = await (await fetch("game/settings.json")).json();
	Filament.configure(settings);
};