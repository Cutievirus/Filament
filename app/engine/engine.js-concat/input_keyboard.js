Filament.keyboard={
	keys:{},
	eventHandler(eventname,event){
		const key = this.getKey(event.code,false);
		if(!key){ return; }
		if(typeof key[eventname] === 'function')key[eventname]();
		for (const keygroup of key.keygroups){
			keygroup.fireEvent(eventname,event);
		}
	},
	getKey(keyname,create){
		if(!(keyname in this.keys) && create){
			this.keys[keyname]=new Filament.Key(keyname);
		}
		return this.keys[keyname];
	}
};
Filament.mixin_object(Filament.keyboard,Filament.MixinEventHandler);
Filament.keyboard.addEventHandler('keydown');
Filament.keyboard.addEventHandler('keyup');

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

Filament.keys={};
Filament.KeyGroup = class{
	constructor(name,keynames=[]){
		this.name=name;
		Filament.keys[name]=this;
		this.keys=[];
		for (const keyname of keynames){
			this.addKey(keyname);
		}
		//Filament.mixin(this,Filament.EventMixin);
		this.implement(this,Filament.KeyGroup);
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

new Filament.KeyGroup('CONFIRM',['Enter','Space']);
new Filament.KeyGroup('CANCEL',['Escape']);
new Filament.KeyGroup('UP',['ArrowUp','KeyW']);
new Filament.KeyGroup('LEFT',['ArrowLeft','KeyA']);
new Filament.KeyGroup('DOWN',['ArrowDown','KeyS']);
new Filament.KeyGroup('RIGHT',['ArrowRight','KeyD']);