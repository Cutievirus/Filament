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
		for (const callback of eventlist){
			event.remove=Filament.MixinEvents.removeEvent.bind(this,eventname,callback);
			if(typeof callback === 'function'){ callback(event); }
		}
		
	},
	addEvent(eventname,callback){
		return Filament.arrayAdd(this.getEventList(eventname,true),callback);
	},
	removeEvent(eventname,callback){
		const eventlist = this.getEventList(eventname,false);
		if(!eventlist){ return false; }
		return Filament.arrayRemove(this.events[eventname],callback);
	}
}

Filament.MixinEventHandler={
	eventHandler(eventname,event){
		if(typeof this.fireEvent==='function'){
			this.fireEvent(eventname,event);
		}

	},
	addEventHandler(eventname,addListener=true){
		const handler = `${eventname}Handler`;
		this[handler]=this.eventHandler.bind(this,eventname);
		if(addListener){
			Filament.parent.addEventListener(eventname,this[handler]);
		}
	},
}