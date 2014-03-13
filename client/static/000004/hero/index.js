soul = {

  name:"Template",
  content:"ChariotPhysics",
  toonList:[    
            { viz:1, id:"idle",			  	speed:.5  },
  			    { viz:0, id:"walkRight",		speed:.5  },
            { viz:0, id:"walkLeft",	  	speed:.5  },
            { viz:0, id:"runRight",  		speed:1    },
  			    { viz:0, id:"jumpLow",	  	speed:1,     complete:'idle', end:'jumpComplete' },
            { viz:0, id:"attack1",    	speed:.6,    end:'endAttack', complete:'idle' },
            { viz:0, id:"attack2",    	speed:.6,    end:'endAttack', complete:'idle' },
            { viz:0, id:"attack3",    	speed:.6,    end:'endAttack', complete:'idle' },
            { viz:0, id:"chain",    		speed:.6,    end:'endAttack', complete:'idle' },
            { viz:0, id:"bruise",    		speed:1,     end:'endHurt' },
            { viz:0, id:"cut",       		speed:1,     end:'endHurt' },
            { viz:0, id:"mortal",    		speed:1,     end:'endHurt' },
            { viz:0, id:"dead",         speed:.3,    complete:'idle'  }  
  ],

  action:null,

  jumpStartY:0,

  rim:10,
  offset:{ x:-5, y:0 },
  collideType:2,

  speed:0,
  accel:10,
  maxSpeed:750,

  size:3,
  grit:5,

  attackType:null,

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

    rock.addEventListener( rock.event.WOUND_BRUISE, soul.triggerBruise );
    rock.addEventListener( rock.event.WOUND_CUT, soul.triggerCut );
    rock.addEventListener( rock.event.WOUND_MORTAL, soul.triggerMortal );

    //rock.glob.addRock(  art.chainsaw, 2500, 200 );
    
   },

   triggerBruise: function( rock ){ 
    rock.show = "bruise";
    soul.action = 'hurt';
    soul.moveReset( rock );
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

  moveReset:function( rock ){
    soul.speed = 0;
    rock.core.body.vx = 0;
    rock.core.body.vy = 0;
  },

  jump:function( rock ){
    
    if ( rock.core.air == true) return;
    if ( soul.action != null ) return;

    //rock.show = 'jumpLow';
    //soul.action = "jumpLow";
    //rock.shape.sensor = true;
    rock.body.vy = -1000;
    rock.core.air = true;

   // soul.jumpY = rock.body.p.y;

  },

  jumpComplete:function( rock ){
    soul.action = null;
   // soul.rock.shape.sensor = false;
    soul.rock.core.air = false;

    //soul.rock.body.p.y = soul.jumpY;
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
   trace("move runRight");
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

    if ( soul.action != null ) return;

      if ( vx > 10    ){
        if ( vx > 1000 ) rock.show = 'runRight'; 
        if ( vx < 1000 ) rock.show = 'walkRight'; 
      } 
      //if ( vx > 500   ) rock.show = 'runRight';
      if ( vx < -10   ) rock.show = 'walkLeft';

      if ( ( vx > 10 ) || ( vx < -10 ) ) return
      rock.show = 'idle';          
  }

}