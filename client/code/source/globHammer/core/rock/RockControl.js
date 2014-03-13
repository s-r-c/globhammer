"use strict";

var RockControl = function ( $core, $event, $const, $glob ) { 
	
	//Create the vars
	var self = Object.create( module, { 
	core:{ 		value:$core  	},
	const:{ 	value:$const 	},
	event:{ 	value:$event 	},
	glob:{ 	value:$glob 	}
	});

	//how about u just override this
	//self.collide 	= null;
	//self.passThru 	= null;

	self.strike = function( target, delay ){
		


		if ( self.last == null ) self.last 		= 0;
		if ( self.delay == null ) self.delay 	= 1;
		if ( self.next == null ) self.next 		= 0;

		if ( delay != null ) {
			self.delay = delay;
			if ( self.core.glob.round < self.next ) return target.dodge();
		}

      	self.last = self.core.glob.round;
      	self.next = self.last + self.delay;

      	if ( target != null ) self.core.target = target;

      	var pool = self.core.rock.stat('touch');
      	pool += self.core.rock.skill('fightClose');
    
      	var fate = self.core.glob.fate( pool );
     	 //if ( fate <= 0 ) return self.target.dodge(); NO DODGING ALLOWED FOR THE TIME BEING
        
    	 //fate = self.glob.fate( self.source.stat('body') ) + fate;
      	 //self.target.addWound( fate, 1 ); 
		target.addWound( 1, 1 );
		self.dispatchEvent( self.event.STRIKE, [ self.core.rock ] );

	}

	self.collide = function( collide ){
		trace("coo ");
	}

	self.addState = function( state ){
		if ( self.state(state) == true ) return;
		self.core.state.push( state );
	}

	self.removeState = function ( state ){
		if ( self.state(state) == false ) return;
		var index = self.stateIndex( state );
		self.core.state.splice( index, 1 );
	}

	self.state = function ( state ){
		var value = self.stateIndex( state );
		if ( value == -1 ) 	return false;
		if ( value != -1) 	return true;
	}

	self.stateIndex = function( state ){
		var check = -1;
		var max = self.core.state.length;
		var i;

		for ( i = max; i >= 0; i-- )
		{
			var stateCheck = self.core.state[ i ];
			if ( stateCheck == null ) 	continue;
			if ( stateCheck == state ) 	check = i;
			if ( stateCheck == state ) 	break;
		}

		return check;
	}

	self.dispatchEvent 	= function( id, vars 	)	{ self.core.rock.dispatchEvent( id, vars  )		;}
	
	self.execute = function( ){
		if ( self.core.ai != null ) 					self.core.ai();
		if ( self.core.woundList.length != 0 )  		self.checkHeal();
		if ( self.state( self.const.STUN ) == true )	self.checkStunRemove(); 		
	}

	self.fetchLife = function(){
		
		return self.core.size;
			}

	self.calcWoundHealTime = function( wound, intensity ){
		if ( intensity == null ) intensity = 1;
		var start 		= wound.start;
		var healTime 	= 0;
		var core 		= self.core;

		if ( wound.value == self.const.BRUISE ) 	healTime = core.healBruise;
		if ( wound.value == self.const.CUT )		healTime = core.healCut;
		if ( wound.value == self.const.MORTAL )		healTime = core.healMortal;

		var tickToRound = core.glob.core.tickToRound;
		var ticksToHeal = tickToRound * healTime * intensity;
		var tickToTime	= ticksToHeal / .001;

		wound.end = wound.start + tickToTime;
	}

	self.checkHeal = function () {		
		var max = self.core.woundList.length;

		var reset = false;
		var index = 0;

		for ( var i = max; i >= 0; i-- ){
			var wound = self.core.woundList[ i ];
			if ( wound == null ) continue

			var now = self.glob.now;
			if ( wound.end >= now ) continue
			var remove = self.healWound( wound );
			reset = true;
			index = i;
			break
		}

		if ( reset == false ) 	return;
		max = self.core.woundList.length;
		if ( max == 0 ) return;

		for ( var i = max; i > 0; i-- ){
			var wound = self.core.woundList[ i - 1 ];
			wound.start = self.glob.now;
			self.calcWoundHealTime( wound, i  );
		}
	}

	self.resetWoundHealTime = function( wound ){
		var max = self.core.woundList.length;
		for ( var i = 0; i < max; i++ ){
			var woundCheck = self.core.woundList[ i ];
			if ( wound.id == woundCheck.id ) continue
			self.calcWoundHealTime( woundCheck, i  );
		}
	}

	self.healWound = function ( wound ){
		var remove = false;
		if ( self.state( self.const.DEAD ) == true ) return;
		wound.value += 1;
		if ( wound.value > 	self.const.BRUISE )		remove = true;
		if ( wound.value > 	self.const.BRUISE ) 	self.removeWound( wound );		
		if ( wound.value <= self.const.BRUISE ) 	wound.start = self.glob.now;
		if ( wound.value <= self.const.BRUISE ) 	self.calcWoundHealTime( wound, 1 );
		self.updateWounds();
		self.dispatchEvent( self.event.HEAL, [ self.core.rock ] );
		return remove;
	}

	self.removeWound = function( wound ){
		if ( self.state( self.const.DEAD ) == true ) return;
		var woundList 	= self.core.woundList;
		var max 		= woundList.length;

		var index = -1;
		for ( var i = 0; i < max; i ++){
			var checkWound = woundList[ i ];
			if ( checkWound.id == wound.id ) index = i;
			if ( checkWound.id == wound.id ) break;
		}

		self.core.wounds[ wound.id ] = null;
		delete self.core.wounds[ wound.id ];
		self.core.woundList.splice( index, 1 );
	}

	self.addWound = function(  woundType, amount ){
		
		if ( amount == null ) 	amount 		= 1;
		if ( wound == null )	woundType 	= 1;

		amount = 1; //TEMP JUST TO GET THE HEAL WORKING

		for ( var i = 0; i < amount; i++ ){
			var wound = self.wound( woundType );
			self.calcWoundHealTime( wound, i + 1 );
			self.updateWounds();
		}


		//CHECK BLEEDING if all the boxes are filled up with CUTS or MORTAL damgage trigger bleed to death
		//Every minute the creature recieves no healing methods upgrade one cut to mortal damage
		var woundList 	= 	self.core.woundList;
		var life 		= 	self.fetchLife();
		var woundAmount = 	woundList.length;
		if ( woundAmount < life ) return

		//TURNING OFF BLEEDING FOR NOW!!!!
		//if ( self.state( self.const.BLEED ) == false ) {
		//	var bleedWound = woundList[ life - 1 ];
		//	if ( bleedWound.value == self.const.CUT ) trace(" trigger bleeding ");
		//}
	
		if ( self.checkDeath() == true ) 	return self.dispatchEvent( self.event.DEAD, [ self.core.rock ] );

		self.checkStun();// ALLOW A KNOCK OUT PUNCH???
		
		//if ( self.state( self.const.STUN ) == false ) {
		//	var globEvent = self.core.glob.event;
		//	globEvent.addEventListener( globEvent.ROUND , self.initRoundStunCheck );		
		//}
	}

	self.bleed = function ( ){
		trace("DO NOTHING NOW ");
	}

	self.wound = function ( value ){	
		if ( self.state( self.const.DEAD ) == true ) return false;

		var woundList 	= 	self.core.woundList;
		var wounds    	=	self.core.wounds;

		var life 		= 	self.fetchLife();
		var woundAmount = 	woundList.length;

		var wound;

		//WOUNDS ARE LESS THAN THEY NEED TO BE
		if ( woundAmount < life ){
			var dir = "/globHammer/core/rock/object/Wound";
			wound 			=  	require( dir )();
			wound.id 		=  	self.createUID();
			wound.start 	= 	self.glob.now;
			wound.value 	= 	value;
			woundList.push( wound );
			self.core.wounds[ wound.id ] = wound;
			self.dispatchWoundEvent( wound );

			//woundAmount += 1;
		}

		if ( woundAmount < life ) return wound;
		wound = woundList[ woundAmount - 1];
		wound.value -= 1;
		self.dispatchWoundEvent( wound );
		wound.start  = 	self.glob.now;
		return wound;
	}

	self.dispatchWoundEvent = function ( wound ) {

		//trace(" dispatchWoundEvent " + wound.value );
		//trace("dispatchWoundEvent " + wound.value );
		if ( wound.value == self.const.BRUISE ) 	self.dispatchEvent( self.event.WOUND_BRUISE, 	[ self.core.rock ] );
		if ( wound.value == self.const.CUT ) 		self.dispatchEvent( self.event.WOUND_CUT,		[ self.core.rock ] );
		if ( wound.value == self.const.MORTAL ) 	self.dispatchEvent( self.event.WOUND_MORTAL, 	[ self.core.rock ] );
		
		//if ( wound.value > 	self.const.BRUISE ) self.dispatchEvent( self.event.WOUND_BRUISE , [ self.core.rock ] );
		//if ( wound.value > 	self.const.BRUISE ) self.dispatchEvent( self.event.WOUND_BRUISE , [ self.core.rock ] );
		
		//if ( wound.value > 	self.const.BRUISE ) 	self.removeWound( wound );		
		//if ( wound.value <= self.const.BRUISE ) 	wound.start = self.glob.now;
		//if ( wound.value <= self.const.BRUISE ) 	self.calcWoundHealTime( wound, 1 );
	}

	self.updateWounds = function (){
		
		var sortable = [];
		var woundCollection = self.core.wounds;

		for (var id in woundCollection ) {
			var wound = woundCollection[ id ];
			sortable.push( [ wound.id, wound.value ] );
		}

		sortable.sort(	function(a,b)	{ return a[1]-b[1]  });

		//now we need to rebuild the wound list
		var newWoundList = [];
		var max = sortable.length;

		for ( var i = 0; i < max; i++ ){
			var sortedWound 	= sortable[ i ];
			var sortedWoundID 	= sortedWound[0];
			var realWound 	= woundCollection[ sortedWoundID ];
			newWoundList.push( realWound );
		}

		self.core.woundList = newWoundList;
	}

	self.checkHealBruise = function (){
		var wounds 		= self.core.wounds; 
		var max 		= wounds.length;
		
		for ( var i = 0; i < max; i++ ){
			var wound = wounds[ i ];
			if ( wound == self.const.BRUISE ) return true
		}

		return false;
	}

	self.initRoundStunCheck = function () {
	//trace("u should init a stun check ")
		self.checkStun();
		if ( self.state( self.const.STUN ) == false ) return

		//var globEvent = self.core.glob.event;
		//globEvent.removeEventListener( globEvent.ROUND , self.initRoundStunCheck );
		//WE GOT A PROBLEM HERE		
	}

	self.checkStun = function(){
		if ( self.state( self.const.STUN ) == true ) return true;		
		
		var grit = self.core.grit;
		var win = self.core.glob.fate( grit );
		if ( win > 0 ) return false;
		self.stun();
		return true
	}

	self.checkStunRemove = function(){
		if ( self.state( self.const.DEAD ) == true  ) return;
		if ( self.state( self.const.STUN ) == false ) return;

		var woundList 	= 	self.core.woundList;
		var life 		= 	self.fetchLife();
		var woundAmount = 	woundList.length;

		if ( woundAmount == life ) return;
		self.removeStun();
	}

	self.checkDeath = function (){
		


		var dead = false;
		var wounds 	= self.core.woundList;
		var life 	= self.fetchLife();

		var amount = wounds.length; 
		if ( amount < life ) return
		var value = wounds.length - 1;

		
		var current = wounds[ value ].value;
		trace("last wound " + current );
		if ( current == -1 ) self.death();
		if ( current == -1 ) dead = true;
		return dead;
	}

	self.death = function () {
		self.core.status = "DEAD";
		self.addState( self.const.DEAD );
		trace("checking death ");
		self.dispatchEvent( self.event.DEAD, [ self.core.rock ] );
	}

	//LOOKING BACK IS A BAD HABIT
	self.removeDeath = function() {
		if ( self.core.status == "DEAD" ) self.core.status = "STUN";
	}

	self.bleed = function(){
		self.addState( self.const.BLEED );
		self.dispatchEvent( self.event.BLEED, [ self.core.rock ] );
	}

	self.stun = function (){
		self.core.status = "STUN";
		self.addState( self.const.STUN );
		self.dispatchEvent( self.event.STUN, [ self.core.rock ] );
	}

	self.removeStun = function(){
		self.core.status = "ALIVE";
		self.removeState( self.const.STUN );
		self.dispatchEvent( self.event.REMOVE_STUN, [ self.core.rock ] );
	}

	self.dodge = function() {
		if ( self.state( self.const.DEAD ) == true ) return;
		if ( self.state( self.const.STUN ) == true ) return;
		
		self.dispatchEvent( self.event.DODGE , [ self.core.rock ] );
	}

	self.addTarget = function ( rock ){
		self.core.targets.push( rock );
	}

	self.updateGlobIndex = function( value ){ self.core.globIndex = value; return self.core.rock; };

	self.updateX = function( value ){ self.core.x = value; return self.core.rock; };
	self.updateY = function( value ){ self.core.y = value; return self.core.rock; };
	
	self.updateLocation = function( value ){ self.core.location = value; return self.core.rock; };
	
	self.createUID = function(){
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    	var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    	return v.toString(16);
		});
		}

	self.injectSoul	= function ( soul ){
		self.core.soul = soul;

		//ADD THE STATS
		if ( soul.size 		!= null )	self.core.size 		= soul.size;
		if ( soul.name 		!= null ) 	self.core.name 		= soul.name;
		if ( soul.touch 	!= null ) 	self.core.touch 	= soul.touch;
		if ( soul.body 		!= null ) 	self.core.body 		= soul.body;
		if ( soul.grit		!= null ) 	self.core.grit  	= soul.grit;
		
		//PHYSICS
		if ( soul.collideType 	!= null )	self.core.collideType 		= soul.collideType;
		if ( soul.physicHeight  != null ) 	self.core.physicHeight 		= soul.physicHeight;
		if ( soul.physicWidth  != null ) 	self.core.physicWidth 		= soul.physicWidth;
		if ( soul.rim 			!= null )	self.core.rim   			= soul.rim;
		if ( soul.offset		!= null )   self.core.offset			= soul.offset;
		if ( soul.mass			!= null )   self.core.mass				= soul.mass;
		
		//ADD SKILLS
		if ( soul.skill != null ) 		self.core.skill 	= soul.skill;
		if ( soul.command != null )	{
			
			var id;
			var max = soul.command.length;
			self.core.command = {};
			
			for ( var i = 0; i < max; i++ ){
				id = soul.command[ i ];

				//var command = self.core.rock.createCommand( id, self.core.rock );
				//if ( self.core.command[ id ] != null ) continue;
				//self.core.command[ id ] = command;
				//self.core.commandList.push( command );
			}
			
			self.core.rock.dispatchEvent( "UPDATE_COMMAND" , [ self.core.rock ] );
		}

		if ( soul.collide != null 	) {
			//self.collide 	= soul.collide;
			//trace("adding collision ");
		}

			
		if (soul.passThru != null) {
		    //self.passThru = soul.passThru;
		    //trace("we do have a pass through ");
		}

		//ADD AI if PRESENT
		if ( soul.ai != null ) self.core.ai = soul.ai;	 
	}


	self.core.id =self.createUID();
	
	return self; 
};

exports = module.exports = RockControl;