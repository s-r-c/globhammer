soul = {

  name:"Hero Bonesaw Attack",
  content:"ChariotPhysics",
  toonList:[    
     	
     	{ viz:1, id:"idle",			  	 speed:.5   },
      { viz:0, id:"bonesaw", 			 speed:.5, complete:'idle', x:35  },
     
  ],

  offset:{ x:-120, y:40 },
  collideType:2,

  physicHeight:200,
  physicWidth:150,


  awake:function( rock ){
  	rock.shape.group = 10;
  	rock.shape.sensor = false;
  		var space = rock.core.glob.core.space;
  		
  		if ( space.containsShape( rock.shape ) == true ) space.removeShape( rock.shape ) ;
  			
  },

  start:function( rock ){ 
    trace("so fragile");
    rock.show = 'bonesaw';
    var space = rock.core.glob.core.space;

    if ( space.containsShape( rock.shape ) == false ) space.addShape( rock.shape ) ;
    space.addCollisionHandler( 2 , 3, null,  null , soul.collideMonster.bind(this) ,  null );
  
  },  
  end:function( rock ){  

    var space = rock.core.glob.core.space;  
    if ( space.containsShape( rock.shape ) == true ) space.removeShape( rock.shape ) ;
   },


 collideMonster:function(   arbiter, space ) {
   // trace("collide monster ");
    var a = arbiter.getA();
    var b = arbiter.getB();
    var rockA = a.rock;
    var rockB = b.rock;
    rockA.control.strike( rockB  );   
  }, 

  execute:function( rock ){ 
    
		rock.body.p.x = soul.rock.body.p.x + 120;
		rock.body.p.y = soul.rock.body.p.y - 50;
            
  },

  



}