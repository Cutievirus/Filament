Filament.mouse={}
Filament.mixin_object(Filament.mouse,Filament.MixinEvents);
Filament.mixin_object(Filament.mouse,Filament.MixinEventHandler);

Filament.mouse.addEventHandler('click');
Filament.mouse.addEventHandler('dblclick');
Filament.mouse.addEventHandler('mousedown');
Filament.mouse.addEventHandler('mouseup');
Filament.mouse.addEventHandler('mousemove');