new Filament.Scene('home');

Filament.scenes.home.start=function(){
	this.window = new Filament.Window().mount(this);
	this.window.width=100;
	this.window.height=50;
	this.window.x=50;
	this.window.y=25;
	this.window.resizable=true;
	this.window.movable=true;
	this.window.closable=true;
	this.window.content.append("Hello World");
	new Filament.Sprite('ebby.png').mount(this).alpha=0.6;
	new Filament.Sprite('ebby.png').mount(this).x=20;
}

Filament.scenes.home.update=function(){
	
}