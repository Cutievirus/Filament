Filament.MixinEvents={
	implement(){
		this.events={};
	},
	getEventList(eventname,create){
		if(!(eventname in this.events) && create){
			this.events[eventname]=[];
		}
		return this.events[eventname];
	},
	fireEvent(eventname,event={}){
		const eventlist=this.getEventList(eventname,false);
		if(!eventlist){ return; }
		for (const entry of eventlist){
			event.remove=Filament.MixinEvents.removeEvent.bind(this,eventname,entry);
			if(entry.context instanceof PIXI.DisplayObject){
				const scene = entry.context.scene;
				if(!scene){
					event.remove();
					continue;
				}else if(scene !== Filament.scene){
					continue;
				}
			}
			if(typeof entry.callback === 'function'){ entry.callback.call(entry.context,event); }
		}
	},
	addEvent(eventname,callback,context){
		const entry = {callback:callback,context:context}
		Filament.arrayAdd(this.getEventList(eventname,true),entry);
		return entry;
	},
	removeEvent(eventname,entry){
		const eventlist = this.getEventList(eventname,false);
		if(!eventlist){ return false; }
		return Filament.arrayRemove(eventlist,entry);
	}
}

Filament.MixinEventHandler={
	eventHandler(eventname,event){
		if(typeof this.fireEvent==='function'){
			this.fireEvent(eventname,event);
		}
	},
	addEventHandler(eventname,listener=Filament.parent){
		const handler = `${eventname}Handler`;
		this[handler]=this.eventHandler.bind(this,eventname);
		if(listener instanceof Object && 'addEventListener' in listener){
			listener.addEventListener(eventname,this[handler]);
		}
	},
}

Filament.events={};
Filament.mixin_object(Filament.events,Filament.MixinEvents);