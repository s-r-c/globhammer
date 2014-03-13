soul = {

  name:"Knowing",
  content:"ChariotPhysics",
  toonList:[ 
  { viz:0, id:"glow0", speed:.2 },
  { viz:0, id:"glow1", speed:.2 },
  { viz:1, id:"glow2", speed:.2 },
  { viz:0, id:"glow3", speed:.2 },
  { viz:0, id:"glow4", speed:.2 },
  
  ],
  rim:10,
  collideType:4,
  hero:null,
  growDelay:2000,
  growSpeed:6,
  growCheck:false,

  awake:function( rock ){
 	
 	rock.core.src = 0;
  rock.speed = -180;
  var space = rock.core.glob.core.space;
  space.addCollisionHandler( 2 , 4, null,  null, soul.collideHero.bind(this), null); 
  rock.core.air = true;
  setTimeout( function(){ rock.core.air = false }, 1000 );
  
  },


  collideHero:function(   arbiter, space ) {
    
    var a = arbiter.getA();
    var b = arbiter.getB();
    var rockA = a.rock;
    var rockB = b.rock;

    if ( rockB.core.air == true) return

    rockA.soul.addGem( rockB );
     

    //soul.heroClear(rockA, rockB); 
  }, 

  heroClear:function( hero, glow ){    
    trace("hero clear " + hero );
    glow.glob.soulLayer.addChild( glow.display );
    glow.shape.sensor = false;
    glow.core.hero = hero;
  },

 // beginAbsorb:function( rock ){
 //  rock.core.hero.soul.triggerAbsorb( rock.core.hero );
 //  rock.glob.removeRock( rock );
//  },

  collideSelf:function( arbiter, space ) { 
    	
      var a = arbiter.getA();
    	var b = arbiter.getB();
    	var rockA = a.rock;
    	var rockB = b.rock;

    //	if ( rockA.soul.growCheck == false ) return
    //	if ( rockB.soul.growCheck == false ) return

    	rockA.soul.growCheck = false;
    	rockB.soul.growCheck = false;
    	setTimeout( function(){ rockA.soul.growCheck = true }, soul.growDelay );
    		
    	var destX = rockA.body.p.x; 
    	var destY = rockA.body.p.y;

    	TweenMax.to( rockB.body.p, soul.growSpeed, { x:destX, y:destY, delay:0, onComplete:rockA.soul.combine, onCompleteParams:[ rockA, rockB ], ease:Expo.easeOut } ); 

    	//if ( rockA.soul.src > 2  ) rockB.show = 'glow2';
   },

   enableSRC:function( rock ){
          trace("enabling  SRC ");
          rock.core.src = 1;
          rock.body.vy = -150;
   },

  beginAbsorb:function( rock ){
    rock.core.hero.soul.triggerAbsorb( rock );
   //rock.glob.removeRock( rock );
  },

   execute:function( rock ){

    if ( rock.core.src == 0 ) return;

    if ( rock.body.p.y < -100 ){
        rock.glob.removeRock( rock );
        return;
    }

    if ( rock.core.hero != null ){
        var destX = rock.core.hero.x + rock.core.offsetX;
        var destY = rock.core.hero.y + rock.core.offsetY;
      // trace(" off set x " + rock.core.offsetX );
        if ( Math.floor( rock.core.hero.body.vx ) == 0 ) return;
        
        TweenMax.to( rock.body.p, 1, { x:destX, y:destY, delay:0, onComplete:rock.soul.beginAbsorb, onCompleteParams:[ rock ] } );
        return
    }
      
    //rock.speed -= chance.d10() * .00;

    //rock.body.applyImpulse( cp.v( 0,  soul.speed ) , cp.v( 0, 0 )  ); 

    var yVelocity = chance.d100() + chance.d100(); //pixels per second
    var oscFreq = 1.5; //oscillations per second
    var oscDepth = 35; //oscillation depth (pixels)
    var drift = 25; // drift (wind?) (pixels per second: - = left, + = right)

    var date = new Date();
    var time = date.getTime();

    var isThisWhatYouWant = oscDepth*Math.sin( oscFreq*Math.PI*2* time  );

    //if (  isThisWhatYouWant > 1    )rock.speed -= chance.d10() * .01;


    isThisWhatYouWant *= 1000;
    isThisWhatYouWant = Math.floor( isThisWhatYouWant );
    isThisWhatYouWant += ( chance.d100() - chance.d100() );

    //rock.body.p.x += isThisWhatYouWant;


     rock.body.applyImpulse( cp.v( isThisWhatYouWant,  rock.speed ) , cp.v( 0, 0 )  ); 

   
    },

   combine:function( rockA, rockB ){
   		
   		//rockB.glob.removeRock( rockB );

   		
   		rockA.core.src += rockB.core.src;
   		//rockB.soul.src = 0;
    	trace("Rock A is getting a little bigger " + rockA.core.src );
    	//rockB.glob.removeRock( rockB );
      
      if ( rockA.core.src <= 4 ) rockA.alpha = 0;
      TweenMax.to( rockA, soul.growSpeed, { alpha:1, onComplete:rockB.glob.removeRock, onCompleteParams:[ rockB ], ease:Expo.easeOut } ); 
      
      if ( rockA.core.src == 1 ) rockA.show = 'glow1'; 
      if ( rockA.core.src == 1 ) rockA.show = 'glow1';
      if ( rockA.core.src == 2 ) rockA.show = 'glow2';
      if ( rockA.core.src == 3 ) rockA.show = 'glow3';
      if ( rockA.core.src >= 4 ) rockA.show = 'glow4';


   }



}