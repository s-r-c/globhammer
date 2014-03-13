soul = {

  name:"Sky Soul",
  content:"ChariotPhysics",
  toonList:[ 
  { viz:1, id:"idle", speed:.2 }
  ],
  rim:10,
  collideType:4,
  hero:null,

  awake:function( rock ){
   
    
    //var path = 1;
    //var shot = chance.rpg( '1d2');
    //if ( shot == 1 ) path = -1;
    //shot = chance.d100() + chance.d100() + chance.d100() + chance.d100() + chance.d100() * 10;
    //shot = shot * path
    
    //rock.body.vx  = shot;
    //rock.body.yy  = chance.d100() * 10; 
    //rock.core.limit = rock.y + chance.d100();

    //var space = rock.core.glob.core.space;
    //space.addCollisionHandler( 2 , 4, null,  null, soul.collideHero.bind(this), null);
    //space.addCollisionHandler( 4 , 4, null,  null, soul.collideSelf.bind(this), null);
   },

   collideSelf:function(   arbiter, space ) { 
      trace("colliding with collideSelf ");
   },

   collideHero:function(   arbiter, space ) {
    
    var a = arbiter.getA();
    var b = arbiter.getB();
    var rockA = a.rock;
    var rockB = b.rock;

    soul.heroClear(rockA, rockB); 
  }, 

  heroClear:function( hero, glow ){    
    glow.glob.soulLayer.addChild( glow.display );
    glow.shape.sensor = false;
    glow.core.hero = hero;
  },

  beginAbsorb:function( rock ){
   trace("beging absorb ");
   //rock.core.hero.soul.triggerAbsorb( rock.core.hero );
   //rock.glob.removeRock( rock );
  },

  execute:function( rock ){
      
     if ( rock.core.hero != null ){
        var destX = rock.core.hero.x;
        var destY = rock.core.hero.y;

        trace(" where u looking " + destX );
       
        if ( Math.floor( rock.core.hero.body.vx ) == 0 ) return;
        TweenMax.to( rock.body.p, 1, { x:destX, y:destY, delay:0, onComplete:rock.soul.beginAbsorb, onCompleteParams:[ rock ] } ); 
        return
      }

  if (  rock.body.p.y < rock.core.limit ){
    soul.speed = 2000;
    rock.body.applyImpulse( cp.v( 0,  soul.speed ) , cp.v( 0, 0 )  );
    return
   }

    soul.speed = 200;
    rock.body.applyImpulse( cp.v( 0,  soul.speed ) , cp.v( 0, 0 )  );   
   
  } 

/*
    //if ( rock.state( rock.const.DEAD ) == true  ) return;
   
 */
}