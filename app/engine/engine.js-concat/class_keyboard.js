Filament.keyboard={
	keys:{},
	keyEventHandler(eventname,event){
		const key = this.getKey(event.key,false);
		if(typeof key[eventname] === 'function')key[eventname]();
		for (const keygroup of key.keygroups){
			keygroup.fireEvent(eventname,event);
		}
	},
	addEventHandler(keyname){
		this[`${keyname}Handler`]=this.keyEventHandler.bind(this,keyname);
	},
	getKey(keyname,create){
		if(!(keyname in this.keys) && create){
			this.keys[keyname]=new Filament.Key(keyname);
		}
		return this.keys[keyname];
	}
};
Filament.keyboard.addEventHandler('keydown');
Filament.keyboard.addEventHandler('keyup');

Filament.parent.addEventListener('keydown',Filament.keyboard.keydownHandler);
Filament.parent.addEventListener('keyup',Filament.keyboard.keyupHandler);

Filament.Key = class{
	constructor(name){
		this.name=name;
		this.isDown=false;
		this.keygroups=[];
	}
	keydown(){
		this.isDown=true;
	}
	keyup(){
		this.isDown=false;
	}
}

Filament.KeyGroup = class{
	constructor(name,keynames=[]){
		this.name=name;
		this.keys=[];
		for (const keyname of keynames){
			this.addKey(keyname);
		}
		//Filament.mixin(this,Filament.EventMixin);
		this.implement(Filament.KeyGroup);
	}
	addKey(keyname){
		const key = Filament.keyboard.getKey(keyname,true);
		Filament.arrayAdd(key.keygroups,this);
		Filament.arrayAdd(this.keys,key);
	}
	removeKey(keyname){
		const key = Filament.keyboard.getKey(keyname,false);
		if(!key){ return; }
		Filament.arrayRemove(key.keygroups,this);
		Filament.arrayRemove(this.keys,key);
	}
	get isDown(){
		for (const key in this.keys){
			if(key.isDown){ return true; }
		}
		return false;
	}
}
Filament.mixin(Filament.KeyGroup, Filament.MixinEvents);