soul = {

  name:"Map",
  content:"Chariot",
  toonList:[    
            { viz:1, id:"idle",  speed:1  }
           ],


  line:[],
  currentPoint:null,
  glob:null,


  awake:function( rock ){
  	
  	$("body").keydown(  function (key) {  soul.keydown( key.which ); });
    $("body").keyup(    function (key) {  soul.keyup( 	key.which ); });
    //GLOB.glob.content.stage.mousedown = soul.stageDown;

    soul.glob = rock.glob;
    soul.glob.content.stage.mousedown = soul.stageDown;

  },

   keyup:function( key ){
    if ( key == 16 ) soul.hidePhysics();
  	},


  keydown:function( key ){ 
  	trace("keydown " + key );

    if ( key == 83 ) soul.save(); // S
  	if ( key == 16 ) soul.showPhysics(); // SHIFT
    if ( key == 37 ) soul.moveWorldLeft();
    if ( key == 38 ) soul.moveWorldUp();
    if ( key == 39 ) soul.moveWorldRight(); 
    if ( key == 40 ) soul.moveWorldDown();
  },

  stageDown:function( data ){
    
    var mousePoint 	= soul.glob.core.stage.getMousePosition();
    soul.line.push( { x:mousePoint.x + soul.glob.x, y:mousePoint.y + soul.glob.y } );

  },


  moveWorldLeft:function( ){
      var newX = soul.glob.x += 10;
      TweenMax.to( soul.glob, .2, { x:newX, delay:0 });
     // world.desert.content.updateLandscapeX( world.glob.x );
  },

  moveWorldRight:function( ){
    var newX = soul.glob.x -= 10;
    TweenMax.to( soul.glob, .2, { x:newX, delay:0 });
     
  },

   moveWorldUp:function( ){
    var newX = soul.glob.y -= 10;
    TweenMax.to( soul.glob, .2, { y:newX, delay:0 });
     
  },

    moveWorldDown:function( ){
    var newX = soul.glob.y += 10;
    TweenMax.to( soul.glob, .2, { y:newX, delay:0 });
     
  },

    showPhysics:function(){ 
    //world.save();
    trace("u showing the showPhysics ");
    soul.glob.content.setUpPhysicsLayer();  
  },
  
  hidePhysics:function(){ soul.glob.content.removePhysicsLayer(); },

  endPoint:function(){	
  	if ( soul.currentPoint == null ) return;
  	soul.line.push( soul.currentPoint );
  },

  save:function( ){

  	trace(" save ");
  		
      var bounds = [];
  	  var max = soul.line.length;

  	  var  pointA;
  	  var  pointB;

      if ( max < 2 ) return

  		for ( var i = 1; i < max; i++ ){
  			
  		pointA = soul.line[ i ];
        pointB = soul.line[ i - 1 ];
  			//if ( i + 1 < max ) pointB = world.line[ i + 1 ];

        var point = {};
        point.x = pointA.x;
        point.y = pointA.y;

        point.h = pointB.y;
        point.w = pointB.x;

        bounds.push( point );
  		}

      soul.line = [];

      soul.bounds = bounds;
      soul.glob.control.createBounds();

      var output = "bounds:[";

      var max = soul.bounds.length;
      for ( var i = 0; i < max; i++ ){
        var item    = soul.bounds[ i ];
        var string  = JSON.stringify( item );
        output += string + ',';
      }

      output += "],"

      trace("output " + output );
      soul.copyToClipboard( output );
  },



  copyToClipboard:function( text ){
  	window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
  },



}