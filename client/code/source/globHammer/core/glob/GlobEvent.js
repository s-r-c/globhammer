"use strict";

//"Let that which does not matter truly slide."
//no rule lasts forever

var GlobEvent = function ( $source ) { 
	
	var source 		= $source;
	var chain 		= {};

	var self 		= Object.create( module, { source: { value:source }, chain:{ value:chain }	});

    //EVENT TYPES
    self.ROUND          = "ROUND";
    self.WORLD_AWAKE    = "WORLD_AWAKE";
    self.AVATAR_AWAKE   = "AVATAR_AWAKE";
    
	//self.buildListenerChain = function(){ if(!self.listenerChain) self.listenerChain = {};};

    self.addEventListener = function(type, listener){
            //if(!listener instanceof Function) throw { message : "Listener isn't a function" };
            if(!self.chain[type])                         
            self.chain[type] = [listener];
            else 
            var max = self.chain[type].length;
            for ( var i = 0; i < max; i++ ){
              var oldListener = self.chain[ type ][i];
              if (oldListener === listener) continue;
              self.chain[type].push(listener);   
            }
     };
                          
     self.hasEventListener = function(type){
            return (typeof self.chain[type] != "undefined");
            };

     self.removeEventListener = function(type, listener){
            if(!self.hasEventListener(type))
            return false;
                                        
            for(var i = 0; i < self.chain[type].length; i++)
            if(self.chain[type][i] == listener)
            self.chain[type].splice(i, 1);
            };

     self.dispatch = function(type, args){
            if ( args == null ) args = [];

            if ( self.chain.hasOwnProperty( type )) {
            var max = self.chain[type].length;

           	for(var i = 0; i < max; i++){
            if ( self.chain[type][i] == null )
            {
               self.chain[type](); 
               continue;
            }
            self.chain[type][i]( args[0] ); //wish it was a litle more open ended here
           	}

           	}                              
        }

	return self; 
};

exports = module.exports = GlobEvent;




