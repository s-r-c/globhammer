
var Title = function ( $glob ) { 
  
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
 self.buffer 		= 20;
 self.iconContainerPos = {x:0, y:225 };

 //GRAPHICS
 self.green
 self.blue
 self.yellow
 self.red 
 self.whte
 
 //VIEW

 self.awake = function ( list ){
   self.list = list;

   self.height = self.glob.height;
   self.width 	= self.glob.width;

   self.loader = new PIXI.AssetLoader( self.graphics );
   self.loader.onComplete = self.assetLoaderComplete();
 }

 self.assetLoaderComplete = function(){
 	var texture = PIXI.Texture.fromImage( self.graphics[0] );
	self.green = new PIXI.Sprite(texture);
	self.display.addChild( self.green );

	var texture = PIXI.Texture.fromImage( self.graphics[1] );
	self.blue = new PIXI.Sprite(texture);
	self.display.addChild( self.green );

	var texture = PIXI.Texture.fromImage( self.graphics[2] );
	self.green = new PIXI.Sprite(texture);
	self.display.addChild( self.green );

	var texture = PIXI.Texture.fromImage( self.graphics[3] );
	self.yellow = new PIXI.Sprite(texture);
	self.display.addChild( self.green );

	var texture = PIXI.Texture.fromImage( self.graphics[4] );
	self.red = new PIXI.Sprite(texture);
	self.display.addChild( self.red );



	//self.buildIconsFromRocks();

	self.glob.addEventListener(  self.glob.event.AVATAR_AWAKE, self.rockLoaded );
 	self.newRock();

	setTimeout( self.sparkle1, 2000);

    //if u wish to center
    //self.logo.position.x = self.glob.width/2 - 700;
    //self.logo.position.y = self.glob.height * .5 - 400;

}

 self.newRock = function (  ){ 
  	if ( self.list == null ) return self.complete();
  	var rock = self.list[ self.index ];
	if ( rock == null ) return self.complete();
 	self.glob.rock( { src: rock } );
 }


 self.rockLoaded = function ( rock ){
 	var icon = self.icons[ rock.src ];
 	if ( icon != null ) icon.gotoAndStop(2);
 	self.glob.removeRock( rock );
 	self.index += 1;
  setTimeout( self.newRock, 500 );
 	//if ( self.index > self.list.length ) self.complete();  
 }

 self.buildIconsFromRocks = function(){

 	self.iconContainer = new PIXI.DisplayObjectContainer;
 	self.display.addChild( self.iconContainer );

  if ( self.list == null ) return trace("Looking for a list " + self.list );

 	var max = self.list.length;
 	
 	for ( var i = 0; i < max; i++ ){
 		var rock = self.list[ i ];
    if ( rock == null ) continue;
 		self.createIcon( rock );
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

    var display = new PIXI.MovieClip( textureList );
    display.id = rock.id;
    self.iconList.push( display );
    self.icons[ rock ] = display;
	self.iconContainer.addChild( display );

    return display; 
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

 	self.iconContainer.position.x = self.width/2 - width/2;
 	self.iconContainer.position.y = self.height * .8;
 }

 self.sparkle1 = function(){
	self.sparkle.visible = true;
	self.sparkle.position.x = 650;
	self.sparkle.position.y = 130;
 	setTimeout( self.sparkle2, 50);
 }

 self.sparkle2 = function(){
 	self.sparkle.position.x = 640;
	self.sparkle.position.y = 140;
 	setTimeout( self.sparkle3, 50);
 }

 self.sparkle3 = function(){
 	self.sparkle.position.x = 735;
	self.sparkle.position.y = 130;
 	setTimeout( self.sparkleOff, 50);
 }

 self.sparkleOff = function(){
 	//self.sparkle.visible = false;
 	setTimeout( self.sparkle1, 2000);
 }


 self.complete = function (){ 
  self.glob.removeEventListener(  self.glob.event.AVATAR_AWAKE, self.rockLoaded );
 	self.event.dispatch(  self.event.COMPLETE  );
  setTimeout( self.showWorld, 1000 );
 }

 self.showWorld = function (){ 

  self.display.visible = false;
 
  //var newX = self.height * -1;
  //TweenMax.to( self.display.position, .5, { y:newX, delay:.5 } );  
 }

 self.execute = function ( rock ){ } 
  return self; 
};

exports = module.exports = Title;