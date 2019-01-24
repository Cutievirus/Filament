Filament.scenes={};
Filament.activeScene="home";
Object.defineProperty(Filament,"scene",{
	get:()=>Filament.scenes[Filament.activeScene]||Filament.scenes.home,
	set(value){
		const oldScene=Filament.activeScene;
		if(value in Filament.scenes){
			Filament.activeScene=value;
		}else{
			for (const key in Filament.scenes){
				if(value===game.scenes[key]){
					Filament.activeScene=key;
					break;
				}
			}
		}
		if(Filament.activeScene===oldScene){ return; }
		for (const scene of Filament.scenes){
			if(Filament.activeScene===scene.name){
				scene.enable();
				scene.enter();
			}else if (scene.enabled){
				scene.disable();
				scene.leave();
			}
		}
	}
})

Filament.ui_container = document.getElementById("ui-container");

Filament.Scene = class extends Filament.UI{
	constructor(name){
		super();
		this.mountUI(Filament.ui_container);
		this.mount(Filament.pixi.stage);
		Filament.scenes[name] = this;
		this.id="scene-"+name;
		this.classList.add("scene");
		this.name=name;
		this.windows=[];
	}
	updateUI(delta){
		super.updateUI(delta);
		for (let i=this.windows.length-1; i>=0; --i){
			this.windows[i].updateUI(delta);
		}
	}
	start(){}
	enter(){}
	leave(){}
}