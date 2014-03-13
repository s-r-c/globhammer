soul = {

  name:"Hero Move",
  content:"Chariot",
  toonList:[    
            { viz:0, id:"idle",              speed:.6  },
            { viz:0, id:"walkRight",         speed:.6  },
            { viz:0, id:"runRight",          speed:.6, y:-5  },
            { viz:0, id:"break",             speed:.6, y:15, x:-10  },
            { viz:0, id:"walkLeft",          speed:.5  },
            { viz:0, id:'jumpStart',         speed:.5, frames:[3]  },
            
  ],

  speed:5,
  speedLimit:300,
  runPoint:760,
  startPush:200,
  vxLimit:1000,
  boost:40,

  break:false,

  breakLimit:500,
  breakPush:200,
  
  awake:function( rock ){
    rock.display.visible = false;
   
   var space = rock.core.glob.core.space;
   space.addCollisionHandler( 1 , 0, null,  null, soul.collideFloor.bind(this), null) 
  },

  collideFloor:function(  arbiter, space  ){
    var a = arbiter.getA();
    var b = arbiter.getB();
    var rockA = a.rock;
    var rockB = b.rock;
    if( rockA.core.air != false ) trace( "air  " + rockA.core.air );
    rockA.core.air = false;   
   },

  jumpStart:function( rock ){
    return
    rock.body.vy = -1000;
    rock.core.air = true;
    soul.rock.show = 'jumpStart';
    //rock.display.visible = false;
    soul.rock.parent.display.visible = false;
  },
  
  jumpEnd:function( rock ){},

  forwardStart:function( rock ){
     if ( soul.break == true ) return;
     if ( rock.body.vx > soul.vxLimit ) return;
     if ( rock.momentum == 0 ) rock.momentum = soul.startPush;

     if ( rock.parent.soul.action != null ) {
      soul.forwardEnd( rock );
      return;
     } 

     if ( rock.momentum > soul.speedLimit ) return;
     rock.momentum += soul.speed;
  },

  forwardEnd:function( rock ){
    soul.moveReset( rock );
  },

    backwardStart:function( rock ){
    trace("backwardStart !!!! ");
    rock.momentum = -100;

  },
  
  backwardEnd:function( rock ){
    soul.moveReset( rock );
  },

  triggerRun:function( rock ){
     
    if ( rock.content.currentToonID != 'runRight' ){
      trace("go go go ");
      rock.parent.body.vx += 100;
     } 

     rock.show = 'runRight';

     rock.parent.body.vx += soul.boost;
  },

  triggerWalk:function( rock ){
    rock.show = 'walkRight';
  },

  jump:function( rock){

  },


  //its running now for sum reason
  execute:function( rock ){ 
    
    if ( rock.parent.soul.action != null ) return  rock.display.visible = false;
    rock.x = rock.parent.x;
    rock.y = rock.parent.y;

    if ( rock.core.air == true ){
      soul.jump( rock );
      return
    }

    if ( rock.parent.body.vy > -10 && rock.parent.body.vy < 10 ){
      rock.parent.body.vy = 0;
    };
      
    var vx = rock.parent.body.vx;
    var vy = rock.parent.body.vy;
    //trace('vx ' + vx );


    if ( soul.break == true ){
      rock.parent.body.vx -= 20;
      rock.show = 'break';
      if ( vx < 10 ) soul.break = false;
      return;
    }

    if ( vx > soul.vxLimit ) rock.parent.body.vx = soul.vxLimit;
      
     if  ( vx > 10 ) 
     {
      
      if ( vx >= soul.runPoint   ) soul.triggerRun( rock );
      if ( vx <  soul.runPoint   ) soul.triggerWalk( rock );
  
      rock.parent.display.visible = false;
      rock.display.visible = true;  
      return 
     }

     ///WALK LEFT

    if ( vx < -10  ) {
          rock.show = 'walkLeft';
          rock.display.visible = true;
          rock.parent.display.visible = false;
          return
      }

    if ( vy > 0 ) {
        rock.parent.display.visible = false;
        rock.display.visible = true;      
      return;
    }

      


   //rock.show = 'idle';
   rock.parent.display.visible = true;
   rock.display.visible = false;          
  },
  

  moveReset:function( rock ){
    rock.momentum = 0;
    var oldVX = rock.core.body.vx;

    if ( oldVX >= soul.runPoint ) return soul.break = true;
    rock.core.body.vx    = 0;
    //rock.core.body.vy = 0;

   //if ( oldVX < soul.breakLimit ) return
   // rock.core.body.vx += soul.breakPush;
   // trace("breakLimit ");
  },

}