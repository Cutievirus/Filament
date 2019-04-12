Filament.mouse={
    eventHandler(eventname,event){
        const canvasBounds = Filament.pixiCanvas.getBoundingClientRect();
        event.canvasX=(event.clientX-canvasBounds.x)/Filament.scaleX;
        event.canvasY=(event.clientY-canvasBounds.y)/Filament.scaleY;
		this.fireEvent(eventname,event);
	},
}
Filament.mixin_object(Filament.mouse,Filament.MixinEvents);
Filament.mixin_object(Filament.mouse,Filament.MixinEventHandler);

Filament.mouse.addEventHandler('click');
Filament.mouse.addEventHandler('dblclick');
Filament.mouse.addEventHandler('mousedown');
Filament.mouse.addEventHandler('mouseup');
Filament.mouse.addEventHandler('mousemove');