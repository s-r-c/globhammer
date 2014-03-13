soul = {

  name:"Hero Jump",
  content:"Chariot",
  toonList:[             
            { viz:1, id:"jumpStart", src:'jumpStart',  speed:.5, complete:'jumpFloat'     },
            { viz:0, id:"jumpFloat", src:'jumpStart',  speed:.5, loop:false, frames:[3]   },
  ],

  awake:function( rock ){
    var space = rock.core.glob.core.space;
    space.addCollisionHandler( 1 , 0, null,  null, soul.collideFloor.bind(this), null);
  },

  start:function( rock ){
    rock.body.vy = -1000;
    //soul.rock.show = 'jumpStart';
    rock.core.air = true;

  },
  
  end:function( rock ){
    //rock.body.vy = 1000;
    //soul.moveReset( rock );
     //if ( soul.rock.momentum == 0 ) soul.rock.momentum = 100;
     // soul.rock.momentum += 10;
     // if ( soul.rock.momentum > 1000 ) soul.rock.momentum = 1000;
     // soul.move.show = "walkRight";
  },


  collideFloor:function(  arbiter, space  ){
    soul.rock.core.air = false;
   },

  execute:function( rock ){ 
    rock.display.visible      = soul.rock.core.air;
    soul.rock.display.visible = !soul.rock.core.air;
    // if ( soul.rock.core.air == true  ){
    //  soul.rock.display.visible = true;
    //   = true;  
    //  return
    // }

    //  if ( soul.rock.core.air == false  ){
    //  soul.rock.display.visible = true;
     // rock.display.visible = true;  
     // }
    
    //if ( soul.rock == null ) return;
    rock.x = soul.rock.x - 5;
    rock.y = soul.rock.y;

    if ( soul.rock.body.p.y < -90 ) soul.rock.body.p.y = -90;
      
    //var vy = soul.rock.body.vy;
    //if(  ( vy < 100 ) && ( vy > -100 )  ) vy = 0;

    //vy = Math.floor( vy );
    
   //if ( ( vy > 100 ) || ( vy < -100 ) ) 
   //{
       
    //}

    //soul.rock.display.visible = true;
    //rock.display.visible = false;          
  },

  //specail functions

  moveReset:function( rock ){},




}