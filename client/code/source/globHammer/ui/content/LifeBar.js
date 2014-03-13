
var LifeBar = function ( $glob ) { 
  
  //Create the vars
 var self = require( "/globHammer/ui/UI" )( $glob );
 self.height 	= 0;
 self.width 	= 0;
 self.index 	= 0;

 self.graphics 	= [];
 self.list 		= [];
 self.loader 	= null;

 self.iconContainer = null;
 self.iconList 		= [];
 self.icons 		= {};
 self.buffer 		= 50;
 self.iconContainerPos = {x:0, y:225 };

 //GRAPHICS
 self.green
 self.blue
 self.yellow
 self.red 
 self.whte
 
 //VIEW

 self.awake = function ( rock ){
   //self.list = list;
   self.rock = rock;

   self.height = self.glob.height;
   self.width 	= self.glob.width;

   self.iconContainer = new PIXI.DisplayObjectContainer;
   self.display.addChild( self.iconContainer );

   self.loader = new PIXI.AssetLoader( self.graphics );
   self.loader.onComplete = self.assetLoaderComplete();

   //rock.display.addChild( self.display );
   rock.glob.soulLayer.addChild( self.display );
   //self.display.position.x +=500;

 }

 self.assetLoaderComplete = function(){
	self.buildLifeBar();
}

self.draw = function(){

    var woundList = self.rock.core.woundList;
    var iconList = self.iconList;

    var max = woundList.length;

    for ( var i = 0; i < max; i++ ){
      var wound = woundList[ i ].value;
      var icon  = iconList[ i ];
      if ( wound == 1 )     icon.gotoAndStop(2);
      if ( wound == 0 )     icon.gotoAndStop(1);
      if ( wound == -1 )    icon.gotoAndStop(0);
      
    }


}

 self.buildLifeBar = function(){

 	self.iconContainer = new PIXI.DisplayObjectContainer;
 	self.display.addChild( self.iconContainer );

  if ( self.list == null ) return trace("Looking for a list " + self.list );

 	var max = self.rock.control.fetchLife();

 	for ( var i = 0; i < max; i++ ){
 		self.createIcon();
 	}

	setTimeout( self.update, 100 ); 
 }

 //CREATING THE ICONS
 self.createIcon = function ( rock ){
   
    var textureList = [];
    var urlList = [ self.graphics[2], self.graphics[3], self.graphics[4], self.graphics[5] ];
    var max = urlList.length;
    
    for (var i = 0; i < max; i++)
    {
     var url = urlList[ i ];
     var texture = PIXI.Texture.fromImage( url );
     if ( texture != null ) textureList.push( texture );
    }

    if ( textureList.length == 0 ) return;

    var clip = new PIXI.MovieClip( textureList );
    clip.gotoAndStop(3);
    //display.id = rock.id;
    //self.display.addChild( display );
    self.iconList.push( clip );
    //self.icons[ rock ] = display;

    self.iconContainer.addChild( clip );

    return clip; 
 }


 self.update = function(){
 	
 	var max = self.iconList.length;
 	var xPos = 0;

 	for ( var i = 0; i < max; i++ ){
 		var icon = self.iconList[ i ];
 		icon.position.x = xPos;
 		xPos += self.buffer; 		
 	}

 	var width = 0;
 	var max = self.iconContainer.children.length;
 	var children = self.iconContainer.children;

 	for ( var i = 0; i < max; i++ ){
 		var child = children[i];
 		if ( child.width == null ) continue;
 		width += child.width;
 	}

 	//self.iconContainer.position.x = self.width/2 - width/2;
 	//self.iconContainer.position.y = self.height * .8;
 }

 
 self.execute = function ( rock ){ 
 
 	//self.display.position.x += 1;
 	self.display.position.x = rock.x + rock.soul.uiOffset.x;
  self.display.position.y = rock.y + rock.soul.uiOffset.y;
  self.draw();


 } 
  
  return self; 
};

exports = module.exports = LifeBar;