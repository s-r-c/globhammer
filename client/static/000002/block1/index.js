soul = {

  name:"Template",
  content:"ChariotPhysics",
  
  toonList:[ 
  
  { viz:1, id:"0-idle",	speed:.3},
  { viz:0, id:"1-closing", speed:.3, complete:'2-closed'}, 
  { viz:0, id:"2-closed", speed:.3}, 
  { viz:0, id:"3-attack", speed:.3, complete:"0-idle"}, 
  { viz:0, id:"4-miss", speed:.3}, 
  { viz:0, id:"5-heal", speed:.3}, 
  { viz:0, id:"6-bruise", speed:.3, complete:'0-idle'}, 
  { viz:0, id:"7-pierce", speed:.3, complete:'0-idle'}, 
  { viz:0, id:"8-mortal", speed:.3, complete:'0-idle'} 
  
  ],
  
  collideType:3,

  rim:60,
  offset:{ x:-5, y:0 },

   awake:function( rock ){
    soul.rock = rock;

    //soul.offset.y += Math.random() * 5;
    //soul.body = rock.body;
    //soul.shape = rock.shape;
    rock.addEventListener( rock.event.WOUND_BRUISE, soul.triggerBruise );
    rock.addEventListener( rock.event.WOUND_CUT, soul.triggerCut );
    rock.addEventListener( rock.event.WOUND_MORTAL, soul.triggerMortal );
    rock.addEventListener( rock.event.DEAD, soul.triggerDeath );

     rock.addEventListener( rock.event.STRIKE, soul.strike );

    var space = rock.core.glob.core.space;
    space.addCollisionHandler( 2 , 3,  soul.collideHero.bind(this), null, null, null);

    //var space = rock.core.glob.core.space;
    //if ( space == null ) return
    //space.addCollisionHandler( 2 , 3, null, null, soul.collideMonster.bind(this), null);
   },

   strike:function( rock ){
    trace(" strike ");
    rock.show = '3-attack';
    //soul.action = 'attack1';
   },

   triggerBruise: function( rock ){ rock.show = "6-bruise"; },
   triggerCut:    function( rock ){ rock.show = "7-pierce"; },
   triggerMortal: function( rock ){ rock.show = "8-mortal"; },


   triggerDeath: function( rock  ){
     rock.show = "1-closing";
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
       }


}