
var Environment = function ( $core, $control ) { 
	
var self = require( "/globHammer/core/rock/RockContent" )( $core, $control );

self.execute = function(){    }

self.remove = function(){     
  //self.core.glob.landscapeLayer.removeChild( rock.display );
}

self.awake = function( rock ){

	var soul = self.core.soul;
  var max = soul.toonList.length;

  for ( var i = 0; i < max; i++ )
  {
    var toon = soul.toonList[ i ];
    self.buildToon( toon );
  }

  self.core.glob.landscapeLayer.addChild( rock.display );
}

self.buildToon = function( toon  ){
    
  var max;
	if ( toon.src != null ) max = toon.src.length;
  if ( toon.frames != null ) max = toon.frames.length;
  var textureList = [];
  
  for ( var i = 0; i < max; i++ ){
    var index = i;
    if ( toon.frames != null )  index = toon.frames[ i ];
    if ( toon.frames == null )  index = toon.src[ i  ];
    var texture = PIXI.Texture.fromImage( index );
    if ( texture != null ) textureList.push( texture );
  }

  self.buildLandscape( toon, textureList );
}

self.buildLandscape = function( toon, textureList){
    var display = new PIXI.MovieClip( textureList );
    var f = new PIXI.MovieClip( textureList );
    f.visible = true;
    if ( toon.y != null ) f.position.y = toon.y;
    if ( toon.y == null ) f.position.y = 0;
        
    f.position.x = 0;
    self.display.addChild(f);
  }

return self; 
};

exports = module.exports = Environment;