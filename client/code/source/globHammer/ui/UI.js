
var UI = function ( $glob ) { 
  
  var event     = '/globHammer/ui/UIEvent';
  event     = require( event )();
  
  //Create the vars
  var self = Object.create( module, {
  glob:   { value:$glob,   	   writable:true   }, 
  display:  { value:null,   	     writable:true   },
  event:    { value:event                          }
  
  });

  Object.defineProperty( self, "x",         { configurable:true, set:function( input ){ self.display.position.x = input }} );
  Object.defineProperty( self, "x",         { configurable:true, get:function(){ return self.display.position.x }} );

  Object.defineProperty( self, "y",         { configurable:true, set:function( input ){ self.display.position.y = input }} );
  Object.defineProperty( self, "y",         { configurable:true, get:function(){ return self.display.position.y }} );
  
  Object.defineProperty( self, "alpha",     { configurable:true, set:function( input ){ self.display.alpha = input }} );
  Object.defineProperty( self, "alpha",     { configurable:true, get:function(){ return self.display.alpha }} );

  Object.defineProperty( self, "visible",   { configurable:true, set:function( input ){ self.display.visible = input }} );
  Object.defineProperty( self, "visible",   { configurable:true, get:function(){ return self.display.visible }} );


  self.addEventListener       = function( id, vars )  { self.event.addEventListener( id, vars ) ;}
  self.removeEventListener    = function( id, vars )  { self.event.removeEventListener( id, vars );}
  self.dispatchEvent          = function( id, vars )  { self.event.dispatchEvent( id, vars  )   ;}
  
  self.display = new PIXI.DisplayObjectContainer;
  return self; 
};

exports = module.exports = UI;