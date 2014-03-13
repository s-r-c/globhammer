soul = {

  name:"Template",
  content:"ChariotPhysics",
  toonList:[    
            { viz:1, id:"idle",			  	speed:.5  },
  			    { viz:0, id:"walkRight",		speed:.5  },
            { viz:0, id:"walkLeft",	  	speed:.5  },
            { viz:0, id:"runRight",  		speed:.6, y:-10, x:-10    },
  			    { viz:0, id:"bruise",    		speed:.4,    end:'endHurt', y:-20, x:-30 },
            { viz:0, id:"absorb",       speed:.3, y:-20, end:'absorbComplete' },
            { viz:0, id:"dead",         speed:.3,    complete:'idle' },
            { viz:0, id:"jumpStart",    speed:.3,    end:'jumpMid', y:-50 }   
  ],

  action:null,

  jumpStartY:0,

  rim:100,
  offset:{ x:-5, y:0 },
  collideType:2,

//what converstation should they have about ur game
  speed:0,
  accel:10,
  maxSpeed:750,
  runMid:500,

  size:300,
  grit:5,

  attackType:null,

  pearls:[],

  awake:function( rock ){
    rock.core.air = false;

    soul.rock = rock;
    soul.body = rock.body;
    soul.shape = rock.shape;
    soul.shape.group = 9;

    rock.addEventListener( rock.event.STRIKE, soul.strike );
    rock.addEventListener( rock.event.DEAD,   soul.triggerDeath );

    var space = rock.core.glob.core.space;
    space.addCollisionHandler( 3 , 2, null,  soul.collideMonster.bind(this), null, null);
    space.addCollisionHandler( 2 , 0, null,  null, soul.collideFloor.bind(this), null);

    rock.addEventListener( rock.event.WOUND_BRUISE, soul.triggerBruise );
    rock.addEventListener( rock.event.WOUND_CUT, soul.triggerCut );
    rock.addEventListener( rock.event.WOUND_MORTAL, soul.triggerMortal );

    //rock.glob.addRock(  art.chainsaw, 2500, 200 );
    soul.rock.core.air = false;
   },

   jumpMid:function( rock ){
      trace("jump mid ");
   },

   jump:function( rock ){
    
    if ( rock.core.air == true) return;
    rock.body.applyImpulse( cp.v( 0 , -10000 ) , cp.v( 0, 0 )  );
    soul.rock.core.air = true;
    rock.show = 'jumpStart';
    
    // if ( soul.action != null ) return;

    //rock.show = 'jumpLow';
    //soul.action = "jumpLow";
    //rock.shape.sensor = true;
    //rock.core.air = true;
   

   // soul.jumpY = rock.body.p.y;
    
   },

   collideFloor:function(  arbiter, space  ){
     soul.rock.core.air = false;
   },

   jumpComplete:function( rock ){
    //soul.action = null;
    soul.rock.core.air = false;
    //soul.rock.shape.sensor = false;
   

   // soul.rock.body.p.y = soul.jumpY;
   },



   triggerAbsorb:function( rock ){
    
    //if ( soul.pearls.length == 0 ) return;
    

    TweenMax.to( rock.body.p, .5 , { x:soul.rock.x + 10, y:soul.rock.y, onComplete:function(){ rock.glob.removeRock( rock ) }, onCompleteParams:[ rock ] } );

    soul.rock.show = "absorb";
    soul.action = 'absorb';

   },

   absorbComplete:function(){

     soul.rock.show = "idle";
     soul.action = null;

   },

   triggerBruise:function( rock ){ 
    rock.show = "bruise";
    soul.action = 'hurt';
    soul.moveReset( rock );
    rock.body.vx = -100;
    rock.body.vy = -100;
    setTimeout( soul.createGem, 200 );
  },

  createGem: function(  ){
    var rock = soul.rock;
    var max = chance.d10();

    for ( var i = 0; i < max; i++ ){
    var posX = rock.x + ( chance.d100() - chance.d100() ) * 2 + ( chance.d100() - chance.d100() ) * 2 + ( chance.d100() - chance.d100() ) * 2;
    var posY = rock.y - chance.d10();
    var sphere = rock.glob.addRock( art.skySpheres, rock.x , rock.y  );
    sphere.alpha = 0;
    TweenMax.to( sphere.body.p, .5, { x:posX, y:posY, onComplete:sphere.soul.enableSRC, onCompleteParams:[ sphere ]  } );
    TweenMax.to( sphere,  .1, { alpha:1 } );  
    }

    //soul.rock.glob.soulLayer.addChild( soul.rock.display );
  },

  addGem:function ( gem ){
      trace("adding the gem " + gem.id );
      gem.core.offsetX = chance.d100() - chance.d100();
      gem.core.offsetY = chance.d100() - chance.d100();
      gem.core.hero = soul.rock;
      gem.shape.group = 9;
      soul.pearls.push( gem );

      //gem.core.glob.removeRock( gem );
  },

   triggerCut:    function( rock ){ 
    rock.show = "cut";
    soul.action = 'hurt';
     soul.moveReset( rock ); 
  },
   
   triggerMortal: function( rock ){ 
    rock.show = "mortal";
    soul.action = 'hurt';
     soul.moveReset( rock ); 
  },

  endHurt: function(){
    soul.action = null;
  },

   triggerDeath:function( rock ){ setTimeout( function() { rock.show = 'dead'; }, 200 );},

   chainsaw:function( rock ){
      trace("chainsaw");
      soul.attackType = "chainsaw";
   },

   strike:function( rock ){

    rock.core.glob.soulLayer.addChild(  rock.display );

    if ( soul.action != null ) return;    
    if ( soul.attackType == null ){
    soul.action = 'attack1';
    var roll = chance.rpg( "1d3" );
    rock.show = 'attack' + roll;
    }

   },

   power:function( rock ) {
    rock.control.strike( rock );  

    //var orb = rock.glob.addRock( art.skySpheres1, rock.x, rock.y);
    //orb.body.vy = -300;
   },

  moveReset:function( rock ){
    soul.speed = 0;
    rock.core.body.vx = 0;
    rock.core.body.vy = 0;
  },

 
  jumpEnd:function( rock ){
    //trace("jump end ");
  },

  moveRightAutoStart:function ( rock ){
    soul.autoRightIntervalID =  setInterval( soul.moveRight, 1000);
  },

  moveRightAutoEnd:function ( rock ){
    clearInterval( soul.autoRightIntervalID );
    soul.moveReset( rock );
  },

  moveRight:function( rock ){
   if ( soul.speed == 0 ) soul.speed = 100;
   soul.speed += soul.accel;
   if ( soul.speed > soul.maxSpeed ) soul.speed = soul.maxSpeed;
  },

  moveLeft:function( rock ){
    soul.speed = -100;
  },
  
  collideMonster:function(   arbiter, space ) {
    
    var a = arbiter.getA();
    var b = arbiter.getB();
    var rockA = a.rock;
    var rockB = b.rock;

    if ( rockB.core.air == true) return
    
    soul.moveReset( rockB );
    if(  soul.action == 'attack1' ) return;

    if (arbiter == null) return;
    if (space == null) return;

    rockB.control.strike( rockA  );   
  }, 

   endAttack:function(){
     soul.action = null;
   },

  
  execute:function( rock ){

   //if ( rock.body.p.y > 460 ) rock.body.p.y = 460;
    if ( rock.state( rock.const.DEAD ) == true  ) return;
    if(  soul.action == 'attack1' ) return;

    var vx = rock.body.vx;
    rock.body.applyImpulse( cp.v( soul.speed , 0 ) , cp.v( 0, 0 )  );

    if ( rock.core.air == true) return;

    if ( soul.action != null ) return;

      if ( vx > 10    ){
        if ( vx > soul.runMid ) rock.show = 'runRight'; 
        if ( vx < soul.runMid ) rock.show = 'walkRight'; 
      } 
      //if ( vx > 500   ) rock.show = 'runRight';
      if ( vx < -10   ) rock.show = 'walkLeft';

      if ( ( vx > 10 ) || ( vx < -10 ) ) return
      rock.show = 'idle';          
  }

}