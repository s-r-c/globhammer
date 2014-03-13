
var RockContent = function ( $core, $control ) { 
	
	//Create the vars
	var self = Object.create( module, { 
	core:{ 		value:$core    },
	control:{ 	value:$control },
	display:{	value:null , writable:true	},
	});

	self.awake 		= function (){}
	self.complete	= function (){}
	self.execute	= function (){}
	self.remove		= function (){}
  
   	self.display = new  PIXI.DisplayObjectContainer;
    
	return self; 
};

exports = module.exports = RockContent;