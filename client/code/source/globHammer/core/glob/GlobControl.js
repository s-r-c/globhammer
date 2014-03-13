"use strict";

var GlobControl = function ( $core, $event ) { 
	
	var rockControl 		= '/globHammer/core/glob/control/RockControl';
	var timeControl			= '/globHammer/core/glob/control/TimeControl';
	
	rockControl	 		    = require( rockControl )( $core, $event );
	timeControl			 	= require( timeControl )( 	$core, $event );

	var self = Object.create( module, { 
	core:{ value:$core },
	rock:{ value:rockControl },
	time:{value:timeControl},
	event:{value:$event  }
	});

	self.removeRockPhysics = function( rock ){
		if ( rock.body 	!= null ) self.core.bodyRemoveList.push( 	rock 	);
		if ( rock.shape 	!= null ) self.core.shapeRemoveList.push( 	rock 	);
	}

	self.awake = function (){
		self.core.startTime = Date.now();
		self.core.prevTime = self.core.startTime; 
  		return self.core.glob;
	}

	self.execute = function (){
		self.time.execute();
		self.rock.execute();
	}

	//AVATAR METHODS
	//{src:'src/RockType.js', x:10, y:10 }
	self.addRock 		= function( data ){ 	return self.rock.rock( data ) 	};
	self.removeRock 	= function( rock ){ 	self.rock.removeRock( rock ) };
	//WORLD METHODS
	//Glob Manifests the World

	self.world = function( data ){
		var core = self.core;
		ss.rpc('world.fetchWorld', data ); //needs to be moved into server control
	}

	//FETCH ME A WORLD BABY
	//THank U
	self.worldFromBeyond = function( worldData ){
		var world = worldData;
		eval(world); //checks out

		if (self.core.world != null) self.resetWorld();
		self.core.world = world;

		world.awake(self.core.glob);
		
		if ( world.bounds != null ) self.createBounds();
		self.event.dispatch( self.event.WORLD_AWAKE, [ world ] );
	}

	self.resetWorld = function () {

	    var max = self.core.rockList.length;
	    for (var i = 0; i < max; i++) {
	        var rock = self.core.rockList[i];
	        self.rock.removeRock( rock );
	    }
	}

	self.createBounds = function(){
		var world 	= 	self.core.world;
		var bounds  =  	world.bounds;
    	var max     =  	bounds.length;

    	if ( world.startX == null ) world.startX = 0;

    	for (var i = 0; i < max; i++) {
      	var data = bounds[ i ];
      	self.core.glob.addBound( world.startX + data.x, data.y, world.startX + data.w, data.h );  
    	}

	}

	self.trace = function( message ){  console.log( "Server Says!: " + message ); }

	ss.event.on('addWorld',     self.worldFromBeyond );
	ss.event.on('trace',        self.trace);

	return self; 
};

exports = module.exports = GlobControl;