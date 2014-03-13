
var Rock = function ( $glob, $location ) { 
	
	var constant   	= '/globHammer/core/rock/RockConstant';
	var core 		= '/globHammer/core/rock/RockCore';
	var control		= '/globHammer/core/rock/RockControl';
	var content		= '/globHammer/core/rock/RockContent';
	var event   	= '/globHammer/core/rock/RockEvent';

	constant 	= require( constant )();	
	core 		= require( core )( $glob, $location );
	event 		= require( event )( core );
	control		= require( control )( core, event, constant, $glob );
	content		= require( content )( core, control );
	
	var self 	= Object.create( module, {
	const: 		{ value:constant },	
	core: 		{ value:core, writable:true 	 },
	control:    { value:control  },
	content:    { value:content, writable:true },
	event:      { value:event   }
	});

	self.collide = function( source, target ){    }

	self.show = function ( id ) { self.content.show( id ); }

	self.remove = function(rock){ 
		if ( self.content.remove == null ) return trace( "remove::: does not exist " );
		self.content.remove();
	}

	self.state 			= function ( state ) { return self.control.state( state ); 	}
	self.addState 		= function ( state ) { self.control.addState( state); 		}
	self.removeState 	= function ( state ) { self.control.removeState( state); 	}

	self.executeCurrentCommand = function( target ){
		var command = self.commandIndex( 0 );
		command.execute( target );
	}

	self.addTarget = function( rock ){
		self.core.target = rock;
		return self.rock;
	}

	self.createCommand = function( type, target, source ){
		var dir = "/globHammer/core/command/";
		if ( source == null ) require( dir + type )( self.core.glob, target, self.rock );
		return require( dir + type )( self.core.glob, target, source );
	}

	self.stat = function( name ){
		var stat = 0;
		if ( self.core[ name ] != null ) stat = self.core[ name ];
		return stat;
	}

	self.skill = function( name ){
		var skill = -1;
		if ( self.core.skill[ name ] != null ) skill = self.core.skill[ name ];
		return skill;
	}

	Object.defineProperty( self, "command", 		{ configurable:true, get:function(){ return self.core.command; }} )
	Object.defineProperty( self, "commandAmount", 	{ configurable:true, get:function(){ return self.core.commandList.length; }} )

	self.commandIndex = function( value )			{ return self.core.commandList[ value ] }

	self.addWound 		= function( wound, value ) 	{ self.control.addWound( value, wound ) }
	self.removeWound 	= function( wound ) 		{ self.control.removeWound( wound )		}
	self.dodge			= function()				{ self.control.dodge() 					}

	self.awake = function()							{ 	
													self.content.awake( self.rock );
													if ( self.soul.awake != null ) self.soul.awake( self.rock );			  		
													return ; 
													};

	self.execute = function( rock ){ 
		self.control.execute();
		self.content.execute();
		if ( self.core.soul == null ) return; 
		if ( self.core.soul.execute == null ) return;
		self.core.soul.execute( rock );	
	};

	self.addEventListener 		= function( id, vars 	)	{ self.event.addEventListener( id, vars )	;}
	self.removeEventListener 	= function( id, vars	)	{ self.event.removeEventListener( id, vars );}
	self.dispatchEvent 			= function( id, vars 	)	{ self.event.dispatchEvent( id, vars  )		;}
	//self.core.glob = self;

	//PUBLIC API
	Object.defineProperty( self, "soul", { configurable:true, set:function( input ){ 
		self.control.injectSoul( input );
		self.dispatchEvent( "SOUL_AWAKE", [ self ] ); 
	}} );

	Object.defineProperty( self, "visible", { configurable:true, set:function( input )	{ return self.display.visible = input; 	}} );
	Object.defineProperty( self, "visible", { configurable:true, get:function()			{ return self.display.visible 			}} );

	Object.defineProperty( self, "soul", { configurable:true, get:function(){ return self.core.soul; }} );
	Object.defineProperty( self, "rock", { configurable:true, get:function(){ return self.core.rock; }} );

	Object.defineProperty( self, "scaleX", { configurable:true, set:function( input )	{ return self.display.scale.x = input; 	}} );
	Object.defineProperty( self, "scaleX", { configurable:true, get:function()			{ return self.display.scale.x 			}} );

	Object.defineProperty( self, "scaleY", { configurable:true, set:function( input )	{ return self.display.scale.y = input; 	}} );
	Object.defineProperty( self, "scaleY", { configurable:true, get:function()			{ return self.display.scale.y 			}} );

	Object.defineProperty( self, "show", { set:function( input ){ 
		return self.content.show( input ); 
	}} );

	Object.defineProperty( self, "run", { get:function(){ 
		return self.content.run(); 
	}} );

	Object.defineProperty( self, "alpha", { configurable:true, set:function( input ){ 
		self.core.alpha = input;
		self.display.alpha = self.core.alpha;
		//trace( "ALPHA :: " + self.core.alpha );
	}} );


	Object.defineProperty( self, "momentum", { configurable:true, set:function( input ){ self.core.momentum = input }} );
	Object.defineProperty( self, "momentum", { configurable:true, get:function(){ return self.core.momentum; }} );

	Object.defineProperty( self, "parent", 	 { configurable:true, set:function( input ){ self.core.parent = input }} );
	Object.defineProperty( self, "parent",   { configurable:true, get:function(){ return self.core.parent; }} );

	Object.defineProperty( self, "globIndex", { configurable:true, set:function( input ){ self.control.updateGlobIndex( input ) }} );
	Object.defineProperty( self, "globIndex", { configurable:true, get:function(){ return self.core.globIndex; }} );

	Object.defineProperty( self, "vx", { configurable:true, get:function(){ return self.core.body.vx; }} );

	Object.defineProperty( self, "target", { configurable:true, set:function( input ){ self.control.addTarget( input ) }} );
	Object.defineProperty( self, "target", { configurable:true, get:function( input ){ return self.core.target  }} );
	
	
	Object.defineProperty( self, "alpha", { configurable:true, get:function(){ return self.core.alpha }} );

	Object.defineProperty( self, "globIndex", { configurable:true, set:function( input ){ self.control.updateGlobIndex( input ) }} );
	Object.defineProperty( self, "globIndex", { configurable:true, get:function(){ return self.core.globIndex; }} );

	Object.defineProperty( self, "src", { configurable:true, set:function( input ){ self.control.updateLocation( input ) }} );
	Object.defineProperty( self, "src", { configurable:true, get:function(){ return self.core.location; }} );

	Object.defineProperty( self, "x", { configurable:true, set:function( input ){ self.control.updateX( input ) }} );
	Object.defineProperty( self, "x", { configurable:true, get:function(){ return self.core.x; }} );

	Object.defineProperty( self, "y", { configurable:true, set:function( input ){ self.control.updateY( input ) }} );
	Object.defineProperty( self, "y", { configurable:true, get:function(){ return self.core.y; }} );


	Object.defineProperty( self, "focusX", 		{ configurable:true, get:function(){ return self.core.focusX; }} );
	Object.defineProperty( self, "focusY", 		{ configurable:true, get:function(){ return self.core.focusY; }} );
	Object.defineProperty( self, "focusZ", 		{ configurable:true, get:function(){ return self.core.focusZ; }} );

	Object.defineProperty( self, "height", 		{ configurable:true, get:function(){ return self.core.height; }} );
	Object.defineProperty( self, "width", 		{ configurable:true, get:function(){ return self.core.width; }} );

	Object.defineProperty( self, "toon",	 	{ configurable:true, get:function(){  self.content.currentToon;	}} );

	Object.defineProperty( self, "name", 		{ get:function(){ return self.core.name; } , configurable:true } );
	Object.defineProperty( self, "name", 		{ set:function( value ){ self.core.name = value; 	}, configurable:true } );
	
	Object.defineProperty( self, "id", 			{ get:function(){ return self.core.id; 			}} );
	
	Object.defineProperty( self, "glob", 		{ configurable:true, set:function( input ){ self.core.glob = input }} );
	Object.defineProperty( self, "glob", 		{ configurable:true, get:function(){ return self.core.glob;  }} );


	Object.defineProperty( self, "body", 		{ get:function(){ return self.core.body; 		}} );
	Object.defineProperty( self, "shape", 		{ get:function(){ return self.core.shape; 		}} );

	Object.defineProperty( self, "display", 	{ get:function(){ return self.content.display; 	}} );

	//Object.defineProperty( self, "create", 	{ set:function( input ){return self.core.create = input }} );
	self.core.rock = self;

	//Empty Public Actions which can be chained without need to include () 
	
	//Object.defineProperty( self, "start", 	{ get:function(){ return self.control.start(); }} );
	//Object.defineProperty( self, "stop", 	{ get:function(){ return self.control.stop(); }} );

	return self; 
};

exports = module.exports = Rock;