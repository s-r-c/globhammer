
var Chariot = function ( $core, $control ) { 
	
var self = require( "/globHammer/core/rock/RockContent" )( $core, $control );

self.execute = function(){
    self.display.position.x = self.core.rock.x;
    self.display.position.y = self.core.rock.y;
}

self.clickUp = function(){}

self.show = function ( id ){
   
   trace("id " + id + " :: " + self.currentToonID);
  var soul = self.core.soul;
  if ( id == self.currentToonID ) return self.currentToon;
  self.currentToonID = id;

  if ( self.currentToon != null ) self.currentToon.visible = false;

  var display = self.toons[ id ];

  if ( display == null ) {
    self.currentToonID = "nullDisplay";
    return;
  }

  display.visible = true;
  
  display.gotoAndPlay( 0 );
  self.currentToon = display;
  return display;
}

self.clickDown = function( event ){
  self.core.rock.dispatchEvent( "ACTIVE", [ self.core.rock ] );
}

self.awake = function( rock ){
  var soul = self.core.soul;
  var max = soul.toonList.length;

    for ( var i = 0; i < max; i++ )
    {
      var toon = soul.toonList[ i ];
      self.buildToon( toon );
    }

  var display = self.display;
   display.setInteractive(true);
 
  display.touchendoutside     = self.clickUp;
  display.mouseupoutside      = self.clickUp;
  display.touchend            = self.clickUp; 
  display.mouseup             = self.clickUp;

  display.touchstartoutside   = self.clickDown;
  display.mousedownoutside    = self.clickDown;
  display.touchstart          = self.clickDown; 
  display.mousedown           = self.clickDown;

  self.core.glob.soulLayer.addChild( display );

  self.execute();
}

self.remove = function (){

    var parent = self.display.parent;
    if ( parent == null ) return trace("no parent present ");

    parent.removeChild ( self.display  )

    trace(' do we know its parent ' + self.display.parent );

    //trace( self.core.glob.soulLayer.contains( self.display));
    //self.core.glob.soulLayer.removeChild( self.display);
}

self.buildToon = function( toon  ){
  var max;
	if ( toon.src != null ) max = toon.src.length;
  if ( toon.frames != null ) max = toon.frames.length;

  var textureList = [];

  //PWEEZE REMOVE THIS
  //if ( toon.frames != null ) self.replaceFramesWithURLs( toon.src, toon.frames ); //here is the issue

  for ( var i = 0; i < max; i++ )
  {
    var index = i;
    if ( toon.frames != null )  index = toon.frames[ i ];
    if ( toon.frames == null )  index = toon.src[ i  ];

    if (index == 'x') return;
    
    var texture = PIXI.Texture.fromImage( index );
    if ( texture != null ) textureList.push( texture );
  }

  var display = new PIXI.MovieClip( textureList );
  
  self.toons[ toon.id ] = display;
  display.setInteractive(true);
  display.anchor.x = 0.5;
  display.anchor.y = 0.5;
  //trace( toon.id  + " / " + display );
  display.visible = false;

  if ( toon.viz == "1" ) {
  display.play();
  if ( self.currentToon != null ) self.currentToon.visible = false;
  self.currentToon = display;
  display.visible = true;
  }

  if ( toon.x != null)       display.position.x = toon.x;
  if ( toon.y != null)       display.position.y = toon.y;
  if ( toon.speed != null)   display.animationSpeed = toon.speed;
  if ( toon.loop == null)    display.loop = true;
  if ( toon.loop != null)    display.loop = toon.loop;
  if ( toon.loop == null)    display.loop = true;

  //ANIMATION  TO CALL @ THE END
  if ( toon.complete != null ) {
  display.loop = false;
  display.onComplete = function() { 
  if ( display.visible == false ) return;
  self.show ( toon.complete ); 
  } 
  };

  //FUNCTION TO CALL @ the END
  if ( toon.end != null ) {
  
  display.loop = false;
  display.onComplete = function() { 
    var soul = self.core.soul;
    if ( toon.end != null ) soul[ toon.end ]();
  }; 
  };

    
  //here is perhaps where the lanscape should go
  self.display.addChild( display );
}

self.toons = {};
return self; 
};

exports = module.exports = Chariot;