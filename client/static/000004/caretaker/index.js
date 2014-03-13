soul = {

  name:"Template",
  content:"ChariotPhysics",
  
  toonList:[ 
  
  { viz:1, id:"0-idle",	speed:.3},

  { viz:0, id:"startWalk1",   src:'10-moveStill',    speed:.5, end:'step1' },
  { viz:0, id:"midWalk1",    src:'11-moveForward1', speed:.01, complete:'startWalk1' },

  { viz:0, id:"startWalk2",   src:'10-moveStill',    speed:.5, end:'step2' },
  { viz:0, id:"midWalk2",    src:'11-moveForward2', speed:.01, complete:'startWalk1' },
  ],
  
  collideType:3,

  rim:200,
  offset:{ x:35, y:-100 },

   awake:function( rock ){
    soul.rock = rock;
   rock.addEventListener( rock.event.WOUND_BRUISE, soul.triggerBruise );
    rock.addEventListener( rock.event.WOUND_CUT, soul.triggerCut );
    rock.addEventListener( rock.event.WOUND_MORTAL, soul.triggerMortal );
    rock.addEventListener( rock.event.DEAD, soul.triggerDeath );
    //
   rock.addEventListener( rock.event.STRIKE, soul.strike );
    //var space = rock.core.glob.core.space;
  //  space.addCollisionHandler( 2 , 3,  soul.collideHero.bind(this), null, null, null);

    //var space = rock.core.glob.core.space;
    //if ( space == null ) return
    //space.addCollisionHandler( 2 , 3, null, null, soul.collideMonster.bind(this), null);
   //setTimeout( function(){ soul.triggerDeath( rock ) }, 5000 );

   //soul.walkForward( rock );
   //soul.step1();
  
   },

   step1:function(){
      soul.rock.show = "midWalk1";
      soul.speed = -1000;
      soul.rock.body.applyImpulse( cp.v( soul.speed , 0 ) , cp.v( 0, 0 )  );
   },

   step2:function(){
      soul.rock.show = "midWalk2";
      soul.speed = -2000;
     //soul.rock.body.applyImpulse( cp.v( soul.speed , 0 ) , cp.v( 0, 0 )  );
   },

   walkForward:function( rock ){

    trace("walk walkForward ");

      setInterval( function(){ 

              soul.speed = -1000;
              rock.body.applyImpulse( cp.v( soul.speed , 0 ) , cp.v( 0, 0 )  );
 

       }, 3500 );


        setInterval( function(){ 

              soul.speed = -1000;
              rock.body.applyImpulse( cp.v( soul.speed , 0 ) , cp.v( 0, 0 )  );
 

       }, 5000 );
 

    

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