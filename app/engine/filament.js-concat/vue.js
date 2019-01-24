// register components

// setup vue

Filament.vue = new Vue({ 
	el:'#wrapper',
	data:{
		activeScreen:null,
		screens:[],
	}
});

// add screens

Filament.editorScreen=(name,component)=>{
	const v = Filament.vue.$data;
	const screen = {
		id: v.screens.length,
		name: name,
		component: component,
	};
	if(v.screens.length===0){ v.activeScreen = screen; }
	v.screens.push(screen);
};

Filament.editorScreen("Map",{
	template:`<div id="screen-game">
		<canvas id="pixi-canvas"></canvas>
		<div id="ui-container"></div>
	</div>`,
	mounted(){
		// run game script
		Filament.loadGame();
	},
});