"use strict";

var RockConstant = function () { 
	
	//Create the vars
	var self = Object.create( module );

	//WOUNDS
	self.BRUISE =  1;
	self.CUT	=  0;
	self.MORTAL	= -1;

	//STATES
	self.DEAD 	= 0;
	self.STUN	= 1;
	self.BLEED	= 2;
	
	if ( self.glob != null) self.id = self.glob.UUID;

	return self; 
};

exports = module.exports = RockConstant;