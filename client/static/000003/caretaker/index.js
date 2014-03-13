soul = {

  name:"Template",
  content:"ChariotPhysics",
  
  toonList:[ 
  
  { viz:1, id:"0-idle",	speed:.3},

  { viz:0, id:"1-step1", speed:.1, end:'step1Complete', y:10 },
  { viz:0, id:"2-step2", speed:.1, end:'step2Complete', y:10 },

  { viz:0, id:"3-idleFront", speed:.001, complete:'4-idleFrontArmOut' },

  { viz:0, id:"4-idleFrontArmOut", speed:.01, complete:'5-strikeStart' },

  { viz:0, id:"5-strikeStart", speed:.6 },

  { viz:0, id:"5-strikeStart", speed:.6, complete:'6-idleFrontHammerOut' },

  ],
  
  collideType:3,

  rim:150,
  leftFoot:true,
  offset:{ x:35, y:-100 },

   awake:function( rock ){
    soul.rock = rock;
   },

  moveLeft:function( rock ){
   
   if ( soul.leftFoot == true ){
    rock.show = '1-step1';
    soul.speed = -1000;
    rock.body.applyImpulse( cp.v( soul.speed , 0 ) , cp.v( 0, 0 )  );
   }

    if ( soul.leftFoot == false ){
    rock.show = '2-step2';
    soul.speed = -1000;
    rock.body.applyImpulse( cp.v( soul.speed , 0 ) , cp.v( 0, 0 )  );
   }


    
  },

  step1Complete:function( rock ){
      trace("step1 step1Complete ");
      soul.rock.show = "0-idle";
      soul.rock.body.vx = 0;
      soul.rock.body.vy = 0;
      soul.rock.body.p.x -= 40;
      
      soul.leftFoot = false;
  },

  step2Complete:function( rock ){
      trace("step2 step2Complete ");
      soul.rock.show = "0-idle";
      soul.rock.body.vx = 0;
      soul.rock.body.vy = 0;
      soul.rock.body.p.x -= 40;
      
      soul.leftFoot = true;
  },



   step1:function(){
      soul.rock.show = "midWalk1";
      soul.speed = -10000;
      soul.rock.body.applyImpulse( cp.v( soul.speed , 0 ) , cp.v( 0, 0 )  );
   },

   step2:function(){
      soul.rock.show = "midWalk2";
      
   },


   strike:function( rock ){
    rock.show = '3-attack';
    rock.core.glob.soulLayer.addChild(  rock.display );
   },

   triggerBruise: function( rock ){ rock.show = "6-bruise"; },
   triggerCut:    function( rock ){ rock.show = "7-pierce"; },
   triggerMortal: function( rock ){ rock.show = "8-mortal"; },


   triggerDeath: function( rock  ){
     rock.show = "1-closing";

     setTimeout( function(){  rock.glob.removeRock( rock )   }, 3000 );
   },

   collideHero: function (  arbiter, space ) {
      
      trace("collideHero ");
       
       var a = arbiter.getA();
        var b = arbiter.getB();

        //if ( rockA.core.air == true ) return;

        var rockA = a.rock;
        var rockB = b.rock;

        if ( rockA.core.air == true) return

        //rockA.core.body.vx = 0;
        //rockA.core.body.vy = 0;

        //rockB.core.body.vx = 0;
        //rockB.core.body.vy = 0;

        trace("i need u to collide with the hero ");

        if ( rockA.x > rockB.x ) return;

        rockB.control.strike( rockA, 4 );
        

       //	trace( "big bang block" );

       //	rock.core.body.setMass( 200000 );
       },

    execute:function( rock ){

    
    if ( rock.state( rock.const.DEAD ) == true  ) return;
    
    var vx = rock.body.vx;

    
          //  trace("rock " + body );
  }



}