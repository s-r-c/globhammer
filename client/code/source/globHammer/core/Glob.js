"use strict";

//"Let that which does not matter truly slide."
//no rule lasts forever

var Glob = function ( $name, $create, $physics ) { 
	
	var chance = new Chance();

	var core 		= '/globHammer/core/glob/GlobCore';
	var control		= '/globHammer/core/glob/GlobControl';
	var content		= '/globHammer/core/glob/GlobContent';
	var event       = '/globHammer/core/glob/GlobEvent';

	core 			= require( core )( $name );
	event 			= require( event )( core );
	control			= require( control )( core, event );
	content			= require( content )( core, control );
	
	var self 		= Object.create( module, {
	core: 				{ value:core 	},
	control: 			{ value:control },
	content: 			{ value:content },
	event:      		{ value:event   }
	});


	self.core.glob = self;

	Object.defineProperty( self, "debug", 			{ configurable:true, get:function(){ 			return self.core.debug; 	}} );
	Object.defineProperty( self, "debug", 			{ configurable:true, set:function( input ){  	self.core.debug = input  	}} );

	Object.defineProperty( self, "now", 			{ configurable:true, get:function(){ return self.core.now; }} );
	
	Object.defineProperty( self, "soulLayer", 		{ configurable:true, get:function(){ return self.content.soulLayer; 	}} );
	Object.defineProperty( self, "landscapeLayer", 	{ configurable:true, get:function(){ return self.content.environment; 	}} );
	Object.defineProperty( self, "uiLayer", 		{ configurable:true, get:function(){ return self.content.uiLayer; 		}} );
	Object.defineProperty( self, "physicsLayer", 	{ configurable:true, get:function(){ return self.content.physicsLayer; 		}} );
	
	
	Object.defineProperty( self, "round", 		{ configurable:true, get:function(){ return self.control.time.round; }} );
	

	Object.defineProperty( self, "height", 	{ configurable:true, get:function(){ return self.core.height; }} );
	Object.defineProperty( self, "height", 	{ configurable:true, set:function( input ){  
												self.core.height = input;
												//self.content.resize();  
											}});
	
	Object.defineProperty( self, "width", 	{ configurable:true, get:function(){ return self.core.width; }} );
	Object.defineProperty( self, "width", 	{ configurable:true, set:function( input ){  
												self.core.width =  input;
												//self.content.resize();  
											}} );

	Object.defineProperty( self, "x", 		{ configurable:true, get:function(){ return self.core.x; }} );
	Object.defineProperty( self, "x", 		{ configurable:true, set:function( input ){ 
	self.core.x =  input; 
	self.content.render(); 
	}} );

	Object.defineProperty( self, "y", 		{ configurable:true, get:function(){ return self.core.y; }} );
	Object.defineProperty( self, "y", 		{ configurable:true, set:function( input ){  
	self.core.y =  input;
	self.content.render(); 

	}} );

	//PUBLIC API
	//HMM i dont know if you use this anymore
	Object.defineProperty( self, "fileList", { set:function( input ){ self.control.requestFileList( input.root, input.dir, input.soulLocation ) }} );

	Object.defineProperty( self,  "world", 	{ set:function  ( input ){  return self.control.world(  input ) }});
	
	Object.defineProperty( self, "zoom", 	{  configurable:true, set:function( input ){  
		self.core.cameraZoom = input;

		self.content.soulLayer.scale.y = input;
		self.content.soulLayer.scale.x = input;

		//self.content.environment.scale.y = input;
		//self.content.environment.scale.x = input;
	}});

	Object.defineProperty( self, "scale", 	{ configurable:true, get:function(){  return self.content.soulLayer.scale.x; }});
	
	Object.defineProperty( self, "name", 	{ get:function(){ return self.core.name; }} );
	Object.defineProperty( self, "glob", 	{ get:function(){ return self.core.glob; }} );
	
	Object.defineProperty( self, "server", 	{ configurable:true,  get:function(){ return self.core.server; }} );
	Object.defineProperty( self, "UUID", 	{ get:function(){ return self.control.createUID() ; }} );

	Object.defineProperty( self, "stage", 	{  configurable:true, set:function( input ){return self.control.createStage( input ) }} );
	Object.defineProperty( self, "stage", 	{  configurable:true, get:function(){ return self.core.stage; }} );

	Object.defineProperty( self, "server", 	{ configurable:true, set:function( input ){return self.control.updateServer( input ) }} );
	Object.defineProperty( self, "loader", 	{ configurable:true, set:function( input ){return self.control.updateLoader( input ) }} );

	Object.defineProperty( self, "focus", 	{ configurable:true, set:function( input ){
	//FOCUS CODE HERE
	return  

	}} );

	self.rockFile				= function( dir, file ){ 
    	var location;
		if ( file == null ) location = GLOB.src + GLOB.srcFolder + dir + '/index.js';
    	if ( file != null ) location = GLOB.src + GLOB.srcFolder + dir + '/' + file + '.js';
    	if ( self.core.preload == null ) self.core.preload = [];
    	self.core.preload.push( location );
    	return location;
  	}

  	self.addRock				= function( rock, x, y ){
  		
  		if ( typeof rock  == 'string' ){
  			var data = {};
    		data.src = rock;
    		if ( x != null ) data.x = x;
    		if ( y != null ) data.y = y;
    		return self.rock( data );
  		}

  		//if( rock instanceof String ) {
  			
    	//}


  	}

	self.addBound				= function( x, y, w, h ){ self.content.addBoundary( x, y, w, h )		} 

	self.removeRockPhysics 	= function( rock )	{ self.control.removeRockPhysics( rock );	}
	
	self.addEventListener 		= function( id, vars )	{ self.event.addEventListener( id, vars )	;	}
	self.removeEventListener 	= function( id, vars )	{ self.event.removeEventListener( id, vars );	}
	self.dispatchEvent 			= function( id, vars )	{ self.event.dispatchEvent( id, vars  )		;	}

	self.rock 				= function( input 	)	{ return self.control.addRock( input );		}
	self.removeRock			= function( rock  )   { self.control.removeRock( rock );  		}
	
	self.awake = function(){
		self.event.addEventListener("WORLD_AWAKE", self.worldAwake );
		self.control.awake();
		self.content.awake();	
	}

	self.updateCamera = function( zoom, x, y ){
		//if ( zoom != null 	) self.glob.zoom = zoom;
		//if ( x != null 		) self.glob.x = x;
		//if ( y != null		) self.glob.y = y;
	}

	self.worldAwake = function( world ){
		//put the preload 
    	GLOB.title.addEventListener( GLOB.title.event.COMPLETE, self.titleAwakeComplete );
    	GLOB.title.awake( self.core.preload );
	}

	self.titleAwakeComplete = function(){
		GLOB.title.removeEventListener( GLOB.title.event.COMPLETE, self.titleAwakeComplete );
    	
		var world = self.core.world;
		world.awakeComplete( self );
	}

	self.rockAwake = function( rock ){
	 	
	 	//replace the default content with whats needed
	 	var content;

	 	var dir = "/globHammer/core/rock/content/";
	 	if ( rock.soul.content != null ){
	 		content = require( dir + rock.soul.content )( rock.core, rock.control );
			if ( content != null ) rock.content = content; 
	 	} 
		
	 	rock.awake();

	 	self.event.dispatch( self.event.AVATAR_AWAKE, [ rock ]);
	}

	self.run = function(){
		self.content.run();
	}

	self.createUI = function ( type ){
	    var dir = "/globHammer/ui/content/";
	    var ui = require(dir + type)(self.core.glob);
	    return ui;
	}

	self.createCommand = function( type, source, target ){
		//var thing = "/globHammer/core/command/";
		//trace("dir " + thing );
		//return require( thing + "/Heal" )( self.core.glob, source, target );
	}

	self.fate = function( value, difficulty ){

		var diff;
		var val;
		var drama = false;

		if (  isNaN( value ) == true ) 	val = 1;
		if (  isNaN( value ) == false ) val = value;

		if (  isNaN( difficulty ) == true ) 	diff = 8;
		if (  isNaN( difficulty ) == false ) 	diff = difficulty;

		if ( val == 0 ){
			drama = true;
			val = 1;
		}

		var roll = val + "d10";
		var list = chance.rpg( roll );

		var max = list.length;

		var success = 0;

		for ( var i = 0; i < max; i++ ){

			var attempt = list[ i ];
			if ( attempt == 10 ){
				success += 1;
				list[ i ] = chance.rpg( "1d10" );
				i -= 1;
				continue;
			}

			if ( attempt >= diff ) success += 1;
			if ( ( drama == true ) && ( attempt == 1 ) ) success = -1;
		}

		return success;

	}

	return self; 
};

exports = module.exports = Glob;




