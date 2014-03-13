"use strict";

var TimeControl = function ( $core, $event ) { 
	
	var self = Object.create( module, { 
	core:{ 		value:$core  },
	event:{   value:$event }
	});

	Object.defineProperty( self, "round", { configurable:true, get:function(){ 
		self.core.now = Date.now();
  		var dt = ( self.core.now - self.core.last) / 1000; // I DON THINK THIS DOES ANYTHING
  		var passed =  ( self.core.now - self.core.start ) * .001;
		return Math.floor( passed / self.core.tickToRound ); 
	}} )

	self.calcRound = function ( value ){
		var passed =  ( value - self.core.start ) * .001;
		return Math.floor( passed / self.core.tickToRound );
	}


	self.execute = function (){		
  		var before = self.core.now;
  		var lastRound = self.calcRound(  before );
  		
  		self.core.now = Date.now();
  		var dt = ( self.core.now - self.core.last) / 1000;
  		var passed = Math.floor( ( self.core.now - self.core.start ) * .001 );
  		self.core.last = self.core.now;

  		var thisRound = self.round;
  		if ( lastRound != thisRound ) self.event.dispatch( self.event.ROUND );
	} 

	//INIT VARS HERE
	self.core.start =  Date.now();
	return self; 
};

exports = module.exports = TimeControl;