soul = {

  name:"Hero Strike1",
  content:"ChariotPhysics",
  toonList:[    
     	
     	{ viz:1, id:"idle",			  	 speed:.5   },
      { viz:0, id:"attack1", 			 speed:.5, complete:'idle', x:35, end:'attackEnd'  },
     
  ],

  offset:{ x:-120, y:40 },
  collideType:2,

  physicHeight:200,
  physicWidth:150,

  awake:function( rock ){
  		//soul.rock = rock;
  		rock.shape.group = 10;
  		rock.shape.sensor = false;
  		var space = rock.core.glob.core.space;
  		
  		if ( space.containsShape( rock.shape ) == true ) space.removeShape( rock.shape ) ;
  			
  },

    start:function( rock ){ 
    if ( rock.parent.soul.action != null ) return;
    rock.show = 'attack1';
    var space = rock.core.glob.core.space;

    if ( space.containsShape( rock.shape ) == false ) space.addShape( rock.shape ) ;
    space.addCollisionHandler( 2 , 3, null,  null , soul.collideMonster.bind(this) ,  null );
    space.addCollisionHandler( 3 , 2, null,  null , soul.collideMonster.bind(this) , null);

    rock.display.visible = true;
    rock.parent.display.visible = false;
    rock.parent.soul.action = rock;
  },  
    
    end:function( rock ){  
    trace("strike end ");
    var space = rock.core.glob.core.space;  
    if ( space.containsShape( rock.shape ) == true ) space.removeShape( rock.shape ) ;
    space.removeCollisionHandler( 3 , 2, null,  null, soul.collideMonster.bind(this), null);

    setTimeout( function(){ rock.parent.soul.action = null }, 500 )
    
   },

   attackEnd:function( ){
      soul.rock.show = 'idle';
      soul.rock.display.visible = false;
      soul.rock.parent.display.visible = true;
   },

 collideMonster:function(   arbiter, space ) {
   // trace("collide monster ");
    var a = arbiter.getA();
    var b = arbiter.getB();
    var rockA = a.rock;
    var rockB = b.rock;

   //if ( rockB.core.air == true) return
    
    //soul.moveReset( rockB );
    //if(  soul.action == 'attack1' ) return;

    
    rockA.control.strike( rockB  );   
  }, 

  execute:function( rock ){ 
		if ( rock.parent == null ) return;

		rock.body.p.x = rock.parent.body.p.x + 120;
		rock.body.p.y = rock.parent.body.p.y - 50;
            
  },

 


}