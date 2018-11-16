const EbRPG = {};

// register components

// setup vue

EbRPG.vue = new Vue({ 
	el:'#wrapper',
	data:{
		activeScreen:null,
		screens:[],
	}
});

// add screens

EbRPG.addScreen=(name,component)=>{
	const v = EbRPG.vue.$data;
	const screen = {
		id: v.screens.length,
		name: name,
		component: component,
	};
	if(v.screens.length===0){ v.activeScreen = screen; }
	v.screens.push(screen);
};

EbRPG.addScreen("Map",{
	template:`<div id="screen-game">
		<canvas id="pixi-canvas"></canvas>
		<div id="ui-container"></div>
	</div>`,
	mounted(){
		// run game script
		EbRPG.loadScript([
			"game/engine/engine.js",
			"game/engine/editor.js",
			"game/game.js",
		]);
	},
});

EbRPG.loadScript=(sources, callback)=>{
	if( !(sources instanceof Array) ){ sources = [sources]; }
	const script = document.createElement("script");
	script.src = sources.shift();
	if( sources.length ) {
		script.onload = EbRPG.loadScript.bind(null,sources,callback);
	}else if( callback ){
		script.onload = callback;
	}
	document.head.append(script);
};