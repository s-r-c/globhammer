soul = {

  name:"Hero Move",
  content:"Chariot",
  toonList:[    
           
            { viz:0, id:"walkLeft",          speed:.5  },
  ],

  awake:function( rock ){},

  start:function( rock ){
    rock.momentum = -100;
    soul.run = true;
  },
  
  end:function( rock ){
    soul.moveReset( rock );
  },

  execute:function( rock ){ 

      if (soul.run == false ) return
      
      rock.x = rock.parent.x;
      rock.y = rock.parent.y;
      
      var vx = rock.parent.body.vx;
      var vy = rock.parent.body.vy;

      if ( vx < -10  ) {
          rock.show = 'walkLeft';
          rock.display.visible = true;
          rock.parent.display.visible = false;
          return
      }

      rock.display.visible = false;
      rock.parent.display.visible = true;
      soul.run = false;
      //if ( ( vy > 1 ) || ( vy < -1 ) ) 
      //{ 
      //rock.display.visible = false;  
      //return 
     // }
     // else {
     //   rock.display.visible = true;  
     // }

     // if ( ( vx > 10 ) || ( vx < -10 ) )  return 
     // rock.show = 'idle';
   
  },

  moveReset:function( rock ){
    rock.momentum = 0;
    rock.core.body.vx = 0;
    rock.core.body.vy = 0;
  },




}