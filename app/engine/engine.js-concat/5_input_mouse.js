Filament.mouse={
	eventHandler(eventname,event){
		const canvasBounds = Filament.pixiCanvas.getBoundingClientRect();
		event.canvasX=(event.clientX-canvasBounds.x)/Filament.scaleX;
		event.canvasY=(event.clientY-canvasBounds.y)/Filament.scaleY;
		event.worldX=event.canvasX;
		event.worldY=event.canvasY;
		this.fireEvent(eventname,event);
	},
}
Filament.mixin_object(Filament.mouse,Filament.MixinEvents);
Filament.mixin_object(Filament.mouse,Filament.MixinEventHandler);

Filament.mouse.addEventHandler('click');
Filament.mouse.addEventHandler('dblclick');
Filament.mouse.addEventHandler('mousedown');
Filament.mouse.addEventHandler('mouseup',window);
Filament.mouse.addEventHandler('mousemove');

Filament.mouse.addEvent('mousedown',event=>{
	Filament.mouse.isDown=true;
});

Filament.mouse.addEvent('mouseup',event=>{
	Filament.mouse.isDown=false;
})