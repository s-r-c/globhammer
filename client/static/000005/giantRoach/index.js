soul = {

  name:"Giant Roach",
  content:"ChariotPhysics",
  toonList:[    
            { viz:1, id:"idle",			  	speed:.5  },
            { viz:0, id:"end",          speed:.5, loop:false  }
           ],

  offset:{ x:-5, y:0 },
  
  physicHeight:100,
  physicWidth:150,

  collideType:3,

  size:5,

  uiOffset:{ x:-80, y:-100 },

  awake:function( rock ){ 
    soul.rock = rock; 

    soul.hit   = soul.addFeature( art.roachHit, rock);
    rock.addEventListener( rock.event.DEAD, soul.end);

    var bar = soul.bar = GLOB.glob.createUI( 'LifeBar' );
    bar.graphics  = [ art.logo, art.star, art.skull, art.red, art.blue, art.green ];
    //
   //bar.display.x += soul.uiOffset.x;
    //bar.display.y += 1000;
    bar.awake( rock );
    //rock.display.addChild( bar.display );
  

    //bar.display.x += 100;

   // rock.addEventListener( rock.event.WOUND_BRUISE, soul.showMeTheMoney );
   var space = rock.core.glob.core.space;
    space.addCollisionHandler( 3 , 1, null, soul.letMePass.bind(this),  null ,  null);

  },

  letMePass:function(){},

  end:function( rock ) { 
    trace("show me the end ");
    rock.show = 'end'  
  },

  showMeTheMoney:function( event){ return"$" },

  execute:function( rock ){ 
    if ( soul.bar == null ) return;
    soul.bar.execute( rock );
  },

  addFeature:function( art, rock){
   var feature = rock.glob.addRock( art );
   if ( feature.soul == null ) return null;
    var oldSoul = feature.soul;
    feature.soul.rock = rock;
    feature.soul.rockSelf = feature;
    feature.soul.featureComplete( rock );

    return feature;
  
  },







}