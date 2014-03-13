"use strict";

var RockCore = function ( $name,  $glob, $location ) { 
	
	//Create the vars
	var self = Object.create( module, { 

	rock:{	 	value:"rock"	, 			writable:true},	
	soul:{			value:null, 				writable:true},
	status:{		value:"alive", 				writable:true},

	state:{ 		value:[], 				writable:true},

	name:{ 			value:$name, 				writable:true},
	type:{ 			value:"no type present" 	},
	id:{ 			value:"no id present", 		writable:true},
	location:{ 		value:$location, 			writable:true},

	target:{ 		value:null, 				writable:true},
	ai:{			value:null, 				writable:true},

	//STATS
	grit:{			value:1, 					writable:true},
	touch:{			value:1, 					writable:true},     
	
	//SKILLS
	skill:{			value:{}, 					writable:true},

	//COMMANDS
	command:{   	value:null,					writable:true},
	commandList:{   value:[],					writable:true},

	selected:{ 		value:false 	},
	
	//texture loading
	root:{	 		value:"", 					writable:true},	
	skin:{ 			value:"folder", 			writable:true},
	frames:{ 		value:10, 					writable:true},

	x:{ 			value:0, 					writable:true},
	y:{ 			value:0, 					writable:true},
	alpha:{ 		value:1, 					writable:true},

	focusX:{ 		value:0, 					writable:true},
	focusY:{ 		value:0, 					writable:true},
	focusZ:{ 		value:1, 					writable:true},

	//COLLISION STUFF
	targets:{ 		value:[], 					writable:true},
	hitWidth:{ 		value:300, 					writable:true},
	hitHeight:{ 	value:300, 					writable:true},

	glob:{	 	value:$glob	, 			writable:true },
	globIndex:{	value:0			, 			writable:true,  enumerable:true },

	//STATS ALL AVATARS POSSESS
	size:{	 		value:1	, 					writable:true },

	//WOUNDS
	//Bruise = 1; Cut = 0; Mortal = -1

	woundList:{	 	value:[],	 				writable:true  },
	wounds:{		value:{},					writable:true  },

	healBruise:{	value:3, 					writable:true },
	healCut:{		value:10, 					writable:true },
	healMortal:{	value:40, 					writable:true },

	//PHYSIC VARIABLES
	physicHeight:{ 	value:100, 					writable:true },
	physicWidth:{ 	value:100, 					writable:true },
	
	rim:{			value:null, 			    writable:true },
	offset:{ 		value:{ x:0, y:0 }, 		writable:true },
	mass:{ 			value:10, 					writable:true },
	momentum:{ 	    value:0, 					writable:true },
	
	
	});

	if ( self.glob != null) self.id = self.glob.UUID;

	return self; 
};

exports = module.exports = RockCore;