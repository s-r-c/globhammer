soul = {

  name:"Template",
  content:"ChariotPhysics",
  toonList:[    
            { viz:1, id:"idle",			  	speed:1  }
           ],

  rim:100,
  offset:{ x:-5, y:0 },
  collideType:1,
  action:null,

  awake:function( rock ){

   soul.rock           = rock;
   
  //soul.change        = soul.addFeature( art.heroChange, rock );
  //soul.jump           = soul.addFeature( art.heroJump, rock);
  //soul.heroBackward   = soul.addFeature( art.heroBackward, rock);
  soul.heroForward    = soul.addFeature( art.heroForward, rock);
  soul.strike         = soul.addFeature( art.heroStrike, rock);
  // soul.bonesaw        = soul.addFeature( art.heroBonesaw, rock); 

   rock.shape.group = 10;

    soul.keyUp      = 38;
    soul.keyDown    = 40;
    soul.keyRight   = 39;
    soul.keyLeft    = 37;
    soul.keyA       = 65;
    soul.keyS       = 83;
    soul.keyD       = 68;
    soul.keyW       = 87;
    
    $("body").keydown(function (key) {  soul.padDown( key.which ); });
    $("body").keyup(function (key)   {  soul.padUp(   key.which ); });
 
  },

  execute:function( rock ){ rock.body.applyImpulse( cp.v( rock.momentum, 0 ) , cp.v( 0, 0 )  ); },

  rightStart:function(){  if ( soul.heroForward != null)  soul.heroForward.soul.forwardStart( soul.rock )  },
  rightEnd:function(){    if ( soul.heroForward != null)  soul.heroForward.soul.forwardEnd( soul.rock )    },
  leftStart:function(){   if ( soul.heroForward != null)  soul.heroForward.soul.backwardStart( soul.rock )    },
  leftEnd:function(){     if ( soul.heroForward != null)  soul.heroForward.soul.backwardEnd( soul.rock )    },

  upStart:function(){ trace("up start ");      },

  downStart:function(){ trace("down start ");  },

  aStart:function(){      },
  aEnd:function(){        },

  sStart:function(){    if( soul.strike != null ) soul.strike.soul.start( soul.strike )   }, //not sure how i feel about u
  sEnd:function(){      if( soul.strike != null ) soul.strike.soul.end( soul.strike )     },

  dStart:function(){    if ( soul.heroForward != null )  soul.heroForward.soul.jumpStart( soul.rock )  },
  dEnd:function(){      if ( soul.heroForward != null )  soul.heroForward.soul.jumpEnd( soul.rock   )  },


  wStart:function(){ trace("w start ");         },
  wEnd:function(){ trace("w end");         },


  upEnd:function(){ trace("up end");      },

  downEnd:function(){ trace("down end");  },


  


  padDown:function( key ){ 
  if ( key == soul.keyUp ) soul.upStart();
  if ( key == soul.keyDown) soul.downStart();
  if ( key == soul.keyRight ) soul.rightStart();
  if ( key == soul.keyLeft ) soul.leftStart();
  if ( key == soul.keyA ) soul.aStart();
  if ( key == soul.keyS ) soul.sStart();
  if ( key == soul.keyW ) soul.wStart();
  if ( key == soul.keyD ) soul.dStart();

  },

 padUp:function( key ){ 
  if ( key == soul.keyUp ) soul.upEnd();
  if ( key == soul.keyDown) soul.downEnd();
  if ( key == soul.keyRight ) soul.rightEnd();
  if ( key == soul.keyLeft ) soul.leftEnd();
  if ( key == soul.keyA ) soul.aEnd();
  if ( key == soul.keyS ) soul.sEnd();
  if ( key == soul.keyW ) soul.wEnd();
  if ( key == soul.keyD ) soul.dEnd();
  },

  addFeature:function( art, rock){
   if ( art == null )               trace("art is not present" );
   var feature = rock.glob.addRock( art );
   if ( feature == null ) return    trace("feature not present ::" + art );
   if ( feature.soul == null ) return null;
   feature.parent = rock;
   feature.soul.rock = feature;
   return feature;
  },







}