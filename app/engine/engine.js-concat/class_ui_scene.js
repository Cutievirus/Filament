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
				if(value===Filament.scenes[key]){
					Filament.activeScene=key;
					break;
				}
			}
		}
		if(Filament.activeScene===oldScene){ return; }
		for (const key in Filament.scenes){
			const scene = Filament.scenes[key];
			if(Filament.activeScene===scene.name){
				scene.enable();
				scene.enter();
			}else if (scene.enabled){
				scene.disable();
				scene.leave();
			}
		}
		Filament.alignScene();
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
		this.setAttribute('data-visible',false);
	}
	enable(){
		super.enable();
		this.setAttribute('data-visible',true);
	}
	disable(){
		super.disable();
		this.setAttribute('data-visible',false);
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