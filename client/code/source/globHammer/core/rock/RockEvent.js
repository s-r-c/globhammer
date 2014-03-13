"use strict";

//"Let that which does not matter truly slide."
//no rule lasts forever

var RockEvent = function ( $source ) { 
	
	var source 		= $source;
	var chain 		= {};

	var self 		= Object.create( module, { source: { value:source }, chain:{ value:chain }	});

    //EVENT TYPES
    self.STRIKE         = "STRIKE";
    self.HEAL           = "HEAL";

    self.WOUND_BRUISE   = "WOUND_BRUISE";
    self.WOUND_CUT      = "WOUND_CUT";
    self.WOUND_MORTAL   = "WOUND_MORTAL"; 
    self.DEAD           = "DEAD";
    self.STUN           = "STUN";
    self.REMOVE_STUN    = "REMOVE_STUN";
    self.BLEED          = "BLEED";
    self.REMOVE_BLEED   = "REMOVE_BLEED";

	//self.buildListenerChain = function(){ if(!self.listenerChain) self.listenerChain = {};};

    self.addEventListener = function(type, listener){
            //if(!listener instanceof Function) throw { message : "Listener isn't a function" };
            if(!self.chain[type])                         
            self.chain[type] = [listener];
            else
            self.chain[type].push(listener);                           
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

     self.dispatchEvent = function(type, args){
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

exports = module.exports = RockEvent;




